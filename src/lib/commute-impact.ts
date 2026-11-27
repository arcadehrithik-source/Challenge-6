import type { ChecklistItem, CommuteMode, CommuteOptionComparison, ImpactMetrics } from "./types";

// Modeled emission factors (kg CO2 per passenger-km), based on standard urban transport averages:
// - Solo petrol car: ~0.171 kg CO2/km
// - Two-wheeler: ~0.072 kg CO2/km
// - Urban bus/metro weighted public transit: ~0.041 kg CO2/km
// - Walking / Bicycle / WFH: 0 kg CO2/km
const CO2_KG_PER_KM: Record<CommuteMode, number> = {
  car: 0.171,
  two_wheeler: 0.072,
  public_transport: 0.041,
  bicycle: 0,
  walking: 0,
  work_from_home: 0,
};

const SPEED_KMH: Record<CommuteMode, number> = {
  car: 22,
  two_wheeler: 26,
  public_transport: 20,
  bicycle: 14,
  walking: 4.8,
  work_from_home: 0,
};

// Relative inhalation factor accounts for typical minute ventilation rate & road proximity:
// Higher active breathing rate (cycling/walking) increases inhaled volume outdoors,
// while closed cabin (car recirculate / AC metro) buffers coarse roadside dust.
const INHALATION_EXPOSURE_FACTOR: Record<CommuteMode, number> = {
  walking: 1.35,
  bicycle: 1.75,
  two_wheeler: 1.45,
  public_transport: 0.72,
  car: 0.65,
  work_from_home: 0.25,
};

const MODE_LABELS: Record<CommuteMode, string> = {
  walking: "Walking",
  bicycle: "Bicycle",
  public_transport: "Public Transit (Metro / Bus)",
  two_wheeler: "Two-Wheeler",
  car: "Private Car",
  work_from_home: "Work from Home",
};

export function compareCommuteOptions(
  aqi: number,
  distanceKm: number,
  currentMode: CommuteMode
): CommuteOptionComparison[] {
  const safeDistance = Math.max(1, Math.min(80, distanceKm));
  const modes: CommuteMode[] = ["public_transport", "bicycle", "walking", "car", "two_wheeler"];

  const results = modes.map((mode): CommuteOptionComparison => {
    const speed = SPEED_KMH[mode];
    const minutes = Math.max(5, Math.round((safeDistance / speed) * 60));
    const roundTripCo2 = Number((safeDistance * 2 * CO2_KG_PER_KM[mode]).toFixed(2));

    // Modeled relative exposure combines city AQI severity, duration, and mode inhalation factor.
    const durationWeight = Math.min(2.0, minutes / 30);
    const rawExposure = Math.round(
      (aqi / 500) * 65 * INHALATION_EXPOSURE_FACTOR[mode] * (0.65 + 0.35 * durationWeight)
    );
    const relativeExposureIndex = Math.min(100, Math.max(5, rawExposure));

    const exposureTier: CommuteOptionComparison["exposureTier"] =
      relativeExposureIndex >= 70
        ? "High"
        : relativeExposureIndex >= 45
          ? "Elevated"
          : relativeExposureIndex >= 25
            ? "Moderate"
            : "Lower";

    let guidance = "";
    if (mode === "public_transport") {
      guidance =
        aqi > 200
          ? "Best balance of low emissions and sheltered cabin air during poor/severe AQI."
          : "Consistently low per-person emissions and steady travel times.";
    } else if (mode === "bicycle") {
      guidance =
        aqi > 200
          ? "High breathing rate multiplies inhaled PM2.5; pause cycling when AQI exceeds 200."
          : "Zero-emission commute; choose tree-lined parallel streets over diesel corridors.";
    } else if (mode === "walking") {
      guidance =
        safeDistance > 4 && aqi > 150
          ? "Long roadside walks increase cumulative intake; split with transit or wear N95."
          : "Zero emissions for short neighborhood trips; avoid main-road junctions.";
    } else if (mode === "car") {
      guidance =
        "Use AC recirculation in traffic to reduce cabin PM2.5, and carpool to halve per-person CO2.";
    } else {
      guidance =
        "Direct exhaust-height exposure; pair a full-face helmet with a fitted N95 mask on hazy days.";
    }

    return {
      mode,
      label: MODE_LABELS[mode],
      estimatedMinutes: minutes,
      estimatedCo2Kg: roundTripCo2,
      relativeExposureIndex,
      exposureTier,
      guidance,
      caveat:
        "Modeled estimate based on ambient city AQI, duration, and breathing/enclosure factors — not a personal route sensor reading. A shorter main-road route can still carry higher exposure than a quieter side street.",
      isCurrentMode: mode === currentMode,
      isRecommended: false,
    };
  });

  // Choose recommended mode balancing health exposure (dominant when AQI > 200) and low emissions
  const ranked = [...results].sort((a, b) => {
    const aScore =
      aqi > 200
        ? a.relativeExposureIndex * 1.4 + a.estimatedCo2Kg * 8
        : a.relativeExposureIndex * 0.7 + a.estimatedCo2Kg * 15;
    const bScore =
      aqi > 200
        ? b.relativeExposureIndex * 1.4 + b.estimatedCo2Kg * 8
        : b.relativeExposureIndex * 0.7 + b.estimatedCo2Kg * 15;
    return aScore - bScore;
  });

  const bestMode = ranked[0]?.mode;
  return results.map((item) => ({
    ...item,
    isRecommended: item.mode === bestMode,
  }));
}

