import type { AqiCategory, PollutantCode } from "./types";

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
  if (concentration === null || Number.isNaN(concentration) || concentration < 0) {
    return null;
  }

  for (const bp of table) {
    if (concentration <= bp.cHigh) {
      const ratio = (concentration - bp.cLow) / (bp.cHigh - bp.cLow);
      return Math.round(bp.iLow + ratio * (bp.iHigh - bp.iLow));
    }
  }

  return 500;
}

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

  if (valid.length === 0) {
    return {
      aqi: 0,
      category: "Good",
      mainPollutant: "PM2.5",
    };
  }

  valid.sort((a, b) => b.index - a.index);
  const top = valid[0]!;
  const boundedAqi = Math.min(500, Math.max(0, top.index));

  return {
    aqi: boundedAqi,
    category: getAqiCategory(boundedAqi),
    mainPollutant: top.code,
  };
}

export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export interface AqiCategoryMeta {
  category: AqiCategory;
  range: string;
  shortAction: string;
  healthAdvisory: string;
  colorClass: string;
  surfaceClass: string;
  borderClass: string;
}

export const AQI_CATEGORY_META: Record<AqiCategory, AqiCategoryMeta> = {
  Good: {
    category: "Good",
    range: "0 – 50",
    shortAction: "Ideal for outdoor movement & ventilation",
    healthAdvisory:
      "Minimal impact. Air quality is suitable for outdoor routines, school play, and natural cross-ventilation.",
    colorClass: "text-emerald-800",
    surfaceClass: "bg-emerald-50",
    borderClass: "border-emerald-300",
  },
  Satisfactory: {
    category: "Satisfactory",
    range: "51 – 100",
    shortAction: "Normal routines with light watch for sensitive groups",
    healthAdvisory:
      "Acceptable air quality; unusually sensitive individuals may experience minor breathing discomfort during prolonged exertion.",
    colorClass: "text-teal-800",
    surfaceClass: "bg-teal-50",
    borderClass: "border-teal-300",
  },
  Moderate: {
    category: "Moderate",
    range: "101 – 200",
    shortAction: "Time outdoor workouts carefully; ventilate midday",
    healthAdvisory:
      "May cause breathing discomfort to people with lung/heart sensitivities, children, and older adults during sustained outdoor exertion.",
    colorClass: "text-amber-900",
    surfaceClass: "bg-amber-50",
    borderClass: "border-amber-300",
  },
  Poor: {
    category: "Poor",
    range: "201 – 300",
    shortAction: "Shift workouts indoors; reduce traffic-corridor exposure",
    healthAdvisory:
      "May cause breathing discomfort on prolonged exposure and affect sensitive groups more quickly. Prefer indoor activities and filtered air.",
    colorClass: "text-orange-900",
    surfaceClass: "bg-orange-50",
    borderClass: "border-orange-300",
  },
  "Very Poor": {
    category: "Very Poor",
    range: "301 – 400",
    shortAction: "Avoid outdoor exertion; seal leaks & run filtration",
    healthAdvisory:
      "Prolonged exposure increases respiratory irritation risk for everyone. Minimize outdoor time, avoid busy roads, and manage indoor pollution sources.",
    colorClass: "text-red-900",
    surfaceClass: "bg-red-50",
    borderClass: "border-red-300",
  },
  Severe: {
    category: "Severe",
    range: "401 – 500",
    shortAction: "Stay indoors where possible; use N95/FFP2 outdoors",
    healthAdvisory:
      "Severe air quality affects healthy individuals and poses heightened concern for children, seniors, and outdoor workers. Avoid strenuous outdoor activity.",
    colorClass: "text-rose-950",
    surfaceClass: "bg-rose-100",
    borderClass: "border-rose-400",
  },
};

export function describePollutant(code: PollutantCode, value: number | null): string {
  const formatted = value !== null ? `${value.toFixed(1)} µg/m³` : "Unavailable";
  switch (code) {
    case "PM2.5":
      return `Fine particulate matter (${formatted}) small enough to penetrate deep into airways and indoor spaces.`;
    case "PM10":
      return `Coarse inhalable dust and particulates (${formatted}) often elevated near construction, dry roads, and traffic.`;
    case "NO2":
      return `Nitrogen dioxide (${formatted}) linked primarily to vehicle exhaust and urban combustion.`;
    case "O3":
      return `Ground-level ozone (${formatted}) that typically peaks during sunny afternoon hours.`;
  }
}
