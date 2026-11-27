import { z } from "zod";
import { DEFAULT_USER_PROFILE } from "./recommendation-engine";
import { userProfileSchema } from "./schemas";
import type { ChecklistItem, UserProfile } from "./types";

const PROFILE_STORAGE_KEY = "breathewise_profile_v1";
const CHECKLIST_STORAGE_KEY = "breathewise_checklist_v1";
const STREAK_STORAGE_KEY = "breathewise_streak_v1";
const DATA_MODE_STORAGE_KEY = "breathewise_data_mode_v1";

const checklistMapSchema = z.record(z.string(), z.boolean());
const streakRecordSchema = z.object({
  lastDate: z.string().optional(),
  days: z.number().finite().nonnegative().default(0),
});

function readStorageRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageRaw(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or private-browsing errors
  }
}

function parseJsonSafe(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseStreakRecord(raw: string | null): { lastDate?: string; days: number } {
  const parsed = streakRecordSchema.safeParse(parseJsonSafe(raw));
  return parsed.success ? parsed.data : { days: 0 };
}

/**
 * Loads the locally persisted household profile, falling back to `DEFAULT_USER_PROFILE`.
 */
export function loadUserProfile(): UserProfile {
  const parsed = userProfileSchema.safeParse(parseJsonSafe(readStorageRaw(PROFILE_STORAGE_KEY)));
  if (!parsed.success) return DEFAULT_USER_PROFILE;
  return {
    ...parsed.data,
    updatedAt: parsed.data.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Reports whether a saved user profile exists in browser localStorage.
 */
export function hasSavedUserProfile(): boolean {
  return Boolean(readStorageRaw(PROFILE_STORAGE_KEY));
}

/**
 * Persists the user's household and commute profile locally with an updated timestamp.
 */
export function saveUserProfile(profile: UserProfile): UserProfile {
  const normalized: UserProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  writeStorageRaw(PROFILE_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

/**
 * Loads persisted daily safety checklist completion states.
 */
export function loadChecklistState(): Record<string, boolean> {
  const parsed = checklistMapSchema.safeParse(parseJsonSafe(readStorageRaw(CHECKLIST_STORAGE_KEY)));
  return parsed.success ? parsed.data : {};
}

/**
 * Saves daily checklist completions and advances the daily streak counter once per UTC date.
 */
export function saveChecklistState(items: ChecklistItem[]): void {
  const map: Record<string, boolean> = {};
  for (const item of items) {
    map[item.id] = item.completed;
  }
  writeStorageRaw(CHECKLIST_STORAGE_KEY, JSON.stringify(map));

  if (items.some((item) => item.completed)) {
    const today = new Date().toISOString().slice(0, 10);
    const current = parseStreakRecord(readStorageRaw(STREAK_STORAGE_KEY));
    if (current.lastDate !== today) {
      writeStorageRaw(
        STREAK_STORAGE_KEY,
        JSON.stringify({ lastDate: today, days: current.days + 1 })
      );
    }
  }
}

/**
 * Returns the persisted streak count in days.
 */
export function loadStreakDays(): number {
  return parseStreakRecord(readStorageRaw(STREAK_STORAGE_KEY)).days;
}

/**
 * Loads the user's preferred feed mode (`live` or `demo`).
 */
export function loadDataMode(): "live" | "demo" {
  return readStorageRaw(DATA_MODE_STORAGE_KEY) === "demo" ? "demo" : "live";
}

/**
 * Persists the selected feed mode (`live` or `demo`).
 */
export function saveDataMode(mode: "live" | "demo"): void {
  writeStorageRaw(DATA_MODE_STORAGE_KEY, mode);
}

/**
 * Clears all BreatheWise preferences, checklist states, streaks, and feed mode from localStorage.
 */
export function resetAllLocalData(): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of [
      PROFILE_STORAGE_KEY,
      CHECKLIST_STORAGE_KEY,
      STREAK_STORAGE_KEY,
      DATA_MODE_STORAGE_KEY,
    ]) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage removal errors
  }
}
