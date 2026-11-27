# Code Quality & Maintainability

## Standards & Tooling
- **TypeScript Strictness**: `tsconfig.json` enforces `"strict": true` and `"noUncheckedIndexedAccess": true` with zero `as` type casts and zero `!` non-null assertions across `src/`.
- **ESLint & Formatting**: `eslint.config.mjs` enforces `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`, React Compiler rules, `@typescript-eslint/no-explicit-any: "error"`, and `@typescript-eslint/no-unused-vars: "error"`, alongside Prettier (`npm run format:check`).

## Key Architectural Refactorings
1. **Zod Schema-Validated Storage (`src/lib/storage.ts`)**: Replaced ad-hoc JSON casts and repeated `try/catch` blocks with shared `readStorageRaw`/`writeStorageRaw` helpers and Zod schemas (`checklistMapSchema`, `streakRecordSchema`).
2. **Centralized AQI Constants & Modular Domain Rules (`src/lib/aqi.ts`, `src/lib/recommendation-engine.ts`, `src/lib/recommendations/builders.ts`)**: Shared `AQI_THRESHOLDS` constants across rule evaluators and decomposed outdoor, household, commute, indoor, and cooking/sustainability builders.
3. **Decomposed Air Quality & AI Services (`src/lib/air-quality-service.ts`, `src/lib/ai-assistant.ts`)**: Extracted timeline mapping, live fetch, cache eviction, and lookup-table topic matching into cohesive single-purpose helpers with runtime envelope schemas.
4. **Component Modularity & Hooks (`src/components/`)**:
   - Extracted `useToastQueue` (`crypto.randomUUID()` IDs + timer cleanup) from `BreatheWiseProvider.tsx` and unified `impact` derivation in context.
   - Split presentational sections out of `DashboardOverview.tsx` (`OverviewCards.tsx`), `LandingPage.tsx` (`LandingSections.tsx`), `BreatheWiseAssistantDialog.tsx` (`AssistantResponseView.tsx`), and `OnboardingWizard.tsx` (`onboarding-config.ts`, `steps/OnboardingSteps.tsx`).

## Verification Commands
```bash
npm run typecheck
npm run lint
npm run format:check
```
