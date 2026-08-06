# 23 — Performance Specification

## Target
Lighthouse/PageSpeed Insights: **Performance 100**, treated as a build requirement, not a post-launch optimisation pass.

## JavaScript Budget
- No frontend framework runtime (see 04, 22) — this alone removes the single biggest common cause of poor mobile Performance scores.
- No unnecessary third-party scripts (no analytics/chat-widget scripts unless explicitly required later, and if added, loaded `async`/`defer` and deferred behind user interaction where possible).
- Per-page JS kept minimal and split by actual need (per 22-FRONTEND-ARCHITECTURE.md's module structure) — a static page like `about.html` should ship only the tiny nav-toggle script, not the whole site's JS.
- All `<script>` tags use `defer` (or `type="module"`, deferred by default) so JS never blocks parsing/rendering.

## CSS Delivery
- A single concatenated, minified `styles.css` per deploy (build-time step, see 22) to avoid multiple render-blocking requests.
- Critical above-the-fold CSS should be kept small enough that the single stylesheet itself isn't a bottleneck; if hero sections need it, inline a small critical-CSS snippet in `<head>` and defer the rest — only if measurement shows it's needed, not by default complexity.
- No unused CSS shipped: components.css should only contain classes actually used in the design system/Stitch design, checked periodically.

## Images
- Correct, explicit `width`/`height` (or `aspect-ratio`) attributes on every `<img>` to prevent layout shift (CLS).
- Modern formats: serve WebP/AVIF with a `<picture>`/fallback where broad compatibility matters (e.g. the logo), generated at build/asset-prep time — not on-the-fly.
- Responsive images via `srcset`/`sizes` so mobile doesn't download desktop-resolution assets.
- `loading="lazy"` on all non-critical/below-the-fold images (project cards, badge icons further down profile pages); the hero/logo image (likely LCP element) is **not** lazy-loaded and is preloaded if it's the LCP candidate (`<link rel="preload" as="image">`).
- Icons: prefer inline SVG (no extra request, tiny, styleable via CSS) over icon fonts or many small image requests.

## Fonts
- Self-hosted (not a render-blocking third-party font request chain) where licensing allows, or loaded via `<link rel="preconnect">` to the font host plus `font-display: swap` to avoid invisible-text flashes.
- Preload only the specific font file(s) actually used above the fold (e.g. the heading serif's regular/bold weights) — not the entire family/weight range.
- Limit total font weights/styles shipped to what the design system (17-DESIGN-SYSTEM.md) actually specifies (heading serif + body sans, a small number of weights each).

## Resource Hints
- `<link rel="preload">` only for genuinely critical resources (LCP image, primary font file) — over-preloading competes for bandwidth and can hurt LCP.
- `<link rel="preconnect">` for the font host and any required third-party origin (e.g. OAuth provider redirect targets don't need preconnect; font CDNs do).

## Render-Blocking Resources
- One CSS file, deferred/module JS, no synchronous third-party `<script>` tags in `<head>`.

## Animations
- CSS animations/transitions (`transform`/`opacity` only, to stay on the compositor thread) used for all micro-interactions (hover states, the mobile nav drawer, the join-flow stepper transitions) — JavaScript is used only to toggle a class, never to run the animation loop itself.
- All animation respects `prefers-reduced-motion: reduce` (see 24-ACCESSIBILITY-SPECIFICATION.md) — reduced or removed entirely for users who request it.

## Layout Shift (CLS) Avoidance
- Reserved space for all images/embeds via explicit dimensions.
- Nav/footer are part of the initial static HTML (per 22's build-time-assembly approach) — never injected after load, which is a common CLS cause this architecture deliberately avoids.
- Web fonts use `font-display: swap` with a closely-matched fallback font stack to minimise the visible reflow when the custom font loads.
- Skeleton loading states (17-DESIGN-SYSTEM.md) reserve the same box size as the final content on dynamic pages (profile contributions list, etc.).

## First Contentful Paint / Largest Contentful Paint
- Static pages: FCP/LCP are dominated by server response time (Vercel edge, effectively instant for static files) and the hero image/font — both addressed above.
- Dynamic pages (profile/verify): server-rendered HTML (22-FRONTEND-ARCHITECTURE.md) means the LCP content arrives in the initial response, not after a client-side fetch — critical for hitting 100 on these pages specifically.

## Caching
- `vercel.json` sets long `Cache-Control` (e.g. `public, max-age=31536000, immutable`) on hashed/static assets (`/css/*`, `/js/*`, `/assets/*`), and short/no-cache on dynamic serverless-rendered routes (`/profile/*`, verify results) balanced against the certificate-revocation-must-propagate-promptly requirement from 11-CERTIFICATE-SYSTEM.md.

## Measurement
- Every milestone in 20-IMPLEMENTATION-PLAN.md that ships a new page type should include a Lighthouse run against that page (mobile + desktop) before being marked done — performance is verified continuously, not audited once at the end.
