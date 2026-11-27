export type AqiCategory = "Good" | "Satisfactory" | "Moderate" | "Poor" | "Very Poor" | "Severe";

export type PollutantCode = "PM2.5" | "PM10" | "NO2" | "O3";

export type DataSourceMode = "live" | "demo";

export type ObservationType = "observed" | "forecast" | "simulated";

export type DemoScenario = "auto" | "good" | "moderate" | "poor" | "severe";

export interface HourlyAirQualityPoint {
  time: string;
  label: string;
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  observationType: ObservationType;
}

export interface AirQualitySnapshot {
  city: string;
  locality?: string;
  latitude: number;
  longitude: number;
  aqi: number;
  category: AqiCategory;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
  mainPollutant: PollutantCode;
  healthAdvisory: string;
  dataSource: string;
  dataMode: DataSourceMode;
  updatedAt: string;
  hourly: HourlyAirQualityPoint[];
  isFallback: boolean;
  fallbackReason?: string;
}

export type HouseholdType =
  "individual" | "couple" | "family" | "family_with_children" | "household_with_seniors";

export type LifestyleType =
  "student" | "office_commuter" | "remote_worker" | "outdoor_worker" | "fitness_enthusiast";

export type CommuteMode =
  "walking" | "bicycle" | "public_transport" | "two_wheeler" | "car" | "work_from_home";

export type CookingFuel = "lpg_png" | "electric_induction" | "solid_biomass_kerosene";

export type VentilationLevel = "cross_ventilated" | "moderate" | "sealed_limited";

export type BudgetPreference = "zero_low_cost" | "moderate" | "flexible";

export type SustainabilityPriority =
  "protect_health" | "reduce_emissions" | "save_energy" | "low_cost_living";

export interface IndoorEnvironmentProfile {
  hasAirPurifier: boolean;
  hasIndoorPlants: boolean;
  windowsFrequentlyOpen: boolean;
  cookingFuel: CookingFuel;
  ventilation: VentilationLevel;
}

export interface UserPreferences {
  dailyNotifications: boolean;
  notificationTime: string;
  sustainabilityPriority: SustainabilityPriority;
  budget: BudgetPreference;
}

export interface UserProfile {
  city: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  household: HouseholdType;
  lifestyle: LifestyleType;
  commute: CommuteMode;
  commuteDistanceKm: number;
  indoorEnvironment: IndoorEnvironmentProfile;
  preferences: UserPreferences;
  demoScenario?: DemoScenario;
  updatedAt: string;
}

export type RecommendationUrgency = "critical" | "high" | "medium" | "low";
export type RecommendationCategory =
  "outdoor" | "indoor" | "commute" | "sustainability" | "household";

export interface Recommendation {
  id: string;
  title: string;
  whatToDo: string;
  whyItMatters: string;
  whenToDoIt: string;
  expectedBenefit: string;
  difficulty: "Easy" | "Moderate" | "Dedicated";
  estimatedCost: string;
  environmentalImpact: string;
  supportingData: string;
  priorityScore: number;
  urgency: RecommendationUrgency;
  category: RecommendationCategory;
}

export interface DailySlotPlan {
  slot: "Morning" | "Afternoon" | "Evening" | "Night";
  timeRange: string;
  riskLevel: "Low" | "Moderate" | "Elevated" | "High";
  summary: string;
  actions: string[];
  ventilationAdvice: string;
}

export interface ExposureIndicator {
  level: "Low" | "Moderate" | "Elevated" | "High" | "Critical";
  score: number;
  headline: string;
  rationale: string[];
  disclaimer: string;
}

export interface CommuteOptionComparison {
  mode: CommuteMode;
  label: string;
  estimatedMinutes: number;
  estimatedCo2Kg: number;
  relativeExposureIndex: number;
  exposureTier: "Lower" | "Moderate" | "Elevated" | "High";
  guidance: string;
  caveat: string;
  isCurrentMode: boolean;
  isRecommended: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: "indoor" | "commute" | "health" | "energy";
  co2AvoidedKg: number;
  exposureReductionNote: string;
  completed: boolean;
}

export interface ImpactMetrics {
  actionsCompleted: number;
  totalActions: number;
  estimatedCo2AvoidedKg: number;
  transportSwitches: number;
  energyActionsCompleted: number;
  exposureReductionOpportunities: number;
  streakDays: number;
  weeklySeries: Array<{
    day: string;
    co2Kg: number;
    actions: number;
  }>;
  assumptions: string[];
}

export interface AssistantStructuredResponse {
  situationAssessment: string;
  whatThisMeansForYou: string;
  recommendedActions: string[];
  whyTheseActionsMatter: string;
  estimatedImpact: string;
  importantPrecautions: string;
  dataSourceAndTimestamp: string;
  providerUsed: string;
  isFallback: boolean;
}
