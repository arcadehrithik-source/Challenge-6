# Security Audit Report — BreatheWise AI

| Finding ID | Area | Severity | Risk | Remediation | Status | Verification |
|---|---|---|---|---|---|---|
| SEC-01 | Production CSP | Medium | `'unsafe-eval'` in `script-src` unnecessarily widens script execution surface in production | Restricted `'unsafe-eval'` to non-production dev mode in `next.config.ts`; added `object-src 'none'`, COOP, CORP | Fixed | `tests/security/security-controls.test.ts` + `next.config.ts` |
| SEC-02 | Memory Exhaustion (DoS) | Medium | Unbounded `snapshotCache` and `localBuckets` maps could grow under arbitrary city/IP floods | Added `MAX_CACHE_ENTRIES=100` eviction in `air-quality-service.ts` and `MAX_LOCAL_BUCKETS=1000` pruning in `rate-limit.ts` | Fixed | `tests/security/security-controls.test.ts` |
| SEC-03 | Third-Party Advisories | High / Critical | Initial dependencies (`next<=16.3`, `vitest<5`, `zod<4.6.6`) had known advisories | Upgraded to `next@16.4.6`, `vitest@5.1.2`, `zod@4.6.7` | Fixed | `npm audit --audit-level=high` → `0 vulnerabilities` |
| SEC-04 | Distributed Rate Limiting | Info / Operational | In-memory limiter is single-instance only without Redis | Implemented optional Upstash Redis REST adapter (`UPSTASH_REDIS_REST_URL`) and documented single-instance behavior | Documented | `src/lib/security/rate-limit.ts` |
