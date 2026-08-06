# 03 — Software Requirements Specification (SRS)

## System Overview
A static HTML/CSS/Vanilla JavaScript site deployed on Vercel, using framework-free Vercel Serverless Functions for authentication, dynamic page rendering (profile, verify), and writes, with a custom lightweight OAuth implementation (no NextAuth/Auth.js) for Google, GitHub, and Discord, and a Google Apps Script service layer sitting in front of Google Sheets as the v1 datastore. GitHub webhooks feed a contribution-processing pipeline. Public marketing pages are pre-built static HTML (assembled at build time from shared partials); public profile and certificate-verification pages are server-rendered per-request by serverless functions for SEO and freshness; member/profile writes happen through authenticated API routes only. See 04-SYSTEM-ARCHITECTURE.md and 22-FRONTEND-ARCHITECTURE.md for full detail.

## Functional Requirements

### Authentication (FR-AUTH)
- **FR-AUTH-001**: The system shall support Google OAuth 2.0 as the primary login method.
- **FR-AUTH-002**: The system shall use the Google account's unique subject ID as the canonical identity anchor.
- **FR-AUTH-003**: The system shall prevent creation of a second Hack Orbit identity from a Google account already linked to an existing member.
- **FR-AUTH-004**: The system shall support GitHub OAuth 2.0 as a required secondary connection for full verification.
- **FR-AUTH-005**: The system shall support Discord OAuth 2.0 as a required secondary connection for full verification.
- **FR-AUTH-006**: The system shall prevent linking a GitHub or Discord account already linked to a different Hack Orbit member.
- **FR-AUTH-007**: The system shall rely on Google's own account-recovery flow; Hack Orbit shall not implement a parallel password-recovery system.
- **FR-AUTH-008**: Session tokens shall be short-lived and refreshed via provider refresh tokens stored server-side only (never client-exposed).

### Identity / Member ID (FR-ID)
- **FR-ID-001**: The system shall generate a permanent, unique, sequential Member ID in the format `HO-000001` upon completion of full verification (Google + GitHub + Discord).
- **FR-ID-002**: Member ID `HO-000001` shall be reserved for the founder account.
- **FR-ID-003**: Member IDs shall never be reused, including after account deletion.
- **FR-ID-004**: The system shall support a "partial member" state (Google-only, pre-full-verification) that does not yet receive a public profile or Member ID.
- **FR-ID-005**: The system shall log identity-lifecycle events (created, verified, deleted) to an append-only audit record.
- **FR-ID-006**: Account deletion shall retain the Member ID as permanently retired (not reassignable) while removing personally identifying private data per FR-PRIV requirements (see 18-SECURITY-AND-PRIVACY.md).

### Public Member Profile (FR-PROFILE)
- **FR-PROFILE-001**: Every fully-verified member shall have a public profile at `/profile/{member_id}`.
- **FR-PROFILE-002**: Profiles shall display a public display name distinct from any legal/real name field.
- **FR-PROFILE-003**: Profiles shall never display Gmail address or any private authentication data.
- **FR-PROFILE-004**: Profiles shall display: Member ID, display name, optional bio/avatar, skills/technologies, linked GitHub username, optional professional links (e.g. LinkedIn), contributions, badges, certificates, and project involvement.
- **FR-PROFILE-005**: Members shall be able to edit their own public-facing profile fields (bio, display name, skills, links) via an authenticated settings page.
- **FR-PROFILE-006**: Contribution, badge, and certificate data on a profile shall be system-derived/admin-issued only — not member-editable.

### GitHub Integration (FR-GH)
- **FR-GH-001**: GitHub connection shall use OAuth; manual username entry alone shall not constitute verification.
- **FR-GH-002**: Contribution tracking scope shall be limited to repositories within the official Hack Orbit GitHub organisation.
- **FR-GH-003**: The system shall ingest contribution events primarily via GitHub organisation webhooks (PR merged, issue closed, review submitted).
- **FR-GH-004**: The system shall run a scheduled reconciliation job (not per-member polling) to catch missed webhook events, batched and rate-limit-aware.
- **FR-GH-005**: Contribution ingestion shall be idempotent — re-delivery of the same event shall not create duplicate contribution records.
- **FR-GH-006**: Contribution records shall be attributable to a Hack Orbit member via their verified GitHub account link; unlinked GitHub activity shall be queued/ignored until a match exists.

### Discord Integration (FR-DISCORD)
- **FR-DISCORD-001**: Discord connection shall use OAuth to verify account ownership.
- **FR-DISCORD-002**: The system shall be able to check whether a connected Discord account is a member of the official Hack Orbit Discord server.
- **FR-DISCORD-003**: Discord role/bot automation beyond connection + membership verification is deferred (see 08).