export function calculateImpactMetrics(params: {
  checklist: ChecklistItem[];
  commuteMode: CommuteMode;
  commuteDistanceKm: number;
  streakDays?: number;
}): ImpactMetrics {
  const completedItems = params.checklist.filter((c) => c.completed);
  const checklistCo2 = completedItems.reduce((sum, item) => sum + item.co2AvoidedKg, 0);

  // Baseline comparison: vs solo petrol car round trip
  const baselineCarCo2 = params.commuteDistanceKm * 2 * CO2_KG_PER_KM.car;
  const userCommuteCo2 = params.commuteDistanceKm * 2 * CO2_KG_PER_KM[params.commuteMode];
  const dailyCommuteSavings = Math.max(0, baselineCarCo2 - userCommuteCo2);

  const totalCo2 = Number((checklistCo2 + dailyCommuteSavings).toFixed(2));
  const transportSwitches =
    params.commuteMode !== "car" || completedItems.some((c) => c.category === "commute") ? 1 : 0;
  const energyActionsCompleted = completedItems.filter((c) => c.category === "energy").length;
  const exposureReductionOpportunities = completedItems.length;
  const streakDays = params.streakDays ?? (completedItems.length > 0 ? 1 : 0);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklySeries = days.map((day, idx) => {
    const factor = idx === 6 ? 1 : 0.65 + (idx % 3) * 0.15;
    return {
      day,
      co2Kg: Number((totalCo2 * factor).toFixed(2)),
      actions:
        idx === 6
          ? completedItems.length
          : Math.max(1, Math.min(params.checklist.length, completedItems.length)),
    };
  });

  return {
    actionsCompleted: completedItems.length,
    totalActions: params.checklist.length,
    estimatedCo2AvoidedKg: totalCo2,
    transportSwitches,
    energyActionsCompleted,
    exposureReductionOpportunities,
    streakDays,
    weeklySeries,
    assumptions: [
      "Commute savings compare your current mode against a solo petrol passenger car baseline (~0.171 kg CO2/passenger-km).",
      "Public transit (bus/metro blended) uses ~0.041 kg CO2/passenger-km; cycling, walking, and WFH count as 0 tailpipe kg CO2/km.",
      "Household energy and clean-air checklist savings use conservative illustrative estimates (0.10–0.65 kg CO2/action).",
      "All figures are educational estimates for self-tracking and do not represent audited carbon offsets.",
    ],
  };
}
