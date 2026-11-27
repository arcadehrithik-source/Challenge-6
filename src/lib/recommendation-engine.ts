import { AQI_THRESHOLDS } from "./aqi";
import {
  buildCommuteRecommendations,
  buildCookingAndSustainabilityRecommendations,
  buildHouseholdRecommendations,
  buildIndoorRecommendations,
  buildOutdoorRecommendations,
  type RecommendationContext,
} from "./recommendations/builders";
import type {
  AirQualitySnapshot,
  ChecklistItem,
  DailySlotPlan,
  ExposureIndicator,
  Recommendation,
  UserProfile,
} from "./types";

/**
 * Baseline default user profile used before onboarding completion or after local reset.
 */
export const DEFAULT_USER_PROFILE: UserProfile = {
  city: "Kolkata",
  locality: "Salt Lake Sector V",
  household: "family_with_children",
  lifestyle: "office_commuter",
  commute: "public_transport",
  commuteDistanceKm: 10,
  indoorEnvironment: {
    hasAirPurifier: false,
    hasIndoorPlants: true,
    windowsFrequentlyOpen: true,
    cookingFuel: "lpg_png",
    ventilation: "moderate",
  },
  preferences: {
    dailyNotifications: true,
    notificationTime: "07:30",
    sustainabilityPriority: "protect_health",
    budget: "zero_low_cost",
  },
  demoScenario: "auto",
  updatedAt: new Date(0).toISOString(),
};

const HOUSEHOLD_EXPOSURE_BONUS: Partial<
  Record<UserProfile["household"], { pts: number; note: string }>
> = {
  family_with_children: {
    pts: 12,
    note: "Household includes children, who breathe faster per body weight and need protected play windows.",
  },
  household_with_seniors: {
    pts: 12,
    note: "Household includes senior citizens, who benefit from tighter indoor PM2.5 control and low-exertion schedules.",
  },
};

const LIFESTYLE_EXPOSURE_BONUS: Partial<
  Record<UserProfile["lifestyle"], { pts: number; note: string }>
> = {
  outdoor_worker: {
    pts: 14,
    note: "Outdoor work significantly extends cumulative daily inhalation compared with indoor schedules.",
  },
  fitness_enthusiast: {
    pts: 14,
    note: "High-ventilation exercise multiplies lung airflow, amplifying particulate intake during elevated AQI.",
  },
};

function getExposureLevel(score: number): ExposureIndicator["level"] {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Elevated";
  if (score >= 22) return "Moderate";
  return "Low";
}

function getExposureHeadline(
  level: ExposureIndicator["level"],
  lifestyle: UserProfile["lifestyle"]
): string {
  if (level === "Critical" || level === "High") {
    return `High lifestyle exposure sensitivity today for your ${lifestyle.replace("_", " ")} routine.`;
  }
  if (level === "Elevated") {
    return "Moderate-to-elevated exposure window — timing and route adjustments will meaningfully cut intake.";
  }
  return "Low relative exposure pressure — ideal conditions for sustainable low-emission habits.";
}

/**
 * Computes a transparent situational exposure sensitivity score (not a clinical score).
 */
export function computeExposureIndicator(
  airQuality: AirQualitySnapshot,
  profile: UserProfile
): ExposureIndicator {
  let score = Math.round((airQuality.aqi / AQI_THRESHOLDS.MAX) * 65);
  const rationale: string[] = [
    `Current ${airQuality.city} AQI is ${airQuality.aqi} (${airQuality.category}), driven primarily by ${airQuality.mainPollutant}.`,
  ];

  const householdBonus = HOUSEHOLD_EXPOSURE_BONUS[profile.household];
  if (householdBonus) {
    score += householdBonus.pts;
    rationale.push(householdBonus.note);
  }

  const lifestyleBonus = LIFESTYLE_EXPOSURE_BONUS[profile.lifestyle];
  if (lifestyleBonus) {
    score += lifestyleBonus.pts;
    rationale.push(lifestyleBonus.note);
  }

  if (
    profile.commute === "bicycle" ||
    profile.commute === "walking" ||
    profile.commute === "two_wheeler"
  ) {
    score += 10;
    rationale.push(
      `Open-air ${profile.commute.replace("_", "-")} commute (${profile.commuteDistanceKm} km) places you directly in street-level tailpipe and dust plumes.`
    );
  } else if (profile.commute === "work_from_home") {
    score -= 6;
    rationale.push(
      "Working from home avoids peak-traffic corridor inhalation, shifting priority to indoor air hygiene."
    );
  }

  if (!profile.indoorEnvironment.hasAirPurifier && airQuality.aqi > AQI_THRESHOLDS.MODERATE_MAX) {
    score += 7;
    rationale.push(
      "No mechanical HEPA purifier is configured; sealing peak smog infiltration and cooking exhaust becomes essential."
    );
  }

  if (profile.indoorEnvironment.cookingFuel === "solid_biomass_kerosene") {
    score += 10;
    rationale.push(
      "Solid/biomass or kerosene cooking can generate extreme indoor PM2.5 peaks unless vented continuously."
    );
  }

  const clamped = Math.min(100, Math.max(5, score));
  const level = getExposureLevel(clamped);

  return {
    level,
    score: clamped,
    headline: getExposureHeadline(level, profile.lifestyle),
    rationale,
    disclaimer:
      "Situational guidance indicator only — not a medical diagnosis, clinical risk score, or personal dosimeter measurement.",
  };
}

/**
 * Generates prioritized, context-aware recommendations across outdoor, household, commute, indoor, and sustainability domains.
 */
export function generateRecommendations(
  airQuality: AirQualitySnapshot,
  profile: UserProfile,
  hourOfDay = 8
): Recommendation[] {
  const aqi = airQuality.aqi;
  const ctx: RecommendationContext = {
    airQuality,
    profile,
    hourOfDay,
    aqi,
    pm25Text: airQuality.pm25 !== null ? `${airQuality.pm25.toFixed(1)} µg/m³` : "elevated levels",
    isSevereOrVeryPoor: aqi > AQI_THRESHOLDS.POOR_MAX,
    isPoorPlus: aqi > AQI_THRESHOLDS.MODERATE_MAX,
    isModeratePlus: aqi > AQI_THRESHOLDS.SATISFACTORY_MAX,
    lowBudget: profile.preferences.budget === "zero_low_cost",
  };

  return [
    ...buildOutdoorRecommendations(ctx),
    ...buildHouseholdRecommendations(ctx),
    ...buildCommuteRecommendations(ctx),
    ...buildIndoorRecommendations(ctx),
    ...buildCookingAndSustainabilityRecommendations(ctx),
  ].sort((a, b) => b.priorityScore - a.priorityScore);
}

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
