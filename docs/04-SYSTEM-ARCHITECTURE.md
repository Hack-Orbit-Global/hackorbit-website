# 04 — System Architecture

## Stack Decision (locked)
- **Frontend**: Plain **HTML5 + CSS3 + Vanilla JavaScript**. No React, Vue, TypeScript, or frontend framework. The existing approved Google Stitch design is the visual source of truth and must be reproduced as closely as reasonably possible in this stack.
- **Hosting/Deployment**: Vercel, serving static HTML/CSS/JS/assets directly from its edge network.
- **Dynamic/SEO-critical pages** (public member profiles, certificate verification): rendered server-side by lightweight **Vercel Serverless Functions** (plain Node.js, no framework) that output complete HTML strings — not client-side-rendered — so content is present in the initial response for both users and search engines.
- **Static marketing pages** (Home, About, Projects, Contribute, Contact, Join): hand-authored static `.html` files, assembled at build time from shared partials (nav/footer/head) by a small Node build script — no runtime framework, no client-side templating for structural content.
- **Auth**: Custom, minimal OAuth 2.0 implementation against Google, GitHub, and Discord, implemented directly in Vercel Serverless Functions (no NextAuth/Auth.js, since there's no Next.js). Sessions are signed JWTs in httpOnly cookies, using a small, well-audited JWT library (e.g. `jose`) rather than a full auth framework.
- **Data layer (v1)**: Google Sheets, fronted exclusively by Google Apps Script Web App endpoints — unchanged from the original decision; this layer is framework-agnostic and unaffected by the frontend stack change.
- **Contribution ingestion**: GitHub Organisation webhooks → Vercel Serverless Function → Apps Script write, plus a scheduled Vercel Cron job for reconciliation — unchanged mechanism, just implemented as a plain Node.js function instead of a Next.js API route.

Rationale: this satisfies the explicit new requirement (no frontend framework), keeps the site deployable on Vercel, and is the most direct path to Lighthouse 100/100/100/100 — minimal JS payload, no framework runtime/hydration cost, and full control over every byte shipped.

## Frontend Architecture (summary — full detail in 22-FRONTEND-ARCHITECTURE.md)
- Static pages are pre-assembled HTML at build time (shared nav/header/footer injected via a build script, not runtime JS) so there is zero layout shift or flash-of-missing-content from client-side includes.
- Dynamic pages (profile, verify) are rendered per-request by a serverless function using simple string-template HTML generation — functionally "SSR without a framework."
- Client-side vanilla JS is scoped narrowly to genuine interactivity: mobile nav toggle, the join-flow stepper, profile settings form, certificate verify form submission, badge/contribution list filtering. No JS is used to render structural content that could instead ship as HTML.

## Vercel Deployment Architecture
```
Vercel Edge Network
  ├─ Static assets: /*.html, /css/*, /js/*, /assets/*      (pre-built, cached aggressively)
  ├─ Serverless Functions (/api/*, Node.js, framework-free)
  │    ├─ /api/auth/google/start        (redirect to Google OAuth)
  │    ├─ /api/auth/google/callback
  │    ├─ /api/auth/github/connect
  │    ├─ /api/auth/github/callback
  │    ├─ /api/auth/discord/connect
  │    ├─ /api/auth/discord/callback
  │    ├─ /api/auth/session             (session check)
  │    ├─ /api/auth/logout
  │    ├─ /api/webhooks/github          (GitHub org webhook receiver)
  │    ├─ /api/members/[id]             (JSON, used by profile.js for client-side bits)
  │    ├─ /api/members/me               (profile edit)
  │    ├─ /api/certificates/verify      (JSON, used by verify.html's fetch)
  │    ├─ /api/admin/*                  (admin-only actions)
  │    ├─ /profile/[id]                 (renders full HTML page server-side)
  │    └─ /verify-result/[id]           (optional: server-rendered verify result page for shareable/indexable links)
  └─ Vercel Cron
       └─ GitHub reconciliation sync (scheduled, calls the same logic as the webhook handler)
```
`vercel.json` defines the routing so that `/profile/HO-000001` maps to the `/api/profile/[id]` serverless function (rendering full HTML), while `/css/*`, `/js/*`, `/assets/*`, and the static marketing pages are served directly as static files with long-cache headers.

## Authentication Architecture
```
User clicks "Join Hack Orbit" (static join.html)
  → GET /api/auth/google/start           → redirects to Google's OAuth consent screen
  → GET /api/auth/google/callback         → exchanges code, creates/finds pending member (via Apps Script), sets session cookie
  → join.html (client JS) checks session, shows "Connect GitHub" step
  → GET /api/auth/github/connect          → redirects to GitHub OAuth
  → GET /api/auth/github/callback         → exchanges code, links GitHub to session's member (via Apps Script), enforces uniqueness
  → join.html shows "Connect Discord" step
  → GET /api/auth/discord/connect / /api/auth/discord/callback  → same pattern
  → POST /api/identity/finalize           → promotes pending → verified, assigns Member ID
  → Client JS redirects to /profile/{member_id}
```
Each OAuth step is a plain redirect + callback pair implemented with the provider's documented OAuth endpoints directly (`fetch`/`https` calls in the serverless function) — no SDK/framework dependency required beyond a minimal HTTP client already built into Node.js. PKCE and `state` parameters are implemented explicitly in these handlers (see 18-SECURITY-AND-PRIVACY.md).

## Google Integration
Unchanged: Google OAuth scopes limited to basic profile/email; `google_sub` remains the identity anchor. Implementation is now a direct OAuth 2.0 exchange in a serverless function rather than a NextAuth provider.

## GitHub Integration (architecture summary — full detail in 07)
Unchanged mechanism (org-scoped webhook + scheduled reconciliation); the webhook receiver and reconciliation job are now plain Node.js serverless functions/cron jobs with no framework dependency.

## Discord Integration (architecture summary — full detail in 08)
Unchanged mechanism; OAuth connect implemented the same direct way as Google/GitHub.

## Apps Script Integration
Unchanged — this boundary was already framework-agnostic (plain HTTP calls with a shared-secret header). See 13-GOOGLE-APPS-SCRIPT-ARCHITECTURE.md.

## Google Sheets Integration
Unchanged.

## Future Migration Path
Unchanged in principle: the Apps Script layer's request/response contracts stay stable, so a future database migration only touches what's behind `/api/members/*`, `/api/certificates/*`, etc. The frontend's dependence on plain HTML/CSS/JS is orthogonal to this — a future backend migration does not require introducing a frontend framework, and vice versa.

## Data Flow (high level)
```
Public visitor  → Vercel static HTML/CSS/JS               → read-only, cached aggressively
Profile/Verify request → Vercel Serverless Function → Apps Script → Sheets (read)  → server-rendered HTML response
Member action   → Client JS fetch → Vercel API route → Apps Script → Sheets (write)
GitHub event    → GitHub webhook → Vercel Serverless Function → Apps Script → Sheets (write)
```

## Trust Boundaries
Unchanged from the original design (public/untrusted browser + webhook payloads; trusted server-side functions; Apps Script as the sole Sheets-write path) — see 18-SECURITY-AND-PRIVACY.md for the vanilla-stack-specific auth security details.

## Failure Scenarios & Handling
Unchanged table from the original design (Apps Script down, webhook missed/duplicate, duplicate identity, certificate not found, OAuth outage) — none of these are framework-dependent; see the equivalent section previously documented and now implemented via plain serverless functions instead of Next.js API routes.
