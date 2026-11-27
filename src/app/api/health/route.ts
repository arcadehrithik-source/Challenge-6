import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/security/env";

export async function GET() {
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
}
