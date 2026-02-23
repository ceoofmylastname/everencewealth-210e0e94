

# Hardcoded Modern Headline + Mobile Optimization

## Changes to `src/pages/public/WorkshopLanding.tsx`

### 1. Replace Dynamic Headline with Hardcoded Copy

Remove the word-by-word dynamic headline logic (`headlineWords`, `headline` variable) and replace with a hardcoded headline and subheadline featuring styled words:

**Headline:** "Build Your **Tax-Free** Retirement"
- "Tax-Free" gets a gold underline decoration (`border-b-4 border-[#EDDB77]`)
- "Retirement" gets a highlighted background (`bg-[#EDDB77]/20 px-2 rounded-lg`)

**Subheadline:** "Join a complimentary workshop and discover proven strategies to eliminate taxes, protect your wealth, and retire with confidence."

### 2. Animation

Replace the word-by-word `motion.span` loop with a single `motion.h1` that fades up smoothly:
```tsx
<motion.h1
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
>
  Build Your{" "}
  <span className="border-b-4 border-[#EDDB77] pb-1">Tax-Free</span>{" "}
  <span className="bg-[#EDDB77]/20 px-2 rounded-lg">Retirement</span>
</motion.h1>
```

Subheadline animates in with a 0.3s delay.

### 3. Mobile Optimization

- Hero padding: reduce to `py-10` on mobile (currently `py-16`)
- Headline size: `text-2xl` on mobile, scaling up through breakpoints
- Grid: already `grid-cols-1` on mobile -- no change needed
- Form card: ensure full-width on mobile with `px-4` padding
- Info pills: use `flex-wrap` (already set) with smaller text on mobile
- "What You'll Learn" cards: single column on mobile (already set)
- Ensure the hero gradient covers the full viewport on mobile

### 4. Remove Unused Variables

Remove `headlineWords`, the `headline` const, and the `subheadline` const since they are no longer used dynamically.

