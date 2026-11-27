import { AQI_THRESHOLDS } from "../aqi-meta";
import type { AirQualitySnapshot, ChecklistItem, DailySlotPlan, UserProfile } from "../types";

function getSlotRisk(
  aqi: number,
  highThreshold: number,
  modThreshold: number
): DailySlotPlan["riskLevel"] {
  if (aqi > highThreshold) return "High";
  if (aqi > modThreshold) return "Elevated";
  return aqi > AQI_THRESHOLDS.SATISFACTORY_MAX ? "Moderate" : "Low";
}

function buildMorningSlot(aqi: number, profile: UserProfile): DailySlotPlan {
  const activeCommuter = profile.commute === "bicycle" || profile.commute === "walking";
  const poor = aqi > AQI_THRESHOLDS.MODERATE_MAX;
  const commuteAdvice = activeCommuter
    ? poor
      ? "Use closed transit or N95 mask on side streets."
      : "Prefer tree-lined interior streets."
    : "Keep cabin AC on recirculate in traffic.";

  return {
    slot: "Morning",
    timeRange: "06:00 – 10:30",
    riskLevel: getSlotRisk(aqi, AQI_THRESHOLDS.MODERATE_MAX, AQI_THRESHOLDS.SATISFACTORY_MAX),
    summary:
      aqi > AQI_THRESHOLDS.SATISFACTORY_MAX
        ? "Cool morning inversion typically traps PM2.5 near street level."
        : "Crisp morning conditions — safe for routine commute and errands.",
    actions: [
      profile.lifestyle === "fitness_enthusiast" && aqi > AQI_THRESHOLDS.CAUTION_ACTIVE
        ? "Move morning run indoors."
        : "Check live AQI before stepping out.",
      commuteAdvice,
    ],
    ventilationAdvice:
      aqi > AQI_THRESHOLDS.CAUTION_ACTIVE
        ? "Keep outer windows closed until late morning warmth disperses ground haze."
        : "Safe for 20-minute morning fresh-air flush.",
  };
}

function buildAfternoonSlot(aqi: number, profile: UserProfile): DailySlotPlan {
  const severe = aqi > AQI_THRESHOLDS.POOR_MAX;
  const poor = aqi > AQI_THRESHOLDS.MODERATE_MAX;
  return {
    slot: "Afternoon",
    timeRange: "11:30 – 16:00",
    riskLevel: severe ? "Elevated" : poor ? "Moderate" : "Low",
    summary: "Daytime warming usually offers the best atmospheric mixing window of the day.",
    actions: [
      "Schedule essential outdoor errands or short walks in this window.",
      profile.indoorEnvironment.cookingFuel !== "electric_induction"
        ? "Run kitchen exhaust during lunch prep."
        : "Keep lids on pots for faster, cleaner cooking.",
    ],
    ventilationAdvice: severe
      ? "Keep airing brief (10 mins) only if outdoor visibility improves; run purifier after."
      : "Best window to open opposite windows for 20–30 minutes to flush indoor CO2.",
  };
}

function buildEveningSlot(aqi: number, profile: UserProfile): DailySlotPlan {
  return {
    slot: "Evening",
    timeRange: "16:30 – 20:30",
    riskLevel:
      aqi > AQI_THRESHOLDS.MODERATE_MAX
        ? "High"
        : aqi > AQI_THRESHOLDS.SATISFACTORY_MAX
          ? "Elevated"
          : "Moderate",
    summary: "Rush-hour traffic overlaps with cooling boundary layer — particulates climb rapidly.",
    actions: [
      profile.household === "family_with_children"
        ? "Shift children's play indoors before sunset."
        : "Avoid lingering near busy intersections.",
      "Use damp cloth dusting instead of dry sweeping.",
    ],
    ventilationAdvice: "Close street-facing windows before 17:30 to prevent evening smog trap.",
  };
}

function buildNightSlot(aqi: number, profile: UserProfile): DailySlotPlan {
  return {
    slot: "Night",
    timeRange: "21:00 – 05:30",
    riskLevel: getSlotRisk(aqi, AQI_THRESHOLDS.POOR_MAX, AQI_THRESHOLDS.MODERATE_MAX),
    summary: "Calm night winds allow particulates to settle indoors if frames are unsealed.",
    actions: [
      profile.indoorEnvironment.hasAirPurifier
        ? "Run HEPA purifier in bedroom with door closed."
        : "Seal door gaps and avoid incense/mosquito coils indoors.",
      "Prepare next-day commute mask & low-emission plan.",
    ],
    ventilationAdvice: `Keep bedroom windows closed overnight when outdoor AQI exceeds ${AQI_THRESHOLDS.CAUTION_ACTIVE}.`,
  };
}

/**
 * Generates Morning/Afternoon/Evening/Night time-of-day exposure and ventilation plans.
 */
export function generateDailySlotPlan(
  airQuality: AirQualitySnapshot,
  profile: UserProfile
): DailySlotPlan[] {
  const aqi = airQuality.aqi;
  return [
    buildMorningSlot(aqi, profile),
    buildAfternoonSlot(aqi, profile),
    buildEveningSlot(aqi, profile),
    buildNightSlot(aqi, profile),
  ];
}

/**
 * Builds the interactive household safety and sustainability checklist.
 */
export function buildDefaultChecklist(
  airQuality: AirQualitySnapshot,
  profile: UserProfile
): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: "chk-no-incense",
      label: "Keep indoor air combustion-free today (no incense, coils, or indoor smoke)",
      category: "indoor",
      co2AvoidedKg: 0.25,
      exposureReductionNote: "Eliminates high-concentration indoor PM2.5 spikes.",
      completed: false,
    },
    {
      id: "chk-kitchen-vent",
      label: "Run kitchen exhaust / ventilate stove area during every meal",
      category: "indoor",
      co2AvoidedKg: 0.15,
      exposureReductionNote: "Prevents cooking NO2 and aerosol buildup indoors.",
      completed: false,
    },
    {
      id: "chk-damp-clean",
      label: "Damp-mop floors instead of dry sweeping to avoid resuspending dust",
      category: "health",
      co2AvoidedKg: 0.1,
      exposureReductionNote: "Keeps settled coarse dust out of breathing zone.",
      completed: false,
    },
    {
      id: "chk-window-timing",
      label:
        airQuality.aqi > AQI_THRESHOLDS.CAUTION_ACTIVE
          ? "Close windows during peak smog & ventilate briefly midday (13:00–15:30)"
          : "Cross-ventilate home naturally for 30 minutes instead of running AC",
      category: "energy",
      co2AvoidedKg: 0.65,
      exposureReductionNote: "Balances CO2 freshness and indoor particulate protection.",
      completed: false,
    },
    {
      id: "chk-commute-green",
      label:
        profile.commute === "car"
          ? "Carpool, take public transit, or bundle errands to skip one solo car trip"
          : "Choose a low-emission transit / side-street commute option today",
      category: "commute",
      co2AvoidedKg: Number((Math.max(2, profile.commuteDistanceKm) * 0.16).toFixed(2)),
      exposureReductionNote: "Cuts street-level tailpipe emissions for your neighborhood.",
      completed: false,
    },
  ];

  if (profile.preferences.dailyNotifications) {
    items.push({
      id: "chk-energy-standby",
      label: "Switch off idle appliances & use LED/fan efficiency settings",
      category: "energy",
      co2AvoidedKg: 0.45,
      exposureReductionNote: "Lowers grid power demand tied to urban thermal emissions.",
      completed: false,
    });
  }

  return items;
}
