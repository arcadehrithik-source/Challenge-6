import { describe, expect, it } from "vitest";
import { calculateImpactMetrics, compareCommuteOptions } from "@/lib/commute-impact";
import { buildDefaultChecklist, DEFAULT_USER_PROFILE } from "@/lib/recommendation-engine";
import { GOOD_AIR_FIXTURE, SEVERE_AIR_FIXTURE } from "../fixtures/air-quality-fixtures";

describe("Commute comparison and emissions calculations", () => {
  it("recommends sheltered public transit over cycling during severe pollution", () => {
    const options = compareCommuteOptions(SEVERE_AIR_FIXTURE.aqi, 10, "bicycle");
    const recommended = options.find((o) => o.isRecommended);
    const bike = options.find((o) => o.mode === "bicycle");

    expect(recommended?.mode).toBe("public_transport");
    expect(bike?.exposureTier).toBe("High");
    expect(bike?.caveat.toLowerCase()).toContain("shorter main-road route");
  });

  it("calculates CO2 savings transparently for active vs car commute", () => {
    const checklist = buildDefaultChecklist(GOOD_AIR_FIXTURE, DEFAULT_USER_PROFILE).map(
      (c, idx) => ({
        ...c,
        completed: idx < 2,
      })
    );

    const cycleImpact = calculateImpactMetrics({
      checklist,
      commuteMode: "bicycle",
      commuteDistanceKm: 10,
      streakDays: 3,
    });

    const carImpact = calculateImpactMetrics({
      checklist,
      commuteMode: "car",
      commuteDistanceKm: 10,
      streakDays: 3,
    });

    expect(cycleImpact.estimatedCo2AvoidedKg).toBeGreaterThan(carImpact.estimatedCo2AvoidedKg);
    expect(cycleImpact.actionsCompleted).toBe(2);
    expect(cycleImpact.assumptions.length).toBeGreaterThanOrEqual(3);

    const wfhImpact = calculateImpactMetrics({
      checklist,
      commuteMode: "work_from_home",
      commuteDistanceKm: 12,
    });
    expect(wfhImpact.streakDays).toBe(1);

    const moderateOptions = compareCommuteOptions(140, 6, "walking");
    expect(moderateOptions.some((o) => o.isCurrentMode && o.mode === "walking")).toBe(true);
  });
});
