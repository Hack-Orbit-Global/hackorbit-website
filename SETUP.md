# Hack Orbit Website — Setup Guide

The Hack Orbit website is a **purely static frontend** — plain HTML/CSS/Vanilla
JavaScript with **zero Serverless Functions** and **zero environment variables**.
Member onboarding, public profiles, and certificate verification are on hold and
will be re-added later; the current site is a marketing site (Home, About,
Projects, Contribute, Contact) with `noindex` "coming soon" placeholders for
`/join`, `/settings`, and `/verify`.

## Requirements

- Node.js 18+ and npm
- A Vercel account (any plan)

## Deploy

```bash
npm install
npm run build   # builds public/, sitemap.xml, robots.txt
npm test        # 5 tests, expect 0 failures
vercel --prod   # or just push to the connected branch
```

`vercel.json` sets the output directory (`public`) and long-lived cache headers
for static assets. In the Vercel project settings make sure:

- **Framework Preset = Other** (NOT Next.js)
- **Build Command** = `npm run build` (or leave default — it reads `package.json`)
- **Output Directory** = `public`

## Project structure

```
├── frontend/            # source
│   ├── pages-src/       # raw HTML pages (tokens {{HEAD}}/{{NAV}}/{{FOOTER}})
│   ├── partials/        # shared head.html, nav.html, footer.html
│   ├── css/             # variables, reset, global, components, animations, responsive
│   ├── js/              # main.js, navigation.js, components.js (UI only)
│   ├── assets/          # logo, images, badges
│   └── build.js         # zero-dependency build script
├── seo/                 # sitemap-generate.js, robots.txt
├── tests/               # build-structure.test.js
├── vercel.json          # static output + cache headers
└── package.json         # build/test scripts, esbuild (dev only)
```

## Post-launch verification

| Feature | How to check |
|---|---|
| Static pages | All 10 pages render with nav, footer, canonical, meta description |
| Styling | Every page links the hashed `styles.<hash>.css` (build verifies this) |
| Join / Verify / Settings | `noindex` "coming soon" placeholders, excluded from sitemap + nav |
| Lighthouse | 100 on Performance, Accessibility, Best Practices, SEO |
