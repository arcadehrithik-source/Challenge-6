# STRIDE Threat Model — BreatheWise AI

## System Overview & Assets
- **Assets**: Optional server LLM API keys (`OPENAI_API_KEY`, `GEMINI_API_KEY`), upstream API quota, application availability, and response integrity (no synthetic/altered AQI measurements).
- **Trust Boundaries**: (1) Untrusted Browser / Public HTTP → Next.js API Routes; (2) Next.js Server → Open-Meteo / Optional LLM Providers.

## STRIDE Threat Analysis

| Category | Scenario | Mitigation | Residual Risk |
|---|---|---|---|
| **Spoofing** | Client spoofs `x-forwarded-for` header to bypass IP rate limiting | Distributed deployments use Upstash Redis; single-instance fallback limits casual bursts | Proxy trust depends on deployment platform overwriting `x-forwarded-for` |
| **Tampering** | Malicious JSON / XSS / prompt injection in `/api/assistant` or `/api/air-quality` | Zod strict schemas, `detectPromptInjection`, `sanitizePlainText`, strict CSP, zero `dangerouslySetInnerHTML` | Novel LLM jailbreaks mitigated by zero tool execution & output Zod validation |
| **Repudiation** | Misattribution of simulated vs live AQI readings | `dataMode` (`live` vs `demo`), `observationType`, timestamp, and explicit Demo Mode banner | None |
| **Information Disclosure** | Leakage of `OPENAI_API_KEY` / `GEMINI_API_KEY` or stack traces in API errors | Server-only `env.ts`, `safeErrorMessage` redaction, `poweredByHeader: false` | Low |
| **Denial of Service** | Oversized POST payloads, hung upstream fetches, or cache/bucket memory floods | 16 KB body limit (`413`), 5–10s `AbortSignal.timeout`, bounded cache (`100`) & rate-limit map (`1000`) | Large-scale DDoS requires edge WAF/CDN |
| **Elevation of Privilege** | SSRF via manipulated upstream URLs | `isAllowedExternalUrl` restricts outbound `fetch` to `https:` allowlisted hostnames | Low |
