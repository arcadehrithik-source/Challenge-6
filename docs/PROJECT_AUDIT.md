# Project Audit — BreatheWise AI

## 1. Audited Stack & Architecture
- **Framework**: Next.js `16.4.6` (App Router, Turbopack), React `19.1.0`, TypeScript `5.8.3` (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Styling & UI**: Tailwind CSS v4, Radix UI primitives (`dialog`, `progress`, `label`, `slot`), Lucide icons, Framer Motion (`MotionConfig reducedMotion="user"`), Recharts.
- **Validation & Forms**: Zod `4.x`, React Hook Form `7.56.4`, `@hookform/resolvers`.
- **Quality & Testing**: ESLint 9 (`eslint-config-next/core-web-vitals` + `typescript`), Prettier, Vitest `5.1.2` (`@vitest/coverage-v8`), Playwright `1.52.0`, `@axe-core/playwright` `4.14.1`.

## 2. Weaknesses Identified & Remediated During Audit
| Area | Finding | Remediation Implemented |
|---|---|---|
| Code Quality | `recommendation-engine.ts` (~30 KB) and `OnboardingWizard.tsx` (~27 KB) held large monolithic functions/JSX blocks | Decomposed `recommendation-engine.ts` into 5 domain builders (`buildOutdoorRecommendations`, etc.) and extracted `OnboardingSteps.tsx` |
| SSR Hydration | Initial `BreatheWiseProvider` state computed `new Date()` differently between SSR and browser mount (React #418) | Added deterministic `referenceTimeIso` for initial SSR state + `queueMicrotask` hydration |
| Security (CSP & DoS) | Production CSP included `'unsafe-eval'`; local cache and rate-limit maps were unbounded | Removed `'unsafe-eval'` in `NODE_ENV=production`, added `object-src 'none'`, COOP/CORP headers, `MAX_CACHE_ENTRIES=100`, `MAX_LOCAL_BUCKETS=1000` |
| Dependencies | Initial `npm audit` flagged advisories in `next<=16.3`, `vitest<5`, `zod<4.6.6` | Upgraded to `next@16.4.6`, `vitest@5.1.2`, `zod@4.6.7` (`npm audit` now reports `0` vulnerabilities) |
| Accessibility | `CardTitle` defaulted to `<h3>` directly under `<h1>`; AI response headings used `<h4>`; mobile dialog could overflow `393px` width | Changed `CardTitle` default to `<h2>`, AI headings to `<h3>`, constrained mobile dialog width (`max-w-[calc(100vw-1.5rem)]`) and added `Escape` + `aria-describedby` |
| Testing & CI | No `tests/security/`, `tests/accessibility/`, or CI workflow existed | Added dedicated `tests/security/`, `tests/accessibility/a11y.spec.ts` (`axe-core`), `storage-utils.test.ts`, `ai-adapter.test.ts`, and `.github/workflows/ci.yml` |

## 3. Remaining Prototype Limitations
- Local-first `localStorage` persistence only (no server-side authentication or multi-device account sync).
- Open-Meteo grid estimates (~11–40 km) rather than street-level CPCB monitoring hardware.
- In-memory rate-limit fallback resets per process unless `UPSTASH_REDIS_REST_URL` is configured.
