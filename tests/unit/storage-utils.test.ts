import { beforeEach, describe, expect, it } from "vitest";
import { buildDefaultChecklist, DEFAULT_USER_PROFILE } from "@/lib/recommendation-engine";
import {
  hasSavedUserProfile,
  loadChecklistState,
  loadDataMode,
  loadStreakDays,
  loadUserProfile,
  resetAllLocalData,
  saveChecklistState,
  saveDataMode,
  saveUserProfile,
} from "@/lib/storage";
import { formatEnumLabel, formatTimestamp } from "@/lib/utils";
import { POOR_AIR_FIXTURE } from "../fixtures/air-quality-fixtures";

describe("Local storage persistence & formatting utilities", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves, loads, and resets user profile safely", () => {
    expect(hasSavedUserProfile()).toBe(false);
    expect(loadUserProfile().city).toBe("Kolkata");

    saveUserProfile({ ...DEFAULT_USER_PROFILE, city: "Delhi", locality: "Saket" });
    expect(hasSavedUserProfile()).toBe(true);
    expect(loadUserProfile().city).toBe("Delhi");

    resetAllLocalData();
    expect(hasSavedUserProfile()).toBe(false);
  });

  it("recovers gracefully from corrupted localStorage JSON", () => {
    window.localStorage.setItem("breathewise_profile_v1", "{bad-json");
    window.localStorage.setItem("breathewise_checklist_v1", "not-an-object");
    window.localStorage.setItem("breathewise_streak_v1", "null");

    expect(loadUserProfile().city).toBe("Kolkata");
    expect(loadChecklistState()).toEqual({});
    expect(loadStreakDays()).toBe(0);
  });

  it("tracks checklist completion, streak increment, and data mode", () => {
    const items = buildDefaultChecklist(POOR_AIR_FIXTURE, DEFAULT_USER_PROFILE);
    items[0]!.completed = true;
    saveChecklistState(items);

    expect(loadChecklistState()[items[0]!.id]).toBe(true);
    expect(loadStreakDays()).toBe(1);

    saveDataMode("demo");
    expect(loadDataMode()).toBe("demo");
  });

  it("formats enum labels and timestamps reliably", () => {
    expect(formatEnumLabel("family_with_children")).toBe("Family With Children");
    expect(formatTimestamp("invalid-date")).toBe("invalid-date");
    expect(formatTimestamp("2026-11-27T08:00:00.000Z").length).toBeGreaterThan(3);
  });
});
