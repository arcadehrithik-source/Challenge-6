import { AQI_CATEGORY_META, calculateIndianAqi } from "../aqi";
import { findCityPreset } from "../cities";
import type { AirQualitySnapshot, DemoScenario, HourlyAirQualityPoint } from "../types";

interface DemoCurveConfig {
  basePm25: number;
  basePm10: number;
  no2: number;
  o3: number;
  label: string;
}

const DEMO_SCENARIO_CURVES: Record<Exclude<DemoScenario, "auto">, DemoCurveConfig> = {
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

function getDiurnalFactor(hour: number): number {
  if (hour >= 6 && hour <= 10) return 1.24;
  if (hour >= 13 && hour <= 16) return 0.72;
  if (hour >= 18) return 1.18;
  return 0.96;
}

function buildSimulatedHourlySeries(baseTime: Date, cfg: DemoCurveConfig): HourlyAirQualityPoint[] {
  const hourly: HourlyAirQualityPoint[] = [];
  for (let offset = -12; offset <= 11; offset++) {
    const t = new Date(baseTime.getTime() + offset * 3600_000);
    const hour = t.getHours();
    const factor = getDiurnalFactor(hour);
    const pm25 = Number((cfg.basePm25 * factor).toFixed(1));
    const pm10 = Number((cfg.basePm10 * factor).toFixed(1));
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
  return hourly;
}

/**
 * Generates an explicitly labeled synthetic air-quality snapshot for Demo Mode or fallback paths.
 */
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
  const cfg = DEMO_SCENARIO_CURVES[inferScenarioForCity(params.city, params.scenario)];
  const baseTime = params.referenceTimeIso ? new Date(params.referenceTimeIso) : new Date();
  const hourly = buildSimulatedHourlySeries(baseTime, cfg);
  const currentPoint = hourly[12] ?? hourly[0];
  const pm25 = currentPoint?.pm25 ?? cfg.basePm25;
  const pm10 = currentPoint?.pm10 ?? cfg.basePm10;

  const currentAqi = calculateIndianAqi({
    pm25,
    pm10,
    no2: cfg.no2,
    o3: cfg.o3,
  });

  return {
    city: preset?.name ?? params.city,
    locality: params.locality || undefined,
    latitude: params.latitude ?? preset?.latitude ?? 22.5726,
    longitude: params.longitude ?? preset?.longitude ?? 88.3639,
    aqi: currentAqi.aqi,
    category: currentAqi.category,
    pm25,
    pm10,
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
