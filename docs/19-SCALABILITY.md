# 19 — Scalability

## Principle
Automate repetitive, high-volume operations (contribution ingestion). Keep low-frequency operations simple and manual (certificate emailing, badge awarding at small scale). Migrate off Google Sheets only when it becomes a genuine bottleneck — not preemptively.

## Stage: ~100 members
- Google Sheets + Apps Script comfortably handles all reads/writes.
- Manual badge/certificate awarding via Sheets rows is entirely practical — no admin UI needed.
- GitHub webhook + daily-ish reconciliation is more than sufficient.
- **No changes needed from the v1 architecture in this document set.**

## Stage: ~1,000 members
- Sheets row counts remain small relative to Google Sheets' practical limits (millions of cells); performance still fine for targeted range reads/writes.
- Consider tightening reconciliation interval (e.g. every 1–2 hours) if org repo activity has grown proportionally.
- Consider a lightweight internal admin form (still backed by Apps Script) if manual badge/certificate volume makes raw-Sheet-editing error-prone — this is a UI convenience, not an architecture change.

## Stage: ~10,000 members
- Watch for two concrete Sheets pressure points: (a) `Contributions` sheet row growth if org repo activity is high-volume, (b) Apps Script execution-time limits on any endpoint that scans more than a targeted range.
- Mitigation before migrating: archive old `Contributions`/`AuditLog` rows to a secondary "cold" sheet/tab beyond a rolling window (e.g. keep last 12 months hot), summarising older data into aggregate counters per member for profile display.
- This is the recommended point to start **planning** (not necessarily executing) the database migration described in 04-SYSTEM-ARCHITECTURE.md, since the Apps Script service-contract design already makes it a swap, not a rewrite.

## Stage: 30,000–50,000+ members
- **Recommended migration trigger.** At this scale, Google Sheets/Apps Script's row-count, execution-time, and concurrent-request quotas become a real operational risk rather than a comfortable margin.
- Migrate the data layer to a managed relational database (e.g. Postgres via a Vercel-compatible provider), preserving the exact entity/field structure from 05-DATA-MODEL.md — this is why that structure was deliberately designed to be "Sheets today, tables tomorrow."
- The public API contracts (14-API-SPECIFICATION.md) do not need to change; only the implementation behind them (Apps Script calls → direct DB queries) changes.
- GitHub contribution ingestion remains org-repo-scoped regardless of member count (07-GITHUB-INTEGRATION.md) — this is what keeps that specific pipeline scalable independent of the Sheets/DB decision.
- At this scale, introduce proper edge/CDN caching tuning (cache-control headers on the serverless-rendered profile/verify routes, per 04-SYSTEM-ARCHITECTURE.md and 23-PERFORMANCE-SPECIFICATION.md) for high-traffic profile pages and consider a shorter-TTL CDN-level cache for the `/verify` public metadata responses specifically, since revocation must still propagate promptly.

## What Should Never Require a Rebuild
- Public API contracts and page URLs (member profiles, verification page) — these stay stable across every stage above by design.
- The Member ID / Certificate ID formats — sequential and permanent regardless of backing store.
- The org-repo-scoped GitHub ingestion model — it scales with org activity, not member count, from day one.
