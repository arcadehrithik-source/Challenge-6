import type { AirQualitySnapshot, UserProfile } from "../types";

export interface RecommendationContext {
  airQuality: AirQualitySnapshot;
  profile: UserProfile;
  hourOfDay: number;
  aqi: number;
  pm25Text: string;
  isSevereOrVeryPoor: boolean;
  isPoorPlus: boolean;
  isModeratePlus: boolean;
  lowBudget: boolean;
}
