# Contributing Guidelines

1. Keep TypeScript `strict: true` and `noUncheckedIndexedAccess: true` error-free.
2. Follow single-responsibility separation: pure domain math belongs in `src/lib/`, API guards in `src/lib/security/`, and UI in `src/components/`.
3. Preserve non-color-only AQI indicators (`AqiBadge` must always pair icon + category text).
4. Add unit/integration/accessibility tests for new domain logic or routes before submitting.
5. Run all local gates before opening a PR:
   ```bash
   npm run lint && npm run format:check && npm run typecheck && npm run test:coverage && npm run audit && npm run build
   ```
   *(In Windows PowerShell, chain with `; if ($LASTEXITCODE -eq 0) { ... }`.)*
