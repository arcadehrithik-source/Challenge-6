import type { Recommendation } from "../types";
import type { RecommendationContext } from "./types";

function buildFitnessRecommendation(ctx: RecommendationContext): Recommendation {
  const { airQuality, aqi, pm25Text, isSevereOrVeryPoor, isPoorPlus, isModeratePlus } = ctx;
  if (isPoorPlus) {
    return {
      id: "fitness-indoor-shift",
      title: "Move today's cardio and intense training indoors",
      whatToDo:
        "Replace outdoor jogging or intervals with indoor bodyweight, mobility, or stationary workouts away from open street-facing windows.",
      whyItMatters:
        "Vigorous exercise increases minute ventilation 5–10x, pulling fine particulates deeper into lower airways when PM2.5 is high.",
      whenToDoIt:
        "All day while AQI remains above 200; reassess only if midday AQI drops below 150.",
      expectedBenefit: "Avoids high-dose peak PM2.5 inhalation during elevated breathing rates.",
      difficulty: "Easy",
      estimatedCost: "₹0",
      environmentalImpact:
        "Zero emissions; maintains health habit without car trips to distant gyms.",
      supportingData: `Current AQI ${aqi} (${airQuality.category}); PM2.5 at ${pm25Text}.`,
      priorityScore: 98,
      urgency: isSevereOrVeryPoor ? "critical" : "high",
      category: "outdoor",
    };
  }

  if (isModeratePlus) {
    return {
      id: "fitness-timing-shift",
      title: "Shift outdoor workouts to midday dispersion windows",
      whatToDo:
        "Avoid 06:00–09:00 and post-sunset runs; train between 12:30 and 16:00 in green parks set back from arterial roads.",
      whyItMatters:
        "Winter morning inversion traps vehicle emissions close to ground level before afternoon warming disperses particulates.",
      whenToDoIt: "Between 12:30 and 16:00 when hourly dispersion improves.",
      expectedBenefit:
        "Substantially lowers particulate intake compared with dawn traffic-corridor runs.",
      difficulty: "Easy",
      estimatedCost: "₹0",
      environmentalImpact: "Supports active zero-carbon mobility and outdoor stewardship.",
      supportingData: `Current AQI ${aqi} (${airQuality.category}) with morning/evening inversion tendency.`,
      priorityScore: 84,
      urgency: "medium",
      category: "outdoor",
    };
  }

  return {
    id: "fitness-green-route",
    title: "Take advantage of clean air for outdoor conditioning",
    whatToDo:
      "Complete outdoor runs or cycling in neighborhood parks while avoiding idling intersections.",
    whyItMatters:
      "Clean baseline air supports cardiovascular fitness without significant particulate stress.",
    whenToDoIt: "Morning or late afternoon.",
    expectedBenefit: "High fitness benefit with low particulate load.",
    difficulty: "Easy",
    estimatedCost: "₹0",
    environmentalImpact: "Zero-emission recreation.",
    supportingData: `AQI ${aqi} (${airQuality.category}) is well within comfortable outdoor limits.`,
    priorityScore: 60,
    urgency: "low",
    category: "outdoor",
  };
}

/** Builds outdoor activity recommendations based on user lifestyle and current AQI. */
export function buildOutdoorRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { airQuality, profile, aqi, isSevereOrVeryPoor, isModeratePlus } = ctx;
  const recs: Recommendation[] = [];

  if (profile.lifestyle === "fitness_enthusiast") {
    recs.push(buildFitnessRecommendation(ctx));
  }

  if (profile.lifestyle === "outdoor_worker" && isModeratePlus) {
    recs.push({
      id: "outdoor-worker-protection",
      title: "Use a well-fitted N95/FFP2 respirator and take shaded indoor breaks",
      whatToDo:
        "Wear a snug N95/FFP2 mask (no gaps around the nose bridge) during roadside shifts and take 10-minute breaks indoors away from dust and exhaust.",
      whyItMatters:
        "Cloth masks and loose surgical masks let fine PM2.5 bypass around the edges during full-day outdoor shifts.",
      whenToDoIt: "Throughout outdoor shifts, especially during morning and evening rush hours.",
      expectedBenefit:
        "Significantly reduces inhaled fine particulate mass when staying indoors is not an option.",
      difficulty: "Moderate",
      estimatedCost: "₹40–₹120 per reusable N95 respirator",
      environmentalImpact: "Reusable respirators reduce single-use mask waste.",
      supportingData: `Outdoor worker profile with AQI ${aqi} (${airQuality.category}) and main pollutant ${airQuality.mainPollutant}.`,
      priorityScore: 99,
      urgency: isSevereOrVeryPoor ? "critical" : "high",
      category: "outdoor",
    });
  }

  return recs;
}

