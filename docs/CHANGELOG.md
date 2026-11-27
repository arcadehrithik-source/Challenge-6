# Changelog

## v1.0.0 — Challenge 6 Production Prototype
- **Core Platform**: Built 8-section landing page, 6-step Zod-validated onboarding wizard, and personalized dashboard with 8 specialized modules (`Air Quality`, `Daily Plan`, `Indoor Air`, `Smart Commute`, `Sustainability`, `Impact Tracker`, `Community`, `Settings`).
- **Intelligence Engines**: Implemented CPCB Indian NAQI sub-index computation, persona-driven deterministic recommendation engine, commute mode comparator, transparent CO2 impact baselines, and configurable OpenAI/Gemini + deterministic fallback assistant.
- **Hardening & Quality Optimization**:
  - Refactored `recommendation-engine.ts` and `OnboardingWizard.tsx` into modular helpers/steps.
  - Added bounded cache eviction (`MAX_CACHE_ENTRIES = 100`) and bounded local rate-limit buckets (`MAX_LOCAL_BUCKETS = 1000`).
  - Tightened production CSP (omitting `'unsafe-eval'`, adding `object-src 'none'`, COOP/CORP headers).
  - Resolved mobile dialog overflow/hit-testing and SSR hydration timing issues.
  - Added `@axe-core/playwright` WCAG 2.2 AA accessibility suite across all 11 routes, dedicated `tests/security/` suite, and GitHub Actions CI workflow.
