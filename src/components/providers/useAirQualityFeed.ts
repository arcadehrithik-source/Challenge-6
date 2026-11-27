"use client";

import { useCallback, useState } from "react";
import { buildDemoAirQualitySnapshot } from "@/lib/air-quality-service";
import { airQualitySnapshotSchema } from "@/lib/schemas";
import type { AirQualitySnapshot, UserProfile } from "@/lib/types";

function buildAirQualitySearchParams(
  targetProfile: UserProfile,
  targetMode: "live" | "demo"
): URLSearchParams {
  const params = new URLSearchParams({
    city: targetProfile.city,
    mode: targetMode,
    scenario: targetProfile.demoScenario ?? "auto",
  });
  if (targetProfile.locality) {
    params.set("locality", targetProfile.locality);
  }
  if (typeof targetProfile.latitude === "number" && typeof targetProfile.longitude === "number") {
    params.set("lat", String(targetProfile.latitude));
    params.set("lon", String(targetProfile.longitude));
  }
  return params;
}

function buildPendingCitySnapshot(targetProfile: UserProfile): AirQualitySnapshot {
  return buildDemoAirQualitySnapshot({
    city: targetProfile.city,
    locality: targetProfile.locality,
    latitude: targetProfile.latitude,
    longitude: targetProfile.longitude,
    scenario: targetProfile.demoScenario ?? "auto",
    reason: `Loading air quality data for ${targetProfile.city}...`,
  });
}

/**
 * Encapsulates live/demo `/api/air-quality` fetching, schema validation, loading states, and safe fallback.
 */
export function useAirQualityFeed(initialProfile: UserProfile) {
  const [airQuality, setAirQuality] = useState<AirQualitySnapshot>(() =>
    buildDemoAirQualitySnapshot({
      city: initialProfile.city,
      locality: initialProfile.locality,
      scenario: "poor",
      reason: "Initializing local air quality feed.",
      referenceTimeIso: "2026-11-27T08:00:00.000Z",
    })
  );
  const [isLoadingAirQuality, setIsLoadingAirQuality] = useState(false);
  const [airQualityError, setAirQualityError] = useState<string | null>(null);

  const fetchSnapshot = useCallback(
    async (targetProfile: UserProfile, targetMode: "live" | "demo") => {
      setIsLoadingAirQuality(true);
      setAirQualityError(null);
      setAirQuality((prev) =>
        prev.city.toLowerCase() === targetProfile.city.trim().toLowerCase()
          ? prev
          : buildPendingCitySnapshot(targetProfile)
      );
      try {
        const params = buildAirQualitySearchParams(targetProfile, targetMode);
        const res = await fetch(`/api/air-quality?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Air quality service returned ${res.status}`);
        }
        const parsed = airQualitySnapshotSchema.safeParse(await res.json());
        if (!parsed.success) {
          throw new Error("Unexpected air quality payload shape.");
        }
        setAirQuality(parsed.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load air quality data.";
        setAirQualityError(message);
        setAirQuality(
          buildDemoAirQualitySnapshot({
            city: targetProfile.city,
            locality: targetProfile.locality,
            scenario: targetProfile.demoScenario ?? "auto",
            reason: "Network fetch failed; showing clearly labeled Demonstration Mode.",
          })
        );
      } finally {
        setIsLoadingAirQuality(false);
      }
    },
    []
  );

  return { airQuality, isLoadingAirQuality, airQualityError, fetchSnapshot };
}
