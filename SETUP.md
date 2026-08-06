# Hack Orbit Website — Setup Guide

> **Current status: static-only site.** The site currently ships as a purely static
> frontend (10 pages, no Serverless Functions). Membership onboarding, profiles,
> certificate verification, OAuth, and the GitHub webhook are **on hold** — the
> `api/` layer was removed from the repo. Sections 1–4 below document the full
> backend setup for when those features are re-enabled; for today's static deploy,
> jump straight to §5.

Complete guide to get every Hack Orbit feature running: static site, OAuth
sign-in, member IDs, public profiles, GitHub contribution tracking, Discord
linking, badges, and certificate verification.

Three runtime layers are involved:

1. **Vercel** — static pages + Serverless Functions (`/api/*`) + cron
2. **Google Sheets + Apps Script** — the database and the only place Sheets is touched
3. **External providers** — Google / GitHub / Discord OAuth apps and the GitHub org webhook

> Detailed engineering references: `docs/26-DEPLOYMENT-RUNBOOK.md`, `docs/14-API-SPECIFICATION.md`, `docs/12-GOOGLE-SHEETS-ARCHITECTURE.md`.

---

## 0. Prerequisites

- Node.js 18+ and npm (local only)
- A Vercel account and a project connected to this repo
- A Google account (for Sheets + Apps Script)
- Google, GitHub, and Discord accounts to create OAuth apps
- A GitHub organisation whose repos you want to track for contributions

---

## 1. Register OAuth apps

Create a web OAuth app on each provider and register the exact callback URL.

| Provider | Where | Callback URL |
|---|---|---|
| Google | Google Cloud Console → APIs & Services → Credentials → **OAuth Client (Web)** | `https://<YOUR_SITE>/api/auth/google/callback` |
| GitHub | GitHub → Settings (or org) → Developer settings → **OAuth Apps** | `https://<YOUR_SITE>/api/auth/github/callback` |
| Discord | Discord Developer Portal → Applications → your app → **OAuth2** | `https://<YOUR_SITE>/api/auth/discord/callback` |

Replace `<YOUR_SITE>` with your deployed domain (or `http://localhost:3000` for local dev via `vercel dev`).

Save the generated IDs/secrets for step 4.

---

## 2. Create the Google Sheet + Apps Script backend

1. Create a new Google Spreadsheet (this is the single source of truth).
2. Open **Extensions → Apps Script** (this binds the script to the spreadsheet).
3. Create one script file per `.gs` file in `apps-script/`:
   - `Code.gs` — main dispatcher + shared helpers
   - `members.gs` — member creation, identity checks
   - `counters.gs` — sequential `HO-XXXXXX` ID counters
   - `contributions.gs` — GitHub event logging & aggregation
   - `badges.gs` — badge lookup & awarding
   - `certificates.gs` — certificate issue/revoke/verify
   - `setup.gs` — one-time schema + seed builder
4. **Project Settings → Script properties → Add property**:
   - `HO_SERVICE_KEY` = a long random string (the shared secret)
5. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, then copy the **Web app URL** → this is your `APPS_SCRIPT_URL`.

> Your `.gs` files cannot be uploaded via git — Google requires pasting them into
> the Apps Script editor. (Optionally install `clasp` to deploy from CLI; see §6.)

### Verify the connection

```bash
curl -X POST <APPS_SCRIPT_URL> -H 'Content-Type: application/json' \
  -d '{"service_key":"<HO_SERVICE_KEY>","action":"getMemberByGoogleSub","payload":{}}'
```

Expected: `{"ok":false,"error_code":"VALIDATION_ERROR"}` — auth worked, payload correctly rejected.
With a wrong key you should get `{"ok":false,"error_code":"UNAUTHORIZED"}`.

### Seed the database

```bash
curl -X POST <APPS_SCRIPT_URL> -H 'Content-Type: application/json' \
  -d '{"service_key":"<HO_SERVICE_KEY>","action":"runSetup","payload":{}}'
```

This creates all 11 tabs, seeds the 5 badges, creates founder member `HO-000001`, the admin record, and awards the founder badge.

### Claim the founder identity

In the `Members` tab, row `HO-000001`, replace the `email` value
`founder@hackorbit.example` with your real Gmail address. Keep `google_sub` empty
and `is_founder` = `TRUE`. The first Google sign-in with that email adopts the
founder identity (verified, `HO-000001`, no new ID issued).

