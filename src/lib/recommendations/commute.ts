import { AQI_THRESHOLDS } from "../aqi-meta";
import type { Recommendation } from "../types";
import type { RecommendationContext } from "./types";

function buildActiveCommuteRec(ctx: RecommendationContext): Recommendation {
  const { airQuality, profile, aqi, isSevereOrVeryPoor, isPoorPlus } = ctx;
  if (isPoorPlus) {
    return {
      id: "active-commute-switch",
      title: `Pause ${profile.commute} commute today — switch to metro or closed-window transit`,
      whatToDo: `For your ${profile.commuteDistanceKm} km trip, take metro/AC bus or carpool instead of ${profile.commute}. If you must walk short links, take quiet interior lanes and wear a fitted N95 mask.`,
      whyItMatters:
        "Cycling and brisk walking elevate breathing rate 2–4x directly in street-level emissions; during Poor/Severe AQI, elevated inhalation outweighs the short-term convenience.",
      whenToDoIt: `Morning and evening commute legs while AQI exceeds ${AQI_THRESHOLDS.MODERATE_MAX}.`,
      expectedBenefit:
        "Avoids heavy street-level particulate dose while keeping per-passenger emissions low via public transit.",
      difficulty: "Moderate",
      estimatedCost: "₹20–₹60 transit fare",
      environmentalImpact: "Metro/bus keeps per-km emissions ~70–85% lower than driving solo.",
      supportingData: `Current commute=${profile.commute} (${profile.commuteDistanceKm} km) at AQI ${aqi}.`,
      priorityScore: 94,
      urgency: isSevereOrVeryPoor ? "critical" : "high",
      category: "commute",
    };
  }

  return {
    id: "active-commute-route",
    title: "Choose quieter parallel lanes over high-traffic arterial roads",
    whatToDo: `Keep your zero-emission ${profile.commute} commute, but shift one or two blocks off major diesel/bus corridors even if it adds 3–4 minutes.`,
    whyItMatters:
      "A slightly longer side-street route often has 30–50% lower tailpipe PM2.5 and NO2 than the shortest main-road route.",
    whenToDoIt: "Daily commute.",
    expectedBenefit: "Preserves zero-carbon transport while cutting traffic-plume spikes.",
    difficulty: "Easy",
    estimatedCost: "₹0",
    environmentalImpact: `Avoids ~${(profile.commuteDistanceKm * 0.17 * 2).toFixed(1)} kg CO2/day vs solo car.`,
    supportingData: `AQI ${aqi} (${airQuality.category}); active zero-emission commuter.`,
    priorityScore: 80,
    urgency: "medium",
    category: "commute",
  };
}

function buildMotorizedCommuteRec(ctx: RecommendationContext): Recommendation[] {
  const { airQuality, profile, aqi, isPoorPlus, isModeratePlus } = ctx;
  if (profile.commute === "two_wheeler" && isModeratePlus) {
    return [
      {
        id: "two-wheeler-protection",
        title: "Use a full-face helmet with N95 mask or switch to public transit",
        whatToDo:
          "Switch to metro/bus on days above AQI 200; when riding, pair a closed-visor helmet with a fitted N95 mask and avoid tailgating heavy buses/trucks.",
        whyItMatters: "Two-wheeler riders sit at exhaust-pipe height with zero cabin filtration.",
        whenToDoIt: `Every ride while AQI is above ${AQI_THRESHOLDS.SATISFACTORY_MAX}.`,
        expectedBenefit: "Reduces direct exhaust and road-dust inhalation.",
        difficulty: "Easy",
        estimatedCost: "₹40–₹100 mask or transit fare",
        environmentalImpact: "Switching to public transit cuts personal NOx and CO2 emissions.",
        supportingData: `Two-wheeler commuter (${profile.commuteDistanceKm} km) at AQI ${aqi}.`,
        priorityScore: 89,
        urgency: isPoorPlus ? "high" : "medium",
        category: "commute",
      },
    ];
  }

  if (profile.commute === "car") {
    return [
      {
        id: "car-recirculate-carpool",
        title: "Use cabin recirculation mode in traffic & carpool or combine errands",
        whatToDo:
          "Set car AC to 'recirculate' in congested traffic (while cracking fresh intake briefly on open stretches to prevent CO2 buildup), check cabin air filter, and carpool or take metro 2+ days/week.",
        whyItMatters:
          "Fresh-air intake mode pulls roadside exhaust directly into the cabin; single-occupant driving also worsens city PM2.5 and NO2.",
        whenToDoIt: "During daily commute and congested junctions.",
        expectedBenefit: "Lowers in-cabin PM2.5 spikes and cuts per-person tailpipe emissions.",
        difficulty: "Easy",
        estimatedCost: "₹0 (saves fuel when carpooling)",
        environmentalImpact: `Sharing a ${profile.commuteDistanceKm} km round trip halves per-person CO2 (~1.7 kg saved/day).`,
        supportingData: `Car commuter (${profile.commuteDistanceKm} km) at AQI ${aqi}.`,
        priorityScore: 82,
        urgency: isPoorPlus ? "high" : "medium",
        category: "commute",
      },
    ];
  }

  if (profile.commute === "public_transport") {
    return [
      {
        id: "public-transit-optimization",
        title: "Continue public transit and minimize roadside waiting time",
        whatToDo:
          "Time departure with transit arrivals so you spend minimal minutes standing beside busy bus bays; wear an N95 during last-mile walks if AQI > 200.",
        whyItMatters:
          "Public transit drastically reduces city emissions per trip, while enclosed metro stations/AC coaches buffer street-level spikes.",
        whenToDoIt: "Morning and evening transit legs.",
        expectedBenefit: "Low carbon footprint plus controlled exposure on enclosed transit.",
        difficulty: "Easy",
        estimatedCost: "₹0 extra",
        environmentalImpact: `Saves ~${(profile.commuteDistanceKm * 0.12 * 2).toFixed(1)} kg CO2/day compared with driving alone.`,
        supportingData: `Public transport commuter at AQI ${aqi} (${airQuality.category}).`,
        priorityScore: 74,
        urgency: "low",
        category: "commute",
      },
    ];
  }

  return [];
}

/** Builds commute-mode recommendations balancing exposure reduction and per-trip emissions. */
export function buildCommuteRecommendations(ctx: RecommendationContext): Recommendation[] {
  if (ctx.profile.commute === "bicycle" || ctx.profile.commute === "walking") {
    return [buildActiveCommuteRec(ctx)];
  }
  return buildMotorizedCommuteRec(ctx);
}
