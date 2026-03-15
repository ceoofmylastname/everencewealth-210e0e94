

## Add Background Watermark Logo to Presentation Slides

### What
Place the Everence Wealth logo (`https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png`) as a large centered background watermark at 30% opacity on all white/light-background slides, skipping Slide 1 and any slides with dark or image backgrounds.

### How
**Single change in `src/components/presentation/PresentationViewer.tsx`**:

Add a watermark overlay layer inside the slide area, conditionally rendered based on `currentSlide` index. This avoids editing all 18+ individual slide files.

- Define a set of slide indices to **exclude** (dark/image backgrounds):
  - Index 0 (Slide01 — dark, also skip per request)
  - Index 1 (Slide02 — mesh bg)
  - Index 4 (Slide05 — carrier bg)
  - Index 7 (Slide08 — dark green)
  - Index 8 (Slide09 — bridge image)
  - Index 19 (Slide21 — bridge/skyline image)
  - Index 24 (Slide26 — gradient)

- All other slides (indices 2, 3, 5, 6, 9–18, 20–23) get the watermark

- The watermark is an absolutely positioned `img` element:
  - Centered (top 50%, left 50%, translate -50% -50%)
  - Large size (~60–70% of viewport height)
  - `opacity: 0.3`, `pointer-events: none`, `z-index: 1`
  - `object-fit: contain`

- Placed inside the slide area `div` (the `flex-1 relative overflow-hidden` container), rendered **behind** the slide content via low z-index

### Files Modified
- `src/components/presentation/PresentationViewer.tsx` — add conditional watermark overlay

