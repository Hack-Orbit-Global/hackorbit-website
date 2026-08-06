# 26. Deployment Runbook

Production deployment checklist for the Hack Orbit website. Covers the three runtime
layers this system is built on:

1. **Vercel** — static output + Serverless Functions + Cron.
2. **Google Sheets + Apps Script** — the data layer and the only place Sheets is touched.
3. **External providers** — Google, GitHub, Discord OAuth apps and the GitHub webhook.

The runbook mirrors Milestone 12 of `implementation.md`.

---

## 1. Prerequisites

- Node.js 18+ (local), npm.
- A Vercel project (Hobby/Pro) with the repo connected.
- A Google account with a spreadsheet for Hack Orbit data.
- OAuth app registrations: Google (web), GitHub (OAuth App), Discord (OAuth2).
- A GitHub organisation (set as `GITHUB_ORG_NAME`) whose repos will be tracked.

---

## 2. Environment variables (Vercel)

Configure these in **Vercel → Project → Settings → Environment Variables** for
Production and Preview:

| Variable | Required | Notes |
|---|---|---|
| `SITE_URL` | Yes | Canonical base, e.g. `https://hackorbit.com` (no trailing slash). Used for SSR canonicals, OAuth redirect URIs, sitemap. |
| `JWT_SECRET` | Yes | `>=32` random bytes. Used to sign the `ho_session` cookie (HS256). |
| `APPS_SCRIPT_URL` | Yes | Deployed Web App URL from §4. Alias `GAS_WEBAPP_URL` also accepted. |
| `HO_SERVICE_KEY` | Yes | Shared secret with the Apps Script script property (§4). Alias `SHARED_SERVICE_KEY` also accepted. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth web client. |
| `GOOGLE_CLIENT_SECRET` | Yes | |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App. Scope used: `read:user`. |
| `GITHUB_CLIENT_SECRET` | Yes | |
| `DISCORD_CLIENT_ID` | Yes | Discord OAuth2 app. Scope used: `identify`. |
| `DISCORD_CLIENT_SECRET` | Yes | |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret configured on the GitHub webhook (§5). |
| `GITHUB_ORG_NAME` | Conditional | Required for contribution tracking/reconciliation. |
| `GITHUB_TOKEN` | Conditional | PAT (or fine-grained token) with read access to org repos + PRs/issues. Required for the cron. |
| `CRON_SECRET` | Conditional | Vercel Cron supplies `Authorization: Bearer <CRON_SECRET>` to the cron endpoint. |

`NODE_ENV` is set automatically by Vercel; cookie `Secure` flags derive from it.

---

## 3. OAuth redirect URIs

Register the exact callback paths on each provider:

- Google: `<SITE_URL>/api/auth/google/callback`
- GitHub: `<SITE_URL>/api/auth/github/callback`
- Discord: `<SITE_URL>/api/auth/discord/callback`

Connect/start endpoints are reached by the browser from `<SITE_URL>/api/auth/*`
and need no provider registration beyond the callbacks above.

---

## 4. Google Sheets + Apps Script

1. Create a spreadsheet (the single source of truth). Copy `apps-script/*.gs`
   (`Code`, `counters`, `members`, `contributions`, `badges`, `certificates`, `setup`)
   into a **new Apps Script project bound to that spreadsheet** (Extensions →
   Apps Script), one file per `.gs` file.
2. Script properties → add:
   - `HO_SERVICE_KEY` = the same random value used for Vercel's `HO_SERVICE_KEY`.
3. Deploy → **New deployment** → type **Web app**:
   - Execute as: **Me**.
   - Who has access: **Anyone**.
   - Copy the Web App URL → set as `APPS_SCRIPT_URL` in Vercel.
