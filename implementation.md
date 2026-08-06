# Hack Orbit Website — Master Implementation Plan

> **Document Status:** Active / Production Baseline  
> **Source Documents:** `docs/00` through `docs/25`, `docs/ANTIGRAVITY-STARTER-PROMPT.md`  
> **Target Output:** `/home/sabarna/hackorbit-website/implementation.md`  
> **Architecture Constraint:** Plain HTML5 + CSS3 + Vanilla JavaScript + Vercel Serverless Functions + Google Sheets / Apps Script (Zero Frontend Frameworks)  
> **Target Quality Standard:** 100/100/100/100 Lighthouse Scores (Performance, Accessibility, Best Practices, SEO)  

---

## 1. Executive Summary & Core Requirements

Hack Orbit is an open-source technology organisation and developer community founded by **Sabarna Barik**. Hack Orbit is technology-neutral (spanning web development, DevOps, AI/ML, and general software engineering) and is **not** a cybersecurity or hacking-focused brand.

### 1.1 Core Mission & Purpose
The Hack Orbit main website serves as the official public identity and participant home for the organisation. It enables members to:
1. Understand Hack Orbit's mission and philosophy (**BUILD. CONTRIBUTE. ORBIT TOGETHER.**).
2. Complete verified membership onboardings via a seamless 3-step OAuth flow (**Google → GitHub → Discord**).
3. Obtain permanent, sequential Member IDs (starting with founder **`HO-000001`**).
4. Maintain a public, contribution-backed profile (`/profile/HO-XXXXXX`) showing verified org-repo contributions, badges, and certificates without exposing private authentication data or personal emails.
5. Verify issued certificates publicly via a metadata-only verification system (`/verify`).

### 1.2 Non-Negotiable Architecture Constraints
- **Stack:** Plain HTML5, Vanilla CSS3 (CSS Custom Properties), and Vanilla JavaScript. **No React, Vue, Svelte, Next.js, or TypeScript.**
- **Deployment:** Vercel Edge Network for static file serving, Node.js Serverless Functions for dynamic routes/API endpoints (`/api/*`), and Vercel Cron for background reconciliation.
- **Visual Design Source of Truth:** Approved Google Stitch visual designs in `design-prototypes/`. Visual hierarchy, typography, dark tech-noir aesthetic, component layouts, and animations must match the prototypes.
- **Backend & Data Layer (v1):** Google Sheets accessed via Google Apps Script Web App endpoints with shared-secret authorization headers (`X-Shared-Service-Key`).
- **Authentication:** Custom Node.js OAuth 2.0 handler using lightweight signed JWTs stored in `httpOnly`, `SameSite=Lax`, `Secure` cookies (`ho_session`).

### 1.3 Key Performance & Accessibility Targets
- **Lighthouse Performance:** 100
- **Lighthouse Accessibility:** 100
- **Lighthouse Best Practices:** 100
- **Lighthouse SEO:** 100

---

## 2. System Architecture & Component Design

```
+---------------------------------------------------------------------------------------------------+
|                                        VERCEL EDGE NETWORK                                         |
|                                                                                                   |
|  +-------------------------------------+  +----------------------------------------------------+  |
|  |     Static Assets (Edge CDN)        |  |        Serverless Functions (Node.js API)          |  |
|  | - index.html, about.html, join.html   |  | - /api/auth/* (Google, GitHub, Discord OAuth)      |  |
|  | - projects.html, contribute.html    |  | - /api/identity/* (Verification & Member ID)       |  |
|  | - css/*.css, js/*.js, assets/*        |  | - /api/webhooks/github (Org PR/Issue events)      |  |
|  +-------------------------------------+  | - /api/verify/* (Certificate Verification API)     |  |
|                                           | - /profile/[id] (Serverless HTML SSR for Profiles) |  |
|                                           +-------------------------+--------------------------+  |
+---------------------------------------------------------------------|-----------------------------+
                                                                      | Shared Service Key (HTTPS)
                                                                      v
                                                    +-----------------------------------+
                                                    |  Google Apps Script Web App       |
                                                    |  (doPost / doGet Handler)         |
                                                    +-----------------+-----------------+
                                                                      | Apps Script API
                                                                      v
                                                    +-----------------------------------+
                                                    |   Google Sheets Database (v1)     |
                                                    |  - Members, IdentityConnections   |
                                                    |  - Contributions, Badges, Certs   |
                                                    +-----------------------------------+
```

