# 24 — Accessibility Specification

## Target
Lighthouse Accessibility: **100**, and substantive conformance with **WCAG 2.1 AA** (a perfect automated score is necessary but not sufficient — manual keyboard/screen-reader checks are part of Milestone testing per 20-IMPLEMENTATION-PLAN.md).

## Semantic HTML5
- Use real elements for real purposes: `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>` (project/profile cards where appropriate), `<button>` for actions, `<a>` for navigation — never a `<div>` with a click handler standing in for either.
- One `<h1>` per page; heading levels never skip (no `<h2>` straight to `<h4>`); the heading outline should mirror the page's actual content hierarchy, matching 16-FRONTEND-SITEMAP.md's page structure.
- Landmarks (`<nav aria-label="Primary">`, `<nav aria-label="Breadcrumb">` where more than one nav exists) so screen-reader users can jump between regions.

## Keyboard Navigation
- Every interactive element (nav links, buttons, form fields, the mobile nav toggle, the certificate verify form, the join-flow stepper controls) is reachable and operable via `Tab`/`Shift+Tab`/`Enter`/`Space` with no keyboard traps.
- Logical tab order following visual/DOM order (no `tabindex` values above 0).
- The mobile nav drawer, when opened, moves focus into it and returns focus to the toggle button on close; `Escape` closes it.

## Visible Focus States
- A clear, high-contrast focus outline (part of 17-DESIGN-SYSTEM.md's component tokens) on every focusable element — never removed with `outline: none` without an equally visible replacement.
- Focus states are especially verified on the primary/secondary button variants and on form inputs against both light backgrounds and the accent-coloured surfaces.

## Forms
- Every input has a real, associated `<label>` (via `for`/`id`, not just placeholder text).
- Required fields are marked both visually and with `aria-required`/`required`.
- Error messages are programmatically associated with their field via `aria-describedby`, announced to screen readers (e.g. via an `aria-live="polite"` region for the certificate-verify "not found" result and form validation summaries), and worded in plain language (not just a red border).

## ARIA Usage
- ARIA is used only where semantic HTML can't express the state on its own: `aria-expanded` on the mobile nav toggle, `aria-current="page"` on the active nav link, `aria-live` regions for dynamically-injected results (verify result, contribution list updates). No redundant ARIA roles on elements that already have implicit correct roles (e.g. no `role="button"` on an actual `<button>`).

## Colour Contrast
- All text/background combinations from 17-DESIGN-SYSTEM.md's colour tokens are checked against WCAG AA thresholds (4.5:1 for normal text, 3:1 for large text/UI components) before implementation — this includes white text on the primary blue button, the accent-red/green status text, and secondary/muted text colour on the off-white background. Any token combination that fails is adjusted (typically darkening the accent for text use, keeping the lighter tone for backgrounds/fills only).

## Reduced Motion
- All CSS animations/transitions (23-PERFORMANCE-SPECIFICATION.md) are wrapped so that `@media (prefers-reduced-motion: reduce)` disables or substantially shortens them — no essential information is conveyed by motion alone.

## Screen-Reader-Friendly Structure
- Meaningful `alt` text on informative images (logo, badge icons describe what they represent, e.g. `alt="Open Source Contributor badge"`); purely decorative images use `alt=""` so they're skipped.
- Status indicators (Valid/Revoked/Pending on certificates) convey meaning through text and icon, not colour alone (colour-blind-safe).
- Tables (if used for any data display) use proper `<th>`/`scope` markup.

## Accessible Mobile Navigation
- The hamburger toggle is a real `<button>` with an accessible name (e.g. `aria-label="Open menu"` / `"Close menu"` toggled with state) and `aria-expanded` reflecting open/closed state, per Keyboard Navigation above.

## Testing
- Automated: Lighthouse + axe-core run against every page template as part of the workflow described in 20-IMPLEMENTATION-PLAN.md.
- Manual spot checks: full keyboard-only pass and at least one screen-reader pass (e.g. VoiceOver/NVDA) on the join flow, profile page, and certificate verification page specifically, since these are the most interaction-heavy templates.
