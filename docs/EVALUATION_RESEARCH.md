# Evaluation Standards & Engineering Research

## 1. Purpose
This document synthesizes primary industry standards and automated evaluation criteria across the six assessment dimensions for **BreatheWise AI** (Challenge 6: Urban Air Quality Assistant | PromptWars).

## 2. Standards & Reference Frameworks

### Code Quality & Maintainability
- **SOLID & Clean Architecture**: Single-responsibility modules separating pure domain calculations (`src/lib/aqi.ts`, `src/lib/recommendation-engine.ts`, `src/lib/commute-impact.ts`), external service adapters (`src/lib/air-quality-service.ts`, `src/lib/ai-assistant.ts`), HTTP route handlers (`src/app/api/*`), and presentation components (`src/components/*`).
- **Static Analysis Gates**: TypeScript `strict: true` + `noUncheckedIndexedAccess: true`, ESLint (`eslint-config-next/core-web-vitals` + `typescript` + React 19 compiler rules), and Prettier formatting verification.

### Security (OWASP Top 10 & OWASP API Security Top 10:2023)
- **API4:2023 — Unrestricted Resource Consumption**: Enforced via request rate limiting (`src/lib/security/rate-limit.ts`), 16 KB request body caps (`enforcePayloadSize`), bounded local cache/rate-limit maps, and `AbortSignal.timeout` on upstream calls.
- **API7:2023 — Server-Side Request Forgery (SSRF)**: Mitigated by strict `https:` + hostname allowlisting (`isAllowedExternalUrl` in `src/lib/security/env.ts`) and strict city-name regex validation.
- **Input & Output Validation**: Zod schemas (`src/lib/schemas.ts`) validate inbound API requests, external Open-Meteo payloads, and LLM JSON responses; `sanitizePlainText` and `detectPromptInjection` guard against XSS and prompt injection.
- **HTTP Hardening**: Security headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, `Referrer-Policy`) configured in `next.config.ts`.

### Efficiency & Web Performance
- **Code Splitting & Dynamic Loading**: `HourlyAqiChart` (Recharts) loaded dynamically via `next/dynamic` to avoid blocking initial shell render.
- **Caching & Request Deduplication**: 10-minute bounded in-memory server cache + in-flight Promise deduplication in `src/lib/air-quality-service.ts` + HTTP `Cache-Control` headers.
- **Minimal Client State**: React Context + `useMemo` + `localStorage` persistence with zero heavy state-management dependencies.

### Testing Strategy
- **Multi-Layer Verification**: Unit tests (`tests/unit/`), integration tests (`tests/integration/`), security verification tests (`tests/security/`), automated WCAG 2.2 AA accessibility scans (`tests/accessibility/`), and desktop + mobile end-to-end Playwright journeys (`tests/e2e/`).
- **Anti-Pattern Avoidance**: Tests validate real domain logic, HTTP status codes (`400`, `413`, `429`, `200`), API fallbacks, persistence across reloads, and real browser DOM interactions—never trivial file-existence checks.

### Accessibility (WCAG 2.2 Level AA)
- **SC 1.4.1 / 1.4.3 / 1.4.11**: Non-color-only AQI communication (`AqiBadge` pairs numeric range, category label, and icon); high-contrast emerald/charcoal/neutral surface tokens.
- **SC 2.4.7 & 2.4.11 Focus Visible / Focus Not Obscured**: Consistent `:focus-visible` outlines (`globals.css`), skip-to-content link, and clean modal/drawer focus management.
- **SC 2.5.8 Target Size (Minimum)**: Interactive controls sized cleanly (`>= 24x24` CSS px; primary buttons `36–48px`).
- **Automated + Manual Checks**: `@axe-core/playwright` (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) across all 11 application routes plus keyboard Tab/Escape checks.

### Problem Statement Alignment
- Transforms ambient AQI into personalized, persona-driven daily decisions across 5 household/lifestyle personas, indoor air management, commute exposure vs CO2 comparisons, and transparent sustainability tracking.

## 3. Primary References
- OWASP Top 10 & OWASP API Security Top 10 (2023): <https://owasp.org/API-Security/>
- W3C WCAG 2.2 Recommendation: <https://www.w3.org/TR/WCAG22/>
- Deque axe-core Ruleset: <https://github.com/dequelabs/axe-core>
- CPCB Indian National Air Quality Index (NAQI) Standard
- Open-Meteo Air Quality API Documentation: <https://open-meteo.com/en/docs/air-quality-api>

## 4. Implementation Evidence Mapping

| Evaluation Parameter | Primary Implementation Evidence | Automated Verification |
|---|---|---|
| Code Quality | Modular `src/lib/*`, `src/components/*`, strict TS, ESLint, Prettier | `npm run typecheck`, `npm run lint`, `npm run format:check` |
| Security | `src/lib/security/*`, `src/lib/schemas.ts`, `next.config.ts` headers | `tests/security/security-controls.test.ts`, `tests/integration/api-routes.test.ts`, `npm run audit` |
| Efficiency | Bounded 10m cache, in-flight dedup, `next/dynamic` charts, `useMemo` | `npm run build` bundle report, cache hit test |
| Testing | Vitest (unit/integration/security) + Playwright (E2E + axe-core) | `npm run test:coverage`, `npm run test:e2e`, `npm run test:a11y` |
| Accessibility | Semantic landmarks, skip link, non-color badges, accessible dialogs | `tests/accessibility/a11y.spec.ts` |
| Problem Alignment | 6-step onboarding, deterministic engine, AI fallback, 8 dashboard modules | `docs/PROBLEM_STATEMENT_ALIGNMENT.md`, E2E suite |
