# 07 — GitHub Integration

## Design Principle
Track contribution activity **within the official Hack Orbit GitHub organisation's repositories only**. Never continuously scan a member's entire personal GitHub account. This keeps the system accurate to what actually matters (org contributions), API-rate-limit-safe, and scalable to 30k–50k+ members.

## OAuth
- Standard GitHub OAuth App (or GitHub App, preferred for finer-grained, org-aware permissions) used purely to establish and verify account ownership at connection time.
- Minimal scopes requested: `read:user` (identity) — no repo-write scopes needed for the member-facing connection itself.

## Organisation Membership
- Recommended (flagged for confirmation): full "verified contributor" status does not strictly require GitHub org membership/invitation, since public contributions (PRs from forks) are attributable without org membership. Org membership may instead be an additional, optional badge/role trigger (e.g. "Org Member" badge) rather than a hard gate on identity verification.

## Repository Contribution Tracking
- Scope: only repositories under the Hack Orbit GitHub organisation.
- Tracked types (v1): merged pull requests, closed issues (opened and resolved by a member), submitted code reviews. Documentation-only contributions initially tracked via the same "merged PR" path (docs PRs count) rather than a separate mechanism.

## Webhooks
- A single organisation-level webhook is registered once on the Hack Orbit GitHub org, subscribed to: `pull_request` (merged), `issues` (closed), `pull_request_review` (submitted).
- Payloads are delivered to `POST /api/webhooks/github`.
- Each webhook delivery includes a unique `X-GitHub-Delivery` ID — used as the idempotency key for `contribution_id` so replayed/duplicate deliveries never double-count.

## Scheduled Synchronisation (Reconciliation)
- A Vercel Cron job runs on a fixed interval (recommended: every 6 hours, adjustable) and paginates the org's repos' recently-closed PRs/issues via the GitHub REST/GraphQL API, comparing against existing `contribution_id`s to backfill anything the webhook missed (e.g. due to downtime).
- Uses GraphQL batched queries where possible to minimise API call count against rate limits, rather than one call per repo per member.

## API Rate Limits
- Org-scoped, batched queries only — never a per-member "check their GitHub" loop.
- Reconciliation job respects GitHub's rate-limit headers and backs off/retries with exponential backoff if throttled.
- A GitHub App installation token (higher rate limits than a personal OAuth token) is recommended for the reconciliation job specifically.

## Contribution Processing
```
GitHub org event (webhook or reconciliation)
  → validate signature / dedupe by delivery ID
  → resolve GitHub actor → Hack Orbit member via linked github_username
  → if unresolved (contributor not yet a Hack Orbit member): queue/ignore, optionally re-attempt resolution on next reconciliation
  → write Contribution record via Apps Script
  → evaluate automatic badge triggers (e.g. "first merged PR")
```

## Idempotency & Duplicate Event Prevention
- Idempotency key = GitHub delivery ID (webhook path) or a deterministic hash of (repo, PR/issue number, event type) for reconciliation-sourced records.
- Apps Script write endpoint checks for existing `contribution_id` before inserting.

## Failure Handling
- Webhook signature invalid → reject with 401, log, no write.
- Apps Script write failure → return 5xx to GitHub (triggers GitHub's own webhook retry), and log for manual review if retries exhaust.
- Unresolvable actor (not a Hack Orbit member) → non-error, simply not attributed; visible in an internal "unattributed contributions" log for potential future backfill if that person later joins.

## Scalability to 30k–50k+ Members
- Because tracking is org-repo-scoped (not per-member account-scoped), the ingestion cost is bounded by **organisation activity volume**, not member count — this is what makes the design scale without a rebuild.
- As org repo count/activity grows, the reconciliation job's per-run cost grows with repo count, not member count; mitigate by increasing interval or sharding the job by repo group if needed at high volume.
