

# Upgrade Philosophy Hero Section -- Modern, Sleek & Professional

## Overview
Rewrite `PhilosophyHero.tsx` to replace the current glassmorphic card layout with a more modern, open composition featuring a cinematic staged reveal, refined typography hierarchy, horizontal stat ticker, and cleaner visual layering.

## Current State
- Full-screen evergreen section with mesh gradient background
- Three parallax-tracked `MorphingBlob` elements
- Grain overlay
- Centered glassmorphic card containing badge, gold divider, headline, paragraph, and two CTA buttons
- Bouncing scroll indicator at bottom

## What Changes

### Visual Upgrades
1. **Remove the glassmorphic card wrapper** -- content floats directly on the background for a cleaner, more editorial feel
2. **Staged cinematic reveal** -- a multi-step orchestrated animation sequence:
   - Gold horizontal line draws in from center (0.3s)
   - Badge fades up (0.5s)
   - Headline reveals with blur-to-sharp + clip-path wipe (0.7s)
   - Paragraph slides up with opacity (1.0s)
   - Stat ticker bar slides up (1.2s)
   - CTAs scale in (1.4s)
3. **Horizontal stat ticker** between the paragraph and CTAs -- three key stats ("25+ Years", "1,200+ Families", "$0 AUM Fees") in a row with thin vertical dividers, adding credibility and visual weight
4. **Refined background** -- keep the mesh gradient layers but reduce to 2 `MorphingBlob`s (cleaner), increase the grain overlay slightly for texture
5. **Modernized CTAs** -- primary button gets a subtle shimmer/shine animation on hover; secondary button uses a clean outline with arrow reveal
6. **Scroll indicator** replaced with a sleek thin line that pulses, instead of the chunky chevron

### i18n
Add three stat entries to `philosophy.hero` in both `en.ts` and `es.ts`:

```text
stats: [
  { value: "25+", label: "Years" },
  { value: "1,200+", label: "Families Served" },
  { value: "$0", label: "AUM Fees" }
]
```

### Component Architecture
The file stays as a single component (`PhilosophyHero`) with no new sub-components needed. The stat ticker is a simple mapped array inline.

## Technical Details

### Files Modified
- `src/components/philosophy/PhilosophyHero.tsx` -- full rewrite
- `src/i18n/translations/en.ts` -- add `stats` array to `philosophy.hero`
- `src/i18n/translations/es.ts` -- add `stats` array to `philosophy.hero`

### No New Files or Dependencies
Uses existing `framer-motion`, `lucide-react`, `MorphingBlob`, and `useTranslation`.

### Animation Sequence (timeline)

```text
0.0s ── Gold divider line scales from center
0.3s ── Badge text fades + slides up
0.5s ── Headline blur-to-sharp reveal
0.9s ── Paragraph fades up
1.1s ── Stats ticker slides up with stagger (each stat 0.1s apart)
1.4s ── CTA buttons scale in
```

### Layout Structure (top to bottom, all centered)
1. Badge (uppercase tracking text, white/40)
2. Gold gradient divider line (animated scaleX)
3. Headline (large, bold, white, blur-to-sharp)
4. Paragraph (white/60, max-w-2xl)
5. Stats ticker row (3 stats with vertical dividers)
6. CTA button pair (ghost + gold)
7. Scroll indicator (thin animated line at bottom)

### Background Layers (back to front)
1. Solid evergreen gradient base
2. Two radial gradient overlays with `animate-mesh-shift`
3. Two `MorphingBlob` elements at low opacity
4. Grain texture overlay at 3% opacity
5. Content (z-10)

### What Is NOT Changed
- No other Philosophy sections affected
- Mouse-move parallax on blobs is preserved
- All existing i18n keys retained (badge, headline, paragraph, ctaPrimary, ctaSecondary)
- Section still has `speakable-section` class and `min-h-screen`

