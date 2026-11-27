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

// Single-instance fallback limiter for local/prototype runtime.
// Note: Not globally consistent across multi-instance serverless deployments unless Upstash Redis is configured.
const MAX_LOCAL_BUCKETS = 1000;
const localBuckets = new Map<string, BucketEntry>();

function pruneLocalBuckets(now: number): void {
  if (localBuckets.size < MAX_LOCAL_BUCKETS) return;
  for (const [k, v] of localBuckets.entries()) {
    if (v.resetAtMs <= now) {
      localBuckets.delete(k);
    }
  }
  if (localBuckets.size >= MAX_LOCAL_BUCKETS) {
    const oldest = localBuckets.keys().next().value;
    if (oldest) localBuckets.delete(oldest);
  }
}

export function clearLocalRateLimits(): void {
  localBuckets.clear();
}

export async function checkRateLimit(
  identifier: string,
  options: { limit?: number; windowMs?: number } = {}
): Promise<RateLimitResult> {
  const limit = options.limit ?? 15;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  const env = getServerEnv();
  const upstashUrl = env.UPSTASH_REDIS_REST_URL;
  const upstashToken = env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken && isAllowedExternalUrl(upstashUrl)) {
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

      if (pipelineRes.ok) {
        const data = (await pipelineRes.json()) as Array<{ result?: number }>;
        const count = Number(data?.[0]?.result ?? 1);
        return {
          allowed: count <= limit,
          remaining: Math.max(0, limit - count),
          resetAtMs: now + windowMs,
          backend: "upstash-redis",
        };
      }
    } catch {
      // Fall through cleanly to single-instance fallback without exposing credentials.
    }
  }

  pruneLocalBuckets(now);
  const existing = localBuckets.get(identifier);
  if (!existing || existing.resetAtMs <= now) {
    const next: BucketEntry = { count: 1, resetAtMs: now + windowMs };
    localBuckets.set(identifier, next);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAtMs: next.resetAtMs,
      backend: "single-instance-memory",
    };
  }

  existing.count += 1;
  localBuckets.set(identifier, existing);

  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAtMs: existing.resetAtMs,
    backend: "single-instance-memory",
  };
}

export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  return realIp || "local-client";
}
