# 08 — Discord Integration

## Design Principle
Keep v1 minimal: verify account ownership and (optionally) server membership. Architect so bot-driven roles/automation can be added later without a redesign, per the brief's explicit "do not overbuild" instruction.

## OAuth
- Standard Discord OAuth2 flow implemented directly in a Vercel Serverless Function (`/api/auth/discord/connect` → `/callback`), scopes: `identify` (and `guilds` or `guilds.members.read` if server-membership verification is desired at connect time).
- Establishes `discord_id` as the internal identity field (never shown publicly).

## Account Connection
- Connect step runs after GitHub in the join flow (Google → GitHub → Discord → Member ID).
- Duplicate prevention: a Discord account already linked to another Hack Orbit member cannot be linked again (mirrors GitHub duplicate-prevention logic).

## Server Membership Verification
- At connection time, the system checks (via the `guilds` scope or a bot-side lookup) whether the connected Discord account is a member of the official Hack Orbit Discord server.
- Recommended v1 behaviour (flagged for confirmation): server membership is checked and stored as a flag, but is **not** a hard blocker for completing verification — a person who hasn't joined the Discord yet can still finish identity verification and join the server afterward, with the flag updating on next check. This avoids a brittle failure point in the join flow.

## Bot Architecture (future)
- A lightweight Discord bot service (could run as a small always-on process outside Vercel's serverless model, e.g. a minimal worker, or via Discord's Gateway through a scheduled Interactions endpoint) is the recommended future path once role automation is needed.
- Deferred scope: auto-assigning Discord roles based on Hack Orbit badges (e.g. "Contributor" role), announcing new certificates/badges in a Discord channel, slash commands for self-service profile lookup.

## Future Roles
- Planned role mapping (not built in v1): Founder, Verified Member, Contributor, Mentor — mirroring the badge system, synced one-directionally from Hack Orbit → Discord (Hack Orbit remains the source of truth).

## Identity Synchronisation
- v1: one-time check at connection. No ongoing polling of Discord membership status (keeps the system lightweight and avoids unnecessary API usage).
- Future: periodic re-check job, run alongside the GitHub reconciliation cron, once bot infrastructure exists.

## Failure Handling
- OAuth failure/denial → connect step fails gracefully, user can retry; does not affect an already-completed Google/GitHub connection.
- Discord API unavailable at connect time → membership flag left unset/null rather than blocking the flow; retried on next login or admin action.
