# Test Coverage Report — BreatheWise AI

Measured via `npm run test:coverage` (`vitest run --coverage`, V8 provider) with enforced thresholds (`lines: 88`, `statements: 88`, `functions: 95`, `branches: 75`) in `vitest.config.ts`.

## Summary (Observed Run: 10/10 Test Files, 47/47 Tests Passed)
- **All Measured Files**: `91.77%` Statements | `77.48%` Branches | `98.07%` Functions | `93.46%` Lines

## Module Breakdown
| File | Stmts | Branch | Funcs | Lines | Notes |
|---|---|---|---|---|---|
| `src/app/api/air-quality/route.ts` | 94.73% | 85.00% | 100% | 94.73% | Covers 200, 400, 429, blank lat/lon guard, fallback `no-store` |
| `src/app/api/assistant/route.ts` | 96.00% | 91.66% | 100% | 96.00% | Covers 200, 400, 413 (`Content-Length` & body), 429 |
| `src/app/api/health/route.ts` | 100% | 50.00% | 100% | 100% | Readiness status without secret leakage + degraded 500 path |
| `src/lib/aqi.ts` | 97.43% | 96.55% | 100% | 96.96% | All CPCB breakpoints, non-finite/Infinity guard, clamping |
| `src/lib/cities.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/commute-impact.ts` | 95.83% | 70.58% | 92.30% | 95.34% | Mode comparison, scoring, and CO2 formulas |
| `src/lib/recommendation-engine.ts` | 91.66% | 67.94% | 100% | 94.44% | Exposure levels (`Low`/`Elevated`/`Critical`), daily slots, checklist |
| `src/lib/recommendations/builders.ts` | 95.23% | 79.06% | 100% | 95.23% | Domain recommendation builders across personas, fuels, purifiers |
| `src/lib/schemas.ts` | 100% | 100% | 100% | 100% | Complete coverage incl. blank/null coordinate normalization |
| `src/lib/air-quality-service.ts` | 89.70% | 80.00% | 91.66% | 90.15% | Live fetch, TTL expiry eviction, dedup, schema bounds, demo fallback |
| `src/lib/ai-assistant.ts` | 90.27% | 72.54% | 100% | 90.00% | OpenAI, Gemini (`x-goog-api-key` header), malformed JSON fallback |
| `src/lib/storage.ts` | 83.13% | 62.00% | 100% | 95.58% | Persistence, corrupted JSON & streak guard recovery |
| `src/lib/utils.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/security/http.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/security/rate-limit.ts` | 92.72% | 80.85% | 100% | 92.45% | Upstash REST adapter, malformed-shape fallback, bounded eviction |
| `src/lib/security/sanitize.ts` | 88.88% | 75.00% | 100% | 87.50% | Prompt injection, payload limit, redaction |
| `src/lib/security/env.ts` | 93.33% | 95.45% | 100% | 92.85% | SSRF allowlist, env parsing, invalid key reporting |

## Known Gaps
- `src/lib/types.ts` contains TypeScript interfaces only (`0%` runtime executable lines).
- Complex multi-route UI flows are validated through Playwright E2E (`tests/e2e/breathewise.spec.ts`) and `axe-core` across Desktop Chromium + Mobile Pixel 5 (`tests/accessibility/a11y.spec.ts`), complemented by component tests in `tests/unit/components.test.tsx`.
