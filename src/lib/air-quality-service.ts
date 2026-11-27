import { z } from "zod";
import { AQI_CATEGORY_META, calculateIndianAqi } from "./aqi";
import { findCityPreset } from "./cities";
import { getServerEnv, isAllowedExternalUrl } from "./security/env";
import type { AirQualitySnapshot, DemoScenario, HourlyAirQualityPoint } from "./types";

const validIsoTimestampSchema = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid timestamp format.");

const openMeteoAirQualitySchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  hourly: z.object({
    time: z.array(validIsoTimestampSchema).min(1),
    pm10: z.array(z.number().finite().nullable()).optional(),
    pm2_5: z.array(z.number().finite().nullable()).optional(),
    nitrogen_dioxide: z.array(z.number().finite().nullable()).optional(),
    ozone: z.array(z.number().finite().nullable()).optional(),
  }),
});

const openMeteoGeocodingSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string().min(1),
        latitude: z.number().finite().min(-90).max(90),
        longitude: z.number().finite().min(-180).max(180),
        country_code: z.string().optional(),
        admin1: z.string().optional(),
      })
    )
    .optional(),
});

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
  const now = Date.now();
  if (snapshotCache.size >= MAX_CACHE_ENTRIES) {
    evictExpiredCache(now);
  }
  if (snapshotCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = snapshotCache.keys().next().value;
    if (oldestKey) {
      snapshotCache.delete(oldestKey);
    }
  }
  snapshotCache.set(key, record);
}

export function clearAirQualityCache(): void {
  snapshotCache.clear();
  inFlightRequests.clear();
}

const DEMO_SCENARIO_CURVES: Record<
  Exclude<DemoScenario, "auto">,
  { basePm25: number; basePm10: number; no2: number; o3: number; label: string }
> = {
  good: { basePm25: 22, basePm10: 45, no2: 24, o3: 38, label: "Clean Breeze Scenario" },
  moderate: { basePm25: 74, basePm10: 140, no2: 52, o3: 64, label: "Moderate Urban Haze" },
  poor: { basePm25: 106, basePm10: 196, no2: 68, o3: 54, label: "Winter Morning Smog" },
  severe: { basePm25: 268, basePm10: 382, no2: 96, o3: 48, label: "Severe Inversion Episode" },
};

function inferScenarioForCity(
  city: string,
  requested?: DemoScenario
): Exclude<DemoScenario, "auto"> {
  if (requested && requested !== "auto") return requested;
  const lower = city.toLowerCase();
  if (lower.includes("delhi")) return "severe";
  if (lower.includes("bengaluru") || lower.includes("chennai")) return "moderate";
  return "poor";
}

export function buildDemoAirQualitySnapshot(params: {
  city: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  scenario?: DemoScenario;
  reason?: string;
  referenceTimeIso?: string;
}): AirQualitySnapshot {
  const preset = findCityPreset(params.city);
  const lat = params.latitude ?? preset?.latitude ?? 22.5726;
  const lon = params.longitude ?? preset?.longitude ?? 88.3639;
  const chosenScenario = inferScenarioForCity(params.city, params.scenario);
  const cfg = DEMO_SCENARIO_CURVES[chosenScenario];

  const baseTime = params.referenceTimeIso ? new Date(params.referenceTimeIso) : new Date();
  const hourly: HourlyAirQualityPoint[] = [];

  for (let offset = -12; offset <= 11; offset++) {
    const t = new Date(baseTime.getTime() + offset * 3600_000);
    const hour = t.getHours();
    const diurnalFactor =
      hour >= 6 && hour <= 10 ? 1.24 : hour >= 13 && hour <= 16 ? 0.72 : hour >= 18 ? 1.18 : 0.96;

    const pm25 = Number((cfg.basePm25 * diurnalFactor).toFixed(1));
    const pm10 = Number((cfg.basePm10 * diurnalFactor).toFixed(1));
    const aqiRes = calculateIndianAqi({ pm25, pm10, no2: cfg.no2, o3: cfg.o3 });

    hourly.push({
      time: t.toISOString(),
      label: `${String(hour).padStart(2, "0")}:00`,
      aqi: aqiRes.aqi,
      pm25,
      pm10,
      observationType: "simulated",
    });
  }

  const currentPoint = hourly[12] ?? hourly[0]!;
  const currentAqi = calculateIndianAqi({
    pm25: currentPoint.pm25,
    pm10: currentPoint.pm10,
    no2: cfg.no2,
    o3: cfg.o3,
  });

  return {
    city: preset?.name ?? params.city,
    locality: params.locality || undefined,
    latitude: lat,
    longitude: lon,
    aqi: currentAqi.aqi,
    category: currentAqi.category,
    pm25: currentPoint.pm25,
    pm10: currentPoint.pm10,
    no2: cfg.no2,
    o3: cfg.o3,
    mainPollutant: currentAqi.mainPollutant,
    healthAdvisory: AQI_CATEGORY_META[currentAqi.category].healthAdvisory,
    dataSource: `BreatheWise Simulation (${cfg.label})`,
    dataMode: "demo",
    updatedAt: baseTime.toISOString(),
    hourly,
    isFallback: true,
    fallbackReason:
      params.reason ??
      "Demonstration mode active — simulated hourly curves clearly separated from live Open-Meteo telemetry.",
  };
}

