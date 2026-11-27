# Performance Audit & Observed Build Metrics

## Observed Next.js Production Build (`npm run build` — Next.js 16.4.6 Turbopack)
- **Compilation**: `10.2s` compile + `11.6s` TypeScript validation + `1.8s` static prerendering across 16 routes.
- **Route Architecture**:
  - Static prerendered (`○`): `/`, `/onboarding`, `/dashboard`, `/dashboard/air-quality`, `/dashboard/community`, `/dashboard/commute`, `/dashboard/impact`, `/dashboard/indoor-air`, `/dashboard/plan`, `/dashboard/settings`, `/dashboard/sustainability`.
  - Dynamic server routes (`ƒ`): `/api/air-quality`, `/api/assistant`, `/api/health`.

## Optimizations Implemented During Audit
1. **Bounded In-Memory Caches**: Added `MAX_CACHE_ENTRIES = 100` eviction in `src/lib/air-quality-service.ts` and `MAX_LOCAL_BUCKETS = 1000` expiry pruning in `src/lib/security/rate-limit.ts` to keep server memory constant under sustained traffic.
2. **Cache Hit Verification**: `tests/integration/air-quality-service.test.ts` asserts that consecutive `getAirQualitySnapshot({ city: "Kolkata" })` calls invoke upstream `fetch` only `1` time.
3. **React Compiler-Friendly Hooks**: Replaced `form.watch()` with `useWatch` in `OnboardingWizard.tsx` and eliminated synchronous `setState` inside `useEffect` in `BreatheWiseProvider.tsx`.

## Remaining Limitations
- Core Web Vitals (LCP/INP/CLS) under throttled 3G networks were not measured with a live Lighthouse CLI trace in this workspace; build prerendering, dynamic chart splitting, and cache hit behavior are verified.
