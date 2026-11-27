import { NextResponse } from "next/server";
import type { RateLimitResult } from "./rate-limit";
import { safeErrorMessage } from "./sanitize";

const SECURITY_API_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
};

/**
 * Returns standardized HTTP rate-limit telemetry headers for API responses.
 */
export function rateLimitHeaders(rate: RateLimitResult, limit: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Backend": rate.backend,
    "X-Content-Type-Options": "nosniff",
  };
}

/**
 * Builds an HTTP 429 JSON response with dynamic `Retry-After` computed from window reset time.
 */
export function rateLimitExceededResponse(
  rate: RateLimitResult,
  limit: number,
  message: string
): NextResponse {
  const retryAfterSeconds = Math.max(1, Math.ceil((rate.resetAtMs - Date.now()) / 1000));
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        ...rateLimitHeaders(rate, limit),
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * Builds a sanitized JSON error response with redacted secret fragments and `no-store` caching.
 */
export function jsonErrorResponse(error: unknown, status = 500): NextResponse {
  return NextResponse.json(
    { error: safeErrorMessage(error) },
    { status, headers: SECURITY_API_HEADERS }
  );
}
