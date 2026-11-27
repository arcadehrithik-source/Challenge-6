import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { generateAssistantGuidance } from "@/lib/ai-assistant";
import { MOCK_OPENAI_CHAT_RESPONSE } from "../mocks/handlers";

const SAMPLE_INPUT = {
  question: "Is it safe to jog outside today?",
  context: {
    location: "Kolkata",
    aqi: 241,
    aqiCategory: "Poor" as const,
    pm25: 102,
    pm10: 190,
    dataMode: "live" as const,
    updatedAt: "2026-11-27T08:00:00.000Z",
    household: "family_with_children" as const,
    lifestyle: "fitness_enthusiast" as const,
    commute: "bicycle" as const,
    commuteDistanceKm: 8,
    indoorEnvironment: {
      hasAirPurifier: false,
      hasIndoorPlants: true,
      windowsFrequentlyOpen: true,
      cookingFuel: "lpg_png" as const,
      ventilation: "moderate" as const,
    },
    preferences: {
      dailyNotifications: true,
      sustainabilityPriority: "protect_health" as const,
      budget: "zero_low_cost" as const,
    },
  },
};

describe("AI Adapter & Health endpoint integration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = originalEnv;
  });

  it("returns structured OpenAI guidance and falls back safely when OpenAI errors", async () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "sk-test-placeholder";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_OPENAI_CHAT_RESPONSE,
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await generateAssistantGuidance(SAMPLE_INPUT);
    expect(res.isFallback).toBe(false);
    expect(res.providerUsed).toContain("OpenAI");
    expect(res.recommendedActions).toHaveLength(3);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const errFallback = await generateAssistantGuidance(SAMPLE_INPUT);
    expect(errFallback.isFallback).toBe(true);
    expect(errFallback.importantPrecautions).toContain("External AI provider unavailable");
  });

  it("falls back to deterministic engine when Gemini returns invalid payload", async () => {
    process.env.AI_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "AIza-test-placeholder";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await generateAssistantGuidance(SAMPLE_INPUT);
    expect(res.isFallback).toBe(true);
    expect(res.providerUsed).toBe("BreatheWise Deterministic Engine");
    expect(res.importantPrecautions).toContain("External AI provider unavailable");
  });

  it("calls Gemini with header auth (not URL query key) and falls back on malformed JSON", async () => {
    process.env.AI_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "AIza-test-placeholder";

    const validGeminiMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: MOCK_OPENAI_CHAT_RESPONSE.choices[0]!.message.content }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", validGeminiMock);

    const okRes = await generateAssistantGuidance(SAMPLE_INPUT);
    expect(okRes.isFallback).toBe(false);
    expect(okRes.providerUsed).toContain("Google Gemini");
    const [calledUrl, calledInit] = validGeminiMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).not.toContain("AIza-test-placeholder");
    expect((calledInit.headers as Record<string, string>)["x-goog-api-key"]).toBe(
      "AIza-test-placeholder"
    );

    // Malformed JSON string returned inside 200 OK payload falls back cleanly
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "{bad-json" }] } }],
        }),
      })
    );
    const badRes = await generateAssistantGuidance(SAMPLE_INPUT);
    expect(badRes.isFallback).toBe(true);
  });

  it("GET /api/health reports readiness without leaking secrets and degrades safely on invalid env", async () => {
    process.env.AI_PROVIDER = "none";
    const res = await getHealth();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.aiProviderConfigured).toBe(false);

    process.env.AI_PROVIDER = "unsupported_provider";
    const degraded = await getHealth();
    expect(degraded.status).toBe(500);
    const degradedBody = await degraded.json();
    expect(degradedBody.status).toBe("degraded");
  });
});
