# Security Policy — BreatheWise AI

## Prototype Scope & Authentication Notice

BreatheWise AI is a **single-user local-profile prototype** built for Challenge 6 (Urban Air Quality Assistant). It does **not** implement server-side user accounts, sessions, passwords, or multi-tenant authentication. All user preferences and checklist records are stored locally in the visitor's browser (`localStorage`).

## Implemented Security Controls

1. **Server-Side Secret Isolation (`src/lib/security/env.ts`)**: Optional `OPENAI_API_KEY`, `GEMINI_API_KEY`, and `UPSTASH_REDIS_REST_TOKEN` are read exclusively in server-side modules and validated with Zod. Zero secrets are exposed via `NEXT_PUBLIC_*`.
2. **Input & Output Schema Validation (`src/lib/schemas.ts`)**: All API requests (`/api/air-quality`, `/api/assistant`), external Open-Meteo payloads, and LLM structured JSON outputs are validated with strict Zod schemas.
3. **Prompt Injection & Payload Guards (`src/lib/security/sanitize.ts`)**:
   - Request bodies on `/api/assistant` are capped at 16 KB (`413 Payload Too Large`).
   - Control characters and HTML brackets are stripped; common prompt-injection phrases trigger the deterministic fallback engine safely.
   - Error messages redact accidental credential patterns before returning JSON.
4. **SSRF Allowlisting (`src/lib/security/env.ts`)**: Outbound server `fetch` calls are restricted via `isAllowedExternalUrl()` to `https:` endpoints on `air-quality-api.open-meteo.com`, `geocoding-api.open-meteo.com`, `api.openai.com`, `generativelanguage.googleapis.com`, and `*.upstash.io`.
5. **Rate Limiting (`src/lib/security/rate-limit.ts`)**: Supports Upstash Redis REST for distributed serverless deployments and provides a single-instance token-bucket fallback for local/prototype runs (explicitly documented as non-distributed).
6. **HTTP Security Headers (`next.config.ts`)**: Sets `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`, with `poweredByHeader: false`.
7. **No Unsafe Execution or HTML Injection**: Zero `eval()`, `new Function()`, `child_process`, or `dangerouslySetInnerHTML`.

## Reporting Vulnerabilities

Never commit real credentials or `.env.local` files. Report security issues to the repository maintainers before public disclosure.

