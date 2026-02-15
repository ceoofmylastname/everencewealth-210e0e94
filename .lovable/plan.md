

# Phase 9.1.6 -- FiduciaryDifference Component

## Overview
Create a new `FiduciaryDifference.tsx` component with a dark evergreen background and white text, featuring a three-column grid of cards explaining the fiduciary advantage. Positioned after `WealthPhilosophy` and before `WhyChooseUs` on the homepage.

## Design
- Dark evergreen background (`bg-[#1A4D3E]`) for strong contrast after the cream WealthPhilosophy section
- White text throughout
- Three cards with semi-transparent white backgrounds (`bg-white/10`, `border border-white/20`)
- Scroll-triggered stagger animations (same `containerVariants`/`cardVariants` pattern)
- Trust badges row at the bottom (text-based: "Licensed in 50 States", "75+ Carriers", "Fiduciary Standard")

## Technical Details

### New File: `src/components/homepage/FiduciaryDifference.tsx`

**Structure:**
1. Section wrapper: `bg-[#1A4D3E]`, responsive padding, `max-w-6xl` container
2. Animated headline: "The Fiduciary Difference" (white, serif, centered)
3. Animated subhead: "Independent. Objective. In your corner." (white/70)
4. Three cards in `grid grid-cols-1 md:grid-cols-3 gap-8`:

**Card 1 -- Independent Broker**
- Icon: `Building2` (white)
- Title: "Independent Broker"
- Three bullet points:
  - Access to 75+ carriers
  - Not captive to one company
  - Shop the market for your best fit

**Card 2 -- Fiduciary Duty**
- Icon: `ShieldCheck` (white)
- Title: "Fiduciary Duty"
- Three bullet points:
  - Legally obligated to act in YOUR best interest
  - No hidden commission conflicts
  - Transparent fee structure

**Card 3 -- Holistic Planning**
- Icon: `Network` (white)
- Title: "Holistic Planning"
- Three bullet points:
  - Retirement gap analysis
  - Tax bucket optimization
  - Estate and legacy planning

**Trust Badges:** A row of three text badges below the cards with subtle dividers (`border-t border-white/20`, flex row). Simple text items like "Licensed in 50 States", "75+ Carriers", "Fiduciary Standard" with small icons.

**Animation:** Same `containerVariants`/`cardVariants` stagger pattern as sibling components.

**Dependencies (all installed):** `framer-motion`, `lucide-react` (`Building2`, `ShieldCheck`, `Network`)

### Integration into `src/pages/Home.tsx`
- Import `FiduciaryDifference` from `../components/homepage/FiduciaryDifference`
- Insert `<FiduciaryDifference />` after `<WealthPhilosophy />` (line 77) and before `<WhyChooseUs />` (line 79)
- Add comment: `{/* 1.10. Fiduciary Difference — trust builder */}`

### No database, edge function, or translation changes required