### Badges & Achievements (FR-BADGE)
- **FR-BADGE-001**: The system shall support badge definitions with a name, description, icon, and award-type (automatic | manual).
- **FR-BADGE-002**: Automatic badges shall be awarded based on defined, auditable trigger conditions (e.g. first merged PR).
- **FR-BADGE-003**: Manual badges shall be awardable only by an authorised admin action, logged with actor and timestamp.
- **FR-BADGE-004**: Badge revocation shall be supported and shall be logged with reason.
- **FR-BADGE-005**: Badges shall render on the member's public profile.

### Certificates (FR-CERT)
- **FR-CERT-001**: Every certificate shall have a unique ID in the format `HO-CERT-{year}-{sequence}`.
- **FR-CERT-002**: Certificate records shall store: type, recipient display name, Member ID, issuing org, optional collaborating org, event name, achievement description, issue date, status (valid/revoked).
- **FR-CERT-003**: The public verification page shall accept a certificate ID and return metadata only — no downloadable file.
- **FR-CERT-004**: An invalid certificate ID shall return a clear "not found" state without leaking system internals.
- **FR-CERT-005**: A revoked certificate shall display status "Revoked" rather than being hidden, to prevent reuse-for-deception.
- **FR-CERT-006**: Certificate file generation (for emailing) is an admin/founder-controlled action, decoupled from the public verification path.

### SEO (FR-SEO)
- **FR-SEO-001**: All public pages shall render server-side with correct `<title>` and meta description tags.
- **FR-SEO-002**: The site shall emit Organization, Person (founder), WebSite, and BreadcrumbList JSON-LD structured data where applicable.
- **FR-SEO-003**: The site shall provide a valid XML sitemap and `robots.txt`.
- **FR-SEO-004**: Public profile and certificate-verification pages shall be indexable and shall include appropriate canonical URLs.
- **FR-SEO-005**: Open Graph and Twitter Card metadata shall be present on all shareable pages (profiles, projects, certificates).

## Non-Functional Requirements

### Performance
- **NFR-PERF-001**: Public pages shall achieve good Core Web Vitals (LCP < 2.5s, CLS < 0.1) on median mobile conditions.
- **NFR-PERF-002**: Apps Script-backed API calls shall respond within 2s under normal load; slower operations shall be asynchronous with clear loading states.
- **NFR-PERF-003**: Every public page shall target a Lighthouse Performance score of 100 (mobile and desktop), per 23-PERFORMANCE-SPECIFICATION.md; no frontend framework runtime shall be shipped.

### Accessibility
- **NFR-A11Y-001**: Public pages shall meet WCAG 2.1 AA for contrast, keyboard navigation, and semantic structure.
- **NFR-A11Y-002**: All interactive components (forms, nav, cards) shall have appropriate ARIA labelling.
- **NFR-A11Y-003**: Every public page shall target a Lighthouse Accessibility score of 100, per 24-ACCESSIBILITY-SPECIFICATION.md.

### Best Practices
- **NFR-BP-001**: Every public page shall target a Lighthouse Best Practices score of 100 — no deprecated APIs, no console errors, no exposed secrets, no insecure/mixed-content requests.
- **NFR-BP-002**: The site shall be served entirely over HTTPS (Vercel default), with no broken links or images.

### SEO
- **NFR-SEO-006**: Every public page shall target a Lighthouse SEO score of 100, in addition to the specific structured-data/metadata requirements in FR-SEO above and 15-SEO-SPECIFICATION.md.

### Security
- **NFR-SEC-001**: OAuth tokens/secrets shall never be exposed client-side; stored server-side (Vercel env vars / encrypted session).
- **NFR-SEC-002**: All write endpoints shall require authenticated sessions; admin endpoints shall require an explicit admin role check.
- **NFR-SEC-003**: The Google Sheet(s) backing the system shall never be directly public; all access shall pass through the Apps Script service layer.
- **NFR-SEC-004**: All admin actions (badge award, certificate issue, revocation) shall be logged in an audit trail.

### Privacy
- **NFR-PRIV-001**: Private fields (email, OAuth tokens, IP/session metadata) shall never be returned by any public-facing API or page.
- **NFR-PRIV-002**: Members shall be able to request account deletion; private data shall be removed while the Member ID record is retired per FR-ID-006.

### Scalability
- **NFR-SCALE-001**: The architecture shall support growth from ~100 to 50,000+ members without a full rebuild, per the phased plan in 19-SCALABILITY.md.
- **NFR-SCALE-002**: GitHub contribution ingestion shall not perform per-member full-account polling at any scale.

### Error Handling, Logging, Monitoring
- **NFR-OPS-001**: All API routes shall return structured error responses (see 14-API-SPECIFICATION.md) with stable error codes.
- **NFR-OPS-002**: Webhook and scheduled-sync failures shall be logged with enough context to manually replay the affected event/window.
- **NFR-OPS-003**: The system shall surface a lightweight health/status check for the Apps Script layer so sync failures are detectable quickly at small operational scale.
