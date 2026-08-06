# 17 — Design System

Derived from the Hack Orbit logo: a red planet, a green orbital ring with a small orbiting body, and a bold blue slab-serif "HACK ORBIT" wordmark on a near-white background. The system should feel modern, professional, technical, and community-driven — not generic-startup, not neon-cyberpunk, not crypto/blockchain-coded.

**Domain-neutral, non-security aesthetic**: "Hack" in the brand name means build/create, not cybersecurity/hacking. Avoid dark hacker-culture visual tropes entirely — no matrix/binary code rain, no green-on-black terminal styling, no padlocks/shields/skulls, no hoodie imagery, no glitch effects. Iconography and illustration across the site should represent the full breadth of Hack Orbit's scope (web development, DevOps, AI/ML, and technology broadly), not lean toward any one domain.

## Colour Tokens (derived from logo, exact hex to be sampled from source logo file during implementation)
| Token | Approx. value | Usage |
|---|---|---|
| `--color-primary` (Orbit Blue) | `#1B5FA8` | Wordmark blue → primary buttons, links, headings |
| `--color-accent-red` (Planet Red) | `#E8382C` | Sparingly: alerts, key highlights, badges needing urgency/energy |
| `--color-accent-green` (Orbit Green) | `#1F9E4C` | Success states, "verified" indicators, secondary accents |
| `--color-bg` | `#FAFAF9` | Page background (matches logo's off-white) |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-text-primary` | `#14181F` | Body/heading text |
| `--color-text-secondary` | `#5B6472` | Meta text, captions |
| `--color-border` | `#E4E7EB` | Dividers, card borders |

**Usage discipline**: Blue is the dominant brand colour (nav, primary CTAs, links). Red and green are accents used deliberately (status, badges, small highlights) — never as large background fields, to avoid drifting toward an unrelated flashy/crypto aesthetic.

## Typography
- **Headings**: A confident slab-serif or bold serif family, echoing the wordmark's serif weight (e.g. system-safe stack: `"Source Serif Pro", Georgia, serif` or a similar open-source slab serif) — used for H1/H2 only, to keep it distinctive without hurting readability at small sizes.
- **Body/UI**: A clean, highly-legible sans-serif (e.g. `Inter`, `IBM Plex Sans`) for body copy, forms, navigation, and profile data — technical-community feel, good number legibility (Member IDs, certificate IDs).
- **Scale**: H1 40/48px, H2 32/40px, H3 24/32px, Body 16/24px, Caption 13/18px (desktop; scale down ~15–20% on mobile).

## Spacing System
- Base unit 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px. Section vertical rhythm defaults to 64–96px between major page sections on desktop, 32–48px on mobile.

## Grid & Layout
- 12-column grid, max content width 1200px, 24px gutters (16px on mobile). Single-column stacking below 768px.

## Border Radius
- `--radius-sm: 6px` (inputs, small badges), `--radius-md: 12px` (cards), `--radius-lg: 20px` (feature panels/hero cards) — soft but technical, not pill-shaped everywhere.

## Shadows
- `--shadow-sm`: subtle 1px card elevation; `--shadow-md`: hover/interactive elevation. Kept minimal — flat/technical over heavy skeuomorphism.

## Components
- **Buttons**: Primary (blue fill, white text), Secondary (blue outline), Ghost (text-only). Consistent 8/16px vertical/horizontal padding rhythm, `--radius-sm`.
- **Cards**: Project cards, profile summary cards, badge cards — white surface, `--radius-md`, `--shadow-sm`, 1px `--color-border`.
- **Navigation**: Sticky top nav, wordmark left, primary links centre/right, "Join Hack Orbit" CTA button far right. Mobile: collapses to a hamburger drawer.
- **Forms**: Labeled inputs, clear focus states in `--color-primary`, inline validation messaging in `--color-accent-red` (errors) / `--color-accent-green` (success).
- **Badges (UI component)**: Small pill/rounded-square with icon + label, using `--color-accent-green` for "verified/active" states.
- **Status Indicators**: `Valid` (green), `Revoked` (red, not hidden — per 11-CERTIFICATE-SYSTEM.md), `Pending` (neutral grey).
- **Profile Components**: ProfileHeader (avatar, display name, Member ID, join date), BadgeRow, ContributionList (type icon + repo + date), CertificateList (linking to `/verify` results).
- **Certificate Verification Component**: ID input + result card matching the exact metadata fields specified in 11-CERTIFICATE-SYSTEM.md — deliberately plain/official-looking, not celebratory, to read as a trustworthy record rather than a marketing artifact.

## Empty / Error / Loading States
- **Empty** (e.g. no contributions yet): friendly, action-oriented prompt, never a bare blank area.
- **Error** (e.g. certificate not found): calm, factual, no dead-end — always offers a next action (e.g. "check the ID and try again").
- **Loading**: skeleton placeholders matching final layout shape (cards, profile header) rather than generic spinners, to reduce layout shift (supports NFR-PERF-001's CLS target).

## Responsive Behaviour
- Mobile-first component design; nav collapses, grids reflow to single column, profile stats stack vertically, certificate verification form remains single-column and prominent at all breakpoints (it's a trust-critical utility, must never feel buried).
