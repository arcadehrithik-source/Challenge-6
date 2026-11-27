import { DEFAULT_USER_PROFILE } from "./recommendation-engine";
import { userProfileSchema } from "./schemas";
import type { ChecklistItem, UserProfile } from "./types";

const PROFILE_STORAGE_KEY = "breathewise_profile_v1";
const CHECKLIST_STORAGE_KEY = "breathewise_checklist_v1";
const STREAK_STORAGE_KEY = "breathewise_streak_v1";
const DATA_MODE_STORAGE_KEY = "breathewise_data_mode_v1";

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_USER_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = userProfileSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return DEFAULT_USER_PROFILE;
    return {
      ...parsed.data,
      updatedAt: parsed.data.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function hasSavedUserProfile(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(PROFILE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function saveUserProfile(profile: UserProfile): UserProfile {
  const normalized: UserProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }
  return normalized;
}

export function loadChecklistState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const clean: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "boolean") {
        clean[k] = v;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function saveChecklistState(items: ChecklistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const map: Record<string, boolean> = {};
    for (const item of items) {
      map[item.id] = item.completed;
    }
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(map));

    const anyDone = items.some((i) => i.completed);
    if (anyDone) {
      const today = new Date().toISOString().slice(0, 10);
      const rawStreak = window.localStorage.getItem(STREAK_STORAGE_KEY);
      const current = rawStreak
        ? (JSON.parse(rawStreak) as { lastDate?: string; days?: number })
        : {};
      if (current.lastDate !== today) {
        const nextDays = (current.days ?? 0) + 1;
        window.localStorage.setItem(
          STREAK_STORAGE_KEY,
          JSON.stringify({ lastDate: today, days: nextDays })
        );
      }
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadStreakDays(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { days?: number };
    return typeof parsed.days === "number" ? parsed.days : 0;
  } catch {
    return 0;
  }
}

export function loadDataMode(): "live" | "demo" {
  if (typeof window === "undefined") return "live";
  try {
    const val = window.localStorage.getItem(DATA_MODE_STORAGE_KEY);
    return val === "demo" ? "demo" : "live";
  } catch {
    return "live";
  }
}

export function saveDataMode(mode: "live" | "demo"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DATA_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors
  }
}

export function resetAllLocalData(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    window.localStorage.removeItem(CHECKLIST_STORAGE_KEY);
    window.localStorage.removeItem(STREAK_STORAGE_KEY);
    window.localStorage.removeItem(DATA_MODE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
