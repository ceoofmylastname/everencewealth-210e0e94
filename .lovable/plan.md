

## Plan: White Background Carrier Slide with Real Logo Images

### What
Redesign Slide 05 to use a **white background** instead of dark green, and replace the Clearbit logo URLs with the 11 provided CDN image URLs. Adjust all colors for light-theme readability.

### Changes

**File: `src/components/presentation/slides/Slide05_CarrierLogos.tsx`**

1. **Update carriers array** — Replace Clearbit URLs with the 11 provided CDN URLs. Reduce carrier list from 13 to 11 (or keep extras as text-only fallbacks) to match the available images. Map each URL to a carrier in order.

2. **Switch to white background** — Change `antigravity-carrier-bg` class or override inline to `background: #FFFFFF`. Remove the ambient orbs (gold/green gradient circles).

3. **Recolor text for light theme**:
   - "Committed to" → `#1A4D3E` (Evergreen) instead of white
   - "Bridging the Gap" → keep `#C8A96E` (Gold)
   - Overline → keep gold
   - Subtext → `#6B7B74` (darker muted green for readability on white)
   - Trust bar → same darker muted tone

4. **Recolor cards for light theme**:
   - Card background: `rgba(245, 247, 246, 0.8)` (light gray-green tint)
   - Border: `rgba(26, 77, 62, 0.12)` default, `rgba(200, 169, 110, 0.4)` on hover
   - Box-shadow: lighter shadows appropriate for white bg
   - Carrier name label below logo: `#1A4D3E` at lower opacity

5. **Keep 3D tilt, hover effects, and Framer Motion animations** — just adjust shadow colors for light theme.

**File: `src/styles/antigravity.css`** — Update `.antigravity-carrier-bg` to white background, remove or hide orb styles for this slide.

