# 🚀 Hack Orbit — Website

> **Build in Public. Build Together.**

A production-ready, fully responsive Next.js website for the Hack Orbit open-source developer community.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 🗂️ Project Structure

```
hack-orbit/
├── app/
│   ├── components/
│   │   ├── Navbar.jsx        # Fixed top nav with mobile menu
│   │   ├── Hero.jsx          # Hero with orbital animations + star field
│   │   ├── About.jsx         # Community pillars (4 cards)
│   │   ├── WhatWeDo.jsx      # Feature grid (4 cards)
│   │   ├── Projects.jsx      # Project showcase cards
│   │   ├── Contribute.jsx    # 3-step contribution guide
│   │   ├── Community.jsx     # Discord CTA + benefits list
│   │   └── Footer.jsx        # Links, socials, copyright
│   ├── globals.css           # Tailwind base + custom utilities
│   ├── layout.jsx            # Root layout with SEO metadata
│   ├── page.jsx              # Main page assembling all sections
│   └── sitemap.js            # Auto-generated sitemap
├── public/
│   ├── logo.svg              # Hack Orbit logo (SVG)
│   └── robots.txt            # Search engine indexing rules
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🌐 Vercel Deployment

### Option 1: Deploy from GitHub (Recommended)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**
5. Done ✅

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

---

## ✏️ Customization Guide

### 🔗 Update URLs & Links

All external links are in these files:

| File | What to change |
|---|---|
| `app/components/Navbar.jsx` | `href` on "Join Community" button |
| `app/components/Hero.jsx` | Discord link + "Explore Projects" href |
| `app/components/Community.jsx` | Discord server invite URL |
| `app/components/Footer.jsx` | GitHub, Discord, LinkedIn URLs |
| `app/components/Projects.jsx` | GitHub links per project |
| `public/robots.txt` | Replace `https://hackorbit.dev` with your domain |
| `app/sitemap.js` | Replace `https://hackorbit.dev` with your domain |
| `app/layout.jsx` | Update `metadataBase`, OG URLs, Twitter handle |

### 🖼️ Replace the Logo

1. Export your logo as SVG or PNG
2. Place it in `/public/logo.svg` (or `logo.png`)
3. Update the `src` in `Navbar.jsx`, `Hero.jsx`, and `Footer.jsx`

### 📦 Add / Edit Projects

In `app/components/Projects.jsx`, edit the `projects` array:

```js
const projects = [
  {
    name: 'Your Project Name',
    description: 'Short description of the project.',
    tags: ['React', 'Node.js'],
    stars: '0',
    forks: '0',
    color: 'blue',           // 'blue' or 'purple'
    github: 'https://github.com/your/repo',
    icon: <YourIconSVG />,
  },
  // add more...
]
```

### 🎨 Change Colors / Theme

Edit `tailwind.config.js` → `theme.extend.colors`:

```js
primary: '#3B82F6',   // Electric blue — buttons, accents
accent: '#8B5CF6',    // Purple — hover glows, secondary
background: '#0B0F19' // Deep black — page background
```

Also update the CSS variables in `app/globals.css`:

```css
:root {
  --color-bg: #0B0F19;
  --color-primary: #3B82F6;
  --color-accent: #8B5CF6;
}
```

### 📝 Update Community Stats (Hero)

In `app/components/Hero.jsx`, find and edit:

```jsx
{ value: '500+', label: 'Developers' },
{ value: '20+', label: 'Projects' },
{ value: '10+', label: 'Hackathons' },
```

### 🔍 SEO — Update Metadata

In `app/layout.jsx`, update:

```js
export const metadata = {
  metadataBase: new URL('https://your-domain.com'),
  title: { default: 'Your Site Title' },
  description: 'Your description here',
  // ... openGraph, twitter
}
```

Also update the JSON-LD structured data in the same file:

```js
const jsonLd = {
  name: 'Hack Orbit',
  url: 'https://your-domain.com',
  sameAs: ['https://github.com/your-org', ...],
}
```

---

## 🛠️ Tech Stack

| Tech | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Google Fonts (Inter) | Typography |

---

## 📋 Checklist Before Going Live

- [ ] Replace all `https://hackorbit.dev` with your actual domain
- [ ] Update Discord invite link (`discord.gg/hackorbit`)
- [ ] Update GitHub org URL (`github.com/hackorbit`)
- [ ] Update LinkedIn URL
- [ ] Replace `logo.svg` with your final logo
- [ ] Add an `og-image.png` (1200×630px) to `/public/` for social sharing
- [ ] Add `favicon.ico` to `/public/`
- [ ] Update hero stats to reflect real numbers
- [ ] Update project cards with real repos
- [ ] Set Twitter handle in `layout.jsx` metadata

---

## 📄 License

Open source. Built in public by Hack Orbit.
