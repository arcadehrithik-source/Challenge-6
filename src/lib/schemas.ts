import { z } from "zod";

const aqiCategorySchema = z.enum([
  "Good",
  "Satisfactory",
  "Moderate",
  "Poor",
  "Very Poor",
  "Severe",
]);

const pollutantCodeSchema = z.enum(["PM2.5", "PM10", "NO2", "O3"]);

const householdTypeSchema = z.enum([
  "individual",
  "couple",
  "family",
  "family_with_children",
  "household_with_seniors",
]);

const lifestyleTypeSchema = z.enum([
  "student",
  "office_commuter",
  "remote_worker",
  "outdoor_worker",
  "fitness_enthusiast",
]);

const commuteModeSchema = z.enum([
  "walking",
  "bicycle",
  "public_transport",
  "two_wheeler",
  "car",
  "work_from_home",
]);

const cookingFuelSchema = z.enum(["lpg_png", "electric_induction", "solid_biomass_kerosene"]);

const ventilationLevelSchema = z.enum(["cross_ventilated", "moderate", "sealed_limited"]);

const budgetPreferenceSchema = z.enum(["zero_low_cost", "moderate", "flexible"]);

const sustainabilityPrioritySchema = z.enum([
  "protect_health",
  "reduce_emissions",
  "save_energy",
  "low_cost_living",
]);

const demoScenarioSchema = z.enum(["auto", "good", "moderate", "poor", "severe"]);

const indoorEnvironmentSchema = z.object({
  hasAirPurifier: z.boolean(),
  hasIndoorPlants: z.boolean(),
  windowsFrequentlyOpen: z.boolean(),
  cookingFuel: cookingFuelSchema,
  ventilation: ventilationLevelSchema,
});

const userPreferencesSchema = z.object({
  dailyNotifications: z.boolean(),
  notificationTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:MM format")
    .default("07:30"),
  sustainabilityPriority: sustainabilityPrioritySchema,
  budget: budgetPreferenceSchema,
});

/**
 * Normalizes blank query strings to undefined before coercing to a finite bounded number,
 * preventing empty strings (?lat=&lon=) from coercing to 0.
 */
function optionalBoundedQueryNumber(min: number, max: number) {
  return z.preprocess((value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, z.coerce.number().finite().min(min).max(max).optional());
}

export const userProfileSchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, "Please enter a city name (at least 2 characters).")
    .max(80, "City name must be 80 characters or fewer.")
    .regex(/^[a-zA-Z\s.,-]+$/, "City name contains unsupported characters."),
  locality: z
    .string()
    .trim()
    .max(100, "Locality must be 100 characters or fewer.")
    .optional()
    .default(""),
  latitude: z.number().finite().min(-90).max(90).optional(),
  longitude: z.number().finite().min(-180).max(180).optional(),
  household: householdTypeSchema,
  lifestyle: lifestyleTypeSchema,
  commute: commuteModeSchema,
  commuteDistanceKm: z.number().finite().min(0).max(120).default(8),
  indoorEnvironment: indoorEnvironmentSchema,
  preferences: userPreferencesSchema,
  demoScenario: demoScenarioSchema.optional().default("auto"),
  updatedAt: z.string().datetime().optional(),
});

export const airQualityQuerySchema = z.object({
  city: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-zA-Z\s.,-]+$/),
  locality: z.string().trim().max(100).optional(),
  lat: optionalBoundedQueryNumber(-90, 90),
  lon: optionalBoundedQueryNumber(-180, 180),
  mode: z.enum(["live", "demo"]).optional().default("live"),
  scenario: demoScenarioSchema.optional().default("auto"),
});

export const airQualitySnapshotSchema = z.object({
  city: z.string().min(1),
  locality: z.string().optional(),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  aqi: z.number().finite().min(0).max(500),
  category: aqiCategorySchema,
  pm25: z.number().finite().nullable(),
  pm10: z.number().finite().nullable(),
  no2: z.number().finite().nullable(),
  o3: z.number().finite().nullable(),
  mainPollutant: pollutantCodeSchema,
  healthAdvisory: z.string(),
  dataSource: z.string(),
  dataMode: z.enum(["live", "demo"]),
  updatedAt: z.string(),
  hourly: z.array(
    z.object({
      time: z.string(),
      label: z.string(),
      aqi: z.number().finite().min(0).max(500),
      pm25: z.number().finite().nullable(),
      pm10: z.number().finite().nullable(),
      observationType: z.enum(["observed", "forecast", "simulated"]),
    })
  ),
  isFallback: z.boolean(),
  fallbackReason: z.string().optional(),
});

export const assistantRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Please ask a question of at least 3 characters.")
    .max(600, "Question must be 600 characters or fewer."),
  context: z.object({
    location: z.string().trim().min(2).max(120),
    aqi: z.number().finite().min(0).max(500),
    aqiCategory: aqiCategorySchema,
    pm25: z.number().finite().min(0).max(2000).nullable(),
    pm10: z.number().finite().min(0).max(2000).nullable(),
    dataMode: z.enum(["live", "demo"]),
    updatedAt: z.string().trim().max(64),
    household: householdTypeSchema,
    lifestyle: lifestyleTypeSchema,
    commute: commuteModeSchema,
    commuteDistanceKm: z.number().finite().min(0).max(120).optional().default(8),
    indoorEnvironment: indoorEnvironmentSchema,
    preferences: userPreferencesSchema.omit({ notificationTime: true }),
  }),
});

export const assistantStructuredResponseSchema = z.object({
  situationAssessment: z.string().min(1),
  whatThisMeansForYou: z.string().min(1),
  recommendedActions: z.array(z.string().min(1)).min(1).max(6),
  whyTheseActionsMatter: z.string().min(1),
  estimatedImpact: z.string().min(1),
  importantPrecautions: z.string().min(1),
  dataSourceAndTimestamp: z.string().min(1),
  providerUsed: z.string().min(1),
  isFallback: z.boolean(),
});
