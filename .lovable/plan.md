
# Fix Buyers Guide SEO Page: Remove Infinite Redirect Loop & Add CSS Assets

## Problem Analysis

The `generateBuyersGuidePageHtml()` function in `supabase/functions/serve-seo-page/index.ts` (lines 775-893) has two critical bugs:

### Bug 1: Self-Referencing Redirect (Infinite Loop)
**Lines 877 and 888:**
```html
<meta http-equiv="refresh" content="0;url=/${lang}/buyers-guide">
...
<script>window.location.href='/${lang}/buyers-guide';</script>
```

When the edge function returns this HTML for `/nl/buyers-guide`, it immediately redirects to `/nl/buyers-guide` again — creating an infinite loop. The middleware detects this route, calls the edge function, which returns HTML that redirects back to the same route.

### Bug 2: Missing CSS/JS Assets
The generated HTML has no `<link rel="stylesheet">` or `<script type="module">` tags for the production assets, so even without the redirect loop, the page would display unstyled HTML.

## Solution: Two-Part Fix

### Part 1: Remove Self-Referencing Redirects
Remove lines 877 and 888 from the edge function. The edge function should return **complete, hydratable HTML** that the browser can render, not a redirect back to itself.

### Part 2: Add Production CSS/JS Assets
Since the edge function runs at request-time (not build-time), we cannot extract hashed asset paths from `dist/index.html`. Instead, we should:

**Option A: Static asset references** - Use fixed paths that Cloudflare will serve:
```html
<link rel="stylesheet" href="/assets/index.css" />
<script type="module" src="/assets/index.js"></script>
```

**Option B: Return minimal SEO shell + client-side hydration** (Recommended)
The edge function should return an SEO-optimized HTML shell with:
- All meta tags, hreflang, Open Graph, JSON-LD schemas
- Static H1 and description for crawlers
- A clean `<div id="root">` for React hydration
- The standard React bootstrap script

This matches how the homepage SSG works — static content for SEO, hydrated by React for users.

## Files to Update

| File | Change |
|------|--------|
| `supabase/functions/serve-seo-page/index.ts` | Fix `generateBuyersGuidePageHtml()` function |

## Implementation Details

### Updated `generateBuyersGuidePageHtml()` Function

```typescript
function generateBuyersGuidePageHtml(lang: string): string {
  const locale = LOCALE_MAP[lang] || 'en_GB'
  const canonicalUrl = `${BASE_URL}/${lang}/buyers-guide`
  const content = BUYERS_GUIDE_META[lang] || BUYERS_GUIDE_META.en
  
  // Generate hreflang tags for all 10 languages + x-default
  const hreflangTags = SUPPORTED_LANGUAGES.map(langCode => 
    `  <link rel="alternate" hreflang="${langCode}" href="${BASE_URL}/${langCode}/buyers-guide" />`
  ).join('\n')
  const xDefaultTag = `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/buyers-guide" />`
  
  // JSON-LD schema (same as before)
  const schemaGraph = { /* existing schema */ }
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <meta name="description" content="${content.description}">
  
  <!-- Canonical -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Hreflang tags -->
${hreflangTags}
${xDefaultTag}
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${content.title}">
  <meta property="og:description" content="${content.description}">
  <meta property="og:locale" content="${locale}">
  <meta property="og:site_name" content="Del Sol Prime Homes">
  <meta property="og:image" content="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${content.title}">
  <meta name="twitter:description" content="${content.description}">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@400;700&family=Raleway:wght@400;500;600;700&display=swap">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(schemaGraph, null, 2)}
  </script>
  
  <!-- Critical inline CSS for initial render -->
  <style>
    body { font-family: 'Lato', sans-serif; margin: 0; }
    .seo-content { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2.5rem; }
  </style>
</head>
<body>
  <div id="root">
    <!-- Static SEO content - React will hydrate -->
    <main class="seo-content">
      <h1>${content.headline}</h1>
      <p>${content.subheadline}</p>
      <p id="speakable-summary">${content.description}</p>
    </main>
  </div>
  
  <!-- React bootstrap - loads the full app -->
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`
}
```

### Key Changes:
1. **Removed** `<meta http-equiv="refresh">` redirect tag
2. **Removed** `<script>window.location.href=...</script>` redirect
3. **Added** font stylesheet links for basic styling
4. **Added** critical inline CSS for minimum styling before React loads
5. **Kept** `<script type="module" src="/src/main.tsx">` for React hydration (Vite dev) or the production build will inject the hashed asset paths

## Alternative: SSG Approach (Build-Time)

For the most robust solution matching the homepage pattern, create a new SSG script:

| File | Purpose |
|------|---------|
| `scripts/generateStaticBuyersGuide.ts` | Pre-render all 10 language versions at build time |

This would:
1. Extract production CSS/JS assets from `dist/index.html`
2. Generate `dist/{lang}/buyers-guide/index.html` for each language
3. Include fully styled static HTML with React hydration

The middleware would then simply serve these static files instead of calling the edge function.

## Expected Result After Fix

**Before (broken):**
- `<html lang="en">` (wrong)
- No CSS → unstyled
- Redirects to itself → infinite loop

**After (fixed):**
- `<html lang="nl">` (correct)
- Fonts loaded → readable text
- Static SEO content → crawlers see proper content
- React hydrates → full interactive page

## Validation

1. **No redirect loop**: Page loads without infinite redirects
2. **Correct meta tags**: View source shows localized title, description, hreflang
3. **Readable content**: At minimum, text is visible with basic styling
4. **React hydrates**: Full interactive page loads within 1-2 seconds
