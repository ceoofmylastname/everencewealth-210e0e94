

# Fix: Headline Text Overflowing Into Registration Form

## Problem
On the workshop landing page hero, the headline text extends beyond its grid column and overlaps with the sign-up form card. This happens because there's no overflow or word-wrapping constraint on the left column.

## Solution
Add overflow and word-break handling to the left (text) column of the hero grid so that long headlines wrap properly within their column boundary instead of spilling into the form.

## Technical Changes

**File: `src/pages/public/WorkshopLanding.tsx`**

1. Add `overflow-hidden` and `min-w-0` to the left-side `motion.div` container (around line 344). The `min-w-0` is critical in CSS Grid to prevent grid children from expanding beyond their track.

2. Add `break-words` (or `overflow-wrap: break-word`) to the `h1` headline element (around line 361) so extremely long words wrap instead of overflowing.

These two small class additions will constrain the headline text to its grid column.