### 2.1 File & Directory Structure (`docs/25-PROJECT-FOLDER-STRUCTURE.md`)
```
hackorbit-website/
├── api/                             # Vercel Serverless Functions (Node.js)
│   ├── admin/
│   │   ├── badges/                  # award.js, revoke.js
│   │   └── certificates/            # issue.js, revoke.js
│   ├── auth/                        # google/, github/, discord/, session.js, logout.js
│   ├── cron/                        # github-reconcile.js
│   ├── identity/                    # finalize.js
│   ├── members/                     # [id].js, me.js
│   ├── profile/                     # [id].js (SSR HTML renderer)
│   ├── verify/                      # index.js, [id].js
│   └── webhooks/                    # github.js
├── apps-script/                     # Google Apps Script Source Files
│   ├── Code.gs                      # Main entrypoint & action dispatcher
│   ├── members.gs                   # Member creation, identity checks
│   ├── contributions.gs             # GitHub event logging & aggregation
│   ├── badges.gs                    # Badge lookup & awarding
│   ├── certificates.gs              # Certificate verification & generation
│   ├── counters.gs                  # ID counter increments (HO-XXXXXX)
│   └── setup.gs                     # Initial sheet structure builder
├── frontend/                        # Frontend Source Assets
│   ├── assets/                      # Images, logos, icons (founder.jpg, logo.svg)
│   ├── css/                         # System styles (variables, reset, global, components, etc.)
│   ├── js/                          # Vanilla JS client logic (api, auth, navigation, etc.)
│   ├── pages-src/                   # Raw HTML pages before header/footer assembly
│   ├── partials/                    # Shared HTML components (head.html, nav.html, footer.html)
│   └── templates/                   # Serverless SSR templates (profile, verify-result)
├── lib/                             # Shared Node.js Utilities
│   ├── appsScriptClient.js          # Apps Script HTTPS caller with retry & secret key
│   ├── html/                        # HTML escape & templating helpers
│   ├── oauth/                       # Google, GitHub, Discord OAuth clients
│   └── session.js                   # JWT sign/verify cookie utilities
├── seo/                             # SEO Assets (robots.txt, sitemap script)
├── tests/                           # Build, HTML structure & unit tests
├── build.js                         # Assembles pages-src + partials -> frontend root static HTML
├── vercel.json                      # Vercel routing rules & Serverless configuration
└── package.json                     # Scripts & dev dependencies
```

---

## 3. Data Model & Google Sheets Schema

All records are persisted in a single Google Sheet containing 11 standardized tabs (`docs/05-DATA-MODEL.md` & `docs/12-GOOGLE-SHEETS-ARCHITECTURE.md`).

