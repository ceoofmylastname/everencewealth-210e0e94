

## Fix Navbar Position and Alignment at Top of Hero

The screenshot shows two issues:
1. The "Philosophy" navigation pill bleeds into the white background above the rounded hero section
2. The logo, language flag, and Portal link aren't visually aligned on the same baseline

### Root Cause

The header is `fixed top-0` but the hero section now lives inside a rounded container with `py-4 md:py-6` top padding on the main element. This means the dark hero area starts ~16-24px below the top of the viewport, but the header still sits at the very top against the white background.

### Changes

**File: `src/components/home/Header.tsx`**

1. **Increase top padding on header** -- Add `top-2 md:top-4 lg:top-6` instead of `top-0` so the header sits inside the rounded dark hero area rather than bleeding into the white zone above it. Match the horizontal margins from Home.tsx (`mx-2 md:mx-4 lg:mx-6`).

2. **Align items vertically** -- The grid currently uses `items-center` which should work, but the logo image (`h-14 md:h-16`) may be causing visual misalignment. Ensure the right-side actions (flag + Portal) use consistent vertical centering by adding `items-center` to their flex container (already present, but we should verify the logo height matches).

**File: `src/components/home/sections/Hero.tsx`**

3. **Adjust hero top padding** -- Currently `pt-24 md:pt-16` on the main content container. Since the header is now pushed down, increase to `pt-28 md:pt-24` so the "ESTABLISHED 1998" badge doesn't overlap with the navbar.

### Summary

| Element | Before | After |
|---|---|---|
| Header position | `top-0` | `top-2 md:top-4 lg:top-6` |
| Hero content padding | `pt-24 md:pt-16` | `pt-28 md:pt-24` |
| Logo height | `h-14 md:h-16` | `h-12 md:h-14` (slightly smaller for better alignment) |

This ensures the navbar sits cleanly within the dark rounded hero area and all three header elements (logo, nav pill, flag+portal) are visually balanced.

