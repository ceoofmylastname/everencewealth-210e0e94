

# Slide 03 — Modern Creative Upgrade

## Current State
The "Ways to Invest" slide has basic glassmorphism cards with static images, no hover effects, no 3D interaction, and plain typography.

## Changes

### 1. Add 3D TiltCard Component (inline)
Reuse the same `TiltCard` pattern from Slide23 — mouse-tracking `perspective(800px)` with `rotateX`/`rotateY` transforms, lift on hover (`translateY(-8px)`), and smooth `scale(1.03)` emphasis.

### 2. Enhanced Card Styling
- **Deep box shadows**: Multi-layer shadows (`0 20px 60px -12px rgba(0,0,0,0.15)`) for floating 3D depth
- **Glassmorphism**: Keep current blur but increase contrast — `rgba(255,255,255,0.6)` backgrounds, `border: 1px solid rgba(255,255,255,0.7)`
- **Hover glow**: Add a subtle colored glow on hover matching each card's theme (blue-gray for Fixed, gold for Variable, emerald for Indexed)
- **Transition**: `transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1)` for smooth, premium feel

### 3. Image Enhancements
- Increase image height from 180px to 220px
- Add `group-hover:scale-110` zoom effect with `overflow-hidden` container
- Add a subtle gradient overlay at the bottom of each image for text separation

### 4. Typography Upgrade
- Title: Use `var(--font-display)` with letter-spacing `-0.02em`, larger size (`text-3xl`)
- Subtitle items: Slightly larger (`text-base`), lighter weight
- "Recommended" pill: Add a shimmer animation (reuse `goldShimmer` keyframes)

### 5. Entrance Animations
- Keep existing `RevealElement` with `cardRise` but add staggered delays
- Add a CSS `@keyframes float` subtle animation on the cards (2px up/down oscillation, 3s duration, offset per card)

### 6. Light Sweep Effect
Add a CSS animated light sweep across each card on hover (diagonal white gradient that slides across), similar to the one used in Slide24.

## Files to Edit
1. `src/components/presentation/slides/Slide03_WaysToInvest.tsx` — Full rewrite with TiltCard, enhanced styles, animations

