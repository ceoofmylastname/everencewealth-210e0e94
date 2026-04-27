# Cleanup: Un-prefixed redirects + hero LCP preloads

Closes 3 of 4 audit items (Items 1, 2, 3). Item 4 (Bing `msvalidate.01`) deferred until the real token is available.

## Why prior hero-preload attempts failed

`index.html` already has hero preload tags at lines 40-49. But production never sees them because `scripts/generateStaticHomePage.ts` overwrites `dist/index.html` at build time with its own `<head>` template (lines 430-494) that has no hero preload tags. The Vite plugin pipeline runs:

1. Vite builds `dist/index.html` from source `index.html` (preloads survive).
2. `staticPageGenerator` plugin's `closeBundle` runs `generateStaticHomePage()`.
3. That generator writes a fresh template to `dist/index.html` — wiping the preloads.

Fix: add the preload tags to the generator template, not just source `index.html`. `app-shell.html` (used for non-homepage SPA fallback) does NOT need them — those routes aren't the LCP hero.

## Changes

### 1. `functions/_middleware.js` — add un-prefixed → `/en/` redirects

Insert a new block immediately AFTER the `REDIRECT_MAP` (line ~390) and BEFORE the comma-strip rule (line ~401). Same precedence as other 301 rules, runs before the static-asset bypass at line 451.

```js
// ============================================================
// Un-prefixed → /en/ redirects for known landing routes
// ============================================================
const UNPREFIXED_TO_EN = ['/assessment', '/about'];
if (
  UNPREFIXED_TO_EN.includes(pathname) ||
  UNPREFIXED_TO_EN.some(p => pathname === p + '/')
) {
  const base = pathname.replace(/\/$/, '');
  const target = `${BASE_URL}/en${base}/`;
  console.log(`[Middleware] 301 unprefixed→/en: ${pathname} → ${target}`);
  return new Response(null, {
    status: 301,
    headers: { Location: target, 'X-Middleware-Status': 'Active' },
  });
}
```

Handles all four cases: `/assessment`, `/assessment/`, `/about`, `/about/` → `/en/assessment/` and `/en/about/`.

### 2. `scripts/generateStaticHomePage.ts` — inject hero preloads in template

In the head template (around line 484, right after the Google Fonts `<link rel="stylesheet">`), add:

```html
<!-- LCP hero image preload — desktop + mobile, fetchpriority high -->
<link rel="preload" as="image"
      href="/hero/hero-landing-desktop.jpg"
      fetchpriority="high"
      media="(min-width: 768px)">
<link rel="preload" as="image"
      href="/hero/hero-landing-mobile.jpg"
      fetchpriority="high"
      media="(max-width: 767px)">
```

This template is used to write `dist/index.html` (root `/`), `dist/en/index.html`, and `dist/{lang}/index.html` for all 10 supported languages, so all homepages get the LCP preloads.

### 3. `index.html` — leave existing hero preload tags in place

Source `index.html` already has them at lines 40-49 (PROMPT 21 work). They survive the Vite step but get wiped by the generator — fixing the generator (above) is the real fix. Keeping them in source is defensive (covers the dev server and any non-homepage entry point that uses raw `index.html`). No edit needed.

### 4. (Deferred) Bing `msvalidate.01` meta tag

Skipped — the prompt provided a literal placeholder. Will land when the real token is supplied.

## Files touched

- `functions/_middleware.js` — add `UNPREFIXED_TO_EN` redirect block
- `scripts/generateStaticHomePage.ts` — add 2 preload tags to head template

## Files explicitly NOT touched

- `supabase/migrations/*` 
- PROMPT 17 catchall, comma-strip 301, `.txt`/`.xml` content-type branches
- `injectSeoTags()` HTMLRewriter
- `OptimizedImage.tsx`
- `serve-seo-page/index.ts`
- `editorialImagePrompt.ts`
- `src/config/business.ts`
- `public/_headers` (PROMPT 22)
- `scripts/generateAppShell.ts` (app-shell isn't homepage; preloads not relevant there)
- Source `index.html` (already correct; generator was the bottleneck)

## Verification (post-deploy + Cloudflare cache purge)

```bash
# Item 1
curl -sIL https://www.everencewealth.com/assessment | grep -E "HTTP|location" | head -4
# Expected: 301 → /en/assessment/ → 200

# Item 2
curl -sIL https://www.everencewealth.com/about/ | grep -E "HTTP|location" | head -4
# Expected: 301 → /en/about/ → 200

# Item 3
curl -sL https://www.everencewealth.com/ | grep -iE 'preload.*image|fetchpriority' 
# Expected: 2 hero preload lines

# Regression check (PROMPT 20/21/22)
curl -sI https://www.everencewealth.com/ | grep -iE "strict-transport|x-frame|content-security|permissions-policy" | wc -l
# Expected: 4
curl -sI https://www.everencewealth.com/llms.txt | grep -i content-type
# Expected: text/plain; charset=utf-8
curl -sL https://www.everencewealth.com/en/about/ | grep canonical
# Expected: canonical → /en/about/
```

Local pre-deploy sanity check:

```bash
npm run build && grep -c 'preload.*hero' dist/index.html
# Expected: 2
```
