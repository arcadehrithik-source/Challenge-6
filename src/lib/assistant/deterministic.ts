import type { z } from "zod";
import { AQI_THRESHOLDS } from "../aqi-meta";
import { generateRecommendations } from "../recommendation-engine";
import type { assistantRequestSchema } from "../schemas";
import { sanitizeResponseText } from "../security/sanitize";
import type { AirQualitySnapshot, AssistantStructuredResponse, UserProfile } from "../types";

export type AssistantQueryInput = z.infer<typeof assistantRequestSchema>;

const FOCUS_TOPICS: ReadonlyArray<{ keywords: ReadonlyArray<string>; label: string }> = [
  {
    keywords: ["jog", "run", "exercise", "gym"],
    label: "outdoor exercise and breathing intensity",
  },
  {
    keywords: ["child", "kid", "school", "play"],
    label: "children's outdoor play and school travel",
  },
  {
    keywords: ["indoor", "purifier", "home", "plant"],
    label: "indoor air quality on your household budget",
  },
  {
    keywords: ["bicycle", "cycle", "commute", "bus", "metro"],
    label: "commute mode selection and route exposure",
  },
  {
    keywords: ["footprint", "sustainab", "emission", "co2"],
    label: "lowering your household emissions and exposure together",
  },
];

function detectFocusTopic(qLower: string): string {
  const matched = FOCUS_TOPICS.find((entry) => entry.keywords.some((kw) => qLower.includes(kw)));
  return matched?.label ?? "your overall daily schedule";
}

function buildAqiImpactClause(aqi: number): string {
  if (aqi > AQI_THRESHOLDS.POOR_MAX) {
    return "severe particulate concentrations make prolonged outdoor exertion and unvented roadside exposure high-priority to avoid today.";
  }
  if (aqi > AQI_THRESHOLDS.MODERATE_MAX) {
    return "poor air quality warrants shifting intense outdoor activity indoors, tightening window schedules, and preferring enclosed low-emission transit.";
  }
  if (aqi > AQI_THRESHOLDS.SATISFACTORY_MAX) {
    return "moderate haze means timing activity around midday dispersion and avoiding peak traffic plumes makes a meaningful difference.";
  }
  return "air quality is supportive of outdoor movement and natural ventilation—great conditions for zero-emission walking or cycling.";
}

function buildSyntheticInputs(context: AssistantQueryInput["context"]): {
  snapshot: AirQualitySnapshot;
  profile: UserProfile;
} {
  const city = context.location.split(",")[0]?.trim() || context.location;
  const snapshot: AirQualitySnapshot = {
    city,
    latitude: 0,
    longitude: 0,
    aqi: context.aqi,
    category: context.aqiCategory,
    pm25: context.pm25,
    pm10: context.pm10,
    no2: null,
    o3: null,
    mainPollutant: "PM2.5",
    healthAdvisory: "",
    dataSource:
      context.dataMode === "live" ? "Open-Meteo Air Quality API" : "BreatheWise Simulation",
    dataMode: context.dataMode,
    updatedAt: context.updatedAt,
    hourly: [],
    isFallback: context.dataMode === "demo",
  };

  const profile: UserProfile = {
    city,
    household: context.household,
    lifestyle: context.lifestyle,
    commute: context.commute,
    commuteDistanceKm: context.commuteDistanceKm,
    indoorEnvironment: context.indoorEnvironment,
    preferences: {
      dailyNotifications: context.preferences.dailyNotifications,
      notificationTime: "07:30",
      sustainabilityPriority: context.preferences.sustainabilityPriority,
      budget: context.preferences.budget,
    },
    updatedAt: context.updatedAt,
  };

  return { snapshot, profile };
}

/** Formats consistent source + timestamp telemetry strings for assistant output. */
export function formatDataSourceTimestamp(context: AssistantQueryInput["context"]): string {
  const source =
    context.dataMode === "live" ? "Open-Meteo Air Quality API" : "Demonstration Mode Simulation";
  return `${source} • Updated ${context.updatedAt}`;
}

/**
 * Generates deterministic, sanitized 7-part guidance when no LLM key is configured,
 * upstream LLM calls fail, or prompt injection is detected.
 */
export function buildDeterministicAssistantResponse(
  input: AssistantQueryInput,
  reasonNote?: string
): AssistantStructuredResponse {
  const { context } = input;
  const qLower = input.question.toLowerCase();
  const { snapshot, profile } = buildSyntheticInputs(context);

  const topRecs = generateRecommendations(snapshot, profile).slice(0, 3);
  const pm25Label = context.pm25 !== null ? `${context.pm25.toFixed(1)} µg/m³` : "unavailable";
  const pm10Label = context.pm10 !== null ? `${context.pm10.toFixed(1)} µg/m³` : "unavailable";

  const situationAssessment = `${context.location} is currently at AQI ${context.aqi} (${context.aqiCategory}) with PM2.5 at ${pm25Label} and PM10 at ${pm10Label}. Because you asked about ${detectFocusTopic(qLower)}, our deterministic planner prioritized actions matched to your ${context.household.replace(/_/g, " ")} household and ${context.commute.replace(/_/g, " ")} commute.`;

  const plantClarification =
    qLower.includes("indoor") && !context.indoorEnvironment.hasAirPurifier
      ? " Without a HEPA purifier, source control (no incense/smoking, exhaust while cooking, damp mopping) is far more effective than relying on houseplants, which cannot meaningfully purify an entire room."
      : "";

  const whatThisMeansForYou =
    `For a ${context.lifestyle.replace(/_/g, " ")} using ${context.commute.replace(/_/g, " ")} (${context.commuteDistanceKm} km), ` +
    buildAqiImpactClause(context.aqi) +
    plantClarification;

  const importantPrecautions =
    "Guidance is informational only and not medical advice or a guarantee against pollution exposure. If anyone in your household experiences persistent wheezing, chest discomfort, or breathlessness, consult a qualified clinician." +
    (reasonNote ? ` (${reasonNote})` : "");

  return {
    situationAssessment: sanitizeResponseText(situationAssessment),
    whatThisMeansForYou: sanitizeResponseText(whatThisMeansForYou),
    recommendedActions: topRecs.map((r) => sanitizeResponseText(`${r.title}: ${r.whatToDo}`)),
    whyTheseActionsMatter: sanitizeResponseText(topRecs.map((r) => r.whyItMatters).join(" ")),
    estimatedImpact: sanitizeResponseText(
      topRecs.map((r) => `${r.expectedBenefit} (${r.environmentalImpact})`).join(" ")
    ),
    importantPrecautions: sanitizeResponseText(importantPrecautions),
    dataSourceAndTimestamp: formatDataSourceTimestamp(context),
    providerUsed: "BreatheWise Deterministic Engine",
    isFallback: true,
  };
}
