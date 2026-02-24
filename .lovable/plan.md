

## Fix: Uploaded Images Showing Too Zoomed In / Cropped

### Root Cause

Every `<img>` in the Image Studio uses `object-cover`, which scales the image to fill the container and **crops** whatever doesn't fit. For portrait or large images, this means only a portion (like shoulders) is visible.

Additionally, the "before" image in the comparison slider uses `w-screen max-w-[1000px]` which is incorrect — it should match the actual container width for proper alignment.

### Changes to `src/pages/portal/advisor/ImageStudio.tsx`

**1. Upload dropzone preview (line 383)**
- Change `object-cover` → `object-contain` and add a neutral background so the image fits fully within the 192px-tall dropzone

**2. Comparison slider — "After" image (line 452)**
- Change `object-cover` → `object-contain` with dark background

**3. Comparison slider — "Before" image (line 468)**
- Change `w-screen max-w-[1000px] h-full object-cover` → use the actual slider container width instead of `w-screen`, and switch to `object-contain`
- The before image needs to match the full slider width (not just the clipped portion) so alignment stays correct when dragging

**4. Generated image output (line 337)**
- Change `object-cover` → `object-contain` with neutral background so generated images also show fully

**5. Hero generated image (line 222)**
- Change `object-cover` → `object-contain`

All placeholder gradient backgrounds remain unchanged — only real images get `object-contain` with a subtle background color behind them so letterboxing looks clean.

### Summary of line changes

| Line | Current | Fix |
|------|---------|-----|
| 222 | `object-cover` | `object-contain bg-gray-100` |
| 337 | `object-cover` | `object-contain bg-gray-100` |
| 383 | `object-cover` | `object-contain bg-gray-100` |
| 452 | `object-cover` | `object-contain bg-gray-900` |
| 468 | `w-screen max-w-[1000px] h-full object-cover` | Match parent slider width, `object-contain bg-gray-900` |

No new files, no backend changes. Pure CSS/class fixes.

