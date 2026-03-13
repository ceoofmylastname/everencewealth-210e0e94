

## Plan: Premium Upgrade for Slide 02 — "What Does Every Retirement Account Need?"

### Vision
Transform the flat white slide into a cinematic, modern experience with glassmorphism cards, 3D hover effects, animated gradients, and dramatic back-shadows — while preserving all existing reveal animations.

### Changes

**File:** `src/components/presentation/slides/Slide02_WhatDoesRetirementNeed.tsx`

Complete rewrite with:

1. **Background**: Subtle animated gradient mesh (dark evergreen to deep navy) instead of plain white — using CSS `radial-gradient` layers with a slow `background-position` animation
2. **Glassmorphism icon cards**: Each card gets `backdrop-filter: blur(16px)`, semi-transparent white background (`rgba(255,255,255,0.08)`), subtle border (`rgba(255,255,255,0.15)`), and a colored glow back-shadow (`box-shadow: 0 8px 32px rgba(200,169,110,0.2), 0 0 60px rgba(26,77,62,0.15)`)
3. **3D hover transforms**: Using framer-motion `whileHover` with `rotateX`/`rotateY` perspective transforms and scale lift — each card tilts toward the cursor
4. **Icon styling**: Icons rendered inside a gradient circle (gold-to-green) with a soft glow, larger size (48px)
5. **Layout**: All 5 cards in a single flowing grid (3 top, 2 bottom centered) instead of split reveals — wrapped in a single staggered reveal group
6. **Typography**: Headline text in white/cream against the dark background, with the gold shimmer on "Retirement Account"
7. **Answer reveal**: "Strategy." rendered as a large glowing gold text with animated pulse shadow
8. **Gold divider**: Animated expanding line with gradient glow

**File:** `src/styles/antigravity.css`

Add a new utility class `.antigravity-glass-card` with the glassmorphism + 3D transform styles, and a `@keyframes gradientShift` for the background animation.

### Technical Details
- Uses framer-motion `motion.div` for 3D card hovers (perspective, rotateX/Y)
- CSS `@keyframes` for background gradient animation and gold pulse glow
- All existing `RevealElement` wrappers and reveal indices preserved
- `GoldUnderline` and `GradientText` components reused for headline styling
- Dark background means all text switches to white/cream/gold palette

