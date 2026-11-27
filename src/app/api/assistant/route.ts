import { NextRequest, NextResponse } from "next/server";
import { generateAssistantGuidance } from "@/lib/ai-assistant";
import { assistantRequestSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";
import { enforcePayloadSize, safeErrorMessage } from "@/lib/security/sanitize";

export async function POST(request: NextRequest) {
  try {
    const clientId = `ai:${getClientIdentifier(request.headers)}`;
    const rate = await checkRateLimit(clientId, { limit: 12, windowMs: 60_000 });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many AI assistant requests. Please wait a minute and try again." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Backend": rate.backend,
            "Retry-After": "60",
          },
        }
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
      headers: {
        "X-RateLimit-Remaining": String(rate.remaining),
        "X-RateLimit-Backend": rate.backend,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 });
  }
}
