import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAirQualityCache, getAirQualitySnapshot } from "@/lib/air-quality-service";
import { MOCK_OPEN_METEO_RESPONSE } from "../mocks/handlers";

describe("Air Quality Service integration", () => {
  beforeEach(() => {
    clearAirQualityCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and normalizes live Open-Meteo measurements and caches subsequent calls", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_OPEN_METEO_RESPONSE,
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await getAirQualitySnapshot({ city: "Kolkata", mode: "live" });
    expect(first.dataMode).toBe("live");
    expect(first.isFallback).toBe(false);
    expect(first.aqi).toBeGreaterThan(100);
    expect(first.pm25).toBe(102);

    const second = await getAirQualitySnapshot({ city: "Kolkata", mode: "live" });
    expect(second.city).toBe("Kolkata");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back cleanly to clearly labeled Demonstration Mode on upstream API failure", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network timeout"));
    vi.stubGlobal("fetch", fetchMock);

    const res = await getAirQualitySnapshot({ city: "Delhi", mode: "live" });
    expect(res.dataMode).toBe("demo");
    expect(res.isFallback).toBe(true);
    expect(res.dataSource).toContain("Simulation");
    expect(res.hourly.every((h) => h.observationType === "simulated")).toBe(true);
  });

  it("falls back when external API returns invalid or missing PM measurements", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        latitude: 22.57,
        longitude: 88.36,
        hourly: {
          time: [new Date().toISOString()],
          pm2_5: [null],
          pm10: [null],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await getAirQualitySnapshot({ city: "Kolkata", mode: "live" });
    expect(res.dataMode).toBe("demo");
    expect(res.isFallback).toBe(true);
    expect(res.fallbackReason).toContain("missing");
  });

  it("resolves coordinates via geocoding for non-preset cities and deduplicates concurrent calls", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("geocoding-api")) {
        return {
          ok: true,
          json: async () => ({
            results: [{ name: "Durgapur", latitude: 23.5204, longitude: 87.3119 }],
          }),
        };
      }
      return {
        ok: true,
        json: async () => MOCK_OPEN_METEO_RESPONSE,
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const [a, b] = await Promise.all([
      getAirQualitySnapshot({ city: "Durgapur", mode: "live" }),
      getAirQualitySnapshot({ city: "Durgapur", mode: "live" }),
    ]);

    expect(a.city).toBe("Durgapur");
    expect(b.city).toBe("Durgapur");
    // Only 1 geocoding + 1 air-quality fetch despite 2 concurrent calls
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("evicts expired cache entries after TTL and rejects non-finite or out-of-range coordinates", async () => {
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy.mockReturnValue(1_000_000);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_OPEN_METEO_RESPONSE,
    });
    vi.stubGlobal("fetch", fetchMock);

    await getAirQualitySnapshot({ city: "Kolkata", mode: "live" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Advance past 10-minute TTL
    nowSpy.mockReturnValue(1_000_000 + 11 * 60 * 1000);
    await getAirQualitySnapshot({ city: "Kolkata", mode: "live" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Non-finite or out-of-range upstream coordinates should trigger clean demo fallback
    clearAirQualityCache();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ...MOCK_OPEN_METEO_RESPONSE,
          latitude: 999,
        }),
      })
    );
    const invalidRes = await getAirQualitySnapshot({ city: "Kolkata", mode: "live" });
    expect(invalidRes.isFallback).toBe(true);
    expect(invalidRes.dataMode).toBe("demo");
  });
});
