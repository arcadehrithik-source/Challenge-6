import { AQI_CATEGORY_META, AQI_THRESHOLDS, describePollutant } from "./aqi-meta";
import type { AqiCategory, PollutantCode } from "./types";

export { AQI_CATEGORY_META, AQI_THRESHOLDS, describePollutant };

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// Indian National Air Quality Index (CPCB) sub-index breakpoints.
const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
  { cLow: 30, cHigh: 60, iLow: 51, iHigh: 100 },
  { cLow: 60, cHigh: 90, iLow: 101, iHigh: 200 },
  { cLow: 90, cHigh: 120, iLow: 201, iHigh: 300 },
  { cLow: 120, cHigh: 250, iLow: 301, iHigh: 400 },
  { cLow: 250, cHigh: 380, iLow: 401, iHigh: 500 },
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 100, cHigh: 250, iLow: 101, iHigh: 200 },
  { cLow: 250, cHigh: 350, iLow: 201, iHigh: 300 },
  { cLow: 350, cHigh: 430, iLow: 301, iHigh: 400 },
  { cLow: 430, cHigh: 510, iLow: 401, iHigh: 500 },
];

const NO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
  { cLow: 40, cHigh: 80, iLow: 51, iHigh: 100 },
  { cLow: 80, cHigh: 180, iLow: 101, iHigh: 200 },
  { cLow: 180, cHigh: 280, iLow: 201, iHigh: 300 },
  { cLow: 280, cHigh: 400, iLow: 301, iHigh: 400 },
  { cLow: 400, cHigh: 520, iLow: 401, iHigh: 500 },
];

const O3_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 100, cHigh: 168, iLow: 101, iHigh: 200 },
  { cLow: 168, cHigh: 208, iLow: 201, iHigh: 300 },
  { cLow: 208, cHigh: 748, iLow: 301, iHigh: 400 },
  { cLow: 748, cHigh: 900, iLow: 401, iHigh: 500 },
];

function computeSubIndex(concentration: number | null, table: Breakpoint[]): number | null {
  if (concentration === null || !Number.isFinite(concentration) || concentration < 0) {
    return null;
  }

  for (const bp of table) {
    if (concentration <= bp.cHigh) {
      const ratio = (concentration - bp.cLow) / (bp.cHigh - bp.cLow);
      return Math.round(bp.iLow + ratio * (bp.iHigh - bp.iLow));
    }
  }

  return AQI_THRESHOLDS.MAX;
}

/**
 * Calculates overall Indian NAQI score, CPCB category, and dominant pollutant driver.
 */
export function calculateIndianAqi(pollutants: {
  pm25: number | null;
  pm10: number | null;
  no2?: number | null;
  o3?: number | null;
}): { aqi: number; category: AqiCategory; mainPollutant: PollutantCode } {
  const candidates: Array<{ code: PollutantCode; index: number | null }> = [
    { code: "PM2.5", index: computeSubIndex(pollutants.pm25, PM25_BREAKPOINTS) },
    { code: "PM10", index: computeSubIndex(pollutants.pm10, PM10_BREAKPOINTS) },
    { code: "NO2", index: computeSubIndex(pollutants.no2 ?? null, NO2_BREAKPOINTS) },
    { code: "O3", index: computeSubIndex(pollutants.o3 ?? null, O3_BREAKPOINTS) },
  ];

  const valid = candidates.filter(
    (entry): entry is { code: PollutantCode; index: number } => entry.index !== null
  );

  valid.sort((a, b) => b.index - a.index);
  const top = valid[0];
  if (!top) {
    return { aqi: 0, category: "Good", mainPollutant: "PM2.5" };
  }

  const boundedAqi = Math.min(AQI_THRESHOLDS.MAX, Math.max(0, top.index));
  return {
    aqi: boundedAqi,
    category: getAqiCategory(boundedAqi),
    mainPollutant: top.code,
  };
}

/**
 * Maps a numeric AQI value onto its official CPCB Indian NAQI category label.
 */
export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= AQI_THRESHOLDS.GOOD_MAX) return "Good";
  if (aqi <= AQI_THRESHOLDS.SATISFACTORY_MAX) return "Satisfactory";
  if (aqi <= AQI_THRESHOLDS.MODERATE_MAX) return "Moderate";
  if (aqi <= AQI_THRESHOLDS.POOR_MAX) return "Poor";
  if (aqi <= AQI_THRESHOLDS.VERY_POOR_MAX) return "Very Poor";
  return "Severe";
}
