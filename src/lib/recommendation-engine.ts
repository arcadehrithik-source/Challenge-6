import type {
  AirQualitySnapshot,
  ChecklistItem,
  DailySlotPlan,
  ExposureIndicator,
  Recommendation,
  UserProfile,
} from "./types";

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

interface RecommendationContext {
  airQuality: AirQualitySnapshot;
  profile: UserProfile;
  hourOfDay: number;
  aqi: number;
  pm25Text: string;
  isSevereOrVeryPoor: boolean;
  isPoorPlus: boolean;
  isModeratePlus: boolean;
  lowBudget: boolean;
}

/**
 * Computes a transparent situational exposure sensitivity score (not a clinical score).
 */
export function computeExposureIndicator(
  airQuality: AirQualitySnapshot,
  profile: UserProfile
): ExposureIndicator {
  let score = Math.round((airQuality.aqi / 500) * 65);
  const rationale: string[] = [
    `Current ${airQuality.city} AQI is ${airQuality.aqi} (${airQuality.category}), driven primarily by ${airQuality.mainPollutant}.`,
  ];

  if (
    profile.household === "family_with_children" ||
    profile.household === "household_with_seniors"
  ) {
    score += 12;
    rationale.push(
      profile.household === "family_with_children"
        ? "Household includes children, who breathe faster per body weight and need protected play windows."
        : "Household includes senior citizens, who benefit from tighter indoor PM2.5 control and low-exertion schedules."
    );
  }

  if (profile.lifestyle === "outdoor_worker" || profile.lifestyle === "fitness_enthusiast") {
    score += 14;
    rationale.push(
      profile.lifestyle === "outdoor_worker"
        ? "Outdoor work significantly extends cumulative daily inhalation compared with indoor schedules."
        : "High-ventilation exercise multiplies lung airflow, amplifying particulate intake during elevated AQI."
    );
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

  if (!profile.indoorEnvironment.hasAirPurifier && airQuality.aqi > 200) {
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
  const level: ExposureIndicator["level"] =
    clamped >= 80
      ? "Critical"
      : clamped >= 60
        ? "High"
        : clamped >= 40
          ? "Elevated"
          : clamped >= 22
            ? "Moderate"
            : "Low";

  const headline =
    level === "Critical" || level === "High"
      ? `High lifestyle exposure sensitivity today for your ${profile.lifestyle.replace("_", " ")} routine.`
      : level === "Elevated"
        ? "Moderate-to-elevated exposure window — timing and route adjustments will meaningfully cut intake."
        : "Low relative exposure pressure — ideal conditions for sustainable low-emission habits.";

  return {
    level,
    score: clamped,
    headline,
    rationale,
    disclaimer:
      "Situational guidance indicator only — not a medical diagnosis, clinical risk score, or personal dosimeter measurement.",
  };
}

function buildOutdoorRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { airQuality, profile, aqi, pm25Text, isSevereOrVeryPoor, isPoorPlus, isModeratePlus } =
    ctx;
  const recs: Recommendation[] = [];

  if (profile.lifestyle === "fitness_enthusiast") {
    if (isPoorPlus) {
      recs.push({
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
      });
    } else if (isModeratePlus) {
      recs.push({
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
      });
    } else {
      recs.push({
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
      });
    }
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

function buildHouseholdRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { airQuality, profile, aqi, isSevereOrVeryPoor, isPoorPlus, isModeratePlus } = ctx;
  const recs: Recommendation[] = [];

  if (profile.household === "family_with_children") {
    if (isPoorPlus) {
      recs.push({
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
      });
    } else {
      recs.push({
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
      });
    }
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

function buildCommuteRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { airQuality, profile, aqi, isSevereOrVeryPoor, isPoorPlus, isModeratePlus } = ctx;
  const recs: Recommendation[] = [];

  if (profile.commute === "bicycle" || profile.commute === "walking") {
    if (isPoorPlus) {
      recs.push({
        id: "active-commute-switch",
        title: `Pause ${profile.commute} commute today — switch to metro or closed-window transit`,
        whatToDo: `For your ${profile.commuteDistanceKm} km trip, take metro/AC bus or carpool instead of ${profile.commute}. If you must walk short links, take quiet interior lanes and wear a fitted N95 mask.`,
        whyItMatters:
          "Cycling and brisk walking elevate breathing rate 2–4x directly in street-level emissions; during Poor/Severe AQI, elevated inhalation outweighs the short-term convenience.",
        whenToDoIt: "Morning and evening commute legs while AQI exceeds 200.",
        expectedBenefit:
          "Avoids heavy street-level particulate dose while keeping per-passenger emissions low via public transit.",
        difficulty: "Moderate",
        estimatedCost: "₹20–₹60 transit fare",
        environmentalImpact: "Metro/bus keeps per-km emissions ~70–85% lower than driving solo.",
        supportingData: `Current commute=${profile.commute} (${profile.commuteDistanceKm} km) at AQI ${aqi}.`,
        priorityScore: 94,
        urgency: isSevereOrVeryPoor ? "critical" : "high",
        category: "commute",
      });
    } else {
      recs.push({
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
      });
    }
    return recs;
  }

  if (profile.commute === "two_wheeler" && isModeratePlus) {
    recs.push({
      id: "two-wheeler-protection",
      title: "Use a full-face helmet with N95 mask or switch to public transit",
      whatToDo:
        "Switch to metro/bus on days above AQI 200; when riding, pair a closed-visor helmet with a fitted N95 mask and avoid tailgating heavy buses/trucks.",
      whyItMatters: "Two-wheeler riders sit at exhaust-pipe height with zero cabin filtration.",
      whenToDoIt: "Every ride while AQI is above 100.",
      expectedBenefit: "Reduces direct exhaust and road-dust inhalation.",
      difficulty: "Easy",
      estimatedCost: "₹40–₹100 mask or transit fare",
      environmentalImpact: "Switching to public transit cuts personal NOx and CO2 emissions.",
      supportingData: `Two-wheeler commuter (${profile.commuteDistanceKm} km) at AQI ${aqi}.`,
      priorityScore: 89,
      urgency: isPoorPlus ? "high" : "medium",
      category: "commute",
    });
  } else if (profile.commute === "car") {
    recs.push({
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
    });
  } else if (profile.commute === "public_transport") {
    recs.push({
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
    });
  }

  return recs;
}

function buildIndoorRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { airQuality, profile, aqi, isSevereOrVeryPoor, isPoorPlus, lowBudget } = ctx;
  const recs: Recommendation[] = [];

  if (profile.indoorEnvironment.hasAirPurifier) {
    recs.push({
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
    });
  } else {
    recs.push({
      id: "no-purifier-practical",
      title: "Control indoor particles without an expensive purifier",
      whatToDo:
        "Seal obvious window/door gaps with weatherstripping or damp towels during severe smog, damp-mop floors instead of dry sweeping, eliminate incense/agarbatti/mosquito coils, and consider a DIY MERV-13 box-fan filter if budget allows.",
      whyItMatters:
        "Stopping indoor combustion and resuspension is free and removes major indoor PM2.5 peaks. Note: houseplants alone cannot meaningfully purify room air—you need source control plus physical filtration.",
      whenToDoIt: "Daily cleaning and whenever outdoor AQI exceeds 150.",
      expectedBenefit:
        "Prevents indoor air from becoming worse than outdoor air at near-zero cost.",
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
    });
  }

  if (profile.indoorEnvironment.windowsFrequentlyOpen || profile.lifestyle === "remote_worker") {
    if (isPoorPlus) {
      recs.push({
        id: "ventilation-window-timing",
        title: "Keep windows closed during smog peaks; air out briefly only midday",
        whatToDo:
          "Close street-facing windows from 18:00 through 10:30. Open windows for a brief 15–20 minute cross-breeze between 13:00 and 15:30 if outdoor haze clears.",
        whyItMatters:
          "Leaving windows open continuously during Poor/Severe AQI lets outdoor PM2.5 equalize indoors, while brief midday airing flushes indoor CO2.",
        whenToDoIt: "Close evening–morning; short midday flush 13:00–15:30.",
        expectedBenefit: "Balances indoor oxygen/CO2 freshness against outdoor particulate entry.",
        difficulty: "Easy",
        estimatedCost: "₹0",
        environmentalImpact: "Passive timing uses zero electricity.",
        supportingData: `Windows frequently open=${profile.indoorEnvironment.windowsFrequentlyOpen}; AQI ${aqi}.`,
        priorityScore: 88,
        urgency: isSevereOrVeryPoor ? "high" : "medium",
        category: "indoor",
      });
    } else {
      recs.push({
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
      });
    }
  }

  return recs;
}

function buildCookingAndSustainabilityRecommendations(
  ctx: RecommendationContext
): Recommendation[] {
  const { profile, hourOfDay } = ctx;
  return [
    {
      id: "cooking-exhaust-control",
      title:
        profile.indoorEnvironment.cookingFuel === "solid_biomass_kerosene"
          ? "Urgently vent cooking smoke & transition toward clean LPG/induction where feasible"
          : "Always run kitchen exhaust/open kitchen window while cooking & cover pots",
      whatToDo:
        profile.indoorEnvironment.cookingFuel === "solid_biomass_kerosene"
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
      priorityScore: profile.indoorEnvironment.cookingFuel === "solid_biomass_kerosene" ? 97 : 79,
      urgency:
        profile.indoorEnvironment.cookingFuel === "solid_biomass_kerosene" ? "critical" : "medium",
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
    isSevereOrVeryPoor: aqi > 300,
    isPoorPlus: aqi > 200,
    isModeratePlus: aqi > 100,
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

/**
 * Generates Morning/Afternoon/Evening/Night time-of-day exposure and ventilation plans.
 */
export function generateDailySlotPlan(
  airQuality: AirQualitySnapshot,
  profile: UserProfile
): DailySlotPlan[] {
  const aqi = airQuality.aqi;
  const severe = aqi > 300;
  const poor = aqi > 200;

  return [
    {
      slot: "Morning",
      timeRange: "06:00 – 10:30",
      riskLevel: severe || poor ? "High" : aqi > 100 ? "Elevated" : "Low",
      summary:
        aqi > 100
          ? "Cool morning inversion typically traps PM2.5 near street level."
          : "Crisp morning conditions — safe for routine commute and errands.",
      actions: [
        profile.lifestyle === "fitness_enthusiast" && aqi > 150
          ? "Move morning run indoors."
          : "Check live AQI before stepping out.",
        profile.commute === "bicycle" || profile.commute === "walking"
          ? poor
            ? "Use closed transit or N95 mask on side streets."
            : "Prefer tree-lined interior streets."
          : "Keep cabin AC on recirculate in traffic.",
      ],
      ventilationAdvice:
        aqi > 150
          ? "Keep outer windows closed until late morning warmth disperses ground haze."
          : "Safe for 20-minute morning fresh-air flush.",
    },
    {
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
      ventilationAdvice:
        aqi > 300
          ? "Keep airing brief (10 mins) only if outdoor visibility improves; run purifier after."
          : "Best window to open opposite windows for 20–30 minutes to flush indoor CO2.",
    },
    {
      slot: "Evening",
      timeRange: "16:30 – 20:30",
      riskLevel: severe || poor ? "High" : aqi > 100 ? "Elevated" : "Moderate",
      summary:
        "Rush-hour traffic overlaps with cooling boundary layer — particulates climb rapidly.",
      actions: [
        profile.household === "family_with_children"
          ? "Shift children's play indoors before sunset."
          : "Avoid lingering near busy intersections.",
        "Use damp cloth dusting instead of dry sweeping.",
      ],
      ventilationAdvice: "Close street-facing windows before 17:30 to prevent evening smog trap.",
    },
    {
      slot: "Night",
      timeRange: "21:00 – 05:30",
      riskLevel: severe ? "High" : poor ? "Elevated" : "Low",
      summary: "Calm night winds allow particulates to settle indoors if frames are unsealed.",
      actions: [
        profile.indoorEnvironment.hasAirPurifier
          ? "Run HEPA purifier in bedroom with door closed."
          : "Seal door gaps and avoid incense/mosquito coils indoors.",
        "Prepare next-day commute mask & low-emission plan.",
      ],
      ventilationAdvice: "Keep bedroom windows closed overnight when outdoor AQI exceeds 150.",
    },
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
        airQuality.aqi > 150
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
