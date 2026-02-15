

# Phase 9.1.5 -- WealthPhilosophy Component

## Overview
Create a new `WealthPhilosophy.tsx` component that contrasts the "Traditional Model" against the "Everence Model" in a side-by-side comparison, followed by a Warren Buffett pullquote. Positioned after `IndexedAdvantage` and before `WhyChooseUs` on the homepage.

## Design
- Cream background (`bg-[#F0F2F1]`) section with `max-w-6xl` container
- Centered headline ("From Accumulation to Abundance") and subhead in serif font
- Two-column grid (`grid-cols-1 md:grid-cols-2 gap-8`) with color-coded cards:
  - **Left card (Traditional):** `bg-red-50`, `border-red-200` -- six items prefixed with X icons in red
  - **Right card (Everence):** `bg-emerald-50`, `border-emerald-200` -- six items prefixed with CheckCircle icons in evergreen
- Pullquote block below the grid with italic serif text, attributed to Warren Buffett, using a left border accent in evergreen
- Scroll-triggered stagger animations matching the existing `containerVariants`/`cardVariants` pattern from sibling components

## Technical Details

### New File: `src/components/homepage/WealthPhilosophy.tsx`

**Structure:**
1. Section wrapper: `bg-[#F0F2F1]`, responsive padding, `max-w-6xl` container
2. Animated headline: "From Accumulation to Abundance" (serif, centered)
3. Animated subhead: "Rethinking the retirement model"
4. Two cards in `grid grid-cols-1 md:grid-cols-2 gap-8`:

**Left Card -- Traditional Model**
- Title: "Traditional Model" with red accent
- Six line items with `X` icon (lucide-react) in red:
  - Save and wait
  - Gamble on market timing
  - Accept volatility as "normal"
  - Pay fees to middlemen
  - Hope your nest egg lasts
  - Stress over RMDs and taxes

**Right Card -- Everence Model**
- Title: "Everence Model" with evergreen accent
- Six line items with `CheckCircle` icon in evergreen:
  - Build tax-free cash flow
  - Eliminate sequence-of-returns risk
  - Protect principal with floor guarantees
  - Work with a fiduciary, not a salesman
  - Create generational wealth transfer
  - Control your tax destiny

**Pullquote:**
- Centered block below grid with `border-l-4 border-[#1A4D3E]` left accent
- Italic serif quote: "Warren Buffett's Rule #1: Never lose money. Rule #2: Never forget Rule #1."
- Attribution line below

**Animation:** Reuses `containerVariants`/`cardVariants` stagger pattern. Pullquote fades in separately with slight delay.

**Dependencies (all installed):** `framer-motion`, `lucide-react` (`X`, `CheckCircle`)

### Integration into `src/pages/Home.tsx`
- Import `WealthPhilosophy` from `@/components/homepage/WealthPhilosophy`
- Insert `<WealthPhilosophy />` after `<IndexedAdvantage />` (line 73) and before `<WhyChooseUs />` (line 76)
- Add comment: `{/* 1.9. Wealth Philosophy — contrarian positioning */}`

### No database, edge function, or translation changes required

