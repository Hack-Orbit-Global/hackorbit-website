# 18 — Security & Privacy

## Authentication Security
- Since there is no frontend framework, OAuth flows are implemented directly and deliberately kept simple: each provider (Google, GitHub, Discord) has a small, isolated `start`/`callback` function pair (see 14-API-SPECIFICATION.md) making direct, documented calls to the provider's own token/userinfo endpoints — no ad-hoc/undocumented OAuth logic.
- Sessions use signed, encrypted JWTs (via a small, well-maintained library such as `jose`) in `httpOnly`, `secure`, `sameSite=lax` cookies — the same session properties a framework like NextAuth would provide, implemented explicitly and kept auditable in `lib/session.js` (25-PROJECT-FOLDER-STRUCTURE.md).

## OAuth Security
- Minimal scopes requested per provider (see 06/07/08). No unnecessary broad permissions (e.g. no Gmail/Drive scope for Google; no repo-write scope for GitHub member connection).
- `state` parameters are generated per auth attempt (signed/short-lived, stored in a temporary cookie) and verified on callback to prevent CSRF; PKCE is used for the Google flow. These are implemented explicitly in `lib/oauth/*.js` — since no framework provides them automatically, they are part of the reviewed, tested surface area rather than assumed.

## Token Security
- Provider access/refresh tokens live only in the server-side session store — never returned in any API response, never written to the Sheets `IdentityConnections` tab in plaintext (a reference/rotation pointer only, per 12-GOOGLE-SHEETS-ARCHITECTURE.md).

## Secrets
- All secrets (OAuth client secrets, Apps Script shared service key, webhook signing secret) stored as Vercel encrypted environment variables, scoped to Production/Preview as appropriate — never committed to the repo.

## API Security
- Every write endpoint requires a valid session (NFR-SEC-002); admin endpoints additionally check `AdminRecords` role.
- All input validated/sanitised at the API boundary (Zod schemas) before reaching Apps Script.
- GitHub webhook payloads validated via HMAC signature (`X-Hub-Signature-256`) before processing.

## Google Sheets Protection
- The spreadsheet is never shared publicly or with "anyone with the link"; only the Apps Script's own execution identity (the founder's Google account, as script owner) can access it.
- The Apps Script Web App is deployed with execution as "Me" (owner) and access "Anyone" (so Vercel can call it), gated entirely by the shared service-key check inside the script — this is the actual security boundary, since the Web App URL itself is not secret-proof.

## Personal Data Handling
- Private fields (email, `google_sub`, Discord internal ID, tokens) are never returned by any public or member-facing API response (NFR-PRIV-001) — enforced at the Apps Script response-shaping layer, not just the frontend, so there's no path that accidentally leaks them.

## Public/Private Data Separation
- Structural, not just conventional: public API responses are built from an explicit allow-list of fields (per entity, per 05-DATA-MODEL.md's Privacy column), not a strip-list — new fields added later are private-by-default until explicitly allow-listed for public exposure.

## Account Deletion
- Deletion request → private fields purged, Member ID retired (never reassigned), public contribution/badge/certificate history handling per the founder-confirmation note in 06-IDENTITY-SYSTEM.md.

## Abuse Prevention
- Duplicate-identity prevention at signup/connection time (06-IDENTITY-SYSTEM.md).
- Certificate verification rate-limited to deter enumeration/scraping (11, 13, 14).
- Admin actions require role check + are all audit-logged, deterring/making-traceable any misuse of manual award/issue/revoke powers.

## Rate Limiting
- Applied at both the Vercel API layer (per-session/per-IP) and the Apps Script layer (per-endpoint, especially the public `verifyCertificate` action) — see 14-API-SPECIFICATION.md for specific limits.

## Best Practices (Lighthouse)
- Entire site served over HTTPS (Vercel default); no mixed-content requests.
- No deprecated/soon-to-be-removed browser APIs used in `js/*`.
- No console errors/warnings shipped to production (checked per milestone, per 20-IMPLEMENTATION-PLAN.md).
- No exposed source maps revealing internal logic in production builds, unless intentionally scoped for debugging.
- Dependencies kept minimal (per 22/25) specifically to reduce known-vulnerable-library risk — a Lighthouse Best Practices check.

## Audit Logging
- Every admin action (badge award/revoke, certificate issue/revoke, admin role grant) writes to `AuditLog` with actor, action, target, timestamp — the primary integrity mechanism for a small, manually-operated system (per 10 and 13).
