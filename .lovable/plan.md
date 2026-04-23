
## Fix the favicon and apple-touch-icon by promoting the existing Everence mountain mark

### Source asset located
The Everence mountain/triangle mark is present in the codebase and can be used as the favicon source.

- Primary source: `src/assets/logo-new.png`
- Mirrored copy: `public/assets/logo-new.png`
- Format: PNG
- Dimensions: 560×445
- Visual: gold mountain/road mark on transparent background

### Component trace
- `src/components/home/Header.tsx` (homepage top-left header) currently renders the remote Everence wordmark URL, not the mountain mark asset.
- `src/components/home/Footer.tsx` also renders the remote wordmark URL.
- The mountain-mark asset is currently imported and used in:
  - `src/components/AdminLayout.tsx`
  - `src/pages/ApartmentsAuth.tsx`

So the favicon fix should promote `src/assets/logo-new.png` / `public/assets/logo-new.png` as the canonical icon source.

## Why the favicon is still wrong
The asset generation was only partially wired up.

Current issues:
- `index.html` still points the 32×32 favicon slot to `/favicon.png` instead of a dedicated `favicon-32x32.png`
- `public/app-shell.html` still points both favicon and apple-touch-icon to legacy generic paths
- `scripts/generateAppShell.ts` still emits generic favicon tags
- Several static generators still emit only:
  - `<link rel="icon" href="/favicon.png">`
  - `<link rel="apple-touch-icon" href="/favicon.png">`
- `public/site.webmanifest` still references `icon-192.png` and `icon-512.png` instead of Android Chrome filenames
- No guaranteed multi-resolution `favicon.ico` path is being emitted everywhere

## Implementation
### 1. Promote the mountain mark as the favicon source
Use `src/assets/logo-new.png` as the master source and generate these outputs on a square canvas, centered, with transparent background unless the rasterization needs the brand dark green for better legibility:

- `public/favicon.png` → 512×512
- `public/favicon-32x32.png` → 32×32
- `public/favicon-16x16.png` → 16×16
- `public/apple-touch-icon.png` → 180×180
- `public/android-chrome-192x192.png` → 192×192
- `public/android-chrome-512x512.png` → 512×512
- `public/favicon.ico` → ICO containing 16×16, 32×32, 48×48

### 2. Update head tags in root templates
Update both `index.html` and `public/app-shell.html` to use the full icon set:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
<link rel="manifest" href="/site.webmanifest">
```

### 3. Update generated app shell output
Update `scripts/generateAppShell.ts` so production-generated `dist/app-shell.html` emits the same icon links instead of the old generic favicon references.

### 4. Update static HTML generators still emitting old favicon links
Replace old generic favicon tags in:
- `scripts/generateStaticHomePage.ts`
- `scripts/generateStaticAboutPage.ts`
- `scripts/generateStaticLocationPages.ts`
- `scripts/generateStaticStrategyPages.ts`
- `scripts/generateStaticGlossary.ts`
- `scripts/generateStaticPhilosophyPage.ts`

Each should emit the same full icon set so generated pages and pre-hydration HTML are consistent.

### 5. Update the web manifest
Change `public/site.webmanifest` icons to:
- `/android-chrome-192x192.png`
- `/android-chrome-512x512.png`

This removes dependency on the older `icon-192.png` / `icon-512.png` filenames.

### 6. Keep OG image separate
Do not replace social OG usage with the favicon files. The favicon should come from the mountain mark, while the existing social preview image remains independent unless separately requested.

## Verification after implementation
### Build/output checks
After build, verify these all exist in `dist/` and are non-zero size:
- `dist/favicon.png`
- `dist/favicon-32x32.png`
- `dist/favicon-16x16.png`
- `dist/apple-touch-icon.png`
- `dist/android-chrome-192x192.png`
- `dist/android-chrome-512x512.png`
- `dist/favicon.ico`

### HTML checks
Confirm every generated HTML head references real files in `dist/`:
- `dist/index.html`
- `dist/app-shell.html`
- static generated pages that emit their own `<head>`

### Report back after implementation
The final implementation report should include:
1. Source file used: `src/assets/logo-new.png` (PNG, 560×445)
2. All generated icon filenames and sizes
3. Confirmation that every `<link rel="icon">` in built HTML resolves to a real file
4. Confirmation that favicon and apple-touch-icon no longer point at stale or placeholder assets

## Files expected to change
- `index.html`
- `public/app-shell.html`
- `public/site.webmanifest`
- `public/favicon.png`
- `public/favicon-32x32.png`
- `public/favicon-16x16.png`
- `public/apple-touch-icon.png`
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`
- `public/favicon.ico`
- `scripts/generateAppShell.ts`
- `scripts/generateStaticHomePage.ts`
- `scripts/generateStaticAboutPage.ts`
- `scripts/generateStaticLocationPages.ts`
- `scripts/generateStaticStrategyPages.ts`
- `scripts/generateStaticGlossary.ts`
- `scripts/generateStaticPhilosophyPage.ts`
