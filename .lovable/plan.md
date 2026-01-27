

# Careful Upgrade: Property Card Images to w800 Resolution

## Overview

This is a targeted, minimal change to upgrade only property card images from w400 to w800 resolution. All other image types (hero, lightbox, thumbnail) remain at w400 for safety.

## Current State

The image transformer is currently in safe pass-through mode:
```typescript
if (!url) return '/placeholder.svg';
return url; // Return original URL unchanged
```

## Proposed Change

### Single File Update

**File: `src/lib/imageUrlTransformer.ts`**

Replace the current implementation with:

```typescript
/**
 * Image URL utility for Resales Online CDN
 * 
 * Upgrades card images to w800 for better quality.
 * Other sizes remain at original resolution for safety.
 */
export function getHighResImageUrl(
  url: string | undefined | null, 
  size: 'thumbnail' | 'card' | 'hero' | 'lightbox' = 'hero'
): string {
  // Return placeholder if no URL
  if (!url) return '/placeholder.svg';
  
  // Only transform URLs that contain /w400/
  if (!url.includes('/w400/')) {
    return url;
  }
  
  // Upgrade card images to w800 ONLY
  if (size === 'card') {
    return url.replace('/w400/', '/w800/');
  }
  
  // Keep everything else at w400 for now (safe)
  return url;
}
```

## Why This Is Safe

| Aspect | Safety Measure |
|--------|----------------|
| Scope | Only affects `size === 'card'` - all other sizes unchanged |
| Fallback | If URL doesn't contain `/w400/`, returns original |
| Components affected | PropertyCard components that pass `'card'` as size parameter |
| Easy revert | If broken, change line 17 to `return url;` |

## Components That Use 'card' Size

Based on the codebase, these components will get w800 images:
- `src/components/property/PropertyCard.tsx` - Main property listing cards
- `src/components/landing/PropertyCard.tsx` - Landing page property cards

## Verification Steps

After deployment:
1. Navigate to `/en/properties?transactionType=sale&newDevs=only`
2. Open browser DevTools > Network tab
3. Filter by "Images" to see loaded images
4. Confirm image URLs now contain `/w800/` instead of `/w400/`
5. Verify images display correctly (not placeholders)
6. Confirm images appear sharper than before

## Rollback Plan

If images break, immediately change line 17-19:
```typescript
// FROM:
if (size === 'card') {
  return url.replace('/w400/', '/w800/');
}

// TO:
// Disabled - w800 not supported
// if (size === 'card') {
//   return url.replace('/w400/', '/w800/');
// }
```

Or simply revert the entire function to `return url;`

