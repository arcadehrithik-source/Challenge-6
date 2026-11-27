# Test Coverage Report — BreatheWise AI

Measured via `npm run test:coverage` (`vitest run --coverage`, V8 provider) across `src/lib/**/*.ts` and `src/app/api/**/*.ts`.

## Summary (Observed Run: 9/9 Test Files, 35/35 Tests Passed)
- **All Measured Files**: `84.33%` Statements | `70.26%` Branches | `97.33%` Functions | `85.68%` Lines

## Module Breakdown
| File | Stmts | Branch | Funcs | Lines | Notes |
|---|---|---|---|---|---|
| `src/app/api/air-quality/route.ts` | 84.61% | 87.50% | 100% | 84.61% | Uncovered: 429 & 500 error catch paths |
| `src/app/api/assistant/route.ts` | 88.88% | 100% | 100% | 88.88% | Uncovered: invalid JSON catch & 500 catch |
| `src/app/api/health/route.ts` | 100% | 50.00% | 100% | 100% | Tested with `AI_PROVIDER=none` |
| `src/lib/aqi.ts` | 92.30% | 86.20% | 100% | 90.90% | All CPCB breakpoints & pollutant drivers covered |
| `src/lib/cities.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/commute-impact.ts` | 100% | 73.68% | 100% | 100% | Mode comparison & CO2 formulas covered |
| `src/lib/recommendation-engine.ts` | 87.95% | 64.77% | 100% | 87.95% | All 5 personas & indoor/commute branches covered |
| `src/lib/schemas.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/air-quality-service.ts` | 79.36% | 72.47% | 100% | 79.20% | Live fetch, cache hit, timeout & missing PM fallback |
| `src/lib/ai-assistant.ts` | 76.62% | 72.83% | 100% | 76.00% | OpenAI, Gemini fallback, and deterministic paths |
| `src/lib/storage.ts` | 81.70% | 56.52% | 100% | 95.58% | Persistence, corrupted JSON recovery, streak |
| `src/lib/security/env.ts` | 73.33% | 90.90% | 66.66% | 78.57% | SSRF allowlist & env parsing |
| `src/lib/security/rate-limit.ts` | 79.06% | 59.37% | 100% | 77.50% | Upstash REST branch not hit without Redis env |
| `src/lib/security/sanitize.ts` | 88.88% | 75.00% | 100% | 87.50% | Prompt injection, payload limit, redaction |

## Known Gaps
- Upstash Redis REST HTTP branch (`rate-limit.ts` lines 50–69) and geocoding external lookup branch (`air-quality-service.ts`) are only exercised when external Redis/non-preset cities are called live; UI components are verified through Playwright E2E and `axe-core` tests rather than Vitest DOM unit coverage.