### 3.1 Primary Data Tables
1. **`Members`**: `member_id` (PK, e.g. `HO-000001`), `google_sub`, `email`, `display_name`, `avatar_url`, `bio`, `skills` (JSON array), `github_username`, `discord_id`, `linkedin_url`, `status` (`pending`|`verified`|`deleted`), `is_founder` (`TRUE`|`FALSE`), `created_at`, `verified_at`.
2. **`IdentityConnections`**: `member_id` (FK), `provider` (`google`|`github`|`discord`), `provider_account_id`, `linked_at`.
3. **`Projects`**: `project_id`, `name`, `description`, `type` (`official`|`community`), `repo_url`, `owner_member_id`, `status` (`proposed`|`active`|`archived`), `created_at`.
4. **`Contributions`**: `contribution_id` (PK, GitHub event delivery ID for idempotency), `member_id` (FK), `project_id`, `type` (`pr_merged`|`issue`|`review`|`doc`|`other`), `repo`, `reference_url`, `occurred_at`, `source` (`webhook`|`reconciliation`|`manual`).
5. **`Badges`**: `badge_id`, `name`, `description`, `icon_url`, `award_type` (`automatic`|`manual`), `trigger_condition`.
6. **`MemberBadges`**: `award_id`, `member_id` (FK), `badge_id` (FK), `awarded_by`, `awarded_at`, `status` (`active`|`revoked`), `revoke_reason`.
7. **`Certificates`**: `certificate_id` (PK, e.g. `HO-CERT-2026-000001`), `member_id` (FK), `type` (`participation`|`winner`|`finalist`|`volunteer`|`organiser`|`contributor`), `event_name`, `achievement_description`, `issued_by`, `collaborating_org`, `issue_date`, `status` (`valid`|`revoked`), `file_generated`, `emailed_at`.
8. **`Events`**: `event_id`, `name`, `external_url`, `date_range`, `summary`.
9. **`AdminRecords`**: `admin_id` (FK), `role` (`founder`|`admin`), `granted_at`.
10. **`AuditRecords`**: `audit_id`, `actor`, `action`, `target`, `timestamp`, `metadata`.
11. **`Counters`**: Key-value table storing current max IDs (`member_counter`: `1`, `cert_2026_counter`: `0`).

---

## 4. Identity & Authentication Pipeline

```
+---------------------------------------------------------------------------------------------------+
|                                  MEMBER ONBOARDING STEPPER FLOW                                   |
+---------------------------------------------------------------------------------------------------+

 [Step 1: Google OAuth]        [Step 2: GitHub OAuth]       [Step 3: Discord OAuth]      [Step 4: Finalize]
 +----------------------+      +---------------------+      +---------------------+      +-------------------+
 | - Authorize Google   |      | - Link GitHub Handle|      | - Link Discord ID   |      | - Promote status  |
 | - Create pending user| ---> | - Enforce uniqueness| ---> | - Check server join | ---> |   pending->verified|
 | - Issue session cookie|     | - Update session    |      | - Update session    |      | - Assign Member ID|
 +----------------------+      +---------------------+      +---------------------+      |   (e.g. HO-000002)|
                                                                                         +-------------------+
```

### 4.1 Security & Uniqueness Rules (`docs/06-IDENTITY-SYSTEM.md`)
- **Google Sub Anchor:** `google_sub` is immutable and attached on Step 1.
- **GitHub Uniqueness:** Each GitHub handle can only be linked to **one** active Hack Orbit Member ID. Attempts to link an already-claimed GitHub account will throw a clear conflict error (`GITHUB_ALREADY_LINKED`).
- **Discord Uniqueness:** Each Discord user ID is uniquely anchored.
- **Founder Identification:** Sabarna Barik's account is permanently assigned `HO-000001` with `is_founder = TRUE` and tagged with the Founder Badge.
- **Session Tokens:** Signed JWT containing `{ google_sub, member_id, github_username, discord_id, status, step }` stored in an HTTP-only cookie with strict expiration (7 days).

---

## 5. Endpoints & API Contract

