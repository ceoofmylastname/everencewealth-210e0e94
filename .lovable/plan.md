

# Phase 9.1.2 -- SilentKillers Component

## Overview
Create a new `SilentKillers.tsx` component in `src/components/homepage/` that introduces the "Three Silent Killers" framework (Fees, Volatility, Taxes). Each killer gets a card with an icon, headline stat, explanatory example, and a small illustrative visual (animated bar/curve/ladder using simple divs + framer-motion). White background section with evergreen-accented cards.

## Design
- White/cream (`bg-slate-50`) background to contrast the preceding dark WakeUpCall section
- Three-column responsive grid (stacks on mobile)
- Each card: rounded border in `border-[#1A4D3E]/20`, hover lift (`hover:-translate-y-1 hover:shadow-lg`), padding, white bg
- Scroll-triggered stagger animation via framer-motion `whileInView` with increasing delay
- Small illustrative visuals inside each card built with styled divs + framer-motion (no charting library needed)

## Technical Details

### New File: `src/components/homepage/SilentKillers.tsx`

**Structure:**
1. Section wrapper with light background, responsive padding, `max-w-6xl` container
2. Headline: "The Three Silent Killers Eroding Your Wealth" (centered, serif font)
3. Three cards in a `grid grid-cols-1 md:grid-cols-3 gap-8`:

**Card 1 -- FEES**
- Icon: `TrendingDown` (lucide-react)
- Stat headline: "2% annual fees can cost you $400K+ over 30 years"
- Example text: "A $500K portfolio with 2% fees vs 0.5% fees"
- Visual: Two animated horizontal bars (one shorter representing eroded value, one full) using `motion.div` width animation on scroll

**Card 2 -- VOLATILITY**
- Icon: `Activity` (lucide-react)
- Stat headline: "Market crashes require 100% gains to recover from 50% losses"
- Example text: "The math of recovery time"
- Visual: A simple zigzag SVG path that draws itself on scroll using `motion.path` with `pathLength` animation

**Card 3 -- TAXES**
- Icon: `Receipt` (lucide-react)
- Stat headline: "RMDs can push retirees into 35%+ tax brackets"
- Example text: "Traditional IRA tax time bomb"
- Visual: Three stacked bars of increasing width (tax bracket ladder) that grow in on scroll

**Animation approach:**
- Parent uses `staggerChildren` variant via framer-motion
- Each card uses `whileInView` with `once: true` and staggered delay (0, 0.15, 0.3)
- Internal visuals animate when card is in view (tied to same viewport trigger)
- Hover effect via Tailwind `transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`

**Dependencies (all installed):**
- `framer-motion`
- `lucide-react` (TrendingDown, Activity, Receipt)

### Integration into `src/pages/Home.tsx`
- Import `SilentKillers` from `@/components/homepage/SilentKillers`
- Place it after `WakeUpCall` and before `WhyChooseUs`

### No database, edge function, or translation changes required

