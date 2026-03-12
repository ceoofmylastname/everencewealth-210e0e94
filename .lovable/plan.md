

## Plan: Fix "REMOVES IT" Visibility

**Problem**: The `filter: drop-shadow()` animation (`te-gold-glow`) is causing the gradient-clipped text to render as a solid gold block. In many browsers, applying `filter` to an element using `background-clip: text` breaks the transparency and fills the entire element.

**Fix in `src/pages/TrainingEvent.tsx`**:

1. **Remove the `te-gold-glow` animation** from the span's `animation` property — keep only `te-gold-gradient-shift`
2. **Wrap the span in a container** that applies the glow effect separately, OR simply drop the glow entirely and let the gradient animation carry the visual weight
3. Keep all other properties (`backgroundClip`, `color: transparent`, `WebkitTextFillColor: transparent`, `textTransform: uppercase`)

**Specific change** (line 363):
- Change `animation` from `'te-gold-gradient-shift 3s ease infinite, te-gold-glow 3s ease-in-out infinite'` to just `'te-gold-gradient-shift 3s ease infinite'`
- Optionally add a subtle `textShadow` on a **wrapper element** around the span for the glow, since `text-shadow` on a `color: transparent` element won't render either

**Files modified**: `src/pages/TrainingEvent.tsx` (1 line change)

