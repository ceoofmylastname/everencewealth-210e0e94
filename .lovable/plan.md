

# Philosophy Page Premium Redesign

Transform the existing `/philosophy` page into a $100K Webflow-level experience with morphing SVG blobs, glassmorphism, custom SVG charts, scroll-driven reveals, and micro-interactions -- all while preserving existing i18n translations and SEO.

## What Changes

### 1. New Shared Components (2 files)

**`src/components/philosophy/MorphingBlob.tsx`**
- Pure SVG component using CSS `@keyframes` to animate between organic blob path shapes
- Props: `colors`, `className`, `morphSpeed` (ms)
- GPU-accelerated via `will-change: d` on the SVG path
- No external libraries; uses native SVG `<animate>` or CSS keyframes on path `d` attribute

**`src/components/philosophy/GlassCard.tsx`**
- Reusable wrapper: `backdrop-blur-xl`, `bg-white/[0.06]`, `border border-white/[0.12]`, `shadow-[0_8px_32px_rgba(0,0,0,0.12)]`
- Optional `glow` prop that adds a subtle animated border shimmer on hover

### 2. Hero Section Upgrade (`PhilosophyHero.tsx`)

**Remove:** Static floating geometric shapes (squares, circles, diamonds)

**Add:**
- 3 `MorphingBlob` instances as decorative background elements (varying sizes, colors, positions)
- Animated mesh gradient background using layered radial gradients with CSS `@keyframes` position shifts
- Glassmorphism content card wrapping headline + paragraph + CTAs
- Staggered text reveal: badge fades in, then headline with blur-to-sharp effect, then paragraph, then CTAs with scale-up
- Animated gold line divider between headline and paragraph
- Mouse-parallax effect on blobs (subtle `onMouseMove` tracking, CSS `translate3d`)

**Preserved:** All i18n text keys (`h.badge`, `h.headline`, `h.paragraph`, `h.ctaPrimary`, `h.ctaSecondary`), scroll indicator, navigation behavior

### 3. Silent Killers Section Upgrade (`PhilosophyKillers.tsx`)

**Remove:** Recharts dependency (AreaChart, BarChart, ResponsiveContainer)

**Replace with custom inline SVGs:**
- **Fees chart:** Hand-drawn SVG `<polyline>` with two paths (green vs red dashed), animated stroke-dashoffset on scroll
- **Volatility chart:** SVG `<polyline>` with gold stroke, animated draw-on-scroll
- **Tax chart:** SVG `<rect>` bars with staggered height animation on scroll

**Card upgrades:**
- Glassmorphic hover state: on hover, card gets `backdrop-blur-sm` overlay and subtle gold border glow
- 3D tilt micro-interaction using `onMouseMove` to calculate `rotateX`/`rotateY` (max 3deg, GPU-accelerated `transform`)
- Floating number watermark gets subtle parallax offset
- Top accent line animates width from 0 to 100% on scroll-into-view

**Preserved:** All i18n text, card structure, stat callouts

### 4. Tax Buckets Section Upgrade (`PhilosophyBuckets.tsx`)

**Add:**
- Organic blob decorations behind the grid (2 blobs, low opacity)
- Cards get glassmorphic treatment: `bg-white/[0.06]` with `backdrop-blur-md`
- Recommended card: animated gold shimmer border using CSS `@keyframes` on a pseudo-element with `linear-gradient` sweep
- Feature list items: staggered fade-in-up animation (each item 50ms delayed)
- Check/X icons get a subtle scale-pop animation on scroll reveal
- Section header gets the same blur-to-sharp reveal as hero

**Preserved:** All i18n text, column structure, recommended badge logic

### 5. Cash Flow Section Upgrade (`PhilosophyCashFlow.tsx`)

**Replace animated bars with custom SVG gauge/progress arcs:**
- Semi-circular SVG arc (stroke-dasharray animation) showing 45% vs 85% "retirement readiness"
- Animated counter stays but gets a number-slot rolling effect
- Cards get glassmorphic border on hover
- "Cash Flow Mobility" card gets a subtle pulsing gold shadow to draw attention
- Add a decorative connecting line between the two cards (SVG line with animated dash)

**Preserved:** All i18n text, AnimatedCounter, approach data structure

### 6. CTA Section Upgrade (`PhilosophyCTA.tsx`)

**Add:**
- Full-width glassmorphic card on an evergreen gradient background (instead of plain white)
- Morphing blob behind CTA content (single large blob, gold/evergreen gradient, very low opacity)
- Primary button gets magnetic hover effect: button `transform` follows cursor within a small radius
- Gold accent line animates as a growing horizontal rule from center outward
- Subtle particle dots (4-6 small circles) floating in background with CSS animation

**Preserved:** All i18n text, navigation behavior, phone link

### 7. Scroll Progress Indicator

Add a thin gold progress bar fixed at the top of the viewport (below header) that fills as the user scrolls through the philosophy page. Implemented with a `useEffect` + `scroll` listener updating a CSS variable for width.

## Technical Details

### Files Created
- `src/components/philosophy/MorphingBlob.tsx` -- SVG blob with CSS morph animation
- `src/components/philosophy/GlassCard.tsx` -- reusable glassmorphism wrapper

### Files Modified
- `src/components/philosophy/PhilosophyHero.tsx` -- mesh gradient, blobs, glass card, parallax
- `src/components/philosophy/PhilosophyKillers.tsx` -- remove Recharts, add custom SVG charts, 3D tilt
- `src/components/philosophy/PhilosophyBuckets.tsx` -- glass cards, shimmer borders, staggered reveals
- `src/components/philosophy/PhilosophyCashFlow.tsx` -- SVG arcs, glass hover states, connecting line
- `src/components/philosophy/PhilosophyCTA.tsx` -- glass card, blob, magnetic button, particles
- `src/pages/Philosophy.tsx` -- add scroll progress bar

### Performance Strategy
- All transforms use `translate3d` / `will-change` for GPU compositing
- MorphingBlob uses CSS `@keyframes` (no JS animation loop)
- Custom SVG charts are static markup with CSS transitions (no charting library overhead)
- Mouse-parallax and tilt use `requestAnimationFrame` throttling
- Scroll progress bar uses passive scroll listener
- No new npm dependencies added

### What Is NOT Changed
- No i18n translation keys are modified
- No SEO/JSON-LD schemas are modified
- No routing changes
- Header and Footer remain untouched
- All existing accessibility attributes preserved

