

# Upgrade Final CTA Section (Section 8)

## Overview
Rewrite `PhilosophyCTA.tsx` from a centered dark glassmorphic card into a white-background split layout: left side with headline, benefits list, and CTA buttons; right side with animated stats in a glassmorphic card. Also create the `PhilosophyQuote` component (from the previously approved but unimplemented Section 7 plan) since it's referenced in the page order.

## Important Note
The Section 7 "Commitment Quote" (`PhilosophyQuote`) was approved but never implemented. I will create it alongside this CTA upgrade so both sections are complete.

## What Changes

### 1. Extend i18n Translation Keys

**English (`en.ts`) -- expand `philosophy.cta`:**
```text
cta: {
  headline: "Ready to Challenge the Status Quo?",
  subtitle: "Schedule a complimentary Financial Needs Assessment. We'll stress-test your current plan against fees, volatility, and taxes -- with zero obligation.",
  primaryCta: "Schedule Assessment",
  secondaryCta: "Download Free Guide",
  benefits: [
    "90-minute strategy session",
    "Complete retirement gap analysis",
    "Three Tax Buckets audit",
    "Fee & tax exposure calculation",
    "No-obligation recommendations"
  ],
  stats: {
    familiesCount: "1,200+",
    familiesLabel: "Families helped bridge the retirement gap since 1998",
    miniStats: [
      { value: "$0", label: "Ongoing AUM fees" },
      { value: "75+", label: "Carrier partnerships" },
      { value: "0%", label: "Floor protection" }
    ]
  }
}
```

**Add `philosophy.quote` block (Section 7):**
```text
quote: {
  text: "We don't work for Wall Street. We don't work for insurance carriers. We work for families who deserve transparency, protection, and a clear path to financial independence. That's been our mission since 1998, and it will never change.",
  author: "Steven Rosenberg",
  role: "Founder & Chief Wealth Strategist",
  company: "Everence Wealth, Est. 1998",
}
```

**Spanish (`es.ts`):** equivalent translations for both blocks.

### 2. Rewrite `PhilosophyCTA.tsx`

**New layout:**
- White background with a subtle dot-grid pattern at low opacity
- `max-w-7xl` container, `grid grid-cols-1 lg:grid-cols-5` layout

**Left side (3 columns):**
- Large evergreen headline from i18n
- Subtitle paragraph
- Benefits list: 5 items, each a flex row with a green checkmark icon and text, staggered `motion.div` entrance
- Two CTA buttons side by side:
  - Primary: gold background (`bg-[hsl(43,74%,49%)]`) with hover gradient sweep, arrow icon
  - Secondary: outlined evergreen border, navigates to guide/download

**Right side (2 columns):**
- `GlassCard` with light styling
- Large animated counter for "1,200+" families (uses `useAnimatedCounter`)
- Gold gradient divider line
- 3-column mini stats grid: `$0`, `75+`, `0%` each with a Lucide icon (`DollarSign`, `Building2`, `Shield`) and label

### 3. Create `PhilosophyQuote.tsx` (Section 7)

- Dark gradient section (`from-[hsl(160,48%,21%)] via-[hsl(160,55%,12%)] to-black`)
- `MorphingBlob` at top-right, low opacity
- Animated quote reveal: text split into words, each `motion.span` fades in with stagger
- Decorative gold quotation marks
- Glassmorphic dark author card with initials avatar "SR", name/role/company, and animated SVG signature path
- Import and render in `Philosophy.tsx` between `PhilosophyWallStreet` and `PhilosophyCTA`

## Updated Section Order
1. PhilosophyHero
2. PhilosophySpeakable
3. PhilosophyPrinciples
4. PhilosophyKillers
5. PhilosophyBuckets
6. PhilosophyCashFlow
7. PhilosophyWallStreet
8. PhilosophyQuote (NEW)
9. PhilosophyCTA (REWRITTEN)

## Technical Details

### Files Created
- `src/components/philosophy/PhilosophyQuote.tsx`

### Files Modified
- `src/components/philosophy/PhilosophyCTA.tsx` -- full rewrite
- `src/pages/Philosophy.tsx` -- add PhilosophyQuote import and render
- `src/i18n/translations/en.ts` -- expand `cta` block + add `quote` block
- `src/i18n/translations/es.ts` -- same

### No New Dependencies
Uses existing `framer-motion`, `lucide-react`, `GlassCard`, `MorphingBlob`, and `useAnimatedCounter`.

### Build Error
The current build error will be resolved as part of this implementation (the truncated logs don't show a specific code error -- the build appears to complete successfully through the sitemap/SSG phase).
