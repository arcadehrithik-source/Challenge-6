# Security Implementation Checklist

| Control | Status | Implementation File | Verification |
|---|---|---|---|
| Server-side env validation | Implemented | `src/lib/security/env.ts` | Verified in unit tests & build |
| Strict Zod request validation | Implemented | `src/lib/schemas.ts`, `src/app/api/*` | Tested in `tests/integration/api-routes.test.ts` |
| AI output schema validation | Implemented | `src/lib/ai-assistant.ts` | `assistantStructuredResponseSchema` |
| Prompt injection protection | Implemented | `src/lib/security/sanitize.ts` | Tested in `tests/unit/security.test.ts` & API tests |
| Request size limits (16 KB) | Implemented | `src/app/api/assistant/route.ts` | Tested for `413` in integration tests |
| Rate limiting adapter | Implemented | `src/lib/security/rate-limit.ts` | Tested for `429` in integration tests |
| SSRF outbound URL allowlist | Implemented | `src/lib/security/env.ts` | Tested in `tests/unit/security.test.ts` |
| HTTP security headers & CSP | Implemented | `next.config.ts` | Verified in `next.config.ts` |
| Safe error handling (no stack/key leaks) | Implemented | `src/lib/security/sanitize.ts` | Tested in `tests/unit/security.test.ts` |
| No unnecessary PII collection | Implemented | `src/components/onboarding/OnboardingWizard.tsx` | Only city/optional locality + routine |
| No `dangerouslySetInnerHTML` / `eval` | Verified | Codebase-wide | Verified via static check |
| Prototype auth scope documented | Documented | `SECURITY.md`, `security/DATA_PRIVACY.md` | Explicit prototype notice |

