

# Phase 9.1.1 -- WakeUpCall Component

## Overview
Create a new `WakeUpCall.tsx` component in `src/components/homepage/` that serves as a contrarian hook section challenging traditional retirement advice. It will feature animated number counters, scroll-triggered animations, and a CTA linking to `/assessment`.

## Design
- Dark evergreen background (`#1A4D3E`) with white text
- Three animated stat counters triggered on scroll via Intersection Observer
- Framer Motion for fade-in animations (already installed)
- Reuses the existing `useCountUp` / `useAnimatedCounter` hook for number animation
- Follows existing section patterns (container, responsive padding)

## Technical Details

### New File: `src/components/homepage/WakeUpCall.tsx`

**Structure:**
1. Section wrapper with `bg-[#1A4D3E]` background, full-width, responsive padding
2. Headline: "The Retirement Crisis Wall Street Won't Tell You About"
3. Subhead: "While they promise 8% returns, the math tells a different story"
4. Three stat cards in a responsive grid (1-col mobile, 3-col desktop):
   - "67%" -- "of Americans are behind on retirement savings"
   - "$1.2M" -- "average retirement gap for middle-class families"
   - "72%" -- "don't understand how taxes will impact retirement income"
5. CTA button: "See Your Retirement Gap" linking to `/assessment`

**Animation approach:**
- Use `useAnimatedCounter` from `src/hooks/useCountUp.ts` for each stat (scroll-triggered, already has Intersection Observer built in)
- Wrap the section content in `framer-motion` `motion.div` with `whileInView` fade-in-up for headline/subhead/CTA
- Stat cards get staggered entrance using framer-motion `variants` with increasing delay

**Dependencies used (all already installed):**
- `framer-motion` for scroll-triggered fade animations
- `useAnimatedCounter` hook for number counters
- `react-router-dom` `useNavigate` for CTA navigation
- `lucide-react` for optional icon accents (e.g., `TrendingDown`, `AlertTriangle`)

### Integration into `src/pages/Home.tsx`
- Import `WakeUpCall` from `@/components/homepage/WakeUpCall`
- Place it after the `Hero` section and before `WhyChooseUs` to serve as the emotional hook

### No database, edge function, or translation file changes required
- Content is hardcoded in English for now (Spanish translation can follow in a separate pass)

