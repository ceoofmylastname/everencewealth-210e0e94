

## Fix: Tax Categories Buckets Appearing All At Once

### Root Cause

There's a race condition in `RevealContext.tsx`. When advancing from the previous slide (Tax Buckets Intro, totalReveals: 4) to Slide 18, the `advance` function calls `setRevealIndex(0)` **inside** an already-running `setRevealIndex` updater. The outer updater returns the old value (`prev = 4`), which overwrites the inner `setRevealIndex(0)`. Result: Slide 18 loads with `revealIndex = 4`, so all cards (at indices 2, 3, 4) appear simultaneously.

### Fix

**`src/components/presentation/RevealContext.tsx`** — Restructure `advance` and `back` to avoid nested state setter conflicts:

- Instead of nesting `setCurrentSlide` inside `setRevealIndex`, read current state and decide the action, then call the appropriate setters sequentially
- Use a ref to track `revealIndex` and `currentSlide` to avoid stale closures
- When advancing to the next slide, set `revealIndex` to 0 **outside** the revealIndex updater

### Expected Result

On Slide 18 (Tax Categories):
- **Click 1**: Title + withdrawal scenario pill appear
- **Click 2**: Ordinary Income card rises in
- **Click 3**: Capital Gains card rises in  
- **Click 4**: Tax Free card rises in
- **Click 5**: Bottom CTA pill appears

No changes needed to `Slide18_TaxCategoriesTransition.tsx` — the reveal indices (2, 3, 4) are already correct.

### Files Modified
- `src/components/presentation/RevealContext.tsx` — fix advance/back to prevent nested state setter race condition

