# 10 — Badge & Achievement System

## Badge Model
Defined once (see 05-DATA-MODEL.md `Badges`), then awarded per-member (`Member Badges`). Every badge has an `award_type` of `automatic` or `manual`.

## Achievement Model
Achievements are represented as awarded badges plus certificates (11-CERTIFICATE-SYSTEM.md) — Hack Orbit does not need a third, separate "achievements" table; a badge award record *is* an achievement record. This avoids duplicate/overlapping data models per the brief's "don't overengineer" principle.

## Example Badge Set (v1)
| Badge | Award type | Trigger / criteria |
|---|---|---|
| Founder | Manual | Assigned once, to `HO-000001` |
| Early Member | Automatic | First N verified members (e.g. first 100) |
| Open Source Contributor | Automatic | First merged PR to any official repo |
| Community Builder | Manual | Admin discretion (e.g. helping others, organising) |
| Outstanding Contributor | Manual | Admin discretion, sustained high-quality contribution |
| Mentor | Manual | Admin discretion |
| Hackathon Winner | Manual | Tied to a specific event/certificate |

## Automatic Awarding
- Evaluated at the point a relevant event occurs (e.g. right after a Contribution record is written, check "is this the member's first merged PR?" → award "Open Source Contributor" if so).
- Trigger conditions are simple, auditable rules stored in `trigger_condition` — not a general rules engine. Keep this deliberately simple in v1.

## Manual Awarding
- Restricted to accounts with an `admin`/`founder` role (05-DATA-MODEL.md `Admin Records`).
- In v1, the practical mechanism is: admin adds a row to the "Member Badges" Google Sheet (or uses a minimal admin form backed by an Apps Script endpoint) — no bespoke admin dashboard required for v1.

## Revocation
- Sets `status = revoked` with a `revoke_reason`, logged to Audit Records. Revoked badges are **not deleted** — they remain visible in the audit trail even though they no longer render on the public profile, preserving accountability.

## Audit Trail
- Every award and revocation writes an Audit Record (`actor`, `action`, `target`, `timestamp`). This is the primary integrity guarantee for a small-admin-team system — not automated fraud detection, just an honest, reviewable log.

## Verification
- Badges are not independently "verified" the way certificates are (no public `/verify` lookup for badges) — they're simply visible, timestamped, and audit-logged on the profile itself. If cross-checking is ever needed, the Audit Records sheet is the source of truth.

## Public Display
- Rendered on the profile as an icon + name + award date; revoked badges are omitted from the default public view (kept in audit trail only), consistent with FR-BADGE-004/005.
