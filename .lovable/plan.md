
# Center the Bottom HUD Panel

## Problem
The bottom HUD panel ("System Status", "Current Protocol", "Begin Assessment") is overflowing to the right side of the viewport. The "Begin Assessment" button is getting cut off.

## Root Cause
The panel uses `w-[92%] max-w-4xl` with absolute positioning (`left-1/2 -translate-x-1/2`), but the combination of width and the section's `overflow-hidden` causes the right side to be clipped.

## Fix (single file change)

### `src/components/home/sections/Hero.tsx`
- Change the HUD panel's positioning approach: instead of `absolute` with `left-1/2 -translate-x-1/2`, use a wrapper approach with `inset-x-0` and `flex justify-center` so the panel is truly centered within the viewport
- Reduce `max-w-4xl` to `max-w-3xl` (768px) to ensure it fits comfortably with padding on all screen sizes
- Keep all internal content (System Status, Current Protocol, Begin Assessment) and their centered alignment unchanged

### Technical Detail
Replace:
```
className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-4xl"
```
With:
```
className="absolute bottom-4 md:bottom-8 inset-x-0 z-20 flex justify-center px-4"
```
And wrap the inner `glass-card` div with `w-full max-w-3xl` to control the width.
