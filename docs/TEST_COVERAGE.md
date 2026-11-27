# Test Coverage Report — BreatheWise AI

Measured via `npm run test:coverage` (`vitest run --coverage`, V8 provider) with enforced thresholds (`lines: 88`, `statements: 88`, `functions: 95`, `branches: 75`) in `vitest.config.ts`.

## Summary (Observed Run: 10/10 Test Files, 43/43 Tests Passed)
- **All Measured Files**: `89.89%` Statements | `75.61%` Branches | `97.61%` Functions | `91.38%` Lines

## Module Breakdown
| File | Stmts | Branch | Funcs | Lines | Notes |
|---|---|---|---|---|---|
| `src/app/api/air-quality/route.ts` | 92.85% | 93.75% | 100% | 92.85% | Covers 200, 400, 429, headers |
| `src/app/api/assistant/route.ts` | 96.00% | 91.66% | 100% | 96.00% | Covers 200, 400, 413 (`Content-Length` & body), 429 |
| `src/app/api/health/route.ts` | 100% | 50.00% | 100% | 100% | Readiness status without secret leakage |
| `src/lib/aqi.ts` | 97.43% | 96.55% | 100% | 96.96% | All CPCB breakpoints, clamping, and pollutant descriptions |
| `src/lib/cities.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/commute-impact.ts` | 95.83% | 70.58% | 92.30% | 95.34% | Mode comparison, scoring, and CO2 formulas |
| `src/lib/recommendation-engine.ts` | 91.56% | 71.59% | 100% | 91.56% | All 5 personas, fuels, purifiers, and daily slots |
| `src/lib/schemas.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/air-quality-service.ts` | 91.26% | 77.06% | 100% | 91.20% | Live fetch, geocoding, concurrent dedup, cache, demo fallback |
| `src/lib/ai-assistant.ts` | 78.20% | 76.00% | 100% | 77.63% | OpenAI, Gemini fallback, deterministic engine |
| `src/lib/storage.ts` | 83.13% | 62.00% | 100% | 95.58% | Persistence, corrupted JSON & streak guard recovery |
| `src/lib/utils.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/security/http.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/security/rate-limit.ts` | 97.67% | 75.00% | 100% | 97.50% | Upstash REST adapter, fallback, bounded eviction |
| `src/lib/security/sanitize.ts` | 88.88% | 75.00% | 100% | 87.50% | Prompt injection, payload limit, redaction |
| `src/lib/security/env.ts` | 73.33% | 90.90% | 66.66% | 78.57% | SSRF allowlist & env parsing |

## Known Gaps
- `src/lib/types.ts` contains TypeScript interfaces only (`0%` runtime executable lines).
- Complex multi-route UI flows are validated through Playwright E2E (`tests/e2e/breathewise.spec.ts`) and `axe-core` (`tests/accessibility/a11y.spec.ts`), complemented by component tests in `tests/unit/components.test.tsx`.
