# Known Limitations

1. **Grid-Assimilated Air Quality Data**: Open-Meteo provides atmospheric model / assimilated concentration grids rather than hyperlocal street-corner reference stations. Instantaneous hourly PM2.5/PM10 values are mapped to CPCB breakpoints as an operational proxy rather than a 24-hour gravimetric filter average.
2. **Prototype Local-First Persistence**: Household preferences, checklist state, and streaks are stored in browser `localStorage` with no server-side user accounts, cross-device sync, or multi-user authentication.
3. **Single-Instance Rate-Limit Fallback**: Without `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, rate limiting falls back to a per-process in-memory token bucket (`single-instance-memory`), which is not shared across horizontal serverless replicas.
4. **Illustrative Impact & Exposure Models**: CO2 avoidance and commute exposure tiers rely on transparent urban emission/ventilation baseline factors—not personal dosimeters or audited carbon credits.
5. **Non-Medical Scope**: Guidance is educational only and never constitutes clinical diagnosis or medical advice.
