import { NextRequest, NextResponse } from "next/server";
import { generateAssistantGuidance } from "@/lib/ai-assistant";
import { assistantRequestSchema } from "@/lib/schemas";
import {
  jsonErrorResponse,
  rateLimitExceededResponse,
  rateLimitHeaders,
} from "@/lib/security/http";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";
import { enforcePayloadSize } from "@/lib/security/sanitize";

const ASSISTANT_RATE_LIMIT = 12;

export async function POST(request: NextRequest) {
  try {
    const clientId = `ai:${getClientIdentifier(request.headers)}`;
    const rate = await checkRateLimit(clientId, {
      limit: ASSISTANT_RATE_LIMIT,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return rateLimitExceededResponse(
        rate,
        ASSISTANT_RATE_LIMIT,
        "Too many AI assistant requests. Please wait a minute and try again."
      );
    }

    const rawBody = await request.text();
    if (!enforcePayloadSize(rawBody, 16_384)) {
      return NextResponse.json(
        { error: "Request payload exceeds maximum allowed size (16 KB)." },
        { status: 413 }
      );
    }

    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parsed = assistantRequestSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed for assistant request.",
          details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const result = await generateAssistantGuidance(parsed.data);

    return NextResponse.json(result, {
      status: 200,
      headers: rateLimitHeaders(rate, ASSISTANT_RATE_LIMIT),
    });
  } catch (error) {
    return jsonErrorResponse(error, 500);
  }
}
