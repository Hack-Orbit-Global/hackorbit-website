---
name: Open Orbit Logic
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#424751'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#727782'
  outline-variant: '#c2c6d3'
  surface-tint: '#1b5fa8'
  primary: '#004786'
  on-primary: '#ffffff'
  primary-container: '#1b5fa8'
  on-primary-container: '#c4daff'
  inverse-primary: '#a6c8ff'
  secondary: '#006d2f'
  on-secondary: '#ffffff'
  secondary-container: '#85fb9d'
  on-secondary-container: '#007433'
  tertiary: '#930004'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc1411'
  on-tertiary-container: '#ffcdc6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a6c8ff'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#004786'
  secondary-fixed: '#85fb9d'
  secondary-fixed-dim: '#69de83'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005322'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#930004'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Merriweather
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Merriweather
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Merriweather
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Merriweather
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin: 32px
  container-max: 1280px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is rooted in the philosophy of "Transparent Engineering." It prioritizes clarity, reliability, and collaborative growth over the typical aggressive aesthetics of the cybersecurity industry. By eschewing dark themes and neon accents, the system positions itself as a mature, open-source utility that is as welcoming to new contributors as it is dependable for enterprise partners.

The visual style is **Corporate / Modern** with a lean towards **Technical Editorial**. It utilizes a clean off-white canvas to reduce eye strain during long periods of documentation reading and code review. High-quality typography and a disciplined 1px-border constraint create a UI that feels structured, intentional, and high-performance.

## Colors

The palette is anchored by a deep **Primary Blue**, used to denote action, navigation, and brand presence. This is supported by a functional system of semantic colors: **Success Green** for positive indicators and **Accent Red** for destructive actions or critical alerts.

The background uses a slightly warm off-white to provide a softer contrast than pure white, while interactive surfaces (cards, inputs) use pure white to "pop" forward. Text follows a strict hierarchy: near-black for maximum legibility on headers and primary content, and a muted grey for metadata and secondary descriptions.

## Typography

This design system employs a dual-font strategy to balance character with utility. **Merriweather** is used for all headings, lending an authoritative, academic, and established feel that echoes traditional technical publishing. Its bold weights provide a strong visual anchor for page headers.

**Inter** handles the heavy lifting for the interface and body text. Chosen for its exceptional legibility on digital screens and neutral character, it ensures that complex data and technical prose remain highly readable. Labels use a slightly heavier weight and increased letter spacing to differentiate them from body text at smaller sizes.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop, transitioning to a 4-column grid for mobile devices. A base unit of 4px governs all spacing, ensuring a rhythmic "8px-step" consistency across the UI.

- **Desktop (1024px+):** 12 columns, 24px gutters, 32px side margins.
- **Tablet (768px - 1023px):** 8 columns, 20px gutters, 24px side margins.
- **Mobile (Up to 767px):** 4 columns, 16px gutters, 16px side margins.

Content is primarily organized in vertical stacks with standard increments of 16px (medium) or 32px (large) to maintain a clean, breathable technical document feel.

## Elevation & Depth

Hierarchy is established through **low-contrast outlines** and **subtle tonal layering** rather than dramatic shadows. 

1.  **Level 0 (Base):** The off-white background (#FAFAF9).
2.  **Level 1 (Surfaces):** White (#FFFFFF) cards and containers with a 1px solid border (#E5E5E5).
3.  **Level 2 (Interaction):** When hovered, cards or buttons may utilize a very soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) to indicate interactivity without breaking the flat, technical aesthetic.

This approach keeps the UI looking lightweight and fast, avoiding the "heavy" feeling of traditional skeuomorphism or neomorphism.

## Shapes

The design system uses a consistent **12px (0.75rem)** corner radius for all standard UI components, including cards, input fields, and buttons. This "Soft" approach counteracts the rigidity of the slab-serif typography, making the technology feel more accessible and user-friendly.

Small elements like checkboxes use a 4px radius, while status badges and chips use a **full pill-shape** (999px) to clearly distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid #1B5FA8 background with White Inter Medium text. 12px border radius.
- **Outline:** 1px border using #1B5FA8, text in #1B5FA8. Transparent background.
- **Ghost:** No border or background. #1B5FA8 text. Background becomes #F0F4F8 on hover.

### Cards
- **Base:** White background, 1px #E5E5E5 border, 12px border radius.
- **Content Padding:** 24px internal padding for standard cards.

### Status Indicators & Badges
- **Pill-shaped:** Used for labels and tags. 
- **Semantic States:**
    - **Valid:** #1F9E4C background (10% opacity) with #1F9E4C text.
    - **Revoked:** #E8382C background (10% opacity) with #E8382C text.
    - **Pending:** #666666 background (10% opacity) with #666666 text.

### Input Fields
- **Style:** 1px #D1D1D1 border, 12px radius, 16px horizontal padding.
- **Focus State:** 1px #1B5FA8 border with a subtle 2px blue outer glow (halo).

### Lists
- Clean, 1px horizontal dividers (#F0F0F0) between list items.
- Active list items utilize a subtle left-edge accent bar in Primary Blue (4px width).