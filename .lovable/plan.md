

# Fix: California (and other state pages) missing card images

## Problem
The `FeaturedCitiesSection` component uses a fallback image map (`CITY_FALLBACK_IMAGES`) when a location has no `featured_image_url`. The map only contains city-level slugs (los-angeles, austin, etc.) but no state-level slugs (california). The final fallback references `CITY_FALLBACK_IMAGES.marbella` which also does not exist, resulting in an undefined image URL and a blank gray card.

## Solution
Two changes in `src/components/location-hub/FeaturedCitiesSection.tsx`:

### 1. Add state-level fallback images
Add entries like `"california"` to the `CITY_FALLBACK_IMAGES` map with appropriate Unsplash images for each state.

### 2. Add state-level metadata
Add entries like `"california"` to the `CITY_METADATA` map so the overlay tags show meaningful data instead of generic defaults.

### 3. Fix the broken final fallback
Replace the non-existent `CITY_FALLBACK_IMAGES.marbella` reference (lines 158 and 230) with a generic default Unsplash URL, so any location without a specific fallback still gets a visible image.

## Technical Details

**File:** `src/components/location-hub/FeaturedCitiesSection.tsx`

- Line 69-82: Add `'california': 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80'` (or similar California landscape) to `CITY_FALLBACK_IMAGES`.
- Line 24-37: Add `'california': { avgPrice: 'From $300K', bestFor: 'Diverse Economy', vibe: 'Golden State' }` to `CITY_METADATA`.
- Lines 158 and 230: Change the fallback from `CITY_FALLBACK_IMAGES.marbella` (which is undefined) to a hardcoded generic cityscape URL like `'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'`.

This is a purely cosmetic fix -- no database or backend changes needed. Once the admin generates images for the California state pages using the "Generate Image" button we added earlier, the AI-generated images will automatically replace these fallbacks.
