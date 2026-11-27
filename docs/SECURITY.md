# Security Architecture — BreatheWise AI

See also root [SECURITY.md](file:///c:/Users/Administrator/OneDrive/Desktop/Ch6/SECURITY.md) and [DATA_PRIVACY.md](file:///c:/Users/Administrator/OneDrive/Desktop/Ch6/security/DATA_PRIVACY.md).

## 1. Security Architecture & Protections
- **Boundary Validation (`src/lib/schemas.ts`)**: Strict Zod schemas validate `/api/air-quality` query parameters (`city` regex `^[a-zA-Z\s.,-]+$`, bounded coordinates), `/api/assistant` payloads (`question` 3–600 chars), Open-Meteo upstream JSON, and LLM structured responses.
- **Abuse & Resource Controls (`src/lib/security/rate-limit.ts`, `src/lib/security/sanitize.ts`)**:
  - `POST /api/assistant`: 16 KB payload limit (`413`), 12 req/60s rate limiter (`429`), bounded `MAX_LOCAL_BUCKETS=1000`, 10s upstream timeout.
  - `GET /api/air-quality`: 45 req/60s rate limiter (`429`), bounded `MAX_CACHE_ENTRIES=100`, 5–6.5s upstream timeouts.
- **Prompt Injection & XSS Defense (`src/lib/security/sanitize.ts`)**: `detectPromptInjection` intercepts instruction-override and secret-exfiltration patterns and routes safely to the deterministic engine; `sanitizePlainText` and `sanitizeResponseText` strip control characters and `<`/`>` brackets; zero `dangerouslySetInnerHTML`.
- **SSRF Protection (`src/lib/security/env.ts`)**: `isAllowedExternalUrl` enforces `https:` and an explicit hostname allowlist (`air-quality-api.open-meteo.com`, `geocoding-api.open-meteo.com`, `api.openai.com`, `generativelanguage.googleapis.com`, `*.upstash.io`).
- **HTTP Security Headers (`next.config.ts`)**: Production CSP (`default-src 'self'`, `script-src 'self' 'unsafe-inline'`, `object-src 'none'`, `frame-ancestors 'none'`), HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, and `Permissions-Policy`.

## 2. Authentication & Authorization Scope
BreatheWise AI is a **single-user local-profile prototype** with no user accounts, passwords, cookies, or multi-tenant server database. All profile state resides solely in browser `localStorage`.

## 3. Secrets & Dependency Security
- Optional keys (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`) are read exclusively server-side and redacted in `safeErrorMessage`.
- `npm audit --audit-level=high` (verified across 567 packages): **0 vulnerabilities**.
