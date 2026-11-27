# Accessibility Audit Report — BreatheWise AI

## Audit Tooling & Scope
- **Automated Scanner**: `@axe-core/playwright` `4.14.1` configured with tags `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']` across all **11** application routes (`tests/accessibility/a11y.spec.ts`).
- **Keyboard & Component Checks**: Automated `Tab` skip-link focus test, `Escape` dialog dismissal test, React Testing Library `aria-checked` component tests (`tests/unit/components.test.tsx`), and Pixel 5 (`393x851`) mobile viewport E2E verification.

## Issues Identified & Fixed During Audit
1. **Heading Order Skips (`h1` → `h3`)**: Updated `CardTitle` default to `<h2>` (`as?: "h2" | "h3" | "h4"`) and AI assistant sub-headings to `<h3>`.
2. **Onboarding Landmarks & Error Association**: Added `<header>`, `<main>`, `<nav aria-label="Onboarding steps">` with `aria-current="step"`, and `aria-describedby` linking inputs to error alerts.
3. **Mobile Dialog Width Overflow & Tap Target**: Fixed `DialogContent` on `393px` viewports (`max-w-[calc(100vw-1.5rem)]`) and sized interactive controls cleanly (`>= 28px–36px`).
4. **Mobile Navigation Drawer Focus Management**: Added `role="dialog" aria-modal="true"` and focus move/restore refs (`closeDrawerButtonRef` / `menuButtonRef`) plus `aria-controls` on the alerts popover in `DashboardShell.tsx`.
5. **Chart Data Table Alternatives**: Added collapsible semantic HTML `<table>` summaries beneath both `HourlyAqiChart.tsx` and `ImpactTrackerModule.tsx` bar charts, plus `aria-pressed` on weekly/monthly toggles.

## Observed Validation Results (`npm run test:a11y`)
- **12 / 12 tests passed** (`0` axe-core violations across all 11 routes + Tab/Escape keyboard test).

## Remaining Limitations
- Live screen-reader audio output (NVDA/VoiceOver) was not manually recorded in this headless environment; semantic markup, live regions (`aria-live="polite"`), accessible tables, and `axe-core` rules serve as the verified baseline.
