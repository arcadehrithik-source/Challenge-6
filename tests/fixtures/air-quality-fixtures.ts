import type { AirQualitySnapshot, UserProfile } from "@/lib/types";
import { DEFAULT_USER_PROFILE } from "@/lib/recommendation-engine";

export const GOOD_AIR_FIXTURE: AirQualitySnapshot = {
  city: "Bengaluru",
  latitude: 12.9716,
  longitude: 77.5946,
  aqi: 34,
  category: "Good",
  pm25: 20.4,
  pm10: 32,
  no2: 18,
  o3: 30,
  mainPollutant: "PM2.5",
  healthAdvisory: "Minimal impact.",
  dataSource: "Test Fixture",
  dataMode: "demo",
  updatedAt: "2026-11-27T08:00:00.000Z",
  hourly: [
    {
      time: "2026-11-27T07:00:00Z",
      label: "07:00",
      aqi: 36,
      pm25: 21,
      pm10: 34,
      observationType: "observed",
    },
    {
      time: "2026-11-27T08:00:00Z",
      label: "08:00",
      aqi: 34,
      pm25: 20.4,
      pm10: 32,
      observationType: "observed",
    },
    {
      time: "2026-11-27T09:00:00Z",
      label: "09:00",
      aqi: 30,
      pm25: 18,
      pm10: 29,
      observationType: "forecast",
    },
  ],
  isFallback: false,
};

export const MODERATE_AIR_FIXTURE: AirQualitySnapshot = {
  ...GOOD_AIR_FIXTURE,
  city: "Mumbai",
  aqi: 152,
  category: "Moderate",
  pm25: 75.5,
  pm10: 145,
  no2: 44,
};

export const POOR_AIR_FIXTURE: AirQualitySnapshot = {
  ...GOOD_AIR_FIXTURE,
  city: "Kolkata",
  aqi: 254,
  category: "Poor",
  pm25: 106,
  pm10: 210,
  no2: 68,
};

export const SEVERE_AIR_FIXTURE: AirQualitySnapshot = {
  ...GOOD_AIR_FIXTURE,
  city: "Delhi",
  aqi: 438,
  category: "Severe",
  pm25: 298,
  pm10: 440,
  no2: 118,
};

export const CYCLIST_PROFILE_FIXTURE: UserProfile = {
  ...DEFAULT_USER_PROFILE,
  city: "Delhi",
  household: "individual",
  lifestyle: "fitness_enthusiast",
  commute: "bicycle",
  commuteDistanceKm: 9,
  indoorEnvironment: {
    hasAirPurifier: false,
    hasIndoorPlants: true,
    windowsFrequentlyOpen: true,
    cookingFuel: "lpg_png",
    ventilation: "moderate",
  },
};

export const SENIOR_REMOTE_PROFILE_FIXTURE: UserProfile = {
  ...DEFAULT_USER_PROFILE,
  city: "Kolkata",
  household: "household_with_seniors",
  lifestyle: "remote_worker",
  commute: "work_from_home",
  commuteDistanceKm: 0,
  indoorEnvironment: {
    hasAirPurifier: true,
    hasIndoorPlants: false,
    windowsFrequentlyOpen: false,
    cookingFuel: "electric_induction",
    ventilation: "sealed_limited",
  },
};
