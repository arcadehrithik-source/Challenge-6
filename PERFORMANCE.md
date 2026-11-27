# Performance & Efficiency Notes — BreatheWise AI

## Implemented Optimizations

1. **Dynamic Loading of Heavy Charting Modules**:
   - `HourlyAqiChart` (Recharts) is loaded via `next/dynamic(..., { ssr: false })` with a lightweight skeleton fallback so initial dashboard shell paint is not blocked by chart SVG bundles.
2. **Server-Side Caching & Request Deduplication (`src/lib/air-quality-service.ts`)**:
   - Air quality responses are cached in-memory by normalized city/coordinates for 10 minutes (`CACHE_TTL_MS = 600_000`) plus `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.
   - Concurrent requests for the same city share a single `inFlightRequests` Promise to prevent duplicate upstream calls to Open-Meteo.
3. **Request Timeouts**:
   - Upstream Open-Meteo requests enforce `AbortSignal.timeout(5000–6500)` and LLM requests enforce `AbortSignal.timeout(10_000)` so hung external services never stall the UI.
4. **Minimal Dependency Footprint**:
   - No global state manager (Redux/Zustand) or heavy UI framework bloat—uses React Context + `useMemo` + localStorage persistence.
5. **Reduced Motion Compliance**:
   - `<MotionConfig reducedMotion="user">` wraps the application so Framer Motion animations automatically respect OS-level reduced-motion preferences.