### 5.1 Vercel Serverless Function Routes
| Endpoint Route | Method | Description | Access |
|---|---|---|---|
| `/api/auth/google/start` | GET | Initiates Google OAuth redirect | Public |
| `/api/auth/google/callback` | GET | Handles Google callback, creates pending member, sets session | Public |
| `/api/auth/github/connect` | GET | Initiates GitHub OAuth redirect | Authenticated (Pending) |
| `/api/auth/github/callback` | GET | Handles GitHub callback, links account | Authenticated (Pending) |
| `/api/auth/discord/connect` | GET | Initiates Discord OAuth redirect | Authenticated (Pending) |
| `/api/auth/discord/callback` | GET | Handles Discord callback, links account | Authenticated (Pending) |
| `/api/identity/finalize` | POST | Completes onboarding, generates Member ID | Authenticated (Pending) |
| `/api/auth/session` | GET | Returns current user session state | Public / Authenticated |
| `/api/auth/logout` | POST | Clears session cookie | Authenticated |
| `/api/members/me` | PATCH | Updates bio, display name, skills, links | Authenticated (Self) |
| `/api/members/[id]` | GET | Returns public member details & contributions | Public |
| `/api/profile/[id]` | GET | Renders full SSR profile HTML page | Public |
| `/api/verify/[id]` | GET | Returns public certificate metadata (JSON) | Public |
| `/api/webhooks/github` | POST | Ingests GitHub org PR/issue webhooks | Public (HMAC Verified) |
| `/api/cron/github-reconcile`| GET | Periodic reconciliation for GitHub events | Vercel Cron |
| `/api/admin/badges/award` | POST | Awards badge to member | Founder/Admin |
| `/api/admin/certificates/issue`| POST | Issues new certificate | Founder/Admin |

### 5.2 Apps Script Web App Dispatcher Actions
- `createMember`: Insert pending member record into `Members`.
- `linkIdentity`: Record connection in `IdentityConnections` and update `Members`.
- `finalizeVerification`: Atomically increment `member_counter`, assign `HO-XXXXXX`, set status `verified`.
- `getMemberById`: Read member profile + badges + certificates + contributions.
- `addContribution`: Insert contribution event with delivery ID deduplication.
- `awardBadge` / `revokeBadge`: Insert or update `MemberBadges` with audit entry.
- `issueCertificate` / `verifyCertificate`: Manage `Certificates` sheet and verify certificate status (`valid`/`revoked`/`not_found`).

---

## 6. Visual Design System & Frontend Architecture

The design system directly implements the **Cinematic Tech-Noir** visual aesthetic established in `design-prototypes/` and `docs/17-DESIGN-SYSTEM.md`.

### 6.1 Design Tokens (`frontend/css/variables.css`)
```css
:root {
  /* Color Palette */
  --bg-primary: #080a0f;
  --bg-secondary: #0f131c;
  --bg-card: rgba(15, 19, 28, 0.7);
  --border-color: rgba(255, 255, 255, 0.08);
  --border-focus: #3b82f6;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-glow: rgba(6, 182, 212, 0.15);
  
  --status-verified: #10b981;
  --status-pending: #f59e0b;
  --status-revoked: #ef4444;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Layout & Spacing */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  
  --shadow-glow: 0 0 25px rgba(6, 182, 212, 0.2);
  --backdrop-blur: blur(12px);
}
```

### 6.2 Frontend Build System (`build.js`)
Since no runtime JS framework is permitted, static HTML pages are built using a zero-dependency Node.js build script (`frontend/build.js`):
1. Reads HTML page templates from `frontend/pages-src/`.
2. Replaces placeholder tokens (`<!-- {{HEAD}} -->`, `<!-- {{NAV}} -->`, `<!-- {{FOOTER}} -->`) with content from `frontend/partials/`.
3. Validates semantic tags, accessibility attributes (`aria-labels`, `alt` tags), and outputs clean, minified HTML directly to the project root or static distribution folder (`frontend/`).

---

## 7. Comprehensive Milestone Execution Plan

```
[M1: Foundation] ───► [M2: Brand & Shell] ───► [M3: Static Pages] ───► [M4: Auth Systems]
                                                                              │
[M8: Discord] ◄────── [M7: GitHub Sync] ◄──── [M6: Public Profiles] ◄── [M5: Member Identity]
      │
      ▼
[M9: Badges] ───────► [M10: Certificates] ───► [M11: SEO/Perf] ──────► [M12-14: Deployment & QA]
```

### Phase 1: Core Infrastructure & Repository Foundation

