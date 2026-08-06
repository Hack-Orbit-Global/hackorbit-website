# 21 — Google Stitch Prompt (Copy-Paste Ready)

> **Status: Superseded / historical reference only.** The Stitch design generated from this prompt has already been created and approved and is now the site's visual source of truth. Do not re-run this prompt or use it to generate a new design. The implementation phase (HTML/CSS/Vanilla JS) must reproduce the existing approved Stitch design as closely as reasonably possible — see `04-SYSTEM-ARCHITECTURE.md`, `22-FRONTEND-ARCHITECTURE.md`, and `ANTIGRAVITY-STARTER-PROMPT.md`. This file is kept only so the original design brief remains traceable.

Copy everything between the lines below directly into Google Stitch.

---

Design the complete frontend for **Hack Orbit**, an open-source technology organisation and developer community founded by Sabarna Barik. Design this as a professional, credible organisation website — not a generic startup landing page, not a crypto/blockchain aesthetic, not neon cyberpunk.

**Important brand-meaning clarification**: the word "Hack" in Hack Orbit means "build/create," in the maker/hacker-culture-of-building sense — it is **not** a cybersecurity, penetration-testing, or hacking-tools organisation, and the design must not read that way. Hack Orbit is technology-neutral and spans web development, DevOps, AI/ML, and technology broadly, with no single domain visually privileged. **Explicitly avoid**: dark hacker/terminal aesthetics, green-on-black "Matrix" code rain, glitch effects, padlocks, shields, skulls, hoodie-wearing figures, binary-code textures, or any visual cue suggesting security-breach or "hacking" in the cybercrime sense. The design should feel like a mainstream, credible technology-and-developer-community brand — approachable and professional, not underground or edgy.

**Brand identity**
The logo (provided separately) consists of: a solid red circular planet, a green elliptical orbital ring encircling it with a small solid green orbiting body on the ring, and the wordmark "HACK ORBIT" below in a bold blue slab-serif font, set on a near-white/off-white background. Evolve the visual system from this mark — do not replace it with an unrelated identity.

**Colour direction**
- Primary: a strong blue (matching the wordmark, approx. `#1B5FA8`) — dominant colour for navigation, primary buttons, links, headings
- Accent red (approx. `#E8382C`, matching the planet) — used sparingly for alerts, key highlights
- Accent green (approx. `#1F9E4C`, matching the orbit ring) — used for success/verified states, secondary accents
- Background: off-white/near-white (approx. `#FAFAF9`), white surfaces for cards
- Text: near-black primary text, muted grey secondary text
- Discipline: blue dominates; red and green are deliberate small accents, never large background fields; no dark/black-dominant "hacker" colour schemes

**Typography direction**
- Headings: a confident bold serif/slab-serif, echoing the wordmark
- Body/UI text: a clean, highly legible sans-serif, good at small sizes for IDs and technical data (Member IDs, certificate IDs, code-adjacent content) — not a monospace "terminal" typeface used decoratively

**Overall feel**: modern, professional, technical, community-driven, open-source, ambitious, trustworthy, human, globally scalable, welcoming across all technology disciplines. Not a personal vanity site — this is an organisation with a credited founder.

**Sitemap to design** (design each as a distinct, fully laid-out page/screen):
1. **Home (`/`)** — Hero with mission statement and "Build, Contribute, Orbit Together" philosophy, brief org explanation (technology-neutral — web dev, DevOps, AI/ML, and more), highlighted official projects, a "why join" section, a founder credit line, primary CTA "Join Hack Orbit"
2. **About (`/about`)** — Mission, philosophy, organisational positioning (explicitly spanning web development, DevOps, AI/ML, and technology broadly), brief history, and an embedded founder section (Sabarna Barik's bio, founding story, role, links to professional profiles) — there is no separate dedicated Founder page; keep this section professional, not a vanity spotlight
3. **Projects (`/projects`)** — Filterable grid clearly distinguishing "Official Hack Orbit Project" vs "Community Project" on every card, spanning varied technology domains
4. **Contribute (`/contribute`)** — Step-by-step guide to becoming a contributor
5. **Join (`/join`)** — A clear 3-step stepper: Google login → GitHub connection → Discord connection, each step explaining why it's required, ending in a Hack Orbit Member ID
6. **Public Member Profile (`/profile/HO-000001`)** — Header with avatar, display name, Member ID, join date; sections for bio/skills, contributions (list with repo/type/date), badges (icon grid), certificates (list linking to verification), and project involvement
7. **Certificate Verification (`/verify`)** — A simple, official-looking utility page: certificate ID input, and a result card showing Certificate ID, Status (Valid/Revoked), Certificate Type, Recipient, Hack Orbit Member ID, Issued By, Event, Achievement, Issue Date. Must look trustworthy and official, not celebratory. Never show a downloadable file.
8. **Contact (`/contact`)** — Simple contact form, brief note on proposing projects
9. **Member Settings (`/settings`, authenticated view)** — Editable display name, avatar, bio, skills, professional links

**Component requirements**
- Sticky navigation: wordmark left, primary links, "Join Hack Orbit" CTA button right; mobile hamburger drawer
- Buttons: primary (blue fill), secondary (blue outline), ghost/text
- Cards: project cards, profile summary cards, badge cards — white surface, soft rounded corners (~12px), subtle 1px border, minimal shadow
- Status indicators: Valid (green), Revoked (red, shown honestly rather than hidden), Pending (neutral grey)
- Badge component: small icon + label pill
- Forms: clear labels, visible focus states in brand blue, inline validation
- Empty states: friendly and action-oriented (e.g. new member with no contributions yet), never a bare blank area
- Loading states: skeleton placeholders matching final layout, not generic spinners

**Responsive requirements**
Design each page at desktop, tablet, and mobile breakpoints. Navigation collapses to a drawer on mobile; grids reflow to single column; the certificate verification form stays prominent and single-column at every breakpoint since it's a trust-critical utility.

**Accessibility**
Design for WCAG 2.1 AA: sufficient colour contrast (especially blue-on-white and white-on-blue button text), clear focus states, logical heading hierarchy, readable body text sizes.

**SEO-aware structure**
Design each public page with a clear single H1, logical heading hierarchy beneath it, and visible breadcrumb navigation on nested pages (e.g. Projects → individual project). The About page's founder section should visually and structurally reinforce "Sabarna Barik — Founder of Hack Orbit" through layout and headings — naturally, not through repeated or stuffed text.

**Public profiles & member identity**
Profiles are the core showcase artifact — design them to feel like a credible, shareable "proof of work" page: Member ID prominent but not gimmicky, clear separation between identity info (name, bio) and achievement info (contributions, badges, certificates).

**Founder credit**
Sabarna Barik must be clearly and professionally credited as Founder of Hack Orbit on the Home page and within the About page's founder section — visible, not hidden, not overstated into a personal brand site, and without a separate dedicated Founder page.

Produce full-fidelity screen designs for every page listed above, at desktop and mobile widths, using the colour, typography, and component system described.

---
