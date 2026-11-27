import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/security/env";
import { safeErrorMessage } from "@/lib/security/sanitize";

export async function GET() {
  try {
    const env = getServerEnv();
    return NextResponse.json(
      {
        status: "ok",
        service: "breathewise-ai",
        aiProviderConfigured:
          (env.AI_PROVIDER === "openai" && Boolean(env.OPENAI_API_KEY)) ||
          (env.AI_PROVIDER === "gemini" && Boolean(env.GEMINI_API_KEY)),
        aiMode: env.AI_PROVIDER,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        service: "breathewise-ai",
        aiProviderConfigured: false,
        aiMode: "none",
        error: safeErrorMessage(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
