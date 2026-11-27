import { describe, expect, it } from "vitest";
import {
  buildDefaultChecklist,
  computeExposureIndicator,
  DEFAULT_USER_PROFILE,
  generateDailySlotPlan,
  generateRecommendations,
} from "@/lib/recommendation-engine";
import {
  CYCLIST_PROFILE_FIXTURE,
  GOOD_AIR_FIXTURE,
  POOR_AIR_FIXTURE,
  SENIOR_REMOTE_PROFILE_FIXTURE,
  SEVERE_AIR_FIXTURE,
} from "../fixtures/air-quality-fixtures";

describe("Context-aware recommendation engine", () => {
  it("recommends shifting cardio indoors and pausing cycling during severe pollution", () => {
    const recs = generateRecommendations(SEVERE_AIR_FIXTURE, CYCLIST_PROFILE_FIXTURE);
    const titles = recs.map((r) => r.title.toLowerCase());

    expect(titles.some((t) => t.includes("indoors"))).toBe(true);
    expect(titles.some((t) => t.includes("bicycle"))).toBe(true);
    expect(recs[0]?.priorityScore).toBeGreaterThanOrEqual(recs[recs.length - 1]!.priorityScore);

    // Every recommendation must include complete structured guidance fields
    for (const r of recs) {
      expect(r.whatToDo.length).toBeGreaterThan(10);
      expect(r.whyItMatters.length).toBeGreaterThan(10);
      expect(r.whenToDoIt.length).toBeGreaterThan(3);
      expect(r.expectedBenefit.length).toBeGreaterThan(5);
    }
  });

  it("explicitly clarifies houseplants alone cannot purify an entire room when user has no purifier", () => {
    const recs = generateRecommendations(POOR_AIR_FIXTURE, CYCLIST_PROFILE_FIXTURE);
    const noPurifierRec = recs.find((r) => r.id === "no-purifier-practical");
    expect(noPurifierRec).toBeDefined();
    expect(noPurifierRec?.whyItMatters.toLowerCase()).toContain("houseplants alone");
  });

  it("tailors guidance for households with senior citizens and HEPA purifiers", () => {
    const recs = generateRecommendations(POOR_AIR_FIXTURE, SENIOR_REMOTE_PROFILE_FIXTURE);
    expect(recs.some((r) => r.id === "seniors-protection")).toBe(true);
    expect(recs.some((r) => r.id === "hepa-operation")).toBe(true);
  });

  it("encourages outdoor fitness and natural ventilation during Good AQI", () => {
    const recs = generateRecommendations(GOOD_AIR_FIXTURE, CYCLIST_PROFILE_FIXTURE);
    expect(recs.some((r) => r.id === "fitness-green-route")).toBe(true);
    expect(recs.some((r) => r.id === "ventilation-healthy-flush")).toBe(true);
  });

  it("computes exposure indicator across Low, Elevated, and Critical levels with disclaimer", () => {
    const severeExp = computeExposureIndicator(SEVERE_AIR_FIXTURE, CYCLIST_PROFILE_FIXTURE);
    const elevatedExp = computeExposureIndicator(
      { ...POOR_AIR_FIXTURE, aqi: 220, category: "Poor" },
      { ...DEFAULT_USER_PROFILE, commute: "public_transport", household: "family_with_children" }
    );
    const goodExp = computeExposureIndicator(GOOD_AIR_FIXTURE, {
      ...DEFAULT_USER_PROFILE,
      commute: "work_from_home",
      household: "individual",
    });

    expect(severeExp.level).toBe("Critical");
    expect(elevatedExp.level).toBe("Elevated");
    expect(goodExp.level).toBe("Low");
    expect(severeExp.score).toBeGreaterThan(goodExp.score);
    expect(severeExp.disclaimer.toLowerCase()).toContain("not a medical diagnosis");
  });

  it("generates all 4 daily time slots and household checklist", () => {
    const slots = generateDailySlotPlan(POOR_AIR_FIXTURE, DEFAULT_USER_PROFILE);
    expect(slots).toHaveLength(4);
    expect(slots.map((s) => s.slot)).toEqual(["Morning", "Afternoon", "Evening", "Night"]);

    const checklist = buildDefaultChecklist(POOR_AIR_FIXTURE, DEFAULT_USER_PROFILE);
    expect(checklist.length).toBeGreaterThanOrEqual(5);
  });

  it("handles outdoor worker, two-wheeler, car, and solid biomass cooking profiles", () => {
    const outdoorProfile = {
      ...DEFAULT_USER_PROFILE,
      lifestyle: "outdoor_worker" as const,
      commute: "two_wheeler" as const,
      indoorEnvironment: {
        ...DEFAULT_USER_PROFILE.indoorEnvironment,
        cookingFuel: "solid_biomass_kerosene" as const,
      },
    };
    const recs = generateRecommendations(SEVERE_AIR_FIXTURE, outdoorProfile);
    expect(recs.some((r) => r.id === "outdoor-worker-protection")).toBe(true);
    expect(recs.some((r) => r.id === "two-wheeler-protection")).toBe(true);
    expect(recs.some((r) => r.id === "cooking-exhaust-control" && r.urgency === "critical")).toBe(
      true
    );

    const carProfile = {
      ...DEFAULT_USER_PROFILE,
      commute: "car" as const,
    };
    const carRecs = generateRecommendations(POOR_AIR_FIXTURE, carProfile);
    expect(carRecs.some((r) => r.id === "car-recirculate-carpool")).toBe(true);
  });
});
