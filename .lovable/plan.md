

## Plan: Modernize Hero Section — Button, Headline, and "Removes It" Animation

### 1. "Secure Your Seat" Button (lines 368-382)
Replace the flat, square `borderRadius: '0px'` button with a modern rounded pill with depth:
- `borderRadius: '14px'` (rounded-xl feel)
- Deep shadow: `boxShadow: '0 8px 32px rgba(200,169,110,0.35), 0 2px 8px rgba(0,0,0,0.4)'`
- Hover: lift + intensified glow (`translateY(-2px)`, stronger shadow)
- Active: press-down effect

### 2. "Removes It" Gradient Animation (line 341)
Replace the static `color: '#C8A96E'` span with an animated multi-stop gold gradient text:
- Add a CSS `@keyframes` for shifting `background-position` across a gold→cream→gold gradient
- Apply `-webkit-background-clip: text` + transparent fill
- Similar to the existing `gold-shimmer-text` class but inline for isolation

### 3. Headline & Subheadline Font Modernization (lines 335-351)
- Headline: Add `fontFamily: "'GeistSans', 'Inter', system-ui, sans-serif"` with `letterSpacing: '-0.03em'` (tight tracking for premium feel) and bump weight to 900
- Subheadline: Use `letterSpacing: '0.01em'`, `fontWeight: 300` (light weight for elegance), slightly larger `fontSize: '16px'`

### Files Modified
- `src/pages/TrainingEvent.tsx` — CSS keyframes block + hero section (button, headline, "Removes It" span)

