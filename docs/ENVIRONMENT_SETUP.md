# Environment Configuration

BreatheWise AI runs with zero required secrets (`AI_PROVIDER=none` uses the built-in deterministic recommendation and guidance engine).

## Variables (`.env.example`)
| Variable | Default | Purpose |
|---|---|---|
| `AI_PROVIDER` | `none` | `"none"`, `"openai"`, or `"gemini"` |
| `OPENAI_API_KEY` | unset | Server-only API key when `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI chat model |
| `GEMINI_API_KEY` | unset | Server-only API key when `AI_PROVIDER=gemini` |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini generative model |
| `OPEN_METEO_AIR_QUALITY_URL` | `https://air-quality-api.open-meteo.com/v1/air-quality` | Upstream air quality feed (SSRF allowlisted) |
| `OPEN_METEO_GEOCODING_URL` | `https://geocoding-api.open-meteo.com/v1/search` | Upstream city geocoding feed (SSRF allowlisted) |
| `UPSTASH_REDIS_REST_URL` | unset | Optional distributed rate-limiter backend |
| `UPSTASH_REDIS_REST_TOKEN` | unset | Optional Upstash REST token |

All server variables are validated at runtime via Zod in `src/lib/security/env.ts`. Never expose API keys via `NEXT_PUBLIC_*`.
