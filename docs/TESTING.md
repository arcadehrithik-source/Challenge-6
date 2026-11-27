# Testing Strategy & Architecture — BreatheWise AI

## Test Pyramid
1. **Unit Tests (`tests/unit/`)**: Pure domain logic in `aqi.ts`, `recommendation-engine.ts`, `commute-impact.ts`, `storage.ts`, `utils.ts`, and `sanitize.ts`.
2. **Integration Tests (`tests/integration/`)**: `air-quality-service.ts` (caching, timeout/network fallback, missing measurements), `ai-assistant.ts` (OpenAI success, Gemini error fallback), and Next.js route handlers (`/api/air-quality`, `/api/assistant`, `/api/health`).
3. **Security Tests (`tests/security/`)**: Header verification on `next.config.ts`, SSRF blocklist checks, prompt-injection patterns, payload limit, credential redaction, and bounded rate-limiter eviction.
4. **End-to-End Tests (`tests/e2e/`)**: Full user journey on **Desktop Chrome** and **Mobile Chrome (Pixel 5)**: Landing → Onboarding validation → Persistence across reload → Dashboard AQI & recommendations → AI Assistant fallback → Indoor Air → Smart Commute → Impact Tracker checklist update.
5. **Accessibility Tests (`tests/accessibility/`)**: `@axe-core/playwright` (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) across all 11 routes plus keyboard `Tab` & `Escape` verification.

## Execution Commands
```bash
npm run test             # Run Vitest unit, integration, and security tests
npm run test:coverage    # Run Vitest with V8 coverage report
npm run test:e2e         # Run Playwright desktop + mobile user journey tests
npm run test:a11y        # Run Playwright + axe-core WCAG 2.2 AA audit
```
