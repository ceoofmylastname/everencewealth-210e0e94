

# Phase 9.9.1 -- Hero Section Upgrade: Cinematic Load Experience

## Overview
Transform the hero into a cinematic, multi-stage entrance sequence with bolder typography, particle effects, and framer-motion orchestration -- replacing the current simple fade-in with a theatrical reveal.

---

## Design Concept

The page loads with a brief **dark curtain** that splits open, revealing the hero content in a choreographed sequence:

1. **Stage 0 (0-300ms)**: Dark screen with a single pulsing emerald dot in the center
2. **Stage 1 (300-800ms)**: Dot expands into a radial light burst; "BRIDGE the" slides in from the left with blur-to-sharp
3. **Stage 2 (800-1400ms)**: "RETIREMENT" assembles letter-by-letter with gradient fill sweeping across
4. **Stage 3 (1400-1800ms)**: "GAP" slams in from below with a subtle screen-shake and the outline effect
5. **Stage 4 (1800-2200ms)**: Subline fades up, HUD panel slides from bottom, floating particles begin

### Typography Upgrade
- Switch from `font-space` (Space Grotesk) to **Clash Display** via CDN -- a sharp, geometric variable font that commands attention
- Fallback chain: `'Clash Display', 'Space Grotesk', sans-serif`
- Massive sizing: "RETIREMENT" at `15vw` on mobile, `9vw` on desktop
- "GAP" uses a new thicker outline stroke (`2px` instead of `1px`)

### New Visual Elements
- **Floating particles**: 8-12 small emerald/gold dots that drift slowly across the viewport using CSS animations with randomized delays
- **Mesh gradient background**: Animated radial gradients that slowly shift position (using existing `mesh-shift` keyframe)
- **Horizontal scan line**: A thin semi-transparent line that sweeps vertically once during load
- **Scroll indicator**: Animated chevron at the bottom that bounces (using existing `scroll-indicator` keyframe)

---

## Technical Changes

### 1. index.html
- Add Clash Display font from CDN: `https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap`
- Add preconnect for `api.fontshare.com`

### 2. tailwind.config.ts
- Add `'Clash Display'` to the front of `fontFamily.space` array so it becomes `['Clash Display', 'Space Grotesk', 'sans-serif']`
- Add new keyframe `letter-reveal`: staggered opacity + translateY for individual letters
- Add new keyframe `scan-line`: vertical sweep from top to bottom
- Add new keyframe `dot-expand`: scale from 0 to 1 with opacity

### 3. src/index.css
- Update `.text-outline` stroke width from `1px` to `2px`
- Add `.hero-particle` class for floating dot animations
- Add `.scan-line` class for the vertical sweep effect
- Update `.hero-glow` to include a stronger emerald glow

### 4. src/components/home/sections/Hero.tsx (full rewrite)
Major changes:
- Import `motion`, `AnimatePresence` from framer-motion
- Replace boolean `isLoaded` state with a numeric `stage` state (0-4) controlled by sequential timeouts
- **Stage-based orchestration**: Each visual element is gated by the current stage number
- **Letter-by-letter animation** for "RETIREMENT": split into individual `motion.span` elements with staggered delays
- **"GAP" slam effect**: `motion.span` with `scale: [3, 1]` and `y: [100, 0]` spring transition
- **Particle layer**: Map over an array of 10 particles, each with randomized position/delay/duration, rendered as small `div` circles with `animate-float-particle`
- **Mesh gradient**: Two large absolutely-positioned blurred circles that animate with `animate-mesh-shift` at different speeds
- **Scan line**: A 1px-tall div that animates from `top: 0` to `top: 100%` once on load
- **Scroll indicator**: Animated down-chevron at the very bottom using `animate-scroll-indicator`
- Bottom HUD panel stays but enters with a `motion.div` spring from `y: 100`
- Side text stays but enters with `motion.div` from `x: -40` / `x: 40`

### Section structure:
```
<section> (full viewport, dark-bg, overflow-hidden)
  -- Mesh gradient layer (2 blurred circles, absolute)
  -- Scan line (absolute, animates once)
  -- Particle layer (10 floating dots, absolute)
  -- Side text left (xl only, motion)
  -- Side text right (xl only, motion)
  -- Main content container
      -- "BRIDGE the" (motion.div, blur reveal)
      -- "RETIREMENT" (letter-by-letter motion.span)
      -- "GAP" (motion.div, slam + shake)
      -- Subline (motion.p, fade up)
  -- Scroll indicator (bottom center, bouncing chevron)
  -- HUD panel (bottom, motion.div spring)
</section>
```

---

## Files Modified

| File | Action |
|------|--------|
| `index.html` | Add Clash Display font CDN + preconnect |
| `tailwind.config.ts` | Add Clash Display to font stack, add 3 new keyframes |
| `src/index.css` | Update text-outline, add particle/scan-line classes |
| `src/components/home/sections/Hero.tsx` | Full rewrite with staged framer-motion orchestration |

No database, edge function, or dependency changes required. Clash Display is loaded via CDN (Fontshare, free for commercial use).

