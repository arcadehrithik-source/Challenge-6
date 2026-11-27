# Accessibility Audit Report — BreatheWise AI

## Audit Tooling & Scope
- **Automated Scanner**: `@axe-core/playwright` `4.14.1` configured with tags `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']` across all **11** application routes (`tests/accessibility/a11y.spec.ts`).
- **Keyboard & Mobile Checks**: Automated `Tab` skip-link focus test, `Escape` dialog dismissal test, and Pixel 5 (`393x851`) mobile viewport end-to-end journey.

## Issues Identified & Fixed During Audit
1. **Heading Order Skips (`h1` → `h3`)**: `CardTitle` previously rendered `<h3>` on dashboard cards directly beneath `<h1>`. Updated `CardTitle` default to `<h2>` (`as?: "h2" | "h3" | "h4"`) and updated assistant sub-headings to `<h3>`.
2. **Onboarding Landmarks & Error Association**: Added `<header>`, `<main>`, `<nav aria-label="Onboarding steps">` with `aria-current="step"`, and `aria-describedby` linking inputs to error alerts.
3. **Mobile Dialog Width Overflow & Tap Target**: Fixed `DialogContent` on `393px` viewports where grid/flex children could push the Close button off the right edge (`right: 445px`) and bumped Close button to `h-9` (`36px`) and quick-question pills to `min-h-[28px]`.

## Observed Validation Results (`npm run test:a11y`)
- **12 / 12 tests passed** (`0` axe-core violations across `/`, `/onboarding`, `/dashboard`, `/dashboard/air-quality`, `/dashboard/plan`, `/dashboard/indoor-air`, `/dashboard/commute`, `/dashboard/sustainability`, `/dashboard/impact`, `/dashboard/community`, `/dashboard/settings`, plus Tab/Escape keyboard test).

## Remaining Limitations
- Screen-reader audio output (NVDA/VoiceOver) was not manually recorded in this headless environment; semantic markup, live regions (`aria-live="polite"`), and `axe-core` rules serve as the verified baseline.
