# Architecture Decision Records (ADRs)

## ADR-001: Indian NAQI (CPCB) Breakpoint Scale
- **Decision**: Compute AQI using Indian CPCB breakpoints (`Good`, `Satisfactory`, `Moderate`, `Poor`, `Very Poor`, `Severe`) across PM2.5, PM10, NO2, and O3.
- **Rationale**: Target urban personas and winter smog scenarios center on Indian cities (Kolkata, Delhi, Mumbai, Bengaluru, Asansol), where CPCB NAQI categories align with local advisories.

## ADR-002: Deterministic Engine + Optional LLM Adapter
- **Decision**: Pair a rule-based deterministic recommendation and response engine with an optional server-side OpenAI/Gemini adapter.
- **Rationale**: Guarantees 100% functional reliability without paid API keys, prevents hallucinated AQI numbers, and provides an automatic safe fallback when external providers fail or prompt injection is detected.

## ADR-003: Local-First Profile Without Unnecessary Authentication
- **Decision**: Persist household preferences in browser `localStorage` rather than adding mock/fragile auth or collecting personal identity.
- **Rationale**: Minimizes PII exposure, eliminates password/session attack surfaces for a single-user prototype, and is openly documented in `SECURITY.md`.

## ADR-004: Bounded In-Memory Caching + Upstash Rate-Limit Adapter
- **Decision**: Cap server cache at 100 entries (10-minute TTL) and local rate-limit buckets at 1,000 keys, with Upstash Redis REST support for distributed production deployments.
- **Rationale**: Protects single-instance deployments against memory exhaustion while supporting horizontally scaled serverless hosts cleanly.
