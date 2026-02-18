
# Update Glossary Hero with Evergreen Background and Modern Image

## Problem
The glossary hero section currently uses dark navy/slate tones (`prime-900`, `prime-800`) instead of the brand Evergreen color (`#1A4D3E`). The user also wants a modern image added to the hero.

## Changes

### File: `src/pages/Glossary.tsx` (lines 255-293)

**Background update:**
- Replace `from-prime-900 via-prime-800 to-prime-900` with `from-[#1A4D3E] via-[#15402F] to-[#0D2E20]` (Evergreen gradient)
- Update the radial gradient accent from `prime-gold/10` to `prime-gold/15` for warmth against the green

**Add a modern image:**
- Add a decorative stock-style image on the right side of the hero using a professional financial/wealth imagery from a free source (Unsplash)
- Restructure the hero layout to a two-column grid on desktop: left column for text/search, right column for a rounded image with subtle gold border and glass overlay
- On mobile, the image will be hidden to keep the hero clean

**Updated hero layout:**
- Desktop: 2-column grid (text left, image right)
- Image will be a professional financial scene (e.g., documents, charts, or a meeting) with a rounded-2xl border, gold border accent, and subtle overlay
- The image URL will use Unsplash for a high-quality, royalty-free photo related to wealth/finance

**Text styling adjustments:**
- Keep the gold highlights on "Glossary" text
- Keep the search bar and badge as-is
- Adjust subtitle text color from `text-slate-300` to `text-white/70` for better contrast on Evergreen

## Technical Details

Only one file is modified: `src/pages/Glossary.tsx`, specifically the hero `<section>` block (lines 255-293). The change replaces the background gradient classes and adds a right-side image column with responsive visibility.
