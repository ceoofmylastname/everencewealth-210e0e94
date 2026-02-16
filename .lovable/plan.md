

# Hero Section -- Modern Typography and Layout Polish

## Overview
Upgrade the Hero section with a premium, modern font (Clash Display for the headline), center the bottom HUD panel content properly, and refine the overall composition for a super-modern, creative look.

## Changes

### 1. index.html -- Swap hero font to Clash Display
Clash Display (already loaded from Fontshare) is a much more modern, geometric display font compared to Inter Tight. We will make it the primary hero font.

### 2. tailwind.config.ts -- Update hero font family
Change `font-hero` from `'Inter Tight'` to `'Clash Display'` as the primary, with `'Inter Tight'` as fallback.

### 3. src/components/home/sections/Hero.tsx -- Layout and centering fixes
- Center the HUD panel grid items properly using `text-center` and centered flex alignment on all three columns
- Increase letter spacing on "BRIDGE" for a more editorial feel (`tracking-[-0.04em]`)
- Make "the" slightly larger and more visible
- Bump font weights to leverage Clash Display's geometric sharpness

### 4. src/index.css -- Refine text-outline for Clash Display
- Adjust stroke width to `2.5px` at `0.3` opacity for crisper rendering with the new font
- Slight tweak to hero-glow for cleaner ambient effect

## Technical Details

| File | Change |
|------|--------|
| `tailwind.config.ts` | `font-hero: ['Clash Display', 'Inter Tight', 'sans-serif']` |
| `src/components/home/sections/Hero.tsx` | Center HUD panel columns, refine typography classes |
| `src/index.css` | Adjust `.text-outline` stroke for new font |

