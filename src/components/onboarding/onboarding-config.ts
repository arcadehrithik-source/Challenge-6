import { Home, Leaf, MapPin, Route, Sparkles, Users } from "lucide-react";
import type { UserProfile } from "@/lib/types";

export interface OnboardingCardOption<T extends string> {
  value: T;
  label: string;
  desc: string;
}

export const ONBOARDING_STEPS = [
  { id: "location", title: "Location", icon: MapPin, optional: false },
  { id: "household", title: "Household", icon: Users, optional: false },
  { id: "lifestyle", title: "Lifestyle", icon: Sparkles, optional: false },
  { id: "commute", title: "Daily Commute", icon: Route, optional: false },
  { id: "indoor", title: "Indoor Environment", icon: Home, optional: true },
  { id: "preferences", title: "Preferences", icon: Leaf, optional: true },
] as const;

export const HOUSEHOLD_OPTIONS: ReadonlyArray<OnboardingCardOption<UserProfile["household"]>> = [
  { value: "individual", label: "Individual", desc: "Solo daily planning" },
  { value: "couple", label: "Couple", desc: "Two-adult household" },
  { value: "family", label: "Family", desc: "Multi-member home" },
  {
    value: "family_with_children",
    label: "Family with children",
    desc: "Prioritizes school transit & play windows",
  },
  {
    value: "household_with_seniors",
    label: "Household with senior citizens",
    desc: "Prioritizes indoor stability & walk timing",
  },
];

export const LIFESTYLE_OPTIONS: ReadonlyArray<OnboardingCardOption<UserProfile["lifestyle"]>> = [
  {
    value: "office_commuter",
    label: "Office Commuter",
    desc: "Peak-hour travel & indoor office",
  },
  { value: "student", label: "Student", desc: "School/college transit & campus time" },
  {
    value: "remote_worker",
    label: "Remote Worker",
    desc: "High focus on indoor air & ventilation",
  },
  { value: "outdoor_worker", label: "Outdoor Worker", desc: "Extended outdoor shift protection" },
  {
    value: "fitness_enthusiast",
    label: "Fitness Enthusiast",
    desc: "High-ventilation exercise timing",
  },
];

export const COMMUTE_MODES: ReadonlyArray<{ value: UserProfile["commute"]; label: string }> = [
  { value: "walking", label: "Walking" },
  { value: "bicycle", label: "Bicycle" },
  { value: "public_transport", label: "Public Transport" },
  { value: "two_wheeler", label: "Two-Wheeler" },
  { value: "car", label: "Car" },
  { value: "work_from_home", label: "Work from Home" },
];

export const INDOOR_TOGGLES: ReadonlyArray<{
  key: "hasAirPurifier" | "hasIndoorPlants" | "windowsFrequentlyOpen";
  label: string;
}> = [
  { key: "hasAirPurifier", label: "HEPA air purifier at home" },
  { key: "hasIndoorPlants", label: "Indoor plants present" },
  { key: "windowsFrequentlyOpen", label: "Windows kept open often" },
];
