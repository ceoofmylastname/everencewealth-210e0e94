## P1-4 Fix: Add Hero Image Preload Tags to index.html

### Problem
Production verification shows `curl -sL https://www.everencewealth.com/ | grep -i preload` returns only the Google Fonts CSS preload. The `<link rel="preload" as="image">` tags for the hero images were never written to `index.html` in the previous PROMPT 21 ship, even though the underlying hero files exist at `/hero/hero-landing-desktop.jpg` (117 KB) and `/hero/hero-landing-mobile.jpg` (137 KB).

### Change
Edit **only** `index.html`. After the existing Google Fonts CSS preload (line 34) and replacing the stale `<!-- LCP preload removed — dark hero, no image -->` comment at line 40, insert the two media-scoped image preloads:

```html
<link rel="preload" as="image"
      href="/hero/hero-landing-desktop.jpg"
      fetchpriority="high"
      media="(min-width: 768px)">
<link rel="preload" as="image"
      href="/hero/hero-landing-mobile.jpg"
      fetchpriority="high"
      media="(max-width: 767px)">
```

### Scope Guarantees
- No other file touched. No edits to `_headers`, `_redirects`, schema generators, `Hero.tsx`, `OptimizedImage.tsx`, build scripts, edge functions, or middleware.
- No PROMPT 20 / PROMPT 21 work modified — canonical/hreflang, llms.txt, dateModified, speakable schema, asset migration, cache headers, and WebP support all remain untouched.

### Verification (post-deploy + Cloudflare purge)
```bash
curl -sL https://www.everencewealth.com/ | grep -E 'preload.*image|image.*preload'
```
Expected: 2 hits (desktop + mobile preload lines).

### Files Edited
- `index.html` (1 file, ~8 lines added, 1 stale comment removed)