# Deployment Guide

## Recommended Platforms
BreatheWise AI is a standard Next.js 16 App Router application compatible with Vercel, Railway, Render, Fly.io, or self-hosted Node.js 22.

## Production Checklist
1. Set `NODE_ENV=production` so `next.config.ts` applies production CSP (omitting `'unsafe-eval'`).
2. Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` if deploying across multiple serverless instances so `/api/assistant` and `/api/air-quality` rate limits remain globally consistent.
3. Optionally set `AI_PROVIDER=openai` or `gemini` with the matching server-side API key; if omitted or unavailable, the deterministic fallback handles all assistant queries automatically.
4. Build and start:
   ```bash
   npm ci
   npm run build
   npm run start
   ```
5. Verify readiness via `GET /api/health`.
