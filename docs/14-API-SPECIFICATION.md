# 14 — API Specification

All endpoints below are Vercel serverless API routes (`/api/...`). They are the *only* thing the browser talks to — Apps Script is never called client-side. Error responses share a common shape:
```json
{ "ok": false, "error_code": "STRING_CODE", "message": "human readable" }
```

## Authentication Endpoints (plain Vercel Serverless Functions, no auth framework)
| Route | Method | Purpose |
|---|---|---|
| `/api/auth/google/start` | GET | Redirects to Google's OAuth consent screen (with `state`) |
| `/api/auth/google/callback` | GET | Exchanges code, creates/finds `pending` member, sets signed session cookie |
| `/api/auth/github/connect` | GET | Redirects to GitHub OAuth (requires existing session) |
| `/api/auth/github/callback` | GET | Exchanges code, links GitHub to session's member, enforces uniqueness |
| `/api/auth/discord/connect` | GET | Redirects to Discord OAuth (requires existing session) |
| `/api/auth/discord/callback` | GET | Exchanges code, links Discord to session's member, enforces uniqueness |
| `/api/auth/session` | GET | Returns current session status (used by client JS on `join.html`/`settings.html`) |
| `/api/auth/logout` | POST | Clears the session cookie |

Each handler is a small, independent Node.js function using direct HTTPS calls to the provider's token/userinfo endpoints (no OAuth SDK dependency required) — see 04-SYSTEM-ARCHITECTURE.md and 18-SECURITY-AND-PRIVACY.md for the PKCE/state/cookie details.

## `GET /profile/{member_id}` (HTML)
- **Auth**: None (public)
- Rendered server-side by a Vercel Serverless Function per 04-SYSTEM-ARCHITECTURE.md / 22-FRONTEND-ARCHITECTURE.md — returns a complete HTML document (shared nav/footer + profile template), not JSON.
- **Errors**: `404` (rendered as a proper HTML not-found page, not a raw JSON error)

## `GET /api/members/{member_id}` (JSON)
- **Auth**: None (public)
- **Response 200**: `{ member_id, display_name, avatar_url, bio, skills[], github_username, linkedin_url, is_founder, joined_at, contributions[], badges[], certificates[], projects[] }` (only public fields, per 09)
- **Errors**: `404 MEMBER_NOT_FOUND`
- Used by client-side JS for any progressive-enhancement bits on the profile page (e.g. live-refreshing a contributions list) — the initial page load itself comes from the HTML route above, not this endpoint.

## `PATCH /api/members/me`
- **Auth**: Required (session)
- **Request**: `{ display_name?, avatar_url?, bio?, skills?[], linkedin_url?, other_links?[] }`
- **Response 200**: updated public profile object
- **Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `429 RATE_LIMITED`

## `POST /api/identity/link`
- **Auth**: Required (session, mid-join-flow)
- **Request**: `{ provider: "github" | "discord" }` (triggers provider OAuth redirect, then callback finalizes)
- **Response 200**: `{ linked: true, provider }`
- **Errors**: `409 ALREADY_LINKED_TO_ANOTHER_MEMBER`, `401 UNAUTHENTICATED`

## `POST /api/identity/finalize`
- **Auth**: Required (session)
- **Response 200**: `{ member_id: "HO-000042", status: "verified" }`
- **Errors**: `400 INCOMPLETE_VERIFICATION` (missing a required connection)

## `POST /api/webhooks/github`
- **Auth**: GitHub webhook signature (`X-Hub-Signature-256`) validated server-side
- **Request**: raw GitHub event payload
- **Response 200**: `{ ok: true }` (or `202` if queued for async processing)
- **Errors**: `401 INVALID_SIGNATURE`, `500` (triggers GitHub's built-in retry)

## `GET /api/certificates/verify?id={certificate_id}` (JSON)
- **Auth**: None (public), rate-limited
- **Response 200 (found)**: metadata block per 11-CERTIFICATE-SYSTEM.md
- **Response 200 (not found)**: `{ ok: true, found: false }`
- **Errors**: `429 RATE_LIMITED`
- Used by `verify.html`'s client-side form submission for the interactive lookup experience.

## `GET /verify-result/{certificate_id}` (HTML)
- **Auth**: None (public)
- Server-rendered HTML per 04/22, so a shared certificate result link is itself indexable and link-previewable (Open Graph), not just a client-side-only result state.

## `POST /api/admin/badges/award`
- **Auth**: Required, admin role
- **Request**: `{ member_id, badge_id, note? }`
- **Response 200**: `{ award_id }`
- **Errors**: `403 FORBIDDEN`, `400 VALIDATION_ERROR`

## `POST /api/admin/badges/revoke`
- **Auth**: Required, admin role
- **Request**: `{ award_id, reason }`
- **Response 200**: `{ ok: true }`
- **Errors**: `403 FORBIDDEN`, `404 AWARD_NOT_FOUND`

## `POST /api/admin/certificates/issue`
- **Auth**: Required, admin role
- **Request**: `{ member_id, type, event_name?, achievement_description, collaborating_org?, issue_date }`
- **Response 200**: `{ certificate_id }`
- **Errors**: `403 FORBIDDEN`, `400 VALIDATION_ERROR`

## `POST /api/admin/certificates/revoke`
- **Auth**: Required, admin role
- **Request**: `{ certificate_id, reason }`
- **Response 200**: `{ ok: true }`
- **Errors**: `403 FORBIDDEN`, `404 CERT_NOT_FOUND`

## `GET /api/health` (JSON)
- **Auth**: None (public), rate-limited
- **Purpose**: Lightweight health check (NFR-OPS-003) that pings the Apps Script `doGet` endpoint and reports reachability/latency so sync failures are detectable quickly.
- **Response 200**: `{ ok: true, status: "healthy", service: "hack-orbit-website", version, timestamp, checks: { apps_script: { status: "healthy", http_status, latency_ms, detail } } }`
- **Response 503**: `{ ok: false, status: "degraded", checks: { apps_script: { status: "unhealthy" | "not_configured", latency_ms, detail } } }` — when Apps Script is unreachable, returns a non-2xx body, or `APPS_SCRIPT_URL` is unset
- **Errors**: `429 RATE_LIMITED` (20 req/min per IP), `405` for non-GET

## Rate Limits (applied at the Vercel edge/middleware level)
| Endpoint group | Limit |
|---|---|
| Public reads (profile, verify) | 30 req/min per IP |
| Health check (`/api/health`) | 20 req/min per IP |
| Authenticated writes (profile update) | 10 req/min per session |
| Admin actions | 20 req/min per admin session |
| GitHub webhook | Governed by GitHub's own delivery rate, not client-limited |

## Validation
All request bodies validated with a schema library (e.g. Zod) at the API route boundary before any Apps Script call — invalid input never reaches the Sheets layer.
