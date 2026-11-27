# Problem Statement Alignment & Traceability Matrix

## Core Philosophy Alignment
> *"Don't just tell people how polluted their city is. Tell them what they should do differently today, why it matters, and what impact their decisions create."*

Every workflow in BreatheWise AI connects ambient pollutant levels directly to personalized decisions, scientific rationale, and transparent environmental impact estimates.

## Requirement Traceability Matrix

| Problem Statement Requirement | Implementation | Primary File / Module | Verification Method | Status |
|---|---|---|---|---|
| Polished product landing page (no generic dashboard entry) | 8-section startup homepage with interactive hero preview | `src/components/landing/LandingPage.tsx`, `HeroVisual.tsx` | E2E + axe-core WCAG 2.2 AA | Implemented & Verified |
| Multi-step personalized onboarding (A–F) | 6-step Zod-validated wizard with local persistence & skip option | `src/components/onboarding/OnboardingWizard.tsx`, `steps/OnboardingSteps.tsx` | E2E invalid-input + persistence reload test | Implemented & Verified |
| 5 Household Personas affecting recommendations | Persona-specific logic for children, seniors, commuters, outdoor/remote workers, fitness | `src/lib/recommendation-engine.ts` | `tests/unit/recommendation-engine.test.ts` | Implemented & Verified |
| Indian NAQI (CPCB) categories & pollutant breakdown | Sub-index calculation for PM2.5, PM10, NO2, O3 with non-color badges | `src/lib/aqi.ts`, `src/components/air-quality/AqiBadge.tsx` | `tests/unit/aqi.test.ts` | Implemented & Verified |
| Live Air Quality API + timeout, cache, & labeled demo fallback | Open-Meteo integration with 10m cache, 6.5s timeout, explicit Demo Mode banner | `src/lib/air-quality-service.ts`, `src/app/api/air-quality/route.ts` | `tests/integration/air-quality-service.test.ts` | Implemented & Verified |
| Non-medical personalized exposure indicator | Situational exposure score + rationale + explicit disclaimer | `computeExposureIndicator` in `src/lib/recommendation-engine.ts` | `tests/unit/recommendation-engine.test.ts` | Implemented & Verified |
| Time-of-day plan & interactive household checklist | Morning/Afternoon/Evening/Night slots + persistent checkboxes | `src/components/dashboard/DashboardOverview.tsx` | E2E checklist toggle + unit tests | Implemented & Verified |
| Hourly AQI chart separating Observed / Forecast / Simulated | Recharts area chart with explicit observation-type badges & text summary | `src/components/air-quality/HourlyAqiChart.tsx` | E2E + `axe-core` accessibility | Implemented & Verified |
| Context-grounded AI Assistant ("BreatheWise Intelligence") + fallback | Configurable OpenAI/Gemini adapter + 7-part deterministic fallback | `src/lib/ai-assistant.ts`, `BreatheWiseAssistantDialog.tsx` | `tests/integration/api-routes.test.ts`, `ai-adapter.test.ts`, E2E | Implemented & Verified |
| Indoor Air Intelligence (incl. zero-cost & plant caveat) | Ventilation windows, cooking fuel advice, HEPA maintenance, houseplant myth check | `src/components/indoor-air/IndoorAirModule.tsx` | E2E indoor route assertions | Implemented & Verified |
| Smart Commute Assistant (exposure vs emissions + route caveat) | Compares 5 modes, travel time, CO2, modeled exposure, shorter-route caveat | `src/lib/commute-impact.ts`, `SmartCommuteModule.tsx` | `tests/unit/commute-impact.test.ts`, E2E | Implemented & Verified |
| Sustainable Alternatives & Transparent Impact Tracker | Weekly/monthly progress, baseline formulas, non-offset disclaimer | `SustainabilityModule.tsx`, `ImpactTrackerModule.tsx` | `tests/unit/commute-impact.test.ts`, E2E | Implemented & Verified |
| Community Intelligence (privacy-preserving) | City winter notes, neighborhood challenges, copyable advisory card | `src/components/community/CommunityModule.tsx` | Build + axe-core accessibility | Implemented & Verified |
| Security engineering, privacy & docs | Zod, rate limit, SSRF allowlist, sanitization, CSP headers, threat model | `src/lib/security/*`, `next.config.ts`, `security/*` | `tests/security/security-controls.test.ts`, `npm run audit` | Implemented & Verified |
