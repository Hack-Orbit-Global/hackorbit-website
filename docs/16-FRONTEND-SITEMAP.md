# 16 — Frontend Sitemap

## `/` — Home
- **Purpose**: First impression, explain what Hack Orbit is and why it exists
- **Target user**: All visitors
- **Main content**: Hero (mission + Build/Contribute/Orbit Together), what Hack Orbit is, highlighted official projects, "why join" section, founder credit line
- **CTA**: Join Hack Orbit
- **SEO purpose**: Primary organisation-identity page, Organization + WebSite schema
- **Components**: Nav, Hero, ProjectCards, StatBlock (real numbers only), CTA banner, Footer

## `/about`
- **Purpose**: Explain mission, philosophy, positioning, non-goals (what Hack Orbit is not), and credit the founder — no separate Founder page
- **Target user**: Prospective members, evaluators, recruiters/press
- **Main content**: Mission, Build/Contribute/Orbit Together philosophy, org positioning (explicitly technology-neutral: web dev, DevOps, AI/ML, and technology broadly), history, and a founder section (Sabarna Barik's bio, founding story, role, links to relevant professional profiles)
- **CTA**: Join / Contribute
- **SEO purpose**: Deepens Organization schema context; the embedded founder section carries the Person schema for the founder ↔ org relationship
- **Components**: Nav, RichText sections, Timeline (if org history exists), FounderProfileCard (embedded within this page, not a standalone route), Footer

## `/projects`
- **Purpose**: Showcase official and community projects, clearly distinguished
- **Target user**: Prospective contributors, evaluators
- **Main content**: Filterable list, Official vs Community labelling, repo links
- **CTA**: Propose a project / Contribute
- **SEO purpose**: Breadcrumbs, internal linking hub
- **Components**: Nav, FilterTabs, ProjectCard grid, Footer

## `/contribute`
- **Purpose**: Explain exactly how to start contributing
- **Target user**: New/prospective contributors
- **Main content**: Steps to join, link to good-first-issue-style entry points in org repos, contribution guidelines
- **CTA**: Join Hack Orbit
- **SEO purpose**: Long-tail "how to contribute to Hack Orbit" queries
- **Components**: Nav, StepList, RichText, Footer

## `/join`
- **Purpose**: The identity verification flow itself
- **Target user**: Committed new members
- **Main content**: Google → GitHub → Discord stepper, explaining why each is required
- **CTA**: (is the flow itself)
- **SEO purpose**: Low (auth-gated after step 1); keep a clean pre-auth explanation for indexing
- **Components**: Nav, JoinStepper, ProviderConnectButtons, Footer

## `/profile/{member_id}`
- **Purpose**: Public contribution/achievement profile
- **Target user**: Anyone evaluating a specific member
- **Main content**: Display name, bio, skills, contributions, badges, certificates, projects
- **CTA**: "Join Hack Orbit" (for visitors), "Edit profile" (for the owning member)
- **SEO purpose**: Person schema, long-tail discoverability of individual members
- **Components**: Nav, ProfileHeader, BadgeRow, ContributionList, CertificateList, ProjectList, Footer

## `/verify`
- **Purpose**: Public certificate verification
- **Target user**: Third parties checking a certificate's validity
- **Main content**: Certificate ID input, metadata result display
- **CTA**: none (utility page)
- **SEO purpose**: "Hack Orbit certificate verification" queries
- **Components**: Nav, VerifyForm, CertificateMetadataCard, Footer

## `/contact`
- **Purpose**: General/organisational contact, project proposals
- **Target user**: Press, partners, prospective official-project proposers
- **Main content**: Contact form/email, brief guidance on project proposals
- **CTA**: Send message
- **SEO purpose**: Low priority, still indexable
- **Components**: Nav, ContactForm, Footer

## `/settings` (authenticated)
- **Purpose**: Member self-service profile editing
- **Target user**: Verified members
- **Main content**: Editable display name, bio, skills, links, avatar
- **CTA**: Save changes
- **SEO purpose**: None (noindex)
- **Components**: Nav, SettingsForm, Footer

## Non-goals for the sitemap (deferred)
- No `/events` platform pages beyond a simple `/projects`-adjacent "Events" list linking out to separate event sites (see 05-DATA-MODEL.md `Events`)
- No admin dashboard route in v1 (Sheets is the admin UI)
