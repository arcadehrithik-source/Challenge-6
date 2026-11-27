# Performance & Efficiency Strategy — BreatheWise AI

See also root [PERFORMANCE.md](file:///c:/Users/Administrator/OneDrive/Desktop/Ch6/PERFORMANCE.md).

## Key Engineering Decisions
1. **Dynamic Code Splitting (`next/dynamic`)**: `HourlyAqiChart` (Recharts) is dynamically imported with `{ ssr: false }` and a pulse skeleton placeholder so dashboard shells paint before chart SVG bundles load.
2. **Bounded Server Cache & Request Deduplication (`src/lib/air-quality-service.ts`)**:
   - 10-minute TTL cache (`CACHE_TTL_MS = 600_000`) capped at `MAX_CACHE_ENTRIES = 100`.
   - Concurrent in-flight fetches for the same city/coordinates share one Promise via `inFlightRequests`.
   - HTTP `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` on `/api/air-quality`.
3. **Bounded Upstream Timeouts**: Open-Meteo geocoding (`5.0s`), Open-Meteo air quality (`6.5s`), Upstash Redis (`2.5s`), and OpenAI/Gemini (`10s`) all enforce `AbortSignal.timeout`.
4. **Minimal Client Bundle & Memoization**: Uses `useMemo` for recommendation, exposure, daily slot, and checklist derivations in `BreatheWiseProvider.tsx` without external state-management overhead; `useWatch` in onboarding prevents whole-form over-rendering.
