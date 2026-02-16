

## Fix Stacking Card Scroll Animation

The current StackingCards wrapper has the right idea but needs refinement so each card properly rises from below and covers the previous one with visible depth.

### What Changes

**File: `src/components/homepage/StackingCards.tsx`**

- Add `min-h-screen` to each card's outer wrapper to provide enough scroll distance for the covering effect
- Ensure the sticky container has proper `top-0` pinning so cards stay at the viewport top
- Add a stronger upward-facing box shadow on each card to create the "backlight" illusion as it slides over the previous section
- Add a subtle `border border-white/10` glow ring for glassmorphic depth separation
- Keep `overflow-hidden` with `rounded-3xl` so each section's content is clipped to the rounded card shape

### Technical Details

The current implementation is structurally sound. The key fixes are:

1. **Ensure each section's background fills the card fully** -- each component (SilentKillers, TaxBuckets, IndexedAdvantage) already has its own `bg-` class, so the rounded corners and overflow-hidden on the wrapper will clip them into card shapes.

2. **Stronger shadow for the "backlight" effect** -- upgrade from `shadow-[0_-8px_30px_rgba(0,0,0,0.3)]` to a dual-layer shadow with an emerald/gold tinted glow: `shadow-[0_-8px_30px_rgba(0,0,0,0.4),0_-4px_20px_rgba(26,77,62,0.3)]`

3. **Increase scroll breathing room** -- each card wrapper uses `min-h-[110vh]` instead of `min-h-screen` to give more scroll distance before the next card starts covering, making the animation feel smoother.

4. **Last card exception** -- the final card (IndexedAdvantage) should use `min-h-screen` (not 110vh) since nothing follows it.

| File | Change |
|---|---|
| `src/components/homepage/StackingCards.tsx` | Enhance shadow, increase scroll spacing, refine sticky behavior |

This is a small, targeted update -- the architecture is already in place from the previous implementation.
