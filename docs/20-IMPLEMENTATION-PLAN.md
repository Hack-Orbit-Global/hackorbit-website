# 20 — Implementation Plan

Milestone-based, not calendar-dated. Each milestone should be independently shippable/testable before moving to the next.

## Milestone 1 — Foundation
- Repo scaffold per 25-PROJECT-FOLDER-STRUCTURE.md: `frontend/`, `api/`, `lib/`, `apps-script/`, `seo/`, plain `package.json` with `build`/`dev` scripts, `vercel.json` routing — no frontend framework dependency
- Design tokens from 17-DESIGN-SYSTEM.md wired into `css/variables.css`
- Google Sheets spreadsheet created per 12-GOOGLE-SHEETS-ARCHITECTURE.md (all tabs, including `Counters`)
- Apps Script Web App skeleton deployed, shared-service-key auth working end-to-end (Vercel → Apps Script round trip)

## Milestone 2 — Brand & Frontend Shell
- Nav, footer, design system components (buttons, cards, status indicators) built per 17-DESIGN-SYSTEM.md
- Static/marketing pages: Home, About (with embedded founder section), Contact (per 16-FRONTEND-SITEMAP.md), using real logo assets

## Milestone 3 — Public Organisation Website Content
- Projects page (static/manual content initially, official vs community labelling live)
- Contribute page
- Base SEO wiring: titles, meta descriptions, sitemap.xml, robots.txt, Organization + Person + WebSite JSON-LD (15-SEO-SPECIFICATION.md)

## Milestone 4 — Authentication
- Google `start`/`callback` Serverless Functions (login) and GitHub/Discord `connect`/`callback` pairs (per 14-API-SPECIFICATION.md), using a lightweight JWT session library — no auth framework
- Session handling, secure cookie config per 18-SECURITY-AND-PRIVACY.md

## Milestone 5 — Member Identity
- `/join` flow: Google → GitHub → Discord stepper
- Apps Script endpoints: `createMember`, `linkIdentity`, `finalizeVerification`, `getNextId` (Member ID counter)
- Duplicate-identity prevention enforced and tested (06-IDENTITY-SYSTEM.md)
- Founder account manually verified as `HO-000001`

## Milestone 6 — Public Profiles
- `/profile/{member_id}` page: header, empty states, editable settings page (`/settings`)
- Profile SEO: per-profile metadata, Person schema, OG image generation

## Milestone 7 — GitHub Connection & Contribution Tracking
- GitHub org webhook registered, `/api/webhooks/github` receiver built, signature validation
- `addContribution` Apps Script endpoint, idempotency verified
- Reconciliation Vercel Cron job built and scheduled
- Contributions rendering on profile

## Milestone 8 — Discord Connection
- Discord OAuth connect step, server-membership check flag
- (Bot automation explicitly deferred per 08-DISCORD-INTEGRATION.md)

## Milestone 9 — Contributions → Badges
- Badge definitions seeded in `Badges` sheet
- Automatic-award logic wired to contribution events (e.g. first merged PR)
- Manual-award path via Sheets, `awardBadge`/`revokeBadge` Apps Script endpoints with audit logging

## Milestone 10 — Certificates
- `Certificates` sheet + `Counters` for `HO-CERT-{year}-*`
- `issueCertificate`/`revokeCertificate` admin endpoints
- `/verify` public page + `verifyCertificate` endpoint, rate-limited, tested for not-found/revoked states

## Milestone 11 — SEO & Performance Hardening
- Full structured-data pass (Breadcrumbs, profile Person schema, OG/Twitter cards site-wide) per 15-SEO-SPECIFICATION.md
- Core Web Vitals and asset-optimisation pass per 23-PERFORMANCE-SPECIFICATION.md
- Lighthouse run on every page template, targeting 100 across Performance, Accessibility, Best Practices, SEO

## Milestone 12 — Deployment Hardening
- Environment variables finalised in Vercel (secrets, service key, OAuth credentials)
- Rate limiting confirmed at both Vercel and Apps Script layers
- Health-check for the Apps Script layer (NFR-OPS-003)

## Milestone 13 — Testing
- End-to-end test of the full join flow (Google → GitHub → Discord → profile)
- Webhook idempotency/duplicate-delivery test
- Certificate verify: valid / invalid / revoked states
- Accessibility pass (WCAG 2.1 AA, keyboard + screen-reader spot checks) per 24-ACCESSIBILITY-SPECIFICATION.md
- Mobile/tablet/desktop responsive QA

## Development Workflow
- **Local dev**: `vercel dev` runs both the static `frontend/` build output and the `/api/*` Serverless Functions locally in one process — no separate framework dev server needed.
- **Build step**: `frontend/build.js` assembles `pages-src/` + `partials/` into deployable static HTML on every build (`npm run build`), used both locally and by Vercel's build pipeline.
- **Per-page verification loop**: for every new/changed page, check it against (a) the approved Stitch design, (b) a local Lighthouse run, (c) a manual keyboard pass — before moving to the next milestone item. This is what keeps the 100/100/100/100 target achievable incrementally rather than as a final scramble.
- **Docs-as-source-of-truth**: this documentation package (`docs/`) is read before implementation work on any milestone; if an implementation detail isn't covered, the relevant doc is updated alongside the code change, not left implicit.

## Milestone 14 — Launch Readiness
- Founder account seeded as `HO-000001` with Founder badge
- Real (non-placeholder) content on About (including its founder section) and Projects — no invented stats
- Sitemap submitted to Search Console
