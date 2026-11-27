import { z } from "zod";
import { getServerEnv, isAllowedExternalUrl } from "./env";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAtMs: number;
  backend: "upstash-redis" | "single-instance-memory";
}

interface BucketEntry {
  count: number;
  resetAtMs: number;
}

const upstashPipelineSchema = z.array(
  z.object({
    result: z.union([z.number(), z.string()]).optional(),
  })
);

// Single-instance fallback limiter for local/prototype runtime.
// Not globally consistent across multi-instance deployments unless Upstash Redis is configured.
const MAX_LOCAL_BUCKETS = 1000;
const localBuckets = new Map<string, BucketEntry>();

function sweepExpiredLocalBuckets(now: number): void {
  for (const [key, entry] of localBuckets.entries()) {
    if (entry.resetAtMs <= now) {
      localBuckets.delete(key);
    }
  }
}

function pruneLocalBuckets(now: number): void {
  if (localBuckets.size >= MAX_LOCAL_BUCKETS / 2) {
    sweepExpiredLocalBuckets(now);
  }
  if (localBuckets.size >= MAX_LOCAL_BUCKETS) {
    const oldest = localBuckets.keys().next().value;
    if (oldest) localBuckets.delete(oldest);
  }
}

export function clearLocalRateLimits(): void {
  localBuckets.clear();
}

async function checkUpstashRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  now: number
): Promise<RateLimitResult | null> {
  const env = getServerEnv();
  const upstashUrl = env.UPSTASH_REDIS_REST_URL;
  const upstashToken = env.UPSTASH_REDIS_REST_TOKEN;
  if (!upstashUrl || !upstashToken || !isAllowedExternalUrl(upstashUrl)) {
    return null;
  }

  try {
    const key = `bw_rl:${identifier}`;
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    const pipelineRes = await fetch(`${upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec, "NX"],
      ]),
      signal: AbortSignal.timeout(2500),
    });

    if (!pipelineRes.ok) {
      return null;
    }

    const parsed = upstashPipelineSchema.safeParse(await pipelineRes.json());
    if (!parsed.success || parsed.data.length === 0) {
      return null;
    }

    const count = Number(parsed.data[0]?.result ?? 1);
    if (!Number.isFinite(count) || count < 0) {
      return null;
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAtMs: now + windowMs,
      backend: "upstash-redis",
    };
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  identifier: string,
  options: { limit?: number; windowMs?: number } = {}
): Promise<RateLimitResult> {
  const limit = options.limit ?? 15;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  const redisResult = await checkUpstashRateLimit(identifier, limit, windowMs, now);
  if (redisResult) {
    return redisResult;
  }

  const existing = localBuckets.get(identifier);
  if (existing && existing.resetAtMs <= now) {
    localBuckets.delete(identifier);
  }

  pruneLocalBuckets(now);

  const active = localBuckets.get(identifier);
  if (!active) {
    const next: BucketEntry = { count: 1, resetAtMs: now + windowMs };
    localBuckets.set(identifier, next);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAtMs: next.resetAtMs,
      backend: "single-instance-memory",
    };
  }

  active.count += 1;
  localBuckets.set(identifier, active);

  return {
    allowed: active.count <= limit,
    remaining: Math.max(0, limit - active.count),
    resetAtMs: active.resetAtMs,
    backend: "single-instance-memory",
  };
}

export function getClientIdentifier(headers: Headers): string {
  const trustedPlatformIp =
    headers.get("x-vercel-forwarded-for") ?? headers.get("cf-connecting-ip");
  const candidate =
    trustedPlatformIp?.split(",")[0]?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim();
  if (!candidate) return "local-client";
  return candidate.replace(/[^a-zA-Z0-9.:_-]/g, "").slice(0, 64) || "local-client";
}
