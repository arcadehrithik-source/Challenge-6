# Test Coverage Report — BreatheWise AI

Measured via `npm run test:coverage` (`vitest run --coverage`, V8 provider) with enforced thresholds (`lines: 88`, `statements: 88`, `functions: 95`, `branches: 75`) in `vitest.config.ts`.

## Summary (Observed Run: 10/10 Test Files, 49/49 Tests Passed)
- **All Measured Files**: `93.88%` Statements | `83.30%` Branches | `98.27%` Functions | `94.27%` Lines

## Module Breakdown
| File | Stmts | Branch | Funcs | Lines | Notes |
|---|---|---|---|---|---|
| `src/app/api/air-quality/route.ts` | 94.73% | 85.00% | 100% | 94.73% | Covers 200, 400, 429, blank lat/lon guard, fallback `no-store` |
| `src/app/api/assistant/route.ts` | 96.00% | 91.66% | 100% | 96.00% | Covers 200, 400 (incl. strict unknown-key rejection), 413, 429 |
| `src/app/api/health/route.ts` | 100% | 50.00% | 100% | 100% | Readiness status without secret leakage + degraded 500 path |
| `src/lib/aqi.ts` | 100% | 100% | 100% | 100% | All CPCB breakpoints, non-finite/Infinity guard, clamping |
| `src/lib/cities.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/commute-impact.ts` | 95.83% | 91.17% | 92.30% | 95.34% | Mode comparison across all modes, scoring, and CO2 baselines |
| `src/lib/recommendation-engine.ts` | 95.45% | 85.52% | 100% | 96.66% | Exposure levels (`Low`/`Elevated`/`Critical`), daily slots, checklist |
| `src/lib/recommendations/builders.ts` | 97.87% | 83.72% | 100% | 97.87% | Domain recommendation builders across personas, fuels, purifiers |
| `src/lib/schemas.ts` | 100% | 100% | 100% | 100% | Strict request/profile schemas + blank/null coordinate handling |
| `src/lib/air-quality-service.ts` | 90.72% | 80.15% | 93.33% | 90.78% | Live fetch, TTL expiry eviction, dedup, schema bounds, demo fallback |
| `src/lib/ai-assistant.ts` | 90.27% | 72.54% | 100% | 90.00% | OpenAI, Gemini (`x-goog-api-key` header), malformed JSON fallback |
| `src/lib/storage.ts` | 92.00% | 72.72% | 100% | 97.72% | Zod-validated persistence, negative-streak guard, recovery |
| `src/lib/utils.ts` | 100% | 100% | 100% | 100% | Complete coverage |
| `src/lib/security/http.ts` | 100% | 100% | 100% | 100% | Complete coverage (incl. dynamic `Retry-After`, `nosniff`, `no-store`) |
| `src/lib/security/rate-limit.ts` | 92.72% | 80.85% | 100% | 92.45% | Upstash REST adapter, malformed-shape fallback, bounded eviction |
| `src/lib/security/sanitize.ts` | 88.88% | 75.00% | 100% | 87.50% | Prompt injection, payload limit, redaction |
| `src/lib/security/env.ts` | 93.33% | 95.45% | 100% | 92.85% | SSRF allowlist, env parsing, invalid key reporting |

## Component & End-to-End Verification
- **React Testing Library (`tests/unit/components.test.tsx`)**: Mounted tests covering `AqiBadge`, `RecommendationCard`, `SafetyChecklistCard`, `OnboardingWizard` (validation + step progression), and `BreatheWiseAssistantDialog` (query submission + schema-validated response rendering).
- **Playwright E2E (`tests/e2e/breathewise.spec.ts`)**: `2/2` passed across Desktop Chromium & Pixel 5 mobile.
- **Playwright WCAG 2.2 AA (`tests/accessibility/a11y.spec.ts`)**: `24/24` passed across all `11` routes + keyboard Tab/Escape on both Desktop Chromium and Pixel 5 mobile.
