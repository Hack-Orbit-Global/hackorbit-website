# 22 — Frontend Architecture (HTML / CSS / Vanilla JavaScript)

## Goal
Reproduce the approved Stitch design faithfully, with reusable components, without a frontend framework — while keeping Lighthouse Performance/SEO at 100 by shipping real HTML rather than JS-rendered structure wherever possible.

## Core Approach: Build-Time Assembly, Not Runtime Injection
Shared elements (nav, footer, `<head>` meta/schema blocks) are **not** injected at runtime via `fetch()` + `innerHTML` (this causes flash-of-missing-content, layout shift, and a slower/blank first paint — bad for Performance and CLS). Instead, a small Node.js build script assembles final static HTML files from partials at build time, so every shipped `.html` file already contains the full nav/footer/meta — genuinely static output, zero framework runtime.

```
frontend/
  partials/
    head.html          (shared <head> boilerplate: fonts, base meta, structured data shell)
    nav.html
    footer.html
  pages-src/            (page-specific content + per-page <head> overrides)
    index.html
    about.html
    projects.html
    contribute.html
    contact.html
    join.html
  build.js               (Node script: assembles pages-src/* + partials/* → dist HTML)
```
`build.js` is a plain Node script (string templating with simple `{{include:partial-name}}` markers, or a minimal templating helper — no build framework required) run as the Vercel Build Command. Output goes to the deployed static root.

## Dynamic Pages (Profile, Verify)
These are **not** pre-built at deploy time (content changes per member/certificate and must stay current). They are rendered per-request by a Vercel Serverless Function that:
1. Fetches data from Apps Script
2. Fills the same shared nav/footer/head partials + a page-specific HTML template (same partial files as the build script uses, imported by the function) into a complete HTML string
3. Returns it with `Content-Type: text/html` and appropriate cache headers (short TTL, since certificate revocation must propagate promptly)

This keeps profile/verify pages visually and structurally identical to the static pages (same shared partials) while remaining live/accurate — genuine SSR without adopting a framework.

## Reusable Components Without React
"Components" are implemented as one of two things, chosen per case:
1. **HTML partial + CSS class** — for anything that doesn't need client-side behaviour (cards, badges, buttons, status indicators). Defined once in `partials/` or as documented markup patterns in `22a-component-library.html` (a living style-guide page), copy-used across pages/templates.
2. **A small JS render function** — for anything created dynamically from data at runtime (e.g. a contribution-list item rendered from a JSON API response on the profile page). Example pattern:
```js
// js/components.js
export function renderContributionItem(c) {
  return `<li class="contribution-item">
    <span class="contribution-type">${escapeHtml(c.type)}</span>
    <a href="${escapeHtml(c.reference_url)}">${escapeHtml(c.repo)}</a>
    <time datetime="${c.occurred_at}">${formatDate(c.occurred_at)}</time>
  </li>`;
}
```
All dynamic string-building goes through an `escapeHtml()` helper to prevent injection (Best Practices/security requirement). Web Components (`customElements.define`) are used only if a component needs genuine encapsulated behaviour reused across many pages with internal state (e.g. a `<certificate-lookup-form>`); most of the site does not need this and plain functions are simpler and lighter.

## File/Module Structure
```
frontend/
  index.html, about.html, projects.html, contribute.html, contact.html, join.html   (built output)
  profile/                     (served via serverless function, not static — see above)
  verify.html                  (static shell; result rendered by JS from /api/certificates/verify, OR
                                 served via serverless function for indexable verify-result URLs — see 04 & 15)
  settings.html                (authenticated, client-rendered after session check)
  css/
    variables.css              (design tokens from 17-DESIGN-SYSTEM.md as CSS custom properties)
    reset.css
    global.css                 (typography, layout primitives)
    components.css              (buttons, cards, badges, status indicators, forms)
    animations.css              (CSS-only transitions/animations, respects prefers-reduced-motion)
    responsive.css              (breakpoint overrides; or co-located via CSS nesting/media queries per file)
  js/
    main.js                     (per-page bootstrap: mobile nav toggle, shared init)
    components.js               (render-function library, see above)
    navigation.js                (mobile drawer open/close, focus management)
    api.js                       (thin fetch wrapper for /api/* calls, error handling)
    auth.js                      (join-flow stepper state, session check)
    profile.js                   (settings form submit, client-side profile edit)
    certificates.js              (verify form submit + result rendering, if client-rendered path is used)
  assets/
    images/, icons/, logo/       (optimised, correctly sized, modern formats — see 23-PERFORMANCE-SPECIFICATION.md)
  partials/                      (build-time includes, see above)
  build.js
```
Full folder structure (including backend/API) is defined in 25-PROJECT-FOLDER-STRUCTURE.md.

## CSS Architecture
- CSS custom properties (`:root { --color-primary: ...; }`) hold every design token from 17-DESIGN-SYSTEM.md — single source of truth, no duplicated hex values across files.
- Modular files loaded in a fixed order (`reset` → `variables` → `global` → `components` → `animations` → `responsive`), concatenated/minified at build time into a single `styles.css` per deploy to minimise render-blocking requests (one CSS file, not six).
- No CSS framework (no Bootstrap/Tailwind runtime) — hand-written, matching the design system exactly, keeping payload minimal.

## JavaScript Architecture
- ES modules (`<script type="module">`), loaded with `defer`, split per page so a static marketing page loads zero unnecessary JS (e.g. `about.html` loads only `main.js` for nav toggle; `settings.html` loads `main.js` + `profile.js`).
- No bundler is required for a project this size — native ES modules over HTTP/2 from Vercel's edge are fast enough; if module count grows large enough to matter, a minimal esbuild pass can be added later purely as a build-time minifier/concatenator without changing the source architecture.
- No client-side routing/SPA behaviour — every page is a real navigation to a real HTML file/route, which is both simpler and better for SEO/Performance than a client-routed single-page app.

## State Management
There is no global client-side app state to manage (no SPA). Each page's JS is scoped to that page's needs; the only cross-page "state" is the session, which lives server-side in the httpOnly cookie and is checked per-page via `/api/auth/session` where needed (e.g. settings.html, join.html).

## Consistency With the Stitch Design
Every component in `components.css`/`components.js` should be checked against the approved Stitch screens for that component (button styles, card shadows/radii, spacing, colour usage) before being considered done — the design is the acceptance criterion, not a re-interpretation of 17-DESIGN-SYSTEM.md's token list alone.
