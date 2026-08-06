# 11 — Certificate System

## Principle
Certificates are organisation-issued recognitions (participation, winner, finalist, volunteer, organiser, contributor) — never presented as government/professional credentials. Public verification proves the *record exists and is valid*; it never hands out the certificate file itself.

## Certificate Generation
- Founder/admin approves a certificate record (via the Certificates sheet or a minimal admin form) with: type, member_id, event_name, achievement_description, issued_by, collaborating_org (optional), issue_date.
- On approval, the system generates a unique `certificate_id` and (optionally, for the emailing step) a certificate file/image — file generation is decoupled from the public record so the verification page never needs to touch the file.

## Certificate IDs
- Format: `HO-CERT-{year}-{sequence}`, e.g. `HO-CERT-2026-000001`. Sequence increments per year, using the same locked-counter pattern as Member IDs (06-IDENTITY-SYSTEM.md) to avoid collisions.

## Certificate Metadata (shown on verification)
```
Certificate ID:        HO-CERT-2026-000001
Status:                Valid
Certificate Type:      Hackathon Winner
Recipient:              {display_name}
Hack Orbit Member ID:  HO-000001
Issued By:              Hack Orbit
In Collaboration With:  {collaborating_org, if any}
Event:                  {event_name}
Achievement:            {achievement_description}
Issue Date:             {issue_date}
```

## Manual Email Distribution
- Certificate file generation and the admin's review/approval are systemised; the actual **sending** is a founder-controlled manual action (per the brief's explicit ~30–40/day, non-automated intent).
- The system's role: mark `file_generated = true` and expose a founder-only "download for sending" action — it does not send email itself in v1.

## Verification Page (`/verify`)
- Public, simple: enter a certificate ID → look up via Apps Script → render metadata only, per FR-CERT-003.
- No certificate image/PDF is ever served from this page or its API route.

## Invalid Certificate Behaviour
- Unknown ID → a plain "No certificate found with this ID" state. No stack traces, no hints about valid ID ranges/format beyond the public format itself.

## Revoked Certificate Behaviour
- Known but revoked ID → explicitly shows **Status: Revoked**, rather than pretending it doesn't exist — this is the honest, tamper-evident behaviour (matches FR-CERT-005) and prevents someone from claiming "revoked = never existed."

## Organisation / Collaboration Fields
- `issued_by` defaults to "Hack Orbit"; `collaborating_org` is optional free text for co-hosted recognitions, shown only when present.

## Public Verification Security
- Verification lookups are rate-limited (Apps Script layer) to prevent ID enumeration/scraping.
- Certificate IDs are sequential (not secret) by design — the record being public-but-metadata-only is the actual protection, not ID obscurity. This must be a conscious tradeoff the founder is aware of: anyone can enumerate sequential IDs and see metadata, but never a downloadable file, and revoked/invalid states are always honestly reported.
