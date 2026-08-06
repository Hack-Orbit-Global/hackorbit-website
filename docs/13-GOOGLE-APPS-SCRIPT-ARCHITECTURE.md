# 13 — Google Apps Script Architecture

## Role
Apps Script is deployed as a single Web App (`doPost`/`doGet` entry points) acting as the **only** interface between Vercel and Google Sheets. It never trusts the caller by default — every request is authenticated and validated before touching a sheet.

## Endpoints (internal — called only by Vercel server-side code, never the browser)
| Action | Method | Purpose |
|---|---|---|
| `getMember` | POST | Fetch one member's public fields by member_id |
| `createMember` | POST | Create a `pending` member on Google sign-in |
| `linkIdentity` | POST | Link GitHub/Discord to an existing member, enforcing uniqueness |
| `finalizeVerification` | POST | Promote pending → verified, assign Member ID |
| `updateProfile` | POST | Member edits own public fields |
| `addContribution` | POST | Insert a contribution record (idempotent) |
| `listMemberContributions` | POST | Fetch a member's contributions for profile rendering |
| `awardBadge` | POST | Admin-only badge award |
| `revokeBadge` | POST | Admin-only badge revocation |
| `issueCertificate` | POST | Admin-only certificate creation |
| `verifyCertificate` | POST | Public — lookup by certificate_id, metadata only |
| `revokeCertificate` | POST | Admin-only |
| `getNextId` | internal | Locked counter increment, used by createMember/issueCertificate |

## Authentication
- Every request from Vercel includes a shared secret header (`X-HO-Service-Key`), stored as an env var on both sides. Apps Script rejects any request missing/mismatching it.
- Admin-only actions additionally require an `actor_member_id` whose role (from `AdminRecords`) is checked before proceeding.
- The public `verifyCertificate` endpoint is the one action reachable indirectly by end users (via the Vercel API route, not directly) and has no admin requirement, but is rate-limited (see below).

## Validation
- Every endpoint validates required fields and types before writing (Apps Script has no schema enforcement natively, so this must be explicit code, not assumed).
- String fields are length-capped and sanitised (e.g. bio length limit) to prevent sheet bloat or formula-injection via cell content (never allow user input starting with `=`, `+`, `-`, `@` to be written raw — prefix-escape it).

## Rate Limiting
- Apps Script itself has execution quotas (daily runtime, per-user calls); to protect against abuse:
  - `verifyCertificate` (public-facing): capped via a simple in-sheet request-log check (e.g. max N lookups per IP-hash per minute), recommended default **30 requests/minute** global, adjustable.
  - Write endpoints: only reachable via authenticated Vercel routes, which themselves should apply per-session rate limits (e.g. profile updates max 1/few seconds) before ever calling Apps Script.

## Sheet Operations
- All reads/writes use targeted range operations (`getRange`/`setValues`) rather than full-sheet reads, to stay within Apps Script's execution time limits as sheets grow.
- Counter increments (Member ID, Certificate ID) use `LockService.getScriptLock()` to guarantee atomicity under concurrent requests.

## Public Data Filtering
- Apps Script is responsible for **stripping private fields before returning any response** — e.g. `getMember` never includes `email`, `google_sub`, or `discord_id` in its response payload, regardless of what's stored. This is the actual privacy enforcement boundary (NFR-PRIV-001), not just a frontend convention.

## Certificate Verification
- `verifyCertificate` looks up by `certificate_id`, returns the metadata block from 11-CERTIFICATE-SYSTEM.md, or a generic not-found response — never differentiates "wrong format" vs. "not found" in a way that aids enumeration probing.

## Member Lookup
- `getMember` is keyed by `member_id` only (not email/google_sub) for any externally-reachable lookup path, keeping the anchor identity fields fully internal.

## Error Responses
- Structured JSON: `{ "ok": false, "error_code": "MEMBER_NOT_FOUND", "message": "..." }` — stable `error_code` values consumed by the Vercel API layer to map to appropriate HTTP statuses (see 14-API-SPECIFICATION.md).

## Logging
- Apps Script's own `Logger`/Stackdriver logging captures every write action's actor, action, and outcome — mirrored into the `AuditLog` sheet for admin-visible actions (badge/certificate/admin operations), and kept lightweight for high-volume actions (contribution ingestion logs to Stackdriver only, not the AuditLog sheet, to avoid sheet bloat).
