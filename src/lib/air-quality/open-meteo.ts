import { z } from "zod";
import { AQI_CATEGORY_META, calculateIndianAqi } from "../aqi";
import { findCityPreset } from "../cities";
import { getServerEnv, isAllowedExternalUrl } from "../security/env";
import type { AirQualitySnapshot, HourlyAirQualityPoint } from "../types";

const FORECAST_THRESHOLD_MS = 30 * 60_000;
const GEOCODING_TIMEOUT_MS = 5000;
const AIR_QUALITY_TIMEOUT_MS = 6500;

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
    signal: AbortSignal.timeout(GEOCODING_TIMEOUT_MS),
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

  return { name: first.name, latitude: first.latitude, longitude: first.longitude };
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
    const observationType = pointMs > nowMs + FORECAST_THRESHOLD_MS ? "forecast" : "observed";

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

/**
 * Fetches live Open-Meteo hourly pollutant readings, validates schema bounds,
 * and normalizes into an Indian NAQI snapshot.
 */
export async function fetchLiveOpenMeteoSnapshot(params: {
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
    signal: AbortSignal.timeout(AIR_QUALITY_TIMEOUT_MS),
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
