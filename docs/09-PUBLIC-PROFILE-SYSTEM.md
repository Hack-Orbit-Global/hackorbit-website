# 09 — Public Profile System

## Purpose
A public, shareable, contribution-and-achievement profile per verified member — proof of real work, not a private social feed.

## URL
`/profile/{member_id}` — e.g. `/profile/HO-000001`. Stable, permanent, never changes even if display name changes.

## Profile Fields
| Field | Editable by member? | Notes |
|---|---|---|
| Display name | Yes | Need not be legal name |
| Avatar | Yes | Optional |
| Bio | Yes | Short, plain text |
| Skills / technologies | Yes | Tag list |
| Member ID | No | System-assigned |
| GitHub profile link | No (derived) | From verified GitHub connection |
| LinkedIn / other professional links | Yes | Optional |
| Contributions | No (system-derived) | From 07-GITHUB-INTEGRATION.md pipeline |
| Projects | No (system-derived, admin-curated) | Official + community, with clear labelling |
| Badges | No (system/admin-derived) | Per 10-BADGE-AND-ACHIEVEMENT-SYSTEM.md |
| Certificates | No (admin-issued) | Per 11-CERTIFICATE-SYSTEM.md, links to `/verify` |
| Join date | No | Verification timestamp |

## Privacy Rules
- Never displayed: email, `google_sub`, OAuth tokens, Discord internal ID, IP/session data.
- Display name is intentionally decoupled from any legal-name field to protect member privacy while still allowing public accountability via the permanent Member ID.

## Official vs Community Project Labelling
Each project entry on a profile must visibly indicate `Official Hack Orbit Project` or `Community Project` — this distinction (per 00-PROJECT-CONTEXT.md) is load-bearing for the org's credibility and must never be ambiguous on the profile UI.

## SEO for Public Profiles
- Each profile page: unique `<title>` (`{display_name} — Hack Orbit Member {member_id}`), meta description summarising contributions/skills, canonical URL, Open Graph card (name, avatar, short bio).
- `Person` JSON-LD structured data per profile, with `memberOf` referencing the Hack Orbit `Organization` schema (see 15-SEO-SPECIFICATION.md).
- Profiles are indexable by default; a future member-controlled "make profile private/unlisted" toggle is out of scope for v1 but should be kept in mind architecturally (a `visibility` field could be added to Members without a schema rework).

## Shareable URLs
- Profile URLs are the canonical "proof of work" link members are expected to share (resumes, applications, socials) — designed to load fast and render meaningfully even via a bare link preview (OG image/card).

## Empty / New Member State
- A freshly-verified member's profile shows Member ID, display name, join date, and a clear prompt (e.g. "No contributions yet — see how to get started") rather than a broken-looking blank page.
