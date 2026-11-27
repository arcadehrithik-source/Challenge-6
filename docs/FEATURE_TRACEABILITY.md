# Feature-to-Requirement-to-Test Traceability

| Feature | User Need Addressed | Automated Test Coverage |
|---|---|---|
| Indian NAQI Calculation | Accurate pollutant interpretation (PM2.5, PM10, NO2, O3) | `tests/unit/aqi.test.ts` |
| Persona & Indoor Rules Engine | Actionable daily choices without a purifier or for kids/seniors | `tests/unit/recommendation-engine.test.ts` |
| Commute Mode Comparator | Health exposure vs CO2 trade-off for 5 transport modes | `tests/unit/commute-impact.test.ts` |
| Open-Meteo Proxy & Cache | Resilient real-time AQI with honest Demo Mode fallback | `tests/integration/air-quality-service.test.ts` |
| AI Assistant & Adapter | Context-aware Q&A with OpenAI/Gemini + deterministic fallback | `tests/integration/api-routes.test.ts`, `tests/integration/ai-adapter.test.ts` |
| Security & Abuse Controls | XSS, prompt injection, SSRF, payload cap, rate limiting, headers | `tests/unit/security.test.ts`, `tests/security/security-controls.test.ts` |
| Persistence & Formatting | Reliable localStorage recovery & streak calculation | `tests/unit/storage-utils.test.ts` |
| Full User Journey (Desktop & Mobile) | Landing → Onboarding → Dashboard → Assistant → Modules | `tests/e2e/breathewise.spec.ts` |
| WCAG 2.2 AA Accessibility | Zero axe-core violations across 11 routes + Tab/Escape navigation | `tests/accessibility/a11y.spec.ts` |
