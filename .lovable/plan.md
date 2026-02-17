

# Upgrade "Three Silent Killers" Section with Animated Charts and Compound Effect CTA

## Overview
Rewrite `PhilosophyKillers.tsx` to feature enhanced glassmorphic cards with richer inline SVG chart animations (bar comparison, volatility line, tax comparison), a "solution" callout per card, and a new dark "Compound Effect" CTA block at the bottom with an animated percentage loss counter and particle-style background.

## What Changes

### 1. Extend i18n Translation Keys

Add new fields to the existing `philosophy.killers` block in both `en.ts` and `es.ts`. Existing fields (`badge`, `headline`, `subheadline`, `cards`) remain unchanged. New fields added to each card and a new `compound` object:

**English additions:**
```text
// Each card gets a new "solution" field:
cards[0].solution: "No ongoing AUM fees. Transparent pricing."
cards[1].solution: "0% floor. Zero is your hero. Never lose money."
cards[2].solution: "Tax-exempt withdrawals. No RMDs. Ever."

// New compound effect block:
compound: {
  title: "The Compound Effect",
  description: "These three killers working together can reduce your actual retirement income by 40-60% compared to projections.",
  punchline: "Eliminate all three. Keep your wealth.",
  lossLabel: "of projected wealth lost"
}
```

**Spanish:** equivalent translations.

### 2. Rewrite `PhilosophyKillers.tsx`

**File:** `src/components/philosophy/PhilosophyKillers.tsx`

Full rewrite preserving the same section ID (`philosophy-killers`) and overall structure, but with these upgrades:

**Section background:**
- Gradient from cream to white (`bg-gradient-to-br from-[hsl(90,5%,95%)] to-white`)
- Decorative SVG circular loader element at top-right at very low opacity (pure CSS/SVG animation, no new component file needed)

**Header:** Same blur-to-sharp reveal pattern (kept from current).

**Three-column card grid:**
Each card becomes a `GlassCard` (replacing the plain white TiltCard) with:
- Larger icon in a gradient circle
- Title + description (from existing i18n)
- Enhanced inline SVG chart specific to each card:
  - **Card 1 (Fees):** Horizontal bar comparison -- two bars (red "With 1% Fee" shorter, green "With 0% Fee" full width) with amounts ($1.6M vs $2.3M) animating width on scroll
  - **Card 2 (Volatility):** Line chart with two series -- red dashed "Market" line showing drop-and-partial-recovery, green solid "Protected" line staying flat/growing, drawn via stroke-dashoffset
  - **Card 3 (Taxes):** Stacked horizontal bar comparison -- 401k bar showing gross broken into federal/state/net segments vs IUL bar showing full net, animating in on scroll
- New "Solution" callout at bottom of each card: green-tinted background strip with checkmark icon and solution text from i18n
- Hover lift (`whileHover={{ y: -8 }}`)
- Existing stat callout preserved at the bottom

**Compound Effect CTA (new block below the grid):**
- Dark glassmorphic card (`GlassCard` with `dark` prop) centered at `max-w-4xl`
- Decorative floating dots (4-6 small `motion.div` circles animating opacity and position, same pattern as homepage SilentKillers particles)
- Title, description, punchline from i18n
- Animated percentage: uses `useAnimatedCounter` hook counting from 100 down to 50 (representing wealth lost), displayed as large text with a "%" suffix
- Gold divider line above punchline

**Removed:** `TiltCard` component (replaced by `GlassCard`).

### 3. Inline SVG Chart Components (inside PhilosophyKillers.tsx)

Three new chart components replacing the existing `FeesChart`, `VolatilityChart`, `TaxChart`:

- **FeesBarComparison:** Two horizontal SVG rects animating width from 0 to target values. Labels and dollar amounts rendered as SVG text elements. Colors: red (#EF4444) for "with fees", green (#10B981) for "without fees".

- **VolatilityLineChart:** Two SVG polylines with stroke-dashoffset draw animation. Red dashed line: 100 -> 50 -> 75 (market with loss). Green solid line: 100 -> 100 -> 112 (protected with floor). Y-axis inverted to show value. Small circle dots at data points.

- **TaxComparisonChart:** Two horizontal stacked bars. Top bar (401k): shows gross $50K split into federal ($11K red), state ($3.5K orange), net ($35.5K gray). Bottom bar (IUL): full $50K in green. Width animation on scroll.

All triggered by `useInView` with `once: true`.

## Technical Details

### Files Modified
- `src/components/philosophy/PhilosophyKillers.tsx` -- full rewrite
- `src/i18n/translations/en.ts` -- add `solution` to each card + `compound` block in `philosophy.killers`
- `src/i18n/translations/es.ts` -- same additions in Spanish

### No New Files Created
Everything stays in `PhilosophyKillers.tsx`.

### No New Dependencies
Uses existing `framer-motion`, `lucide-react`, `GlassCard`, and `useAnimatedCounter` hook.

### What Is Preserved
- Section ID `philosophy-killers`
- All existing i18n keys (`badge`, `headline`, `subheadline`, `cards` with `id`, `title`, `description`, `stat`, `statLabel`)
- Section position in Philosophy page (between PhilosophyPrinciples and PhilosophyBuckets)
- No changes to any other files

