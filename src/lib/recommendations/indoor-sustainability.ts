import { AQI_THRESHOLDS } from "../aqi-meta";
import type { Recommendation } from "../types";
import type { RecommendationContext } from "./types";

function buildPurifierOrSourceControlRec(ctx: RecommendationContext): Recommendation {
  const { airQuality, profile, aqi, isPoorPlus, lowBudget } = ctx;
  if (profile.indoorEnvironment.hasAirPurifier) {
    return {
      id: "hepa-operation",
      title: isPoorPlus
        ? "Run HEPA purifier continuously in the main occupied room"
        : "Schedule HEPA purifier around morning/evening spikes",
      whatToDo:
        "Close doors/windows in the target room, place the purifier away from corners, run on Medium/Auto (avoid Sleep mode during severe smog), and vacuum the pre-filter every 2 weeks.",
      whyItMatters:
        "A properly sized HEPA purifier only lowers indoor PM2.5 effectively when outdoor air infiltration is restricted.",
      whenToDoIt: isPoorPlus
        ? "Continuous during waking hours & sleep."
        : "06:00–09:00 and 19:00–23:00.",
      expectedBenefit:
        "Substantially reduces indoor fine particulate concentrations in closed rooms.",
      difficulty: "Easy",
      estimatedCost: "₹5–₹12/day electricity",
      environmentalImpact: "Using Auto mode and clean pre-filters prevents excess fan power draw.",
      supportingData: `Air purifier available; outdoor AQI ${aqi} (${airQuality.category}).`,
      priorityScore: isPoorPlus ? 92 : 70,
      urgency: isPoorPlus ? "high" : "low",
      category: "indoor",
    };
  }

  return {
    id: "no-purifier-practical",
    title: "Control indoor particles without an expensive purifier",
    whatToDo:
      "Seal obvious window/door gaps with weatherstripping or damp towels during severe smog, damp-mop floors instead of dry sweeping, eliminate incense/agarbatti/mosquito coils, and consider a DIY MERV-13 box-fan filter if budget allows.",
    whyItMatters:
      "Stopping indoor combustion and resuspension is free and removes major indoor PM2.5 peaks. Note: houseplants alone cannot meaningfully purify room air—you need source control plus physical filtration.",
    whenToDoIt: `Daily cleaning and whenever outdoor AQI exceeds ${AQI_THRESHOLDS.CAUTION_ACTIVE}.`,
    expectedBenefit: "Prevents indoor air from becoming worse than outdoor air at near-zero cost.",
    difficulty: "Easy",
    estimatedCost: lowBudget
      ? "₹0–₹200 (draft seal / damp mop)"
      : "₹0–₹2,500 (optional DIY box-fan filter)",
    environmentalImpact:
      "Eliminates indoor smoke and reduces wasted heating/cooling through leaky frames.",
    supportingData: `No HEPA purifier reported; plants=${profile.indoorEnvironment.hasIndoorPlants ? "yes" : "no"}; AQI ${aqi}.`,
    priorityScore: isPoorPlus ? 91 : 75,
    urgency: isPoorPlus ? "high" : "medium",
    category: "indoor",
  };
}

