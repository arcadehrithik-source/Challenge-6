import type { AqiCategory, PollutantCode } from "./types";

/** Central Indian NAQI (CPCB) threshold constants shared across engines and UI views. */
export const AQI_THRESHOLDS = {
  GOOD_MAX: 50,
  SATISFACTORY_MAX: 100,
  CAUTION_ACTIVE: 150,
  MODERATE_MAX: 200,
  POOR_MAX: 300,
  VERY_POOR_MAX: 400,
  MAX: 500,
} as const;

interface AqiCategoryMeta {
  category: AqiCategory;
  range: string;
  shortAction: string;
  healthAdvisory: string;
  colorClass: string;
  surfaceClass: string;
  borderClass: string;
}

/**
 * Visual styling, range metadata, and advisory text per CPCB category.
 */
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

const POLLUTANT_NOTES: Record<PollutantCode, string> = {
  "PM2.5": "Fine particulate matter",
  PM10: "Coarse inhalable dust and particulates",
  NO2: "Nitrogen dioxide",
  O3: "Ground-level ozone",
};

const POLLUTANT_CONTEXT: Record<PollutantCode, string> = {
  "PM2.5": "small enough to penetrate deep into airways and indoor spaces.",
  PM10: "often elevated near construction, dry roads, and traffic.",
  NO2: "linked primarily to vehicle exhaust and urban combustion.",
  O3: "that typically peaks during sunny afternoon hours.",
};

/**
 * Formats a plain-English pollutant card explanation given code and concentration (µg/m³).
 */
export function describePollutant(code: PollutantCode, value: number | null): string {
  const formatted = value !== null ? `${value.toFixed(1)} µg/m³` : "Unavailable";
  return `${POLLUTANT_NOTES[code]} (${formatted}) ${POLLUTANT_CONTEXT[code]}`;
}
