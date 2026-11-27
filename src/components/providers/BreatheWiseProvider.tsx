"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";
import { calculateImpactMetrics } from "@/lib/commute-impact";
import {
  buildDefaultChecklist,
  computeExposureIndicator,
  DEFAULT_USER_PROFILE,
  generateDailySlotPlan,
  generateRecommendations,
} from "@/lib/recommendation-engine";
import {
  loadChecklistState,
  loadDataMode,
  loadStreakDays,
  loadUserProfile,
  resetAllLocalData,
  saveChecklistState,
  saveDataMode,
  saveUserProfile,
} from "@/lib/storage";
import type {
  AirQualitySnapshot,
  ChecklistItem,
  DailySlotPlan,
  ExposureIndicator,
  ImpactMetrics,
  Recommendation,
  UserProfile,
} from "@/lib/types";
import { useAirQualityFeed } from "./useAirQualityFeed";
import { useToastQueue } from "./useToastQueue";

interface BreatheWiseContextValue {
  profile: UserProfile;
  isHydrated: boolean;
  airQuality: AirQualitySnapshot;
  isLoadingAirQuality: boolean;
  airQualityError: string | null;
  dataMode: "live" | "demo";
  recommendations: Recommendation[];
  exposure: ExposureIndicator;
  dailyPlan: DailySlotPlan[];
  checklist: ChecklistItem[];
  impact: ImpactMetrics;
  streakDays: number;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  updateProfile: (next: UserProfile) => void;
  switchDataMode: (mode: "live" | "demo") => void;
  refreshAirQuality: (overrideCity?: string, overrideMode?: "live" | "demo") => Promise<void>;
  toggleChecklistItem: (id: string) => void;
  resetLocalSession: () => void;
  notify: (title: string, description?: string) => void;
}

const BreatheWiseContext = createContext<BreatheWiseContextValue | null>(null);

/**
 * Root React context provider managing local user profile, live/demo AQI feed,
 * derived exposure/recommendation plans, checklist streaks, and status toasts.
 */
export function BreatheWiseProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [dataMode, setDataMode] = useState<"live" | "demo">("live");
  const [isHydrated, setIsHydrated] = useState(false);
  const [checklistMap, setChecklistMap] = useState<Record<string, boolean>>({});
  const [streakDays, setStreakDays] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { airQuality, isLoadingAirQuality, airQualityError, fetchSnapshot } =
    useAirQualityFeed(DEFAULT_USER_PROFILE);
  const { toasts, notify } = useToastQueue();

  useEffect(() => {
    let active = true;
    const savedProfile = loadUserProfile();
    const savedMode = loadDataMode();
    const savedChecks = loadChecklistState();
    const savedStreak = loadStreakDays();

    queueMicrotask(() => {
      if (!active) return;
      setProfile(savedProfile);
      setDataMode(savedMode);
      setChecklistMap(savedChecks);
      setStreakDays(savedStreak);
      setIsHydrated(true);
      void fetchSnapshot(savedProfile, savedMode);
    });
    return () => {
      active = false;
    };
  }, [fetchSnapshot]);

  const updateProfile = useCallback(
    (next: UserProfile) => {
      const saved = saveUserProfile(next);
      setProfile(saved);
      void fetchSnapshot(saved, dataMode);
    },
    [dataMode, fetchSnapshot]
  );

  const switchDataMode = useCallback(
    (mode: "live" | "demo") => {
      saveDataMode(mode);
      setDataMode(mode);
      void fetchSnapshot(profile, mode);
    },
    [fetchSnapshot, profile]
  );

  const refreshAirQuality = useCallback(
    async (overrideCity?: string, overrideMode?: "live" | "demo") => {
      const targetProfile = overrideCity ? { ...profile, city: overrideCity } : profile;
      await fetchSnapshot(targetProfile, overrideMode ?? dataMode);
    },
    [dataMode, fetchSnapshot, profile]
  );

  const recommendations = useMemo(
    () => generateRecommendations(airQuality, profile, isHydrated ? new Date().getHours() : 8),
    [airQuality, isHydrated, profile]
  );

  const exposure = useMemo(
    () => computeExposureIndicator(airQuality, profile),
    [airQuality, profile]
  );

  const dailyPlan = useMemo(
    () => generateDailySlotPlan(airQuality, profile),
    [airQuality, profile]
  );

  const checklist = useMemo(() => {
    const base = buildDefaultChecklist(airQuality, profile);
    return base.map((item) => ({ ...item, completed: Boolean(checklistMap[item.id]) }));
  }, [airQuality, checklistMap, profile]);

  const impact = useMemo(
    () =>
      calculateImpactMetrics({
        checklist,
        commuteMode: profile.commute,
        commuteDistanceKm: profile.commuteDistanceKm,
        streakDays,
      }),
    [checklist, profile.commute, profile.commuteDistanceKm, streakDays]
  );

  const toggleChecklistItem = useCallback(
    (id: string) => {
      const nextMap = { ...checklistMap, [id]: !checklistMap[id] };
      const updatedList = checklist.map((item) => ({
        ...item,
        completed: Boolean(nextMap[item.id]),
      }));
      setChecklistMap(nextMap);
      saveChecklistState(updatedList);
      setStreakDays(loadStreakDays());
    },
    [checklist, checklistMap]
  );

  const resetLocalSession = useCallback(() => {
    resetAllLocalData();
    setProfile(DEFAULT_USER_PROFILE);
    setDataMode("live");
    setChecklistMap({});
    setStreakDays(0);
    void fetchSnapshot(DEFAULT_USER_PROFILE, "live");
    notify("Preferences reset", "Local profile and checklist data cleared.");
  }, [fetchSnapshot, notify]);

  const value = useMemo<BreatheWiseContextValue>(
    () => ({
      profile,
      isHydrated,
      airQuality,
      isLoadingAirQuality,
      airQualityError,
      dataMode,
      recommendations,
      exposure,
      dailyPlan,
      checklist,
      impact,
      streakDays,
      assistantOpen,
      setAssistantOpen,
      updateProfile,
      switchDataMode,
      refreshAirQuality,
      toggleChecklistItem,
      resetLocalSession,
      notify,
    }),
    [
      profile,
      isHydrated,
      airQuality,
      isLoadingAirQuality,
      airQualityError,
      dataMode,
      recommendations,
      exposure,
      dailyPlan,
      checklist,
      impact,
      streakDays,
      assistantOpen,
      updateProfile,
      switchDataMode,
      refreshAirQuality,
      toggleChecklistItem,
      resetLocalSession,
      notify,
    ]
  );

  return (
    <MotionConfig reducedMotion="user">
      <BreatheWiseContext.Provider value={value}>
        {children}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto rounded-xl border border-[#cde0d4] bg-white px-4 py-3 shadow-lg"
            >
              <p className="text-sm font-semibold text-[#10201a]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[#4b5e56]">{toast.description}</p>
              )}
            </div>
          ))}
        </div>
      </BreatheWiseContext.Provider>
    </MotionConfig>
  );
}

/** Hook returning the BreatheWise application context. Must be called inside `BreatheWiseProvider`. */
export function useBreatheWise(): BreatheWiseContextValue {
  const ctx = useContext(BreatheWiseContext);
  if (!ctx) {
    throw new Error("useBreatheWise must be used within BreatheWiseProvider");
  }
  return ctx;
}
