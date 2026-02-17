

# Upgrade Tax Buckets Section to Interactive 3D Visualization

## Overview
Transform the existing `PhilosophyBuckets` section from a three-column feature-list layout into a two-column interactive experience: a 3D bucket visualization on the left (using React Three Fiber) with adjustable sliders, and detailed bucket explanation cards on the right with animated tax-rate badges and a recommendation CTA.

## What Changes

### 1. Install 3D Dependencies
Add `@react-three/fiber@^8.18`, `@react-three/drei@^9.122.0`, and `three@^0.133` (compatible with React 18).

### 2. Add i18n Translation Keys
Extend `philosophy.buckets` in both `en.ts` and `es.ts` with new keys for the interactive layout:

```text
buckets: {
  // ... keep existing badge, headline, subheadline, recommended, columns ...
  sliderLabel: "Adjust Your Allocation:",
  warningPrefix: "Warning:",
  warningSuffix: "in tax-deferred = massive tax exposure in retirement",
  explanations: [
    {
      number: "1",
      title: "Bucket 1: Taxable",
      description: "Brokerage accounts, savings, CDs. You paid taxes on deposits, AND you'll pay capital gains on growth. Double taxation.",
      taxRate: 20,
      taxLabel: "Capital Gains",
    },
    {
      number: "2",
      title: "Bucket 2: Tax-Deferred",
      description: "401k, Traditional IRA, 403b. Tax deduction today, but you'll pay ordinary income tax on EVERY dollar withdrawn. Plus RMDs force withdrawals whether you need them or not.",
      taxRate: 37,
      taxLabel: "Ordinary Income",
      extraBadge: "+ RMDs",
    },
    {
      number: "3",
      title: "Bucket 3: Tax-Exempt",
      description: "Roth IRA, Indexed Universal Life, Municipal Bonds. Pay taxes on the seed, never on the harvest. No RMDs. No age restrictions.",
      taxRate: 0,
      taxLabel: "Tax-Free Forever",
      extraBadge: "No RMDs",
    },
  ],
  recommendation: {
    title: "Everence Wealth Recommendation:",
    text: "Minimize Bucket 1 (taxable). Maximize Bucket 3 (tax-exempt). Use Bucket 2 (tax-deferred) strategically up to employer match only.",
  },
}
```

Spanish: equivalent translations.

### 3. Create New Component: `AnimatedBucket.tsx`
**File:** `src/components/philosophy/AnimatedBucket.tsx`

A React Three Fiber 3D component rendering a transparent cylindrical bucket with an animated "liquid fill" inside:
- Cylinder geometry for the bucket shell (transparent glass material)
- Inner cylinder for liquid that scales on the Y-axis based on `fillLevel` prop (0-100)
- Liquid color maps to bucket type (red, yellow, green)
- Gentle bobbing animation on the liquid surface using `useFrame`
- Label rendered as `<Html>` overlay from `@react-three/drei`

### 4. Rewrite `PhilosophyBuckets.tsx`
**File:** `src/components/philosophy/PhilosophyBuckets.tsx`

Complete rewrite into a two-column layout:

**Left column (interactive 3D):**
- `<Canvas>` from React Three Fiber with three `AnimatedBucket` instances
- `OrbitControls` from drei (no zoom, slow auto-rotate)
- Ambient + point light
- Glassmorphic overlay at bottom with three custom range sliders
- Sliders control bucket fill levels via React state (values must sum to 100 -- adjusting one redistributes the others)
- Warning alert animates in when tax-deferred exceeds 50%

**Right column (explanations):**
- Three glassmorphic explanation cards, each with:
  - Colored left border (red, yellow, green)
  - Numbered circle badge
  - Title, description from i18n
  - `TaxRateBadge` inline component: animated circular progress showing the tax rate percentage
  - Optional extra badge ("+RMDs", "No RMDs")
- Slide-in-from-right animation staggered by 0.2s
- Bottom recommendation CTA card with evergreen-to-gold gradient, grid pattern background, and CheckCircle icon

**Preserved:** All existing i18n keys (`badge`, `headline`, `subheadline`, `recommended`, `columns`) remain in translations for backward compatibility. The new layout uses the new `explanations` and `recommendation` keys.

### 5. Inline Sub-Components (inside PhilosophyBuckets.tsx)

- **TaxBucketSlider:** A styled `<input type="range">` with colored track matching bucket color, current value label, and custom thumb
- **TaxRateBadge:** Small SVG donut (similar to PrincipleDonutChart) showing rate as arc fill, with percentage text in center

## Section Order (unchanged)
1. PhilosophyHero
2. PhilosophySpeakable
3. PhilosophyPrinciples
4. PhilosophyKillers
5. **PhilosophyBuckets** (upgraded in-place)
6. PhilosophyCashFlow
7. PhilosophyCTA

## Technical Details

### 3D Performance
- Canvas renders at device pixel ratio capped at 2
- OrbitControls with `enableZoom={false}` and `enablePan={false}`
- Bucket geometry is simple cylinders (low poly count)
- `useFrame` runs liquid bob animation (GPU-accelerated)
- Lazy-loaded via `React.lazy` + `Suspense` with a fallback showing a static SVG representation

### Slider Logic
State: `[taxable, deferred, exempt]` initialized to `[30, 60, 10]`. When one slider changes, the other two adjust proportionally to keep the sum at 100.

### Files Created
- `src/components/philosophy/AnimatedBucket.tsx`

### Files Modified
- `src/components/philosophy/PhilosophyBuckets.tsx` -- full rewrite
- `src/i18n/translations/en.ts` -- extend `philosophy.buckets`
- `src/i18n/translations/es.ts` -- extend `philosophy.buckets`

### New Dependencies
- `@react-three/fiber@^8.18`
- `@react-three/drei@^9.122.0`
- `three@^0.133`

### What Is NOT Changed
- No other Philosophy sections modified
- All existing i18n keys preserved (columns data stays for any other usage)
- No routing or SEO changes
