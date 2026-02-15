

# Phase 9.1.4 -- IndexedAdvantage Component

## Overview
Create a new `IndexedAdvantage.tsx` component in `src/components/homepage/` that explains indexed strategies (IUL focus) using a two-column layout with an interactive recharts comparison chart on the left and a benefits checklist on the right.

## Design
- White background (`bg-white`) for clean contrast after the cream TaxBuckets section
- Two-column layout: chart left, benefits right (stacks on mobile)
- Interactive recharts `AreaChart` comparing S&P 500 vs IUL with floor/cap
- "Zero is Your Hero" callout box with evergreen accent
- Scroll-triggered framer-motion animations
- CTA: "See Indexed Strategy Comparison" linking to `/strategies`

## Technical Details

### New File: `src/components/homepage/IndexedAdvantage.tsx`

**Structure:**
1. Section wrapper: `bg-white`, responsive padding, `max-w-6xl` container
2. Animated headline: "The Indexed Advantage: Growth Without the Risk" (serif, centered)
3. Animated subhead: "Participate in market gains. Protected from market losses."
4. Two-column grid (`grid-cols-1 lg:grid-cols-2 gap-12`):

**Left Column -- "How Indexed Universal Life Works"**
- Small heading explaining IUL mechanics
- Floor/Cap labels: "Floor: 0% (never lose money)" and "Cap: 10-12% (participation in up years)"
- Recharts `AreaChart` inside a `ChartContainer` (from `src/components/ui/chart.tsx`) with:
  - ~10 year data points showing S&P 500 returns (with negatives) vs IUL returns (floored at 0, capped at ~11)
  - S&P area in semi-transparent red for down years / blue for up
  - IUL area in evergreen (`#1A4D3E`)
  - Tooltip via `ChartTooltip` / `ChartTooltipContent`
  - X-axis (years), Y-axis (% return)
- Chart data hardcoded as a simple array of objects

**Right Column -- Key Benefits**
- Six benefit items, each with a `CheckCircle` icon in evergreen and text:
  - Tax-free death benefit
  - Tax-free cash value access
  - Living benefits (chronic/critical/terminal illness)
  - No RMDs
  - Asset protection from creditors
  - Estate planning tool
- Each item staggers in with framer-motion
- "Zero is Your Hero" callout box: rounded card with `bg-[#1A4D3E]/5` border, bold headline, and short explanation

**CTA:** Centered button below both columns, links to `/strategies` via `useNavigate`

**Animation approach:**
- Headline/subhead: `whileInView` fade-up (same as sibling sections)
- Left column (chart): fades in from left
- Right column (benefits): staggered fade-in from right
- Callout box: slight scale-up on scroll

**Dependencies (all installed):**
- `recharts` + `ChartContainer`/`ChartTooltip` from `src/components/ui/chart.tsx`
- `framer-motion`
- `lucide-react` (`CheckCircle`)
- `react-router-dom` (`useNavigate`)

### Chart Data (hardcoded)
```
Year | S&P 500 | IUL
2014 |   13.7  | 11.0
2015 |    1.4  |  1.4
2016 |   12.0  | 11.0
2017 |   21.8  | 11.0
2018 |   -4.4  |  0.0
2019 |   31.5  | 11.0
2020 |   18.4  | 11.0
2021 |   28.7  | 11.0
2022 |  -18.1  |  0.0
2023 |   26.3  | 11.0
```

### Integration into `src/pages/Home.tsx`
- Import `IndexedAdvantage` from `@/components/homepage/IndexedAdvantage`
- Place it after `TaxBuckets` and before `WhyChooseUs`

### No database, edge function, or translation changes required

