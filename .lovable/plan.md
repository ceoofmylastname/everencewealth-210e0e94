

## Fix Advisor Headshot Cropping

**Problem**: The `aspect-square` container with `object-cover` crops the top of advisors' heads because the photos are taller than square.

**File**: `src/components/socorro/AdvisorCard.tsx`

**Change**: Adjust the image container from `aspect-square` to `aspect-[3/4]` (portrait ratio) and add `object-top` positioning so the face/head area is prioritized when any cropping occurs.

- Line 23: Change `aspect-square` to `aspect-[3/4]`
- Line 33: Add `object-top` to the image classes

This gives more vertical space for the headshots and ensures any remaining crop happens at the bottom (torso) rather than the top (head).

