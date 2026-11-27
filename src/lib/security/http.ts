import { NextResponse } from "next/server";
import type { RateLimitResult } from "./rate-limit";
import { safeErrorMessage } from "./sanitize";

export function rateLimitHeaders(rate: RateLimitResult, limit: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Backend": rate.backend,
  };
}

export function rateLimitExceededResponse(
  rate: RateLimitResult,
  limit: number,
  message: string
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        ...rateLimitHeaders(rate, limit),
        "Retry-After": "60",
      },
    }
  );
}

export function jsonErrorResponse(error: unknown, status = 500): NextResponse {
  return NextResponse.json({ error: safeErrorMessage(error) }, { status });
}
