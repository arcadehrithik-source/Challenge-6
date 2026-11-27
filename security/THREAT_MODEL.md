# Threat Model — BreatheWise AI

## Architecture Trust Boundaries

1. **Browser Client (`localStorage` + React UI)** → Untrusted network boundary → **Next.js API Routes (`/api/air-quality`, `/api/assistant`)**.
2. **Next.js Server** → External HTTPS boundary → **Open-Meteo APIs** and **Optional LLM Provider (OpenAI / Gemini)**.

## Threats & Mitigations

| Threat | Vector | Mitigation | Residual Risk |
|---|---|---|---|
| API abuse / cost exhaustion | Flooding `/api/assistant` | `checkRateLimit` (12 req/min per IP) + 16 KB payload limit + 10s upstream timeout | Local in-memory fallback resets per instance unless `UPSTASH_REDIS_REST_URL` is configured |
| Prompt injection | Malicious text attempting to extract secrets or override safety rules | `detectPromptInjection` forces deterministic fallback; strict system prompt; Zod JSON output validation | Novel phrasing may reach LLM if configured, mitigated by zero tool access & output schema |
| Server-Side Request Forgery (SSRF) | Crafted env URLs or query parameters | `isAllowedExternalUrl` enforces HTTPS + strict hostname allowlist; `city` regex restricts special characters | Low |
| Cross-Site Scripting (XSS) | Malicious strings in city/locality or AI responses | React auto-escaping, `<`/`>` stripped by `sanitizePlainText`, strict CSP in `next.config.ts`, no `dangerouslySetInnerHTML` | Low |
| Secret leakage | Accidental logging or client bundle exposure | Secrets read only in server files (`src/lib/security/env.ts`); `safeErrorMessage` redacts key patterns | Low |
| Unauthenticated access to private data | Multi-user account takeover | Not applicable — no server user database exists; preferences remain strictly in client `localStorage` | Shared physical device users can view browser `localStorage` unless cleared in Settings |

