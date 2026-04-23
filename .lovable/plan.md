

## Why the favicon and mobile preview look wrong

The Everence logo is correct. The problem is the **same rectangular wordmark file** is being used for **three slots that each require a different shape**:

| Slot | Required shape | Currently | Result |
|---|---|---|---|
| Browser tab favicon | square 32×32 (or 16×16) | 560×445 wordmark | shrunk to a blurry sliver in the tab |
| iOS / Android home-screen icon | square 180×180 (Apple) / 192×192 (Android) | 560×445 wordmark | cropped/squished inside the rounded square |
| Social link preview (OG image) | landscape 1200×630 | 560×445 wordmark | platforms upscale + crop badly |

All three files (`public/favicon.png`, `public/apple-touch-icon.png`, `public/og-image.png`) are byte-identical copies of the same 560×445 rectangular wordmark. That's the entire bug.

## Fix

This requires **a square version of the Everence mark** (the gold "E" emblem alone, without the "Everence Wealth" wordmark) for the favicon and home-screen icon. The wordmark only works in landscape for the OG image.

### Option A (preferred — cleanest result)
Ask the user to upload one square PNG of just the gold "E" emblem (ideally 512×512 or larger, transparent background). I'll then generate all sized variants from it:

- `public/favicon.png` → 32×32 PNG of the E emblem
- `public/favicon-16x16.png` → 16×16 PNG of the E emblem
- `public/apple-touch-icon.png` → 180×180 PNG of the E emblem on the dark green brand background (no transparency — iOS doesn't honor it)
- `public/icon-192.png` and `public/icon-512.png` → for Android home-screen / PWA
- `public/og-image.png` → keep the landscape wordmark, but **regenerate at the standard 1200×630** so social platforms stop upscaling

Update `index.html` to add the new sized icon links and the web app manifest.

### Option B (no new asset needed — quick stopgap)
Without a square emblem file, I can:

1. Crop the existing wordmark file to just the gold "E" portion at the left edge of the image to use as the square favicon / apple-touch-icon. Quality will be limited (the source is only 560 px tall), but it'll look correct in shape.
2. Pad the existing wordmark onto a 1200×630 dark-green canvas to fix the OG image dimensions.

This produces a working result today with no upload required, and we swap to a higher-quality square emblem later if/when you provide one.

### Option C (re-fetch a higher-resolution square mark from Filesafe)
If your Filesafe CDN already hosts a square emblem variant, paste that URL and I'll pull it directly. The current canonical URL on file (`...69b7424c5b89c7c557adfe6e.png`) is the rectangular wordmark, so a separate emblem URL would be needed.

## Files that will change
- `public/favicon.png` (replaced — square)
- `public/apple-touch-icon.png` (replaced — 180×180 square)
- `public/og-image.png` (replaced — 1200×630 landscape)
- `public/favicon-16x16.png`, `public/icon-192.png`, `public/icon-512.png` (new)
- `public/site.webmanifest` (new — PWA icon manifest)
- `index.html` (added `<link rel="icon" sizes="16x16">`, `<link rel="icon" sizes="32x32">`, `<link rel="manifest">`, and `<meta property="og:image:width/height">`)

## Out of scope
No changes to component logo usage, brand colors, JSON-LD logo URL, or SSG output. This is purely a static-asset shape/dimensions fix.

## Decision needed
Which option do you want — **A** (you upload a square emblem PNG), **B** (I crop and pad the existing wordmark today), or **C** (you provide a Filesafe URL for the square emblem)?

