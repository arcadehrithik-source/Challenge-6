import { NextRequest, NextResponse } from "next/server";
import { getAirQualitySnapshot } from "@/lib/air-quality-service";
import { airQualityQuerySchema } from "@/lib/schemas";
import {
  jsonErrorResponse,
  rateLimitExceededResponse,
  rateLimitHeaders,
} from "@/lib/security/http";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

const AIR_QUALITY_RATE_LIMIT = 45;

export async function GET(request: NextRequest) {
  try {
    const clientId = `aq:${getClientIdentifier(request.headers)}`;
    const rate = await checkRateLimit(clientId, {
      limit: AIR_QUALITY_RATE_LIMIT,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return rateLimitExceededResponse(
        rate,
        AIR_QUALITY_RATE_LIMIT,
        "Rate limit exceeded. Please retry shortly."
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const parsed = airQualityQuerySchema.safeParse({
      city: searchParams.get("city") ?? "Kolkata",
      locality: searchParams.get("locality") ?? undefined,
      lat: searchParams.get("lat") ?? undefined,
      lon: searchParams.get("lon") ?? undefined,
      mode: searchParams.get("mode") ?? "live",
      scenario: searchParams.get("scenario") ?? "auto",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid air quality query parameters.",
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const snapshot = await getAirQualitySnapshot({
      city: parsed.data.city,
      locality: parsed.data.locality,
      latitude: parsed.data.lat,
      longitude: parsed.data.lon,
      mode: parsed.data.mode,
      scenario: parsed.data.scenario,
    });

    return NextResponse.json(snapshot, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        ...rateLimitHeaders(rate, AIR_QUALITY_RATE_LIMIT),
      },
    });
  } catch (error) {
    return jsonErrorResponse(error, 500);
  }
}
