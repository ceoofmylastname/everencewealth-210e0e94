

## Plan: Rebuild Slide 05 — Carrier Partners Section

### Overview
Replace the current plain white carrier grid with a premium dark-themed section featuring glassmorphism cards, Clearbit logos, 3D tilt hover effects, and staggered Framer Motion animations — all within the existing presentation slide system.

### Changes

**File: `src/components/presentation/slides/Slide05_CarrierLogos.tsx`** — Full rewrite

- **Background**: Dark `#0D2B20` with two ambient gradient orbs (gold top-right, green bottom-left) absolutely positioned
- **Headline block**: Using `RevealElement` wrappers for staggered reveals:
  - Overline: "TRUSTED CARRIER NETWORK" in gold, uppercase, tracked
  - "Committed to" in white, DM Sans 800, 52px
  - "Bridging the Gap" in Cormorant Garamond italic, gold, 56px
  - Subtext in muted green
- **Carrier grid**: 4-col desktop / 2-col mobile CSS grid with glassmorphism cards (`backdrop-filter: blur(12px)`, semi-transparent bg/border, deep shadows)
- **Logos**: Each card shows a Clearbit logo (`logo.clearbit.com`) with `onError` fallback to carrier name text
- **3D tilt**: `useRef` + `onMouseMove` per card calculating rotateX/rotateY from mouse position relative to card center, max 10deg, with cubic-bezier transition reset on mouseLeave
- **Hover state**: Enhanced border gold opacity, deeper shadows, logo brightness bump
- **Bottom trust bar**: "75+ Carriers · Independent Broker · San Francisco, CA" in muted green, uppercase
- **Fonts**: Import Cormorant Garamond (italic) and DM Sans (400-800) from Google Fonts via `<link>` in a `useEffect` or inline style import

**File: `src/styles/antigravity.css`** — Add carrier section styles

- `.antigravity-carrier-bg` for the dark background
- `.antigravity-carrier-orb-gold` / `.antigravity-carrier-orb-green` for ambient orbs
- `.antigravity-carrier-card` for glassmorphism + shadow base styles

### Technical Details
- Preserves `RevealElement` integration with existing reveal queue (indices 1-3)
- Uses `useState` for per-card tilt tracking (object keyed by card index)
- Clearbit logo URLs hardcoded per the spec
- Framer Motion handles scroll-triggered entry via `RevealElement`; 3D tilt is pure CSS transform via inline styles
- Fully responsive with grid breakpoint at md (768px)

