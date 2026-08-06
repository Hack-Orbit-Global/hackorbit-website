---
name: Cinematic Tech Noir
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0b0e13'
  surface-container-low: '#181c21'
  surface-container: '#1d2025'
  surface-container-high: '#272a30'
  surface-container-highest: '#32353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#c2c6d3'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3036'
  outline: '#8c919c'
  outline-variant: '#424751'
  surface-tint: '#a6c8ff'
  primary: '#a6c8ff'
  on-primary: '#00315f'
  primary-container: '#1b5fa8'
  on-primary-container: '#c4daff'
  inverse-primary: '#1b5fa8'
  secondary: '#69de83'
  on-secondary: '#003915'
  secondary-container: '#2aa552'
  on-secondary-container: '#003111'
  tertiary: '#ffb4a9'
  on-tertiary: '#690002'
  tertiary-container: '#bc1411'
  on-tertiary-container: '#ffcdc6'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
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
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#32353b'
  surface-base: '#070A0F'
  surface-elevated: '#10161F'
  surface-overlay: '#19222D'
  text-primary: '#F8FAFC'
  text-secondary: '#94A3B8'
  border-subtle: '#1E293B'
typography:
  headline-xl:
    fontFamily: Merriweather
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Merriweather
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
  headline-lg-mobile:
    fontFamily: Merriweather
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  grid-unit: 8px
---

## Brand & Style
The design system establishes a high-fidelity, cinematic environment for Hack Orbit, balancing the intellectual depth of open-source engineering with the energy of a creative community. The aesthetic is "Technical Noir"—sophisticated, atmospheric, and precisely engineered.

The design style is a hybrid of **Modern Minimalism** and **Tactile Glassmorphism**. It utilizes deep, layered canvases to create a sense of vast space, punctuated by thin geometric lines and orbital motifs that represent connection and motion. This approach avoids flashy tropes in favor of a "pro-tool" feel: utilitarian enough for developers, yet evocative enough for creators.

## Colors
The palette is rooted in a "Deep Midnight" spectrum. The base layer starts at a near-black `#070A0F`, with successive UI tiers lifting into subtle blue-grays. This creates a natural hierarchy through luminance rather than just color.

- **Primary (Technology Blue):** Used for primary actions, progress indicators, and core brand moments.
- **Secondary (Orbit Green):** Reserved for community features, success states, and "active" node connections.
- **Tertiary (Creation Red):** Used sparingly for high-energy highlights, critical alerts, or "live" recording states.
- **Neutrals:** Typography utilizes high-contrast off-whites to ensure legibility against the dark void.

## Typography
The typography strategy pairings high-authority editorial weight with technical precision. 

- **Headlines:** Merriweather provides a sturdy, academic, yet modern serif presence that echoes legacy wordmarks while remaining legible in digital formats.
- **Body & UI:** Geist Sans (or a clean equivalent) is used for all functional text, providing a neutral, "open-source" feel that doesn't compete with the headlines.
- **Metadata & Code:** JetBrains Mono is employed for labels, timestamps, and data points to emphasize the technical nature of the platform.

## Layout & Spacing
The system uses a **Fixed Grid** model for desktop content to maintain a cinematic "letterboxed" feel, transitioning to a fluid model for mobile.

- **Grid:** A 12-column system with generous gutters (24px) allows the content to breathe.
- **Rhythm:** All spacing (padding, margins) follows an 8px base unit.
- **Atmospheric Spacing:** Layouts should favor large sections of negative space (dead-space) to emphasize the "orbital" elements. Groupings should be tight and technical, while sections should be expansive.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Base Layer:** `#070A0F` (The Canvas).
- **Raised Surfaces:** `#10161F` with a 1px solid border of `#1E293B`.
- **Active/Overlay Surfaces:** `#19222D` with subtle 2px inner-glows in brand blue at 5% opacity.
- **Atmospherics:** Use large, low-opacity radial gradients (200px - 600px radius) in the background to suggest light sources from "off-screen," creating a sense of three-dimensional space without using drop shadows.

## Shapes
The shape language is "Soft-Technical." Elements use small corner radii to feel engineered rather than playful. 

- **Cards & Buttons:** 0.25rem (4px) corner radius for a precise, sharp appearance.
- **Nodes/Status Indicators:** Full circles (pill-shaped) to represent "orbits" and connectivity.
- **Dividers:** Use 1px hairlines. Vertical dividers should have a slight gradient fade-out at the top and bottom to feel like light beams or connection threads.

## Components
- **Buttons:** Primary buttons use a solid brand-blue background with white text. Secondary buttons are "ghost" style with a 1px border and no fill. Tertiary buttons are text-only with a monospaced label.
- **Cards:** Layered dark cards (`#10161F`) with a 1px border. On hover, the border color shifts to the primary brand blue and a subtle inner-glow appears.
- **Input Fields:** Darker than the card surface (`#070A0F`) with a monospaced placeholder text. The focus state uses a 1px solid green border.
- **Chips/Badges:** Small, monospaced labels with low-opacity background tints (e.g., Green text on 10% opacity green background).
- **Orbital Rings:** Decorative elements using 0.5px strokes. These should be non-functional visual anchors that wrap around specific components or sections to imply a "node" in a larger system.
- **Connection Nodes:** 4px circles at the intersection of grid lines, used to visually anchor cards or data lists.