#### Milestone 1: Repository Scaffold & Apps Script Setup
- **Goal:** Verify and complete directory structure, setup local dev environment, build script, and Apps Script backend.
- **Tasks:**
  1. Inspect existing files, ensure `build.js` runs cleanly via `npm run build`.
  2. Implement `apps-script/Code.gs`, `apps-script/setup.gs`, `apps-script/members.gs`, `apps-script/counters.gs`, `apps-script/contributions.gs`, `apps-script/badges.gs`, and `apps-script/certificates.gs`.
  3. Wire `lib/appsScriptClient.js` with HTTPS retry and header authentication (`X-Shared-Service-Key`).
- **Deliverables:** Working local dev server (`vercel dev`), functional `apps-script/` codebase, valid `package.json` scripts.
- **Verification:** Execute `npm test` and verify Apps Script HTTP response handling.

#### Milestone 2: Design Tokens & Base Component CSS
- **Goal:** Establish zero-dependency CSS layout matching Stitch prototypes.
- **Tasks:**
  1. Finalize `frontend/css/variables.css`, `frontend/css/reset.css`, `frontend/css/global.css`, `frontend/css/components.css`, `frontend/css/animations.css`, and `frontend/css/responsive.css`.
  2. Build static partials (`frontend/partials/head.html`, `frontend/partials/nav.html`, `frontend/partials/footer.html`) with semantic tags and mobile drawer menus.
- **Deliverables:** Responsive CSS layout system with glowing buttons, glassmorphic cards, tech-noir navigation bar, and clean footer.
- **Verification:** Inspect navigation bar rendering on mobile (375px), tablet (768px), and desktop (1440px).

---

### Phase 2: Public Marketing Pages & SEO Foundation

#### Milestone 3: Public Marketing Pages Implementation
- **Goal:** Implement static landing pages showcasing Hack Orbit, founder credit, projects, and contribution guides.
- **Tasks:**
  1. Build `frontend/pages-src/index.html` (Homepage with mission hero, core philosophy, contribution callouts, and stats).
  2. Build `frontend/pages-src/about.html` (About page with embedded founder section for **Sabarna Barik** and `founder.jpg` asset).
  3. Build `frontend/pages-src/projects.html` (Official vs. Community project showcase with filters).
  4. Build `frontend/pages-src/contribute.html` (Step-by-step contribution guidelines).
  5. Build `frontend/pages-src/contact.html` (Contact form & community channels).
  6. Run `node frontend/build.js` to compile to static HTML.
- **Deliverables:** Complete set of 5 public marketing pages.
- **Verification:** Confirm all links resolve, semantic HTML validation passes, and asset paths are valid.

#### Milestone 11 & 15: SEO, Structured Data & Metadata Hardening
- **Goal:** Maximize organic search visibility for Hack Orbit and Sabarna Barik.
- **Tasks:**
  1. Add JSON-LD `Organization` schema linking Hack Orbit to founder `Person` schema (**Sabarna Barik**).
  2. Implement canonical tags, Open Graph (`og:title`, `og:image`, `og:description`), Twitter Card metadata across all pages.
  3. Generate `seo/robots.txt` and `sitemap.xml` dynamically via `seo/sitemap-generate.js`.
- **Deliverables:** Fully compliant SEO metadata and indexable sitemap.
- **Verification:** Validate JSON-LD via schema testing tool syntax check; confirm `sitemap.xml` presence.

---

### Phase 3: Identity, OAuth & Member Onboarding

#### Milestone 4: OAuth 2.0 Backend & Session Engine
- **Goal:** Build framework-free OAuth authentication handlers.
- **Tasks:**
  1. Implement `lib/oauth/google.js`, `lib/oauth/github.js`, and `lib/oauth/discord.js` using raw `fetch` calls.
  2. Implement `lib/session.js` using signed JWT tokens with `jose` library.
  3. Create Vercel API routes: `/api/auth/google/start`, `/api/auth/google/callback`, `/api/auth/github/connect`, `/api/auth/github/callback`, `/api/auth/discord/connect`, `/api/auth/discord/callback`, `/api/auth/session`, `/api/auth/logout`.
