import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { generateAssistantGuidance } from "@/lib/ai-assistant";
import { MOCK_OPENAI_CHAT_RESPONSE } from "../mocks/handlers";

const SAMPLE_INPUT = {
  question: "Is it safe to jog outside today?",
  context: {
    location: "Kolkata",
    aqi: 241,
    aqiCategory: "Poor",
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

  it("returns structured OpenAI guidance when AI_PROVIDER=openai and key is configured", async () => {
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

  it("GET /api/health reports readiness without leaking secrets", async () => {
    process.env.AI_PROVIDER = "none";
    const res = await getHealth();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.aiProviderConfigured).toBe(false);
  });
});