async function resolveCoordinates(
  city: string,
  lat?: number,
  lon?: number
): Promise<{ name: string; latitude: number; longitude: number }> {
  if (typeof lat === "number" && typeof lon === "number") {
    return { name: city, latitude: lat, longitude: lon };
  }

  const preset = findCityPreset(city);
  if (preset) {
    return { name: preset.name, latitude: preset.latitude, longitude: preset.longitude };
  }

  const env = getServerEnv();
  const geocodingUrl = env.OPEN_METEO_GEOCODING_URL;
  if (!isAllowedExternalUrl(geocodingUrl)) {
    throw new Error("Disallowed geocoding upstream URL.");
  }

  const url = new URL(geocodingUrl);
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(5000),
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Geocoding service responded with status ${res.status}`);
  }

  const parsed = openMeteoGeocodingSchema.safeParse(await res.json());
  const first = parsed.success ? parsed.data.results?.[0] : undefined;
  if (!first) {
    throw new Error(`Could not resolve coordinates for "${city}".`);
  }

  return {
    name: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

function buildHourlyTimeline(
  hourlyData: z.infer<typeof openMeteoAirQualitySchema>["hourly"],
  nowMs: number
): { hourly: HourlyAirQualityPoint[]; currentIdx: number } {
  const { time, pm2_5 = [], pm10 = [], nitrogen_dioxide = [], ozone = [] } = hourlyData;
  let currentIdx = 0;
  let minDiff = Infinity;

  const hourly: HourlyAirQualityPoint[] = time.map((iso, idx) => {
    const pointMs = Date.parse(iso);
    const diff = Math.abs(pointMs - nowMs);
    if (diff < minDiff) {
      minDiff = diff;
      currentIdx = idx;
    }

    const p25 = pm2_5[idx] ?? null;
    const p10 = pm10[idx] ?? null;
    const computed = calculateIndianAqi({
      pm25: p25,
      pm10: p10,
      no2: nitrogen_dioxide[idx] ?? null,
      o3: ozone[idx] ?? null,
    });

    const hhmm = iso.includes("T") ? (iso.split("T")[1]?.slice(0, 5) ?? iso) : iso.slice(0, 5);
    const observationType = pointMs > nowMs + 30 * 60_000 ? "forecast" : "observed";

    return {
      time: iso,
      label: hhmm,
      aqi: computed.aqi,
      pm25: p25,
      pm10: p10,
      observationType,
    };
  });

  return { hourly, currentIdx };
}

async function fetchLiveOpenMeteoSnapshot(params: {
  city: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
}): Promise<AirQualitySnapshot> {
  const coords = await resolveCoordinates(params.city, params.latitude, params.longitude);
  const env = getServerEnv();
  const apiUrl = env.OPEN_METEO_AIR_QUALITY_URL;
  if (!isAllowedExternalUrl(apiUrl)) {
    throw new Error("Disallowed air quality upstream URL.");
  }

  const url = new URL(apiUrl);
  url.searchParams.set("latitude", coords.latitude.toString());
  url.searchParams.set("longitude", coords.longitude.toString());
  url.searchParams.set("hourly", "pm10,pm2_5,nitrogen_dioxide,ozone");
  url.searchParams.set("past_hours", "12");
  url.searchParams.set("forecast_hours", "13");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(6500),
    headers: { Accept: "application/json" },
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo API responded with status ${response.status}`);
  }

  const parsed = openMeteoAirQualitySchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Unexpected response schema from Open-Meteo Air Quality API.");
  }

  const { hourly, currentIdx } = buildHourlyTimeline(parsed.data.hourly, Date.now());
  const { pm2_5 = [], pm10 = [], nitrogen_dioxide = [], ozone = [] } = parsed.data.hourly;

  const currentPm25 = pm2_5[currentIdx] ?? null;
  const currentPm10 = pm10[currentIdx] ?? null;
  const currentNo2 = nitrogen_dioxide[currentIdx] ?? null;
  const currentO3 = ozone[currentIdx] ?? null;

  if (currentPm25 === null && currentPm10 === null) {
    throw new Error("Live PM2.5 and PM10 measurements were missing for this location.");
  }

  const currentComputed = calculateIndianAqi({
    pm25: currentPm25,
    pm10: currentPm10,
    no2: currentNo2,
    o3: currentO3,
  });

  return {
    city: coords.name,
    locality: params.locality || undefined,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    aqi: currentComputed.aqi,
    category: currentComputed.category,
    pm25: currentPm25,
    pm10: currentPm10,
    no2: currentNo2,
    o3: currentO3,
    mainPollutant: currentComputed.mainPollutant,
    healthAdvisory: AQI_CATEGORY_META[currentComputed.category].healthAdvisory,
    dataSource: "Open-Meteo Air Quality API (CAMS/Atmospheric Model)",
    dataMode: "live",
    updatedAt: new Date().toISOString(),
    hourly,
    isFallback: false,
  };
}

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
  const cached = snapshotCache.get(cacheKey);
  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return {
        ...cached.snapshot,
        locality: params.locality || cached.snapshot.locality,
      };
    }
    snapshotCache.delete(cacheKey);
  }

  const existingFlight = inFlightRequests.get(cacheKey);
  if (existingFlight) {
    return existingFlight;
  }

  const fetchPromise = (async (): Promise<AirQualitySnapshot> => {
    try {
      const snapshot = await fetchLiveOpenMeteoSnapshot(params);
      setBoundedCache(cacheKey, {
        snapshot,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
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
