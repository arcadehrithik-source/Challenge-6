# Local Development Guide

## Prerequisites
- Node.js `>= 20` (verified on `v22.20.0`)
- npm `>= 10` (verified on `10.9.3`)

## Setup & Commands
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Quality & Verification Commands
- `npm run lint` — ESLint (`eslint-config-next/core-web-vitals`, `typescript`, React Compiler rules)
- `npm run format:check` — Prettier formatting validation
- `npm run typecheck` — `tsc --noEmit` strict check
- `npm run test` / `npm run test:coverage` — Vitest unit, integration, and security suites
- `npm run build` — Production Next.js Turbopack build
- `npm run test:e2e` — Playwright desktop & mobile user journey tests (requires build or running server)
- `npm run test:a11y` — `@axe-core/playwright` WCAG 2.2 AA scan across 11 routes + keyboard checks
- `npm run audit` — `npm audit --audit-level=high`
