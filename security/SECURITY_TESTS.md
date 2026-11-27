# Security Verification & Test Mapping

Automated security tests live in:
- `tests/unit/security.test.ts`
  - Rejects XSS/script payloads in `userProfileSchema` city fields and negative distances.
  - Verifies `detectPromptInjection` flags system-prompt/secret-extraction probes while allowing normal health/commute queries.
  - Verifies `sanitizePlainText`, `enforcePayloadSize` (16 KB limit), `safeErrorMessage` key redaction, and `isAllowedExternalUrl` SSRF allowlist (blocking `169.254.169.254` and arbitrary domains).
- `tests/integration/api-routes.test.ts`
  - Confirms `GET /api/air-quality` returns `400` on invalid city characters.
  - Confirms `POST /api/assistant` returns `400` on invalid schemas, `413` on oversized payloads, `429` when rate limit is exceeded, and engages prompt-safety fallback on injection probes.
- `tests/e2e/breathewise.spec.ts`
  - Confirms invalid onboarding form inputs are rejected in the live UI with accessible `role="alert"` feedback.