- **Deliverables:** Functional multi-provider OAuth pipeline with secure cookie management.
- **Verification:** Test OAuth redirect links, token exchange mock, and cookie parsing.

#### Milestone 5: Stepper Flow & Identity Verification
- **Goal:** Implement onboarding UI (`/join.html`) and Member ID assignment.
- **Tasks:**
  1. Build `frontend/pages-src/join.html` and `frontend/js/auth.js` for progressive multi-step verification (Google -> GitHub -> Discord).
  2. Create `/api/identity/finalize` endpoint to invoke Apps Script `finalizeVerification` action.
  3. Enforce sequential Member ID generation (`HO-XXXXXX`) and duplicate identity prevention.
  4. Seed founder identity (`HO-000001` for Sabarna Barik).
- **Deliverables:** Working `/join` stepper interface.
- **Verification:** End-to-end simulation of join flow; confirm `HO-XXXXXX` assignment in Sheets mock.

---

### Phase 4: Public Profiles, GitHub Sync & Community Features

#### Milestone 6: Public Profiles & Member Settings
- **Goal:** Build member profile pages (`/profile/HO-XXXXXX`) and settings manager.
- **Tasks:**
  1. Create `/api/profile/[id].js` serverless function to render SSR HTML from `frontend/templates/profile.template.html`.
  2. Implement `frontend/pages-src/settings.html` and `frontend/js/profile.js` for self-service bio, skills, and links updates via `/api/members/me`.
  3. Create `/api/members/[id].js` for client-side JSON fetching.
- **Deliverables:** SSR public member profiles and interactive account settings.
- **Verification:** Verify search engines receive fully populated HTML at `/profile/HO-000001`; check privacy (no email exposure).

#### Milestone 7 & 8: GitHub Org Webhooks, Reconciliation & Discord Integration
- **Goal:** Automate contribution tracking from official Hack Orbit GitHub repositories.
- **Tasks:**
  1. Implement `/api/webhooks/github.js` with HMAC signature validation (`X-Hub-Signature-256`).
  2. Ingest `pull_request` (merged) and `issues` events, invoking Apps Script `addContribution` with delivery ID for idempotency.
  3. Create `/api/cron/github-reconcile.js` scheduled in `vercel.json` for fallback periodic sync.
  4. Implement Discord membership check status flag.
- **Deliverables:** Live contribution pipeline feeding into member profiles.
- **Verification:** Send mock GitHub webhook payloads with valid signatures; verify idempotency on duplicate deliveries.

---

### Phase 5: Badges, Certificates & Administrative Controls

#### Milestone 9: Badge & Achievement System
- **Goal:** Define and award contribution badges.
- **Tasks:**
  1. Seed initial badges in Sheets `Badges` tab (e.g. "Founder", "Core Contributor", "First PR Merged").
  2. Implement automatic badge trigger logic in Apps Script upon contribution ingestion.
  3. Create `/api/admin/badges/award.js` and `revoke.js` endpoints with audit logging in `AuditRecords`.
- **Deliverables:** Dynamic badge display on profiles with manual/automatic award paths.
- **Verification:** Test automatic award on first merged PR; test manual admin award/revoke.

#### Milestone 10: Certificate Generation & Public Verification System
- **Goal:** Issue verifiable certificates with public search (`/verify`).
- **Tasks:**
  1. Build `frontend/pages-src/verify.html` and `frontend/js/certificates.js` for public ID lookups.
  2. Create `/api/verify/[id].js` and `/api/verify/index.js` endpoints returning metadata-only status (`valid`, `revoked`, `not_found`).
  3. Create `/api/admin/certificates/issue.js` and `revoke.js` endpoints with sequential certificate ID formatting (`HO-CERT-YYYY-XXXXXX`).
  4. Ensure public verification pages **never** expose downloadable certificate files (metadata only).
