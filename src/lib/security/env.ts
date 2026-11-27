import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AI_PROVIDER: z.enum(["none", "openai", "gemini"]).default("none"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  OPEN_METEO_AIR_QUALITY_URL: z
    .string()
    .url()
    .default("https://air-quality-api.open-meteo.com/v1/air-quality"),
  OPEN_METEO_GEOCODING_URL: z
    .string()
    .url()
    .default("https://geocoding-api.open-meteo.com/v1/search"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv && process.env.NODE_ENV === "production") {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    AI_PROVIDER: process.env.AI_PROVIDER || "none",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    OPEN_METEO_AIR_QUALITY_URL:
      process.env.OPEN_METEO_AIR_QUALITY_URL ||
      "https://air-quality-api.open-meteo.com/v1/air-quality",
    OPEN_METEO_GEOCODING_URL:
      process.env.OPEN_METEO_GEOCODING_URL || "https://geocoding-api.open-meteo.com/v1/search",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  if (!parsed.success) {
    // Never log secret values; only report invalid key names.
    const invalidKeys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid server environment configuration for keys: ${invalidKeys}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function isAllowedExternalUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "air-quality-api.open-meteo.com" ||
        parsed.hostname === "geocoding-api.open-meteo.com" ||
        parsed.hostname === "api.openai.com" ||
        parsed.hostname === "generativelanguage.googleapis.com" ||
        parsed.hostname.endsWith(".upstash.io"))
    );
  } catch {
    return false;
  }
}
