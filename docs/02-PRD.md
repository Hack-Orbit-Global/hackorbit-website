# 02 — Product Requirements Document (PRD)

## Product Overview
The Hack Orbit main website: a static HTML/CSS/Vanilla JavaScript site on Vercel, backed by Vercel Serverless Functions for dynamic pages and writes, that presents the organisation, runs the Hack Orbit Identity System (Google + GitHub + Discord verified membership), hosts public member profiles, tracks org-repo GitHub contributions, and issues/verifies badges and certificates — backed by Google Sheets/Apps Script in v1.

## Goals
- G1: Establish a credible, SEO-legible public identity for Hack Orbit and its founder
- G2: Let a person become a verified Hack Orbit member in under ~3 minutes (Google → GitHub → Discord)
- G3: Give every verified member a public, shareable, contribution-based profile
- G4: Track contributions to official Hack Orbit GitHub repos automatically and accurately
- G5: Support badge and certificate issuance with public, spoof-resistant verification
- G6: Ship on Google Sheets/Apps Script now, without blocking a later DB migration
- G7: Keep the system solo-operable by the founder with no enterprise overhead

## Non-Goals
- NG1: No event-management system in the main site
- NG2: No government-grade identity verification
- NG3: No downloadable certificate files from the public verification page
- NG4: No full personal-GitHub-account scanning for every member
- NG5: No automated mass-email sending
- NG6: No premature migration off Sheets before real scale demands it
- NG7: No React/Vue/TypeScript/frontend framework — vanilla HTML/CSS/JS only, per the locked architecture decision

## User Personas
| Persona | Description | Primary Need |
|---|---|---|
| New Builder | Student/early dev discovering Hack Orbit | Understand what it is, join easily, start contributing |
| Active Contributor | Already contributing to org repos | Accurate contribution tracking, badges, a profile to share |
| Project Proposer | Wants their project recognised | Clear path to propose/showcase a project, understand official-vs-community |
| Recruiter / Collaborator / Visitor | Evaluating Hack Orbit or a specific member | Credible org presence, verifiable profile/certificate |
| Founder (Admin) | Sabarna Barik, operating the org | Low-effort admin controls (Sheets-based), founder credit, growth headroom |

## User Journeys
1. **Discovery → Join**: Visitor lands on homepage → reads About/mission → clicks "Join Hack Orbit" → Google login → connect GitHub → connect Discord → gets Member ID → lands on own profile (mostly empty, prompted to contribute)
2. **Contribute → Get Recognised**: Member finds an official repo via the Projects page → opens an issue/PR → PR merges → next sync run reflects it on their profile → member earns a related badge automatically or via admin review
3. **Propose a Project**: Member builds something independently → uses the "Propose a Project" flow (contact/form) → founder reviews → project is showcased as Community, or later formally adopted as Official
4. **Certificate Verification**: A third party receives a certificate ID from a member → visits `/verify` → enters the ID → sees metadata confirming validity, type, event, and recipient — no file exposed
5. **Founder Operations**: Founder manages members/badges/certificates primarily through Google Sheets, using Apps Script-backed admin actions where needed, without touching code for routine operations

## User Stories (representative)
- As a visitor, I want to understand what Hack Orbit is within one homepage scroll, so I can decide whether to join.
- As a new user, I want a single "Join" flow that clearly explains why GitHub and Discord are required, so I'm not confused mid-flow.
- As a member, I want my profile to show real contributions without exposing my email, so I can share it publicly with confidence.
- As a member, I want a public display name option, so my profile doesn't have to use my legal name.
- As a certificate recipient, I want a public verification link, so others can confirm my certificate is real.
- As the founder, I want to manage badges/certificates from a spreadsheet, so I don't need to write code for routine admin tasks.
- As a search engine, I want structured Organization/Person schema, so I can correctly associate Sabarna Barik as Hack Orbit's founder.

## Functional Requirements (summary — full detail in 03-SRS.md)
- FR-AUTH: Google OAuth primary login; GitHub OAuth connection; Discord OAuth connection
- FR-ID: Member ID generation, uniqueness enforcement, duplicate-identity prevention
- FR-PROFILE: Public profile pages with contribution/badge/certificate display and privacy-safe fields
- FR-GH: Org-repo contribution sync (webhooks + scheduled reconciliation)
- FR-BADGE: Automatic + manual badge awarding, audit trail
- FR-CERT: Certificate generation, unique IDs, public metadata-only verification
- FR-SEO: Structured data, sitemap, metadata across all public pages

## Feature Priorities / MVP Scope
**MVP (v1):**
- Public marketing pages (Home, About with embedded founder section, Projects, Contribute, Contact)
- Identity system: Google → GitHub → Discord → Member ID → profile
- Public profile pages (`/profile/HO-XXXXXX`)
- GitHub org-repo contribution sync (merged PRs at minimum; issues/reviews as stretch)
- Badge system (manual awarding first; automatic for clearly-defined trigger types)
- Certificate generation + public verification page
- Full SEO foundation (schema, sitemap, OG, robots)
- Google Sheets/Apps Script backend

**Future scope (explicitly deferred):**
- Event-management platform / event sites (separate projects)
- Discord bot roles/automation beyond basic connection verification
- Full database migration
- Admin dashboard UI beyond Sheets
- Advanced analytics/leaderboards
- Multi-language support

## Success Metrics
- Time-to-join (Google → Member ID issued) under target threshold
- % of verified members with at least one tracked contribution within 30 days
- Certificate verification page usage (evidence it's actually being checked by third parties)
- Organic search visibility for "Hack Orbit" and "Sabarna Barik Hack Orbit" queries
- Founder admin time per week staying low (proxy for "not overbuilt")

## Risks
- R1: GitHub API rate limits at scale if sync design is naive → mitigate via org-scoped webhooks + batched reconciliation (see 07)
- R2: Google Sheets becoming a bottleneck/corruption risk as data grows → mitigate via defined migration triggers (see 19)
- R3: Certificate/badge spoofing or manual-award abuse → mitigate via audit trail and admin-only write paths (see 10, 11, 18)
- R4: Founder-identity SEO effort tipping into keyword stuffing → mitigate via semantic/structured-data-first approach (see 15)
- R5: Scope creep toward event-management or enterprise features → mitigate by treating this PRD's non-goals as binding

## Assumptions
- HTML/CSS/Vanilla JavaScript on Vercel, no frontend framework, custom lightweight OAuth (no NextAuth) — locked architecture decision (see 04-SYSTEM-ARCHITECTURE.md); the approved Google Stitch design is the visual source of truth, not to be redesigned
- Lighthouse-style targets of 100 (Performance, Accessibility, Best Practices, SEO) are engineering requirements from the start (see 23, 24)
- English-only v1
- Founder is the sole admin/operator at launch