4. Verify auth: `curl -X POST <APPS_SCRIPT_URL> -H 'Content-Type: application/json'
   -d '{"service_key":"<HO_SERVICE_KEY>","action":"getMemberByGoogleSub","payload":{}}'`
   should return `{"ok":false,"error_code":"VALIDATION_ERROR"}` (auth OK, payload
   rejected) and `{"ok":false,"error_code":"UNAUTHORIZED"}` when the key is wrong.
   `doGet` returns a public service banner; all actions require `service_key`.
5. Seed the schema + data:
   `curl -X POST <APPS_SCRIPT_URL> -H 'Content-Type: application/json'
   -d '{"service_key":"<HO_SERVICE_KEY>","action":"runSetup","payload":{}}'`
   Creates 11 tabs, seeds the 5 badges, founder member `HO-000001`, admin record,
   and awards the founder badge.
6. **Set the founder's real Google email**: in the `Members` tab, row `HO-000001`,
   replace `founder@hackorbit.example` (column `email`) with the founder's actual
   Gmail address, and keep `google_sub` empty and `is_founder` = `TRUE`. The first
   Google sign-in with that email adopts the founder identity (status → `verified`,
   `HO-000001`, no new ID issued).

> **Do not** grant the Sheets editor to the site or share `SHARED_SERVICE_KEY` beyond
> the script property + Vercel env var. All data access goes through the Apps Script
> Web App.

---

## 5. GitHub webhook

On the tracked organisation (Settings → Webhooks → Add webhook):

- **Payload URL:** `<SITE_URL>/api/webhooks/github`
- **Content type:** `application/json`
- **Secret:** the `GITHUB_WEBHOOK_SECRET` value
- **Events:** `pull_request`, `issues`, `pull_request_review`

Behaviour:
- HMAC `sha256` is verified via `X-Hub-Signature-256` (timing-safe).
- Only merged PRs, closed issues, and submitted reviews are ingested; bot actors are ignored.
- Repos outside `GITHUB_ORG_NAME` are skipped.
- Idempotent via the `X-GitHub-Delivery` id as `contribution_id`.

---

## 6. Deploy

```bash
npm install
npm run build          # builds frontend/public + sitemap.xml + robots.txt
npm test               # 34 tests, expect 0 failures
```

Then `vercel --prod` (or push to the connected Git branch). `vercel.json` sets
`outputDirectory: public`, the `/profile/:id` and `/verify-result/:id` rewrites,
cache headers, and the 6-hourly cron.

---

## 7. Post-launch verification

Run the QA checklist from `implementation.md` §8:

1. **Join flow** — `/join`: Google → GitHub → Discord → Finalize; new member gets
   `HO-XXXXXX`; founder gets `HO-000001`.
2. **Public profile** — `/profile/HO-000001` returns pre-rendered HTML with Person
   schema, no private email, 300s cache.
3. **Settings** — `/settings` PATCH round-trips display name/bio/skills/links.
4. **Webhook** — POST a signed payload twice; second delivery returns
   `processed:false, reason:"duplicate"`.
5. **Certificate** — issue via `/api/admin/certificates/issue`, then `/verify` and
   `/verify-result/<id>` show metadata only (no file link); revoke and re-check.
6. **Cron** — Vercel Cron logs show `/api/cron/github-reconcile` with
   `GITHUB_ORG_NAME`/`GITHUB_TOKEN` set (or `skipped` when not).
7. **Lighthouse** — 100 on Performance, Accessibility, Best Practices, SEO.

## 8. Env var quick reference

| Runtime | Key | Where |
|---|---|---|
| Vercel | `SITE_URL`, `JWT_SECRET`, `APPS_SCRIPT_URL`, `HO_SERVICE_KEY`, OAuth creds, `GITHUB_WEBHOOK_SECRET`, `GITHUB_ORG_NAME`, `GITHUB_TOKEN`, `CRON_SECRET` | Vercel env vars |
| Apps Script | `HO_SERVICE_KEY` | Script Properties |
| GitHub org | Webhook secret | Webhook config |