- **Deliverables:** Working `/verify` public portal and certificate issuance API.
- **Verification:** Test verification search with valid ID, invalid ID, and revoked certificate ID.

---

### Phase 6: Optimization, Accessibility & Launch Readiness

#### Milestone 11 & 23: Core Web Vitals & Performance Optimization
- **Goal:** Guarantee 100/100 Lighthouse Performance score.
- **Tasks:**
  1. Inline critical CSS tokens into head partial.
  2. Optimize image loading: use native `loading="lazy"`, explicit `width` and `height` attributes to eliminate CLS (Cumulative Layout Shift).
  3. Ensure zero unneeded JavaScript execution on static marketing pages.
  4. Configure font loading with `font-display: swap`.
- **Deliverables:** Optimized static and serverless pages.
- **Verification:** Execute Lighthouse audit CLI on all templates; verify 100 Performance score.

#### Milestone 11 & 24: Accessibility (WCAG 2.1 AA) Hardening
- **Goal:** Guarantee 100/100 Lighthouse Accessibility score.
- **Tasks:**
  1. Enforce semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
  2. Ensure color contrast ratios exceed 4.5:1 for normal text and 3:1 for large text against tech-noir dark backgrounds.
  3. Add visible focus indicators (`:focus-visible`) across all interactive elements.
  4. Add explicit `aria-label`, `role`, and `autocomplete` attributes to all forms.
  5. Support `@media (prefers-reduced-motion: reduce)` in `frontend/css/animations.css`.
- **Deliverables:** Accessible, screen-reader friendly interface.
- **Verification:** Complete automated axe/Lighthouse check and manual keyboard navigation pass (Tab / Shift+Tab / Enter / Space).

#### Milestone 12, 13 & 14: Final Integration Testing, Deployment & Launch
- **Goal:** Deploy to Vercel production environment with complete test coverage.
- **Tasks:**
  1. Configure environment variables in Vercel (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `APPS_SCRIPT_URL`, `SHARED_SERVICE_KEY`, `JWT_SECRET`).
  2. Verify health-check and rate-limiting rules in Vercel Functions.
  3. Seed Founder profile (**Sabarna Barik**, `HO-000001`).
  4. Perform full end-to-end QA pass: join flow, profile view, settings update, webhook processing, certificate lookup.
- **Deliverables:** Production-ready Hack Orbit website on Vercel.
- **Verification:** All tests passing (`npm test`), green status on all 4 Lighthouse categories across every page template.

---

## 8. Verification & Quality Assurance Checklist

| Category | Test Requirement | Expected Outcome | Status |
|---|---|---|---|
| **Build System** | `npm run build` execution | Compiles all `pages-src/*.html` + partials into static HTML | Mandatory |
| **Authentication** | Google -> GitHub -> Discord stepper | Successfully transitions steps and sets signed session cookie | Mandatory |
| **Identity** | Member ID incrementation | Generates sequential `HO-XXXXXX` IDs without gaps or duplicates | Mandatory |
| **Public Profile** | GET `/profile/HO-000001` | Returns pre-rendered HTML with Person schema & no private email | Mandatory |
| **GitHub Webhook** | Ingest duplicate webhook payload | Deduplicates via `contribution_id` idempotency key | Mandatory |
| **Certificate Verify** | Search `/verify` with `HO-CERT-2026-000001` | Displays validity, recipient, issue date, and event (no file link) | Mandatory |
| **Lighthouse SEO** | Run Lighthouse audit | Score = 100 (Structured data, canonicals, alt tags present) | Mandatory |
| **Lighthouse Perf** | Run Lighthouse audit | Score = 100 (Zero layout shift, fast LCP, minimal JS payload) | Mandatory |
| **Lighthouse A11y** | Run Lighthouse audit | Score = 100 (WCAG 2.1 AA compliant, visible focus states) | Mandatory |
| **Lighthouse BP** | Run Lighthouse audit | Score = 100 (HTTPS, secure cookies, no console errors) | Mandatory |