/** Builds household protection recommendations for families with children or senior citizens. */
export function buildHouseholdRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { airQuality, profile, aqi, isSevereOrVeryPoor, isPoorPlus, isModeratePlus } = ctx;
  const recs: Recommendation[] = [];

  if (profile.household === "family_with_children") {
    recs.push(
      isPoorPlus
        ? {
            id: "children-indoor-play",
            title: "Replace evening playground play with structured indoor activities",
            whatToDo:
              "Keep children indoors during evening smog buildup; organize indoor games, reading, or stretching in the cleanest room, and use an N95 child-sized mask for school transit if tolerable.",
            whyItMatters:
              "Children inhale more air per kilogram of body weight and their developing lungs are more sensitive to PM2.5 inflammation.",
            whenToDoIt: "School commute windows and 16:30–21:00 evening peak.",
            expectedBenefit:
              "Protects children from highest daily particulate spikes without disrupting school routines.",
            difficulty: "Easy",
            estimatedCost: "₹0 (₹80–₹150 if buying child-fit N95)",
            environmentalImpact:
              "Encourages shared carpool/bus school transport instead of individual idling drop-offs.",
            supportingData: `Family with children profile at AQI ${aqi} (${airQuality.category}).`,
            priorityScore: 96,
            urgency: isSevereOrVeryPoor ? "critical" : "high",
            category: "household",
          }
        : {
            id: "children-school-timing",
            title: "Prefer shaded/side-street waiting zones during school pickup",
            whatToDo:
              "Wait 30–50 meters away from idling school buses and main road junctions during drop-off and pickup.",
            whyItMatters:
              "Micro-plumes next to idling vehicles contain concentrated NO2 and ultra-fine exhaust particles even on moderate AQI days.",
            whenToDoIt: "Morning drop-off and afternoon pickup.",
            expectedBenefit: "Lowers localized traffic exhaust inhalation for children.",
            difficulty: "Easy",
            estimatedCost: "₹0",
            environmentalImpact:
              "Ask drivers to switch off engines while waiting (anti-idling saves fuel).",
            supportingData: `City ${airQuality.city} AQI ${aqi}; NO2 ${airQuality.no2 ?? "N/A"} µg/m³.`,
            priorityScore: 76,
            urgency: "medium",
            category: "household",
          }
    );
  }

  if (profile.household === "household_with_seniors" && isModeratePlus) {
    recs.push({
      id: "seniors-protection",
      title: "Keep senior citizens' resting room sealed during peak smog & monitor comfort",
      whatToDo:
        "Close outer doors/windows in senior bedrooms during early morning and late evening smog, avoid morning walks before 10:00, and keep indoor air calm and dust-free with damp mopping.",
      whyItMatters:
        "Older adults face higher cardiopulmonary strain from prolonged PM2.5 and cold winter haze.",
      whenToDoIt: "Early morning (05:30–09:30) and night (19:00–23:00).",
      expectedBenefit: "Reduces irritant exposure during sleep and morning routines.",
      difficulty: "Easy",
      estimatedCost: "₹0",
      environmentalImpact:
        "Low-energy passive dust control (damp mopping instead of dry sweeping).",
      supportingData: `Household with seniors at AQI ${aqi} (${airQuality.category}).`,
      priorityScore: 95,
      urgency: isPoorPlus ? "critical" : "high",
      category: "household",
    });
  }

  return recs;
}
