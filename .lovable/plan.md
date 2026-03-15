

# Slide 07 — Modernize Compound Interest Cards

## What Changes

### 1. Animated Clockwise Border (CSS `@keyframes`)
Add a `conic-gradient` rotating border effect to each card. Technique: use a pseudo-element (`::before`) with a `conic-gradient` that rotates via `@keyframes` animation, masked by the card's inner background to create a glowing animated border moving clockwise.

### 2. Glassmorphism + 3D Tilt Cards
Replace the static `.antigravity-card` with inline TiltCard components (mouse-tracking `perspective(800px)` + `rotateX/Y`) matching the pattern used in Slide 03 and Slide 06. Each card gets:
- `backdrop-filter: blur(16px)`, semi-transparent white bg
- Deep layered box-shadows with colored glow matching each card's accent
- `translateY(-6px)` lift + `scale(1.02)` on hover
- Light sweep shimmer overlay on hover

### 3. Modern Typography
- Rate percentage: larger `text-3xl` with `font-display`, letter-spacing
- "Doubles Every" text: refined spacing
- Row values: monospace font for financial data
- Final row: gradient highlight instead of flat background

### 4. Visual Polish
- Gauge semicircle: thicker stroke with subtle glow shadow matching card color
- Bottom pill: animated gradient shimmer (reuse Slide 03 pattern)
- Card accent glow beneath each card on hover

## Files to Edit
1. **`src/components/presentation/slides/Slide07_CompoundInterest.tsx`** — Full rewrite with TiltCard, animated border wrapper, modern styling
2. **`src/styles/antigravity.css`** — Add `@keyframes slide07BorderRotate` for clockwise conic-gradient rotation

