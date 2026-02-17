
# Add Speakable Introduction Section to Philosophy Page

## Overview
Add a new premium glassmorphic "Speakable Introduction" section between the Hero and Silent Killers sections on the Philosophy page. This section features a word-by-word text reveal animation, an animated counter (1,200+ families), decorative quote marks, a subtle grid pattern background, and SpeakableSpecification schema for SEO.

## What Changes

### 1. Add i18n Translation Keys

Add a `speakable` block inside `philosophy` in both `en.ts` and `es.ts`:

**English:**
```text
speakable: {
  quote: "Everence Wealth operates on a contrarian philosophy: we believe the traditional 'save and wait' retirement model enriches Wall Street, not Main Street families. Since 1998, we've helped over 1,200 families bridge the retirement gap through tax-exempt indexed strategies that eliminate the three silent wealth destroyers -- hidden fees, market volatility, and tax exposure -- that traditional advisors ignore.",
  counterValue: 1200,
  counterLabel: "Families Served Since 1998",
}
```

**Spanish:** equivalent translation with the same keys.

### 2. Create New Component: `PhilosophySpeakable.tsx`

**File:** `src/components/philosophy/PhilosophySpeakable.tsx`

Features:
- **Grid pattern background**: Subtle SVG-based dot or line grid at low opacity
- **Glassmorphic card** (reuses existing `GlassCard` component) centered at `max-w-5xl`, with large padding
- **Decorative quote marks**: Large serif quote characters at top-left and bottom-right, in evergreen at 10% opacity
- **Word-by-word text reveal**: Uses Framer Motion's `whileInView` with staggered children -- each word fades in and slides up slightly as the section scrolls into view
- **Animated counter**: Uses the existing `useCountUp` hook from `src/hooks/useCountUp.ts` with intersection observer trigger, counting from 0 to 1200 with a "+" suffix
- **Gold divider lines**: Gradient horizontal rules flanking the counter
- **SpeakableSpecification JSON-LD**: Adds schema markup with `cssSelector` pointing to `.speakable-philosophy-quote`

### 3. Update Philosophy Page

**File:** `src/pages/Philosophy.tsx`

- Import `PhilosophySpeakable`
- Insert it between `PhilosophyHero` and `PhilosophyKillers` in the render order

## Technical Details

### Word-by-word animation approach
Split the translation string by spaces, wrap each word in a `motion.span` with staggered delay (`index * 0.03s`). Uses `whileInView` with `viewport={{ once: true }}` so it only plays once.

### Counter
Reuses `useAnimatedCounter` from `src/hooks/useCountUp.ts` which already has intersection observer support. Triggers when the element scrolls into view at 30% visibility.

### Files Created
- `src/components/philosophy/PhilosophySpeakable.tsx`

### Files Modified
- `src/i18n/translations/en.ts` -- add `philosophy.speakable` block
- `src/i18n/translations/es.ts` -- add `philosophy.speakable` block  
- `src/pages/Philosophy.tsx` -- import and render `PhilosophySpeakable`

### No new dependencies
Uses existing framer-motion, useCountUp hook, and GlassCard component.
