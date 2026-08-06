# 25 — Project Folder Structure

```
hackorbit-website/
├── frontend/
│   ├── pages-src/                  # hand-authored page content (pre-build)
│   │   ├── index.html
│   │   ├── about.html
│   │   ├── projects.html
│   │   ├── contribute.html
│   │   ├── join.html
│   │   ├── contact.html
│   │   └── settings.html
│   ├── partials/                   # build-time includes
│   │   ├── head.html
│   │   ├── nav.html
│   │   └── footer.html
│   ├── templates/                  # HTML templates used by serverless-rendered pages
│   │   ├── profile.template.html
│   │   └── verify-result.template.html
│   ├── css/
│   │   ├── variables.css
│   │   ├── reset.css
│   │   ├── global.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── main.js
│   │   ├── components.js
│   │   ├── navigation.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── profile.js
│   │   └── certificates.js
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── logo/
│   └── build.js                    # assembles pages-src/ + partials/ → dist/ at build time
│
├── api/                             # Vercel Serverless Functions (plain Node.js)
│   ├── auth/
│   │   ├── google/
│   │   │   ├── start.js
│   │   │   └── callback.js
│   │   ├── github/
│   │   │   ├── connect.js
│   │   │   └── callback.js
│   │   ├── discord/
│   │   │   ├── connect.js
│   │   │   └── callback.js
│   │   ├── session.js
│   │   └── logout.js
│   ├── identity/
│   │   └── finalize.js
│   ├── members/
│   │   ├── [id].js                 # GET public profile JSON (used by profile.js if needed)
│   │   └── me.js                   # PATCH own profile
│   ├── profile/
│   │   └── [id].js                 # renders full HTML for /profile/{member_id}
│   ├── verify/
│   │   ├── index.js                # POST/GET JSON verification (used by verify.html's fetch)
│   │   └── [id].js                 # optional: renders indexable HTML verify-result page
│   ├── webhooks/
│   │   └── github.js
│   ├── cron/
│   │   └── github-reconcile.js
│   └── admin/
│       ├── badges/
│       │   ├── award.js
│       │   └── revoke.js
│       └── certificates/
│           ├── issue.js
│           └── revoke.js
│
├── lib/                             # shared server-side code, imported by /api functions
│   ├── appsScriptClient.js          # authenticated calls to the Apps Script Web App
│   ├── session.js                   # JWT sign/verify, cookie helpers
│   ├── oauth/
│   │   ├── google.js
│   │   ├── github.js
│   │   └── discord.js
│   ├── html/
│   │   ├── renderPage.js            # fills a template + shared partials with data
│   │   └── escapeHtml.js
│   └── validation/                  # request-body schema checks per endpoint
│
├── apps-script/                     # source of truth for the Google Apps Script project
│   ├── Code.gs
│   ├── members.gs
│   ├── contributions.gs
│   ├── badges.gs
│   ├── certificates.gs
│   └── counters.gs
│
├── seo/
│   ├── sitemap-generate.js          # build-time script producing sitemap.xml (incl. member profile URLs)
│   └── robots.txt
│
├── docs/                            # this documentation package
│   ├── 00-PROJECT-CONTEXT.md
│   ├── ... (01 through 25)
│   └── ANTIGRAVITY-STARTER-PROMPT.md
│
├── vercel.json                      # routing, headers/caching, cron schedule
├── package.json                     # scripts: build, dev — no framework dependency
└── README.md
```

## Notes
- `frontend/build.js` output (the final static HTML/CSS/JS) is what Vercel actually serves for static routes; `pages-src/`, `partials/`, and `templates/` are source, not deployed directly.
- `api/profile/[id].js` and `api/verify/[id].js` reuse the exact same `partials/` (via `lib/html/renderPage.js`) that `build.js` uses for static pages, guaranteeing visual/structural consistency between static and dynamic pages without duplicating markup.
- `apps-script/` is tracked in this repo as the source for the Apps Script project (deployed separately via `clasp` or manual paste into the Apps Script editor) so it isn't a black box outside version control.
- No `node_modules`-heavy framework; `package.json` dependencies should stay minimal (a JWT library, an HTML-escaping helper if not hand-rolled, and dev-only tooling such as an image-optimisation script) — this list itself is a Best Practices/Performance safeguard against dependency creep.
