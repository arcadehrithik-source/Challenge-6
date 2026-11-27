import { AQI_THRESHOLDS } from "./aqi-meta";
import { buildCommuteRecommendations } from "./recommendations/commute";
import {
  buildCookingAndSustainabilityRecommendations,
  buildIndoorRecommendations,
} from "./recommendations/indoor-sustainability";
import {
  buildHouseholdRecommendations,
  buildOutdoorRecommendations,
} from "./recommendations/outdoor-household";
import { buildDefaultChecklist, generateDailySlotPlan } from "./recommendations/slots";
import type { RecommendationContext } from "./recommendations/types";
import type { AirQualitySnapshot, ExposureIndicator, Recommendation, UserProfile } from "./types";

export { buildDefaultChecklist, generateDailySlotPlan };

/** Baseline default user profile used before onboarding completion or after local reset. */
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
