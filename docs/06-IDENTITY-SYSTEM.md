# 06 — Hack Orbit Identity System

## Overview
A Hack Orbit identity is an **organisation-internal verified identity** — not a government identity, not a KYC product. It exists to guarantee: one real person ↔ one Member ID ↔ one public profile, anchored by Google and confirmed by GitHub + Discord ownership.

## Registration Flow
1. User clicks **Join Hack Orbit**.
2. User authenticates with Google (redirected to Google's OAuth consent screen by a Vercel Serverless Function, `/api/auth/google/start` → `/callback`). A `pending` member record is created keyed on `google_sub`.
3. User is prompted to connect GitHub (OAuth). System checks the GitHub account isn't already linked to another member.
4. User is prompted to connect Discord (OAuth). System checks the Discord account isn't already linked to another member, and confirms membership in the Hack Orbit Discord server.
5. System verifies all three connections are present and unique.
6. System transitions the member from `pending` to `verified`, generates and assigns the next sequential Member ID.
7. Member is redirected to their new public profile at `/profile/{member_id}`.

## Google Login
- Primary and first-required step; establishes `google_sub` as the permanent identity anchor.
- Only basic profile/email OAuth scopes requested — no broader Google account access.

## GitHub Connection
- OAuth-based only; a manually-typed GitHub username never counts as verification (per FR-GH-001).
- Establishes `github_username`/`provider_account_id` on the member record, used later for contribution attribution.

## Discord Connection
- OAuth-based; confirms account ownership and (optionally, if the bot/API access allows) server membership.
- Deferred: role sync, bot-driven perks (see 08-DISCORD-INTEGRATION.md).

## Verification
- A member is **fully verified** only when Google + GitHub + Discord are all linked and each is uniquely owned (no other member already holds that provider account).
- Partial (`pending`) members have a session but no Member ID and no public profile — this avoids issuing IDs to abandoned signups.

## Member ID Generation
- Format: `HO-000001`, zero-padded to 6 digits, incrementing per verification event.
- Generation happens atomically at the Apps Script layer (single point of write) to avoid race conditions producing duplicate IDs — implemented as a locked "next ID" counter row in the Members sheet, incremented via `LockService` in Apps Script.
- `HO-000001` reserved for the founder's own verified account.

## Duplicate Prevention
- Enforced at three points: (a) `google_sub` uniqueness at signup, (b) `github` provider_account_id uniqueness at GitHub connect, (c) `discord` provider_account_id uniqueness at Discord connect. Any collision blocks the action with a clear error before any Member ID is issued.

## Account Recovery
- Recovery is entirely delegated to Google's own account recovery. Hack Orbit does not build or maintain a separate password/recovery system, consistent with Google being the anchor identity.

## Account Deletion
- Member-initiated deletion request → admin/system marks the member `deleted`, removes private fields (email, tokens, Discord ID) from active use, and **retires** the Member ID permanently (never reassigned, per FR-ID-006).
- Public contribution/badge/certificate history tied to that Member ID may be retained in de-identified/aggregate form per the org's own retention decision — recommended default: retain contribution counts under the retired ID without a live public profile page, to preserve the integrity of any certificates already issued referencing that ID. *(Flagged for founder confirmation.)*

## Public Identity vs Private Identity Data
| Public | Private/Internal |
|---|---|
| Member ID, display name, avatar, bio, skills, GitHub username, contributions, badges, certificates, project links | Email, google_sub, OAuth tokens, Discord internal ID, raw session data |

## Identity Lifecycle States
```
(none) → pending (Google only) → verified (Google+GitHub+Discord, Member ID issued) → deleted (retired ID, private data purged)
```
