# Code Quality & Maintainability

## Standards & Tooling
- **TypeScript Strictness**: `tsconfig.json` enforces `"strict": true` and `"noUncheckedIndexedAccess": true`.
- **ESLint**: `eslint.config.mjs` runs `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`, React Compiler hooks validation, `@typescript-eslint/no-explicit-any: "error"`, and `@typescript-eslint/no-unused-vars: "error"`.
- **Prettier**: `.prettierrc` standardizes formatting across `src/` and `tests/`.

## Key Refactorings Implemented
1. **Modular Recommendation Engine (`src/lib/recommendation-engine.ts`)**: Decomposed the monolithic recommendation builder into focused domain helpers (`buildOutdoorRecommendations`, `buildHouseholdRecommendations`, `buildCommuteRecommendations`, `buildIndoorRecommendations`, `buildCookingAndSustainabilityRecommendations`) using a shared `RecommendationContext` interface.
2. **Modular Onboarding Steps (`src/components/onboarding/steps/OnboardingSteps.tsx`)**: Extracted the 6 onboarding steps (`StepLocation`, `StepHousehold`, `StepLifestyle`, `StepCommute`, `StepIndoor`, `StepPreferences`) from `OnboardingWizard.tsx` to keep components concise and single-purpose.
3. **Hydration-Safe State Initialization (`src/components/providers/BreatheWiseProvider.tsx`)**: Stabilized initial SSR snapshot timestamps and deferred `localStorage` hydration via `queueMicrotask`, eliminating React hydration mismatch errors (#418) and `react-hooks/set-state-in-effect` warnings.
4. **React Hook Form `useWatch` (`src/components/onboarding/OnboardingWizard.tsx`)**: Replaced `form.watch()` with `useWatch({ control: form.control })` for React Compiler compatibility and narrower re-renders.

## Verification Commands
```bash
npm run typecheck
npm run lint
npm run format:check
```
