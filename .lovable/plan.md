

## Problem

The Compound Interest slide content exceeds the fixed 1080px slide height. The previous padding fix added `paddingTop: 40` and `overflow: auto`, but the title is still clipped because the `antigravity-slide-inner` has `height: 100%` and the content within it is too tall.

## Solution

Resize the content to fit within the 1080px slide without needing scroll. Changes to `Slide07_CompoundInterest.tsx`:

1. **Remove `overflow: auto`** — slides should not scroll; revert to `overflow: hidden` and `align-items: center` (default behavior).
2. **Reduce vertical spacing** — shrink margins, font sizes, and padding throughout the slide to make everything fit within the fixed canvas:
   - Reduce title font size from `clamp(36px, 4.5vw, 56px)` to ~40px
   - Reduce subtitle/description margins
   - Reduce card internal spacing (rate circle size, row padding, doubling text margins)
   - Reduce gap between cards and bottom pill
3. **Remove explicit `paddingTop`/`paddingBottom`** inline overrides — let the default `antigravity-slide-inner` padding (48px 64px) handle it.

This ensures the entire slide fits within the 1920×1080 canvas without clipping or scrolling.

