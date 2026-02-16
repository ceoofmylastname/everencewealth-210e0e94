

# Phase 9.7 -- Animation and Visual Polish

## Overview
Add consistent scroll-triggered `framer-motion` animations to the remaining homepage sections that currently lack them, and create a subtle cursor glow effect component.

## Current State

Sections already animated with framer-motion (no changes needed):
- WakeUpCall, SilentKillers, TaxBuckets, IndexedAdvantage, WealthPhilosophy, FiduciaryDifference, HomepageAbout, Testimonials

Sections using older CSS `reveal-on-scroll` class (upgrade to framer-motion):
- WhyChooseUs -- no animation at all
- QuickSearch -- no animation at all
- MiniAbout / USPSection (ContentBlocks.tsx) -- CSS reveal
- FeaturedAreas -- CSS reveal on header/footer
- Process -- CSS reveal
- Reviews / BlogTeaser / GlossaryTeaser (ReviewsAndBlog.tsx) -- CSS reveal
- Final CTA block in Home.tsx -- CSS reveal

Hero stays as-is (above the fold, no scroll trigger needed).

## Changes

### 1. Shared animation wrapper: `src/components/homepage/ScrollReveal.tsx` (new file)

A lightweight wrapper component using framer-motion:

```tsx
<motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  {children}
</motion.div>
```

Props: `children`, optional `className`, optional `delay` (number).

### 2. Update sections without framer-motion

**WhyChooseUs.tsx**: Wrap the section content in `<ScrollReveal>`. Add staggered card animation using `motion.div` with `variants` for each benefit card (0.1s stagger).

**QuickSearch.tsx**: Wrap the outer container in `<ScrollReveal>`.

**ContentBlocks.tsx (MiniAbout + USPSection)**: Replace `reveal-on-scroll animate-fade-in-up` CSS classes with `<ScrollReveal>`. Replace `reveal-on-scroll stagger-N` on USP cards with `motion.div` variants (0.1s stagger).

**FeaturedAreas.tsx**: Replace `reveal-on-scroll animate-fade-in-down` on the header with `<ScrollReveal>`. Replace `reveal-on-scroll` on mobile CTA.

**Process.tsx**: Replace `reveal-on-scroll animate-fade-in-down` on header with `<ScrollReveal>`. Replace `reveal-on-scroll stagger-N` on step cards with `motion.div` variants. Replace `reveal-on-scroll` on bottom CTA.

**ReviewsAndBlog.tsx**: Replace all `reveal-on-scroll` classes in Reviews, BlogTeaser, and GlossaryTeaser with `<ScrollReveal>`. Blog article cards get staggered `motion.div`.

### 3. Update Final CTA in Home.tsx

Replace `reveal-on-scroll` on the Final CTA `<div>` (inside the contact section) with `<ScrollReveal>`.

### 4. CursorGlow component: `src/components/CursorGlow.tsx` (new file)

A subtle radial glow that follows the cursor on desktop only:

- Listens to `mousemove` on `window`
- Renders a fixed-position `div` with a radial gradient (evergreen/gold, ~300px diameter, very low opacity ~0.06)
- Uses `pointer-events: none` so it never interferes with clicks
- Hidden on touch devices (check `window.matchMedia('(hover: hover)')`)
- Uses `requestAnimationFrame` for smooth tracking

### 5. Add CursorGlow to Home.tsx

Import and render `<CursorGlow />` inside the `<main>` element.

### Files modified
- `src/components/homepage/ScrollReveal.tsx` (create)
- `src/components/CursorGlow.tsx` (create)
- `src/components/home/sections/WhyChooseUs.tsx` (update)
- `src/components/home/sections/QuickSearch.tsx` (update)
- `src/components/home/sections/ContentBlocks.tsx` (update)
- `src/components/home/sections/FeaturedAreas.tsx` (update)
- `src/components/home/sections/Process.tsx` (update)
- `src/components/home/sections/ReviewsAndBlog.tsx` (update)
- `src/pages/Home.tsx` (update -- Final CTA + CursorGlow)

### No database, edge function, or translation changes required

