import { z } from "zod";
import { AQI_CATEGORY_META, calculateIndianAqi } from "./aqi";
import { findCityPreset } from "./cities";
import { getServerEnv, isAllowedExternalUrl } from "./security/env";
import type { AirQualitySnapshot, DemoScenario, HourlyAirQualityPoint } from "./types";

const openMeteoAirQualitySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    pm10: z.array(z.number().nullable()).optional(),
    pm2_5: z.array(z.number().nullable()).optional(),
    nitrogen_dioxide: z.array(z.number().nullable()).optional(),
    ozone: z.array(z.number().nullable()).optional(),
  }),
});

const openMeteoGeocodingSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
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

function setBoundedCache(key: string, record: CacheRecord): void {
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
  good: { basePm25: 18, basePm10: 36, no2: 19, o3: 32, label: "Clean Monsoon / Post-Rain Demo" },
  moderate: { basePm25: 72, basePm10: 138, no2: 48, o3: 54, label: "Typical Urban Morning Demo" },
  poor: { basePm25: 108, basePm10: 215, no2: 74, o3: 46, label: "Hazy Winter Commute Demo" },
  severe: {
    basePm25: 278,
    basePm10: 410,
    no2: 112,
    o3: 38,
    label: "Severe Winter Smog Episode Demo",
  },
};

const CITY_DEFAULT_DEMO: Record<string, Exclude<DemoScenario, "auto">> = {
  delhi: "severe",
  asansol: "poor",
  kolkata: "poor",
  mumbai: "moderate",
  pune: "moderate",
  hyderabad: "moderate",
  chennai: "good",
  bengaluru: "good",
};

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
  const latitude = params.latitude ?? preset?.latitude ?? 22.5726;
  const longitude = params.longitude ?? preset?.longitude ?? 88.3639;
  const normalizedCity = preset?.name ?? params.city;

  const resolvedScenario: Exclude<DemoScenario, "auto"> =
    params.scenario && params.scenario !== "auto"
      ? params.scenario
      : (CITY_DEFAULT_DEMO[normalizedCity.toLowerCase()] ?? "poor");

  const profile = DEMO_SCENARIO_CURVES[resolvedScenario];
  const now = params.referenceTimeIso ? new Date(params.referenceTimeIso) : new Date();
  const hourly: HourlyAirQualityPoint[] = [];

  // Diurnal pollution curve: higher early morning (06:00-09:00) & late evening (19:00-23:00)
  const diurnalMultiplier = [
    1.15, 1.1, 1.05, 1.02, 1.08, 1.18, 1.25, 1.22, 1.12, 0.96, 0.84, 0.78, 0.74, 0.72, 0.76, 0.82,
    0.9, 1.02, 1.14, 1.22, 1.26, 1.24, 1.2, 1.16,
  ];

  for (let offset = -11; offset <= 12; offset++) {
    const pointDate = new Date(now.getTime() + offset * 3600_000);
    const hour = pointDate.getHours();
    const mult = diurnalMultiplier[hour] ?? 1;
    const pm25 = Math.round(profile.basePm25 * mult * 10) / 10;
    const pm10 = Math.round(profile.basePm10 * mult * 10) / 10;
    const { aqi } = calculateIndianAqi({
      pm25,
      pm10,
      no2: profile.no2,
      o3: profile.o3,
    });

    hourly.push({
      time: pointDate.toISOString(),
      label: `${String(hour).padStart(2, "0")}:00`,
      aqi,
      pm25,
      pm10,
      observationType: "simulated",
    });
  }

  const currentPoint = hourly[11] ?? hourly[0]!;
  const currentPm25 = currentPoint.pm25;
  const currentPm10 = currentPoint.pm10;
  const computed = calculateIndianAqi({
    pm25: currentPm25,
    pm10: currentPm10,
    no2: profile.no2,
    o3: profile.o3,
  });

  return {
    city: normalizedCity,
    locality: params.locality || undefined,
    latitude,
    longitude,
    aqi: computed.aqi,
    category: computed.category,
    pm25: currentPm25,
    pm10: currentPm10,
    no2: profile.no2,
    o3: profile.o3,
    mainPollutant: computed.mainPollutant,
    healthAdvisory: AQI_CATEGORY_META[computed.category].healthAdvisory,
    dataSource: `BreatheWise Simulation (${profile.label})`,
    dataMode: "demo",
    updatedAt: now.toISOString(),
    hourly,
    isFallback: true,
    fallbackReason: params.reason,
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

  const json = await res.json();
  const parsed = openMeteoGeocodingSchema.safeParse(json);
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
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.snapshot,
      locality: params.locality || cached.snapshot.locality,
    };
  }

  const existingFlight = inFlightRequests.get(cacheKey);
  if (existingFlight) {
    return existingFlight;
  }

  const fetchPromise = (async (): Promise<AirQualitySnapshot> => {
    try {
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

      const rawJson = await response.json();
      const parsed = openMeteoAirQualitySchema.safeParse(rawJson);
      if (!parsed.success) {
        throw new Error("Unexpected response schema from Open-Meteo Air Quality API.");
      }

      const { time, pm2_5 = [], pm10 = [], nitrogen_dioxide = [], ozone = [] } = parsed.data.hourly;
      if (time.length === 0) {
        throw new Error("Open-Meteo returned empty hourly timeline.");
      }

      const nowMs = Date.now();
      let currentIdx = 0;
      let minDiff = Infinity;

      const hourly: HourlyAirQualityPoint[] = time.map((iso, idx) => {
        const pointMs = Date.parse(iso);
        const diff = Math.abs(pointMs - nowMs);
        if (!Number.isNaN(diff) && diff < minDiff) {
          minDiff = diff;
          currentIdx = idx;
        }

        const p25 = pm2_5[idx] ?? null;
        const p10 = pm10[idx] ?? null;
        const no2Val = nitrogen_dioxide[idx] ?? null;
        const o3Val = ozone[idx] ?? null;

        const computed = calculateIndianAqi({
          pm25: p25,
          pm10: p10,
          no2: no2Val,
          o3: o3Val,
        });

        const hhmm = iso.includes("T") ? (iso.split("T")[1]?.slice(0, 5) ?? iso) : iso.slice(0, 5);
        const observationType =
          !Number.isNaN(pointMs) && pointMs > nowMs + 30 * 60_000 ? "forecast" : "observed";

        return {
          time: iso,
          label: hhmm,
          aqi: computed.aqi,
          pm25: p25,
          pm10: p10,
          observationType,
        };
      });

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

      const snapshot: AirQualitySnapshot = {
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
