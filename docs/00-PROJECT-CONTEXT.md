# 00 — Project Context

## What Hack Orbit Is
Hack Orbit is an open-source technology organisation and developer community where people build real projects, contribute to open source, learn in public, collaborate with other builders, and develop a verifiable public record of their contributions. It is an organisation people participate in — not a marketing website with a newsletter signup.

**Domain scope is technology-neutral.** Despite the word "Hack" in the name (used in the "build/create" sense, not the security-breach sense), Hack Orbit is not a cybersecurity or hacking-focused organisation. It spans web development, DevOps, AI/ML, and technology broadly — no single domain should be visually or editorially privileged over the others anywhere on the site.

## Who Founded It
Hack Orbit was founded by **Sabarna Barik**. This must be represented clearly and professionally across the public identity of the organisation (Home and About page content, structured data, metadata) — never hidden, never overstated into a personal vanity site. There is no separate dedicated Founder page; founder credit is integrated into existing pages.

## Core Mission
Give builders a real, participatory home: a place to ship projects, contribute to org-owned open-source repos, and accumulate a durable, verifiable record (Member ID, contributions, badges, certificates) of what they've actually done.

## Core Philosophy
**BUILD. CONTRIBUTE. ORBIT TOGETHER.**
Build things. Contribute to shared work. Grow together as a community, not as isolated users of a platform.

## Current Stage
- Online-first, single main organisation website, built from scratch
- Small-scale operations (founder-operated, manual controls acceptable — e.g. certificate emails sent manually at ~30–40/day)
- Google Sheets + Apps Script as the initial operational data layer
- No event-management system yet; events are separate, future, independently-built sites

## Long-Term Direction
- Grow into a global, online-first developer organisation
- Potential future expansion into larger hackathons, AI summits, offline events, and additional community programs
- Identity/contribution system designed to scale to 30,000–50,000+ members without a rebuild, migrating off Sheets when needed
- Github-org-centric contribution tracking (not per-member full-account scanning) to stay scalable and API-rate-limit-safe

## The Website's Purpose
The main website is the **official Hack Orbit organisation website** — not an event platform, not a personal blog. It must:
1. Establish Hack Orbit as a credible organisation
2. Explain what Hack Orbit is and why it exists
3. Attract builders and contributors
4. Showcase official and community projects (clearly distinguished)
5. Explain how to contribute
6. House the Hack Orbit Identity System and public profiles
7. Display contributions, badges, achievements
8. Provide certificate verification
9. Establish the Sabarna Barik ↔ Hack Orbit founder relationship for SEO and credibility
10. Provide a durable foundation for future features without overbuilding now

## Important Decisions (Locked)
- Built from scratch; old site is reference-only, not the codebase
- Deployed on Vercel
- Google is the primary authentication method; GitHub + Discord are required for full verified member status
- Member IDs are permanent, sequential (`HO-000001`), never reused, founder = `HO-000001`
- Public profiles never expose Gmail or private auth data
- GitHub contribution tracking is scoped to the official Hack Orbit GitHub organisation, not members' personal accounts
- Certificate verification pages show metadata only — never a downloadable file
- Certificate emails are sent manually by the founder, not mass-automated
- Official Hack Orbit projects vs. community projects are a hard, explicit distinction
- Events are out of scope for the main site and will be separate codebases/sites
- Data layer starts on Google Sheets/Apps Script with an explicit, planned migration path to a database

## Explicit Non-Goals (v1)
- Not a general-purpose event-management platform
- Not a government or legally-verified identity system
- Not a certificate-download portal
- Not a system that continuously scans every member's entire personal GitHub account
- Not an automated mass-email sender
- Not an enterprise-grade, over-engineered platform before the organisation has the scale to justify it
- Not a place that fabricates community statistics or makes unverifiable claims
- Not a cybersecurity/hacking-focused brand or a "hacker culture" aesthetic — the name is about building, not breaching
- Not built around a dedicated Founder page — founder credit lives on Home/About instead