/** Builds indoor air filtration, source-control, and ventilation window recommendations. */
export function buildIndoorRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { airQuality, profile, aqi, isSevereOrVeryPoor, isPoorPlus } = ctx;
  const recs: Recommendation[] = [buildPurifierOrSourceControlRec(ctx)];

  if (profile.indoorEnvironment.windowsFrequentlyOpen || profile.lifestyle === "remote_worker") {
    recs.push(
      isPoorPlus
        ? {
            id: "ventilation-window-timing",
            title: "Keep windows closed during smog peaks; air out briefly only midday",
            whatToDo:
              "Close street-facing windows from 18:00 through 10:30. Open windows for a brief 15–20 minute cross-breeze between 13:00 and 15:30 if outdoor haze clears.",
            whyItMatters:
              "Leaving windows open continuously during Poor/Severe AQI lets outdoor PM2.5 equalize indoors, while brief midday airing flushes indoor CO2.",
            whenToDoIt: "Close evening–morning; short midday flush 13:00–15:30.",
            expectedBenefit:
              "Balances indoor oxygen/CO2 freshness against outdoor particulate entry.",
            difficulty: "Easy",
            estimatedCost: "₹0",
            environmentalImpact: "Passive timing uses zero electricity.",
            supportingData: `Windows frequently open=${profile.indoorEnvironment.windowsFrequentlyOpen}; AQI ${aqi}.`,
            priorityScore: 88,
            urgency: isSevereOrVeryPoor ? "high" : "medium",
            category: "indoor",
          }
        : {
            id: "ventilation-healthy-flush",
            title: "Use natural cross-ventilation during clean daytime hours",
            whatToDo:
              "Open opposite windows for 30–45 minutes midday to refresh indoor air without mechanical AC/fans.",
            whyItMatters:
              "When outdoor AQI is Good/Moderate, natural ventilation dilutes indoor CO2, cooking vapors, and VOCs effectively.",
            whenToDoIt: "11:00–16:00.",
            expectedBenefit: "Fresher indoor air and lower cooling energy use.",
            difficulty: "Easy",
            estimatedCost: "₹0",
            environmentalImpact: "Saves ~0.5–1.0 kWh/day vs continuous AC/purifier operation.",
            supportingData: `Outdoor AQI ${aqi} (${airQuality.category}) permits safe natural ventilation.`,
            priorityScore: 68,
            urgency: "low",
            category: "indoor",
          }
    );
  }

  return recs;
}

/** Builds cooking-exhaust safety and low-emission sustainability habit recommendations. */
export function buildCookingAndSustainabilityRecommendations(
  ctx: RecommendationContext
): Recommendation[] {
  const { profile, hourOfDay } = ctx;
  const solidFuel = profile.indoorEnvironment.cookingFuel === "solid_biomass_kerosene";
  return [
    {
      id: "cooking-exhaust-control",
      title: solidFuel
        ? "Urgently vent cooking smoke & transition toward clean LPG/induction where feasible"
        : "Always run kitchen exhaust/open kitchen window while cooking & cover pots",
      whatToDo: solidFuel
        ? "Cook in the best-ventilated spot away from sleeping areas, use dry fuel only, keep children out of the cooking zone, and explore LPG/electric community subsidy options."
        : "Switch on the kitchen chimney/exhaust fan 2 minutes before lighting the stove, keep lids on pots to cut steam/oil aerosol, and run exhaust 10 minutes after finishing.",
      whyItMatters:
        "High-heat frying and unvented combustion briefly push kitchen PM2.5 and NO2 far above outdoor AQI levels.",
      whenToDoIt: "Every meal preparation.",
      expectedBenefit:
        "Prevents acute indoor cooking pollution spikes from spreading to living rooms.",
      difficulty: "Easy",
      estimatedCost: "₹0",
      environmentalImpact: "Lids on pots reduce cooking fuel/electricity use by ~15–20%.",
      supportingData: `Cooking fuel: ${profile.indoorEnvironment.cookingFuel.replace(/_/g, " ")}.`,
      priorityScore: solidFuel ? 97 : 79,
      urgency: solidFuel ? "critical" : "medium",
      category: "indoor",
    },
    {
      id: "sustainability-no-burning",
      title: "Adopt zero-combustion household habits & bundle errands",
      whatToDo:
        "Avoid burning dry leaves, trash, or frequent incense indoors; combine neighborhood errands into one trip and encourage engine-off at long red lights (>30s).",
      whyItMatters:
        "Local open burning and cold-start short car/scooter trips contribute disproportionately to neighborhood PM2.5 during winter.",
      whenToDoIt:
        hourOfDay < 12
          ? "Plan today's errands before leaving home."
          : "Apply across evening errands.",
      expectedBenefit: "Reduces personal contribution to neighborhood smog while saving fuel.",
      difficulty: "Easy",
      estimatedCost: "₹0 (saves fuel/money)",
      environmentalImpact: "Avoids ~0.4–1.2 kg CO2 and local particulate puffs per bundled trip.",
      supportingData: `Sustainability priority: ${profile.preferences.sustainabilityPriority.replace(/_/g, " ")}.`,
      priorityScore: profile.preferences.sustainabilityPriority === "reduce_emissions" ? 86 : 66,
      urgency: "low",
      category: "sustainability",
    },
  ];
}
