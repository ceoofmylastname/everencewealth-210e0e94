

# Phase 9.9.3 -- Hero Section UI Polish

## Issues Identified

1. **"RETIREMENT" glow is too intense** -- the `hero-glow` text-shadow creates an overpowering green rectangle behind the text, drowning out the letters
2. **"GAP" is barely visible** -- the 2px outline stroke at 15% white opacity is too faint against the dark background
3. **Vertical spacing is too loose** -- there's too much gap between "BRIDGE the", "RETIREMENT", and "GAP", making the composition feel disconnected
4. **HUD panel is cut off** -- the bottom panel is partially hidden below the viewport fold

## Fixes

### 1. src/index.css -- Reduce hero-glow intensity
- Current: `text-shadow: 0 0 60px ..., 0 0 120px ..., 0 0 200px ...` with high alpha values (0.6, 0.35, 0.15)
- Fix: Reduce blur radii and alpha values significantly: `0 0 30px hsla(160,60%,30%,0.3), 0 0 80px hsla(160,48%,21%,0.15)` -- subtle ambient glow instead of a green spotlight

### 2. src/index.css -- Make text-outline more visible
- Current: `2px rgba(255,255,255,0.15)` -- nearly invisible
- Fix: Increase to `2px rgba(255,255,255,0.25)` for better contrast while keeping the outlined aesthetic

### 3. src/components/home/sections/Hero.tsx -- Tighten vertical spacing
- Reduce `space-y-0` wrapper and add negative margins between the three text blocks to pull them closer together, creating a cohesive stacked typographic lockup
- Reduce `pt-24 md:pt-32` to `pt-20 md:pt-24` and `pb-32 md:pb-40` to `pb-24 md:pb-32` to pull content up and make room for the HUD panel
- Reduce `mt-8` on the subline to `mt-4`

### 4. src/components/home/sections/Hero.tsx -- Fix HUD panel visibility
- Change `bottom-8 md:bottom-12` to `bottom-4 md:bottom-8` so it doesn't get cut off

## Files Modified

| File | Change |
|------|--------|
| `src/index.css` | Reduce hero-glow intensity, increase text-outline opacity |
| `src/components/home/sections/Hero.tsx` | Tighten vertical spacing, fix HUD panel position |

