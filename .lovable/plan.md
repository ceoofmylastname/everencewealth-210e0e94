

# Redesign Terms of Service Page to Match Privacy Policy

## Overview
Rewrite `src/pages/TermsOfService.tsx` to match the premium bento-grid editorial design of the Privacy Policy page, replacing the current dark navy accordion layout with the same evergreen/gold glassmorphic aesthetic.

## What Changes

**File: `src/pages/TermsOfService.tsx`** (full rewrite)

### Visual Design (mirroring Privacy Policy exactly)
- Background: Deep evergreen `#0B1F18` with mesh gradient blobs (`#1A4D3E` and `#C5A059`)
- Gold scroll-progress bar at top using `framer-motion useScroll + useSpring`
- Fixed header with logo image (same URL) and "Home" back link
- Full-viewport hero with "TERMS OF SERVICE" in bold uppercase
- Gold horizontal rule divider and Everence Wealth subtitle
- Responsive bento grid (2-column on desktop, single on mobile)
- Glassmorphic cards: `bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl`
- Watermark numbers (01-07) in each card background
- Gold icon badges in top-left of each card
- Hover effects: gold border glow, slight scale-up, title color shift to gold
- Footer CTA glassmorphic card with gold "Contact Us" button
- Bottom bar with Privacy, Terms, and Disclosures links

### Layout
- Sections 1 and 7 (Acceptance and Contact) span full width (`lg:col-span-2`)
- Sections 2-6 alternate in the 2-column grid
- Staggered `whileInView` animations with `cardVariants`

### Content (kept as-is, already Everence Wealth branded)
All 7 sections retain their current financial advisory content -- no real estate or Del Sol references exist. The content already references Everence Wealth, California law, and fiduciary services.

### Removed Elements
- Dark navy `#0a0f1a` background and blue/purple gradient orbs
- SVG grid pattern background
- Accordion expand/collapse interaction (replaced with always-visible bento cards)
- "Key Points to Remember" summary cards section (redundant with bento layout)
- `font-serif` typography (replaced with bold uppercase tracking)
- Text "EVERENCE WEALTH" in header (replaced with logo image)

### Technical Details
- Import `useScroll, useSpring` from framer-motion (drop `AnimatePresence`)
- Remove `useState` (no accordion state needed)
- Use same `LOGO_URL` constant as Privacy Policy
- Same `cardVariants` animation config as Privacy Policy
- Add `/disclosures` link to footer
