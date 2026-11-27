import { buildDemoAirQualitySnapshot } from "./air-quality/demo-snapshot";
import { fetchLiveOpenMeteoSnapshot } from "./air-quality/open-meteo";
import type { AirQualitySnapshot, DemoScenario } from "./types";

export { buildDemoAirQualitySnapshot };

interface CacheRecord {
  snapshot: AirQualitySnapshot;
  expiresAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const snapshotCache = new Map<string, CacheRecord>();
const inFlightRequests = new Map<string, Promise<AirQualitySnapshot>>();

function evictExpiredCache(now: number): void {
  for (const [key, entry] of snapshotCache.entries()) {
    if (entry.expiresAt <= now) {
      snapshotCache.delete(key);
    }
  }
}

function setBoundedCache(key: string, record: CacheRecord): void {
  if (snapshotCache.size >= MAX_CACHE_ENTRIES) {
    evictExpiredCache(Date.now());
  }
  if (snapshotCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = snapshotCache.keys().next().value;
    if (oldestKey) {
      snapshotCache.delete(oldestKey);
    }
  }
  snapshotCache.set(key, record);
}

function readCachedSnapshot(cacheKey: string, locality?: string): AirQualitySnapshot | null {
  const cached = snapshotCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    snapshotCache.delete(cacheKey);
    return null;
  }
  return {
    ...cached.snapshot,
    locality: locality || cached.snapshot.locality,
  };
}

/** Clears cached snapshots and active in-flight deduplication promises (used in tests). */
export function clearAirQualityCache(): void {
  snapshotCache.clear();
  inFlightRequests.clear();
}

/**
 * Fetches live Open-Meteo air quality (with bounded cache & request dedup) or returns labeled demo data.
 */
export async function getAirQualitySnapshot(params: {
  city: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  mode?: "live" | "demo";
  scenario?: DemoScenario;
}): Promise<AirQualitySnapshot> {
  if (params.mode === "demo" || (params.scenario && params.scenario !== "auto")) {
    return buildDemoAirQualitySnapshot({
      city: params.city,
      locality: params.locality,
      latitude: params.latitude,
      longitude: params.longitude,
      scenario: params.scenario,
      reason:
        params.mode === "demo"
          ? "Demonstration mode selected by user."
          : `Simulated scenario (${params.scenario}) active.`,
    });
  }

  const cacheKey = `${params.city.trim().toLowerCase()}:${params.latitude ?? ""}:${params.longitude ?? ""}`;
  const cached = readCachedSnapshot(cacheKey, params.locality);
  if (cached) return cached;

  const existingFlight = inFlightRequests.get(cacheKey);
  if (existingFlight) return existingFlight;

  const fetchPromise = (async (): Promise<AirQualitySnapshot> => {
    try {
      const snapshot = await fetchLiveOpenMeteoSnapshot(params);
      setBoundedCache(cacheKey, { snapshot, expiresAt: Date.now() + CACHE_TTL_MS });
      return snapshot;
    } catch (error) {
      const reason =
        error instanceof Error
          ? `Live air quality data unavailable (${error.message}). Showing clearly labeled simulation.`
          : "Live air quality data unavailable. Showing clearly labeled simulation.";

      return buildDemoAirQualitySnapshot({
        city: params.city,
        locality: params.locality,
        latitude: params.latitude,
        longitude: params.longitude,
        scenario: params.scenario ?? "auto",
        reason,
      });
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}