---

## 3. Configure Vercel

1. Import the repo into Vercel. `vercel.json` already sets the output directory, rewrites, cache headers, and the 6-hourly cron.
2. Go to **Project → Settings → Environment Variables** and add for **Production** (and **Preview**):

| Variable | Required | Notes |
|---|---|---|
| `SITE_URL` | Yes | Canonical base, e.g. `https://hackorbit.com` (no trailing slash) |
| `JWT_SECRET` | Yes | ≥32 random characters; signs the `ho_session` cookie |
| `APPS_SCRIPT_URL` | Yes | Web App URL from step 2 (alias `GAS_WEBAPP_URL` accepted) |
| `HO_SERVICE_KEY` | Yes | Same value as the script property (alias `SHARED_SERVICE_KEY` accepted) |
| `GOOGLE_CLIENT_ID` | Yes | From step 1 |
| `GOOGLE_CLIENT_SECRET` | Yes | From step 1 |
| `GITHUB_CLIENT_ID` | Yes | From step 1 (scope used: `read:user`) |
| `GITHUB_CLIENT_SECRET` | Yes | From step 1 |
| `DISCORD_CLIENT_ID` | Yes | From step 1 (scope used: `identify`) |
| `DISCORD_CLIENT_SECRET` | Yes | From step 1 |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret for the webhook in step 4 |
| `GITHUB_ORG_NAME` | Conditional | Org whose repos are tracked; needed for contributions |
| `GITHUB_TOKEN` | Conditional | PAT with read access to org repos/PRs; needed for the cron |
| `CRON_SECRET` | Conditional | Vercel Cron supplies `Authorization: Bearer <CRON_SECRET>` |

3. Redeploy after setting variables.

---

## 4. GitHub org webhook (contribution tracking)

On your tracked org: **Settings → Webhooks → Add webhook**

- **Payload URL:** `https://<YOUR_SITE>/api/webhooks/github`
- **Content type:** `application/json`
- **Secret:** your `GITHUB_WEBHOOK_SECRET`
- **Events:** `pull_request`, `issues`, `pull_request_review`

How it behaves:
- HMAC `sha256` verified via `X-Hub-Signature-256` (timing-safe)
- Only merged PRs, closed issues, and submitted reviews are ingested; bot actors ignored
- Repos outside `GITHUB_ORG_NAME` are skipped
- Idempotent via the `X-GitHub-Delivery` id, so duplicate deliveries don't double-count

---

## 5. Deploy

The static build needs **no environment variables and no Serverless Functions**:

```bash
npm install
npm run build   # builds public/, sitemap.xml, robots.txt
npm test        # 34 tests, expect 0 failures
vercel --prod   # or just push to the connected branch
```

`vercel.json` sets the output directory and static cache headers. In the Vercel
project settings, make sure **Framework Preset = Other** and **Output Directory =
`public`**.

---

## 6. Post-launch verification checklist

| Feature | How to check |
|---|---|
| Static pages | All 10 pages render from `public/` with valid nav/footer, canonical, meta description |
| Join / Verify / Settings | `noindex` "coming soon" placeholders (not in sitemap or navigation) |
| Lighthouse | 100 on Performance, Accessibility, Best Practices, SEO |

> The API-backed checks below (health, join flow, profiles, webhooks, certificates,
> cron) apply again once the backend is re-enabled per sections 1–4.

---

## 7. Optional: `clasp` for Apps Script CLI deploys

If you'd rather not copy-paste `.gs` files:

```bash
npm install -g @google/clasp
clasp login
# link to the bound Apps Script project (get its Script ID from Project Settings)
clasp create hack-orbit --rootDir apps-script
clasp push    # from the repo root
```

---

## Environment variable quick reference

| Runtime | Keys |
|---|---|
| Vercel | `SITE_URL`, `JWT_SECRET`, `APPS_SCRIPT_URL`, `HO_SERVICE_KEY`, OAuth creds, `GITHUB_WEBHOOK_SECRET`, `GITHUB_ORG_NAME`, `GITHUB_TOKEN`, `CRON_SECRET` |
| Apps Script | `HO_SERVICE_KEY` (Script Properties) |
| GitHub org | Webhook secret (webhook config) |
