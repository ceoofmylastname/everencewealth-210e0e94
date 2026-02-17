
# Add "Wall Street vs. Main Street" Split-Screen Section

## Overview
Create a new `PhilosophyWallStreet` component featuring an animated split-screen comparison between the Wall Street model (dark side) and the Everence model (light side), with a morphing vertical divider, floating decorative icons, and staggered comparison items.

## What Changes

### 1. New i18n Translation Keys
Add a `philosophy.wallStreet` block in both `en.ts` and `es.ts`, inserted between `cashFlow` and `cta`:

```text
wallStreet: {
  headline: "Wall Street vs. Main Street",
  left: {
    title: "The Wall Street Model",
    items: [
      { title: "AUM Fees Forever", description: "1-2% annually whether you make money or not" },
      { title: "Market Volatility Risk", description: '"Stay the course" through 50% crashes' },
      { title: "Tax-Deferred Trap", description: "Pay taxes at unknown future rates" },
      { title: "Proprietary Products", description: "Sell what makes THEM the most money" },
      { title: "Suitability Standard", description: 'Only required to recommend "suitable" products, not best' },
    ],
    incentiveLabel: "Their Incentive:",
    incentiveText: "Keep your money \"under management\" as long as possible",
  },
  right: {
    title: "The Everence Model",
    items: [
      { title: "Transparent Pricing", description: "No ongoing AUM fees. You keep what you earn." },
      { title: "0% Floor Protection", description: "Participate in growth, protected from losses" },
      { title: "Tax-Exempt Income", description: "Pay taxes once, withdraw tax-free forever" },
      { title: "75+ Carrier Partnerships", description: "Independent broker. Best solution for YOU." },
      { title: "Fiduciary Obligation", description: "Legally required to act in YOUR best interest" },
    ],
    incentiveLabel: "Our Incentive:",
    incentiveText: "Help you achieve financial independence and retire successfully",
  },
}
```

Spanish: equivalent translations.

### 2. Create New Component
**File:** `src/components/philosophy/PhilosophyWallStreet.tsx`

**Layout:**
- Full-width section with white background
- Centered animated headline (blur-to-sharp reveal, matching other sections)
- Two-column grid (`grid-cols-1 md:grid-cols-2`) with no gap (edge-to-edge split)

**Left column (Wall Street -- dark):**
- `bg-slate-900 text-white p-12 md:p-16`
- Floating decorative elements: 6-8 small `motion.div` circles with dollar-sign opacity animation drifting downward (CSS keyframes, no emoji)
- Red-accented title
- Five `ComparisonItem` rows, each with a red X icon (`lucide-react`), title, and description, staggered entrance from left
- Bottom callout: dark glassmorphic card with red left border showing "Their Incentive"

**Right column (Everence -- light):**
- `bg-[hsl(90,5%,95%)] p-12 md:p-16`
- Floating decorative elements: small circles drifting upward with green tint
- Evergreen-accented title
- Five `ComparisonItem` rows with green checkmark icons, staggered entrance from right
- Bottom callout: solid evergreen card showing "Our Incentive"

**Center divider (desktop only):**
- Absolute positioned `div` at `left-1/2`, full height
- Gradient line (`from-transparent via-evergreen to-transparent`) animating `scaleY` from 0 to 1 on scroll

**Inline sub-components:**
- `ComparisonItem`: accepts `icon`, `title`, `description`, `delay`, renders as a flex row with `motion.div` entrance animation
- `FloatingParticles`: accepts `direction` ("up" | "down") and `color`, renders 6 small absolute-positioned circles with infinite CSS translate animation

### 3. Register in Philosophy Page
**File:** `src/pages/Philosophy.tsx`

Import `PhilosophyWallStreet` and place it between `PhilosophyCashFlow` and `PhilosophyCTA`:

```text
<PhilosophyCashFlow />
<PhilosophyWallStreet />   <-- NEW
<PhilosophyCTA />
```

## Section Order (updated)
1. PhilosophyHero
2. PhilosophySpeakable
3. PhilosophyPrinciples
4. PhilosophyKillers
5. PhilosophyBuckets
6. PhilosophyCashFlow
7. **PhilosophyWallStreet** (NEW)
8. PhilosophyCTA

## Technical Details

### Files Created
- `src/components/philosophy/PhilosophyWallStreet.tsx`

### Files Modified
- `src/pages/Philosophy.tsx` -- add import + render
- `src/i18n/translations/en.ts` -- add `philosophy.wallStreet` block
- `src/i18n/translations/es.ts` -- add `philosophy.wallStreet` block

### No New Dependencies
Uses existing `framer-motion`, `lucide-react` (X, Check icons), and `useInView`.

### What Is NOT Changed
- No other Philosophy sections modified
- All existing i18n keys preserved
- No routing or SEO changes
