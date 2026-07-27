# Hack Orbit — Organization Website

> High-fidelity open-source engineering organization website.
> **Stack:** HTML5 + CSS3 + Vanilla JS · Vercel Serverless · Google Sheets + Apps Script

---

## Quick Start

```bash
# Install dev deps (vercel CLI only — no framework)
npm install

# Run build (assembles pages + minifies CSS)
npm run build

# Local dev server
npm run dev
```

## Project Structure

```
hackorbit-website/
├── index.html / about.html / ...  ← Assembled static pages (root, auto-built)
├── frontend/
│   ├── pages-src/   ← Hand-authored page content with {{include:}} placeholders
│   ├── partials/    ← Shared head.html, nav.html, footer.html
│   ├── templates/   ← SSR templates for profile and verify-result pages
│   ├── css/         ← Design tokens → components → minified to styles.css
│   ├── js/          ← Vanilla JS modules (no framework)
│   └── build.js     ← Node.js build script (assembles + minifies)
├── api/             ← Vercel Serverless Functions (plain Node.js)
├── lib/             ← Shared server-side utilities (session, oauth, appsScript)
├── apps-script/     ← Google Apps Script source (deploy via clasp)
└── seo/             ← sitemap generator + robots.txt
```

## Environment Variables (Vercel)

| Variable | Description |
|---|---|
| `SESSION_SECRET` | 64 hex chars (32 bytes) — JWT signing key |
| `APPS_SCRIPT_URL` | Deployed Apps Script Web App URL |
| `HO_SERVICE_KEY` | Shared secret for Vercel ↔ Apps Script auth |
| `GOOGLE_CLIENT_ID` | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret |
| `GOOGLE_REDIRECT_URI` | `https://hackorbitglobal.vercel.app/api/auth/google/callback` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `GITHUB_REDIRECT_URI` | `https://hackorbitglobal.vercel.app/api/auth/github/callback` |
| `DISCORD_CLIENT_ID` | Discord OAuth app client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth app client secret |
| `DISCORD_REDIRECT_URI` | `https://hackorbitglobal.vercel.app/api/auth/discord/callback` |
| `GITHUB_WEBHOOK_SECRET` | GitHub webhook HMAC signing secret |
| `GITHUB_ORG` | GitHub org name (default: `hackorbit`) |
| `GITHUB_ORG_TOKEN` | Fine-grained PAT for cron reconciliation |
| `CRON_SECRET` | Secret for authenticating Vercel cron calls |

## Build & Deploy

```bash
# Build static pages
npm run build

# Generate sitemap (requires env vars set)
npm run sitemap

# Deploy via Vercel CLI
vercel --prod
```

## Apps Script Setup

1. Create a new Google Spreadsheet with tabs: `Members`, `IdentityConnections`, `Contributions`, `Badges`, `MemberBadges`, `Certificates`, `Events`, `AdminRecords`, `AuditLog`, `Counters`
2. Open Apps Script editor → paste contents of `apps-script/*.gs`
3. Set script property `HO_SERVICE_KEY` to the same value as the Vercel env var
4. Deploy as Web App: Execute as **Me**, access **Anyone**
5. Copy the deployed URL → set as `APPS_SCRIPT_URL` in Vercel

---

**Founder:** Sabarna Barik · **License:** MIT
