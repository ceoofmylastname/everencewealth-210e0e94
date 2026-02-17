

# Add "Three Core Principles" Section to Philosophy Page

## Overview
Add a brand-new section between PhilosophySpeakable and PhilosophyKillers featuring three premium glassmorphic cards -- "Cash Flow Over Net Worth," "Zero is Your Hero," and "Fiduciary, Always" -- each with custom inline SVG mini-charts (bar, line, donut), hover-lift animations, and gradient overlays.

## What Changes

### 1. Add i18n Translation Keys

Add a `principles` block inside `philosophy` in both `en.ts` and `es.ts`:

**English keys:**
```text
principles: {
  badge: "Our Core Principles",
  headline: "Three Beliefs That Guide Every Recommendation",
  subheadline: "Three fundamental beliefs that guide every recommendation we make",
  cards: [
    {
      title: "Cash Flow Over Net Worth",
      description: "Wall Street obsesses over account balances you can't spend. We focus on tax-free income you can actually use.",
      chartLabel: "The Reality:",
      chartNote: "$5,000/month tax-free cash flow beats $1M in a 401k you can't touch until age 59 1/2",
      bars: [
        { label: "$5K/mo Tax-Free", value: 100 },
        { label: "$1M in 401k", value: 60 }
      ]
    },
    {
      title: "Zero is Your Hero",
      description: "Warren Buffett's Rule #1: Never lose money. We engineer that literally with 0% floor protection.",
      chartLabel: "The Math:",
      chartNote: "A 50% loss requires a 100% gain just to break even. Zero is your hero."
    },
    {
      title: "Fiduciary, Always",
      description: "We're legally required to act in your best interest -- not maximize our commissions.",
      chartLabel: "The Difference:",
      chartNote: "Wall Street advisors earn more when you stay invested. We earn nothing if you lose.",
      centerText: "100%",
      centerLabel: "Client First"
    }
  ]
}
```

Spanish: equivalent translations with the same structure.

### 2. Create New Component: `PhilosophyPrinciples.tsx`

**File:** `src/components/philosophy/PhilosophyPrinciples.tsx`

Features:
- **Background:** Two `MorphingBlob` instances (reused from existing component) at low opacity behind the grid
- **Section header:** Badge + blur-to-sharp headline reveal (matching existing pattern from PhilosophyKillers)
- **Three-column grid** of glassmorphic cards using `GlassCard` component
- Each card contains:
  - **Gradient overlay on hover** (evergreen-to-gold, evergreen-to-blue, evergreen-to-purple respectively)
  - **Icon pair** at top (static icon, no morphing library needed -- just swap icon opacity on group-hover via CSS transitions)
  - **Title + description** text from i18n
  - **Custom inline SVG mini-chart** specific to each card:
    - Card 1: Two horizontal bars (custom SVG rects with width animation on scroll)
    - Card 2: Two polylines (market vs IUL) with stroke-dashoffset draw animation
    - Card 3: Donut/ring chart (SVG circle with stroke-dasharray arc animation + centered text)
  - **Hover lift:** `whileHover={{ y: -10 }}` via Framer Motion
- All charts animate on scroll into view using `useInView`

### 3. Custom SVG Charts (inline in component)

Three small chart components defined inside PhilosophyPrinciples.tsx (no separate files needed):

- **PrincipleBarChart:** Two horizontal SVG `<rect>` bars that animate width from 0 to target on scroll. Labels below each bar.
- **PrincipleLineChart:** Two SVG `<polyline>` lines (red "Market" dashed, green "IUL" solid) with stroke-dashoffset animation. Three data points showing loss-recovery scenario.
- **PrincipleDonutChart:** SVG `<circle>` with large stroke-width, `stroke-dasharray` animated to show 100% fill. Center text "100%" and "Client First" label.

### 4. Update Philosophy Page

**File:** `src/pages/Philosophy.tsx`

- Import `PhilosophyPrinciples`
- Insert between `PhilosophySpeakable` and `PhilosophyKillers`

## Section Order After Change

1. PhilosophyHero
2. PhilosophySpeakable
3. **PhilosophyPrinciples** (NEW)
4. PhilosophyKillers
5. PhilosophyBuckets
6. PhilosophyCashFlow
7. PhilosophyCTA

## Technical Details

### Icon Hover Effect
Instead of a complex "MorphingIcon" component, use a simple CSS-based icon swap: both icons are rendered, the secondary starts at `opacity-0 scale-75`, on `group-hover` it transitions to `opacity-100 scale-100` while the primary fades out. Pure CSS, no JS animation loop.

### Files Created
- `src/components/philosophy/PhilosophyPrinciples.tsx`

### Files Modified
- `src/i18n/translations/en.ts` -- add `philosophy.principles` block
- `src/i18n/translations/es.ts` -- add `philosophy.principles` block
- `src/pages/Philosophy.tsx` -- import and render PhilosophyPrinciples

### No new dependencies
Uses existing framer-motion, lucide-react, MorphingBlob, and GlassCard components.

