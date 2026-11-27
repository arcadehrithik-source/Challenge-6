# Accessibility Architecture — BreatheWise AI (WCAG 2.2 AA)

## Core Practices Implemented
1. **Non-Color-Only Status Indicators (SC 1.4.1)**: `AqiBadge` pairs background/border contrast with an explicit severity icon (`CheckCircle2`, `Info`, `AlertTriangle`, `ShieldAlert`, `AlertOctagon`), category text (`Good` through `Severe`), and numeric range.
2. **Semantic Landmarks & Heading Hierarchy (SC 1.3.1, 2.4.1)**:
   - `<header>`, `<nav aria-label=...>`, `<main id="dashboard-main">`, `<aside>`, and `<footer>` landmarks across Landing, Onboarding, and Dashboard routes.
   - Skip-to-main-content link in `DashboardShell.tsx` verified via `Tab` focus test.
   - Heading levels flow `<h1>` → `<h2>` (`CardTitle` default) → `<h3>` (`RecommendationCard` & assistant sections) without skipped levels.
3. **Keyboard & Dialog Focus Management (SC 2.1.1, 2.4.7, 2.4.11)**:
   - Global `*:focus-visible` `2px` emerald outline in `src/app/globals.css`.
   - Radix `Dialog` handles focus trapping and `Escape` dismissal; `DashboardShell` handles `Escape` to close mobile navigation drawers and alert popovers.
4. **Target Size & Mobile Layout (SC 2.5.8)**:
   - Interactive controls meet or exceed `24x24` CSS px (`Button` sm `32px`, default `40px`, dialog Close `36px`, assistant quick-prompt chips `min-h-[28px]`).
5. **Accessible Charts, Forms & Reduced Motion (SC 1.1.1, 3.3.1, 2.3.3)**:
   - `HourlyAqiChart` provides `role="img"` summary labels plus a 3-column textual data breakdown (peak window, cleanest window, data classification).
   - Form validation errors render with `role="alert"`, `aria-invalid`, and `aria-describedby`.
   - `<MotionConfig reducedMotion="user">` wraps the entire application.
