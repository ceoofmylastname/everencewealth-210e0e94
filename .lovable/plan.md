

# Phase 9.1.3 -- TaxBuckets Component

## Overview
Create a new `TaxBuckets.tsx` component in `src/components/homepage/` that explains the "Three Tax Buckets" strategy. Features three color-coded cards (red/yellow/evergreen) representing Taxable, Tax-Deferred, and Tax-Exempt accounts, with scroll-triggered animations and a CTA linking to `/contact`.

## Design
- Cream background (`bg-[#F0F2F1]`) per brand guidelines
- Three-column responsive grid (stacks on mobile)
- Cards color-coded: red tint, yellow tint, evergreen tint
- Scroll-triggered stagger animation via framer-motion (same pattern as SilentKillers)
- Hover lift effect on cards
- CTA button at bottom: "Get Your Tax Bucket Analysis" linking to `/contact`

## Technical Details

### New File: `src/components/homepage/TaxBuckets.tsx`

**Structure:**
1. Section wrapper with `bg-[#F0F2F1]`, responsive padding, `max-w-6xl` container
2. Headline: "The Three Tax Buckets Strategy" (centered, serif)
3. Subhead: "Strategic positioning across these buckets minimizes lifetime tax exposure"
4. Three cards in `grid grid-cols-1 md:grid-cols-3 gap-8`:

**Card 1 -- TAXABLE** (red tint)
- Background: `bg-red-50`, border: `border-red-200`
- Icon: `TrendingDown` from lucide-react
- Title: "Taxable"
- Tax treatment: "Capital gains + ordinary income"
- Examples: Brokerage accounts, savings, CDs

**Card 2 -- TAX-DEFERRED** (yellow tint)
- Background: `bg-yellow-50`, border: `border-yellow-200`
- Icon: `Clock` from lucide-react
- Title: "Tax-Deferred"
- Tax treatment: "Ordinary income at withdrawal + RMDs"
- Examples: 401(k), Traditional IRA, 403(b)

**Card 3 -- TAX-EXEMPT** (evergreen tint)
- Background: `bg-emerald-50`, border: `border-emerald-200`
- Icon: `Shield` from lucide-react
- Title: "Tax-Exempt"
- Tax treatment: "Zero taxes on qualified distributions"
- Examples: Roth IRA, Indexed Universal Life, Municipal bonds

**Animation:** Reuses the exact `containerVariants`/`cardVariants` stagger pattern from `SilentKillers.tsx`.

**CTA:** Centered button below cards using `useNavigate` to route to `/contact`.

**Dependencies (all installed):** `framer-motion`, `lucide-react` (TrendingDown, Clock, Shield), `react-router-dom`.

### Integration into `src/pages/Home.tsx`
- Import `TaxBuckets` from `@/components/homepage/TaxBuckets`
- Place it after `SilentKillers` and before `WhyChooseUs` (line ~66 area)

### No database, edge function, or translation changes required

