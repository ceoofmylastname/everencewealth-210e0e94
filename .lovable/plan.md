

# Fix: Serve Pre-rendered Q&A Static HTML via Cloudflare Routing

## Root Cause
The build script (`scripts/generateStaticQAPages.ts`) generates static HTML files at `dist/{lang}/qa/{slug}/index.html` with full SEO content. However, `public/_redirects` has **zero rules** for Q&A paths. Every Q&A request falls through to the final catch-all (`/* /index.html 200`), which serves the empty React SPA shell. Googlebot sees no content.

Compare with blog pages which DO have a rule on line 62:
```
/blog/:slug  /blog/:slug/index.html  200
```

Q&A pages have no equivalent.

## Changes

### 1. `public/_redirects` -- Add Q&A static file rules

Insert before the SPA fallback section (before line 82), add rules to serve the pre-rendered static HTML for both individual Q&A pages and Q&A index pages:

```
# Q&A pages - serve pre-rendered static HTML (MUST come before SPA fallback)
/:lang/qa/:slug  /:lang/qa/:slug/index.html  200
/:lang/qa  /:lang/qa/index.html  200
```

This mirrors the existing pattern used for blog articles and buyers-guide pages.

### 2. `public/_headers` -- Add Q&A caching and crawler headers

Append Q&A-specific headers for caching and crawler signals:

```
/*/qa/*
  Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=300
  X-Robots-Tag: all
  X-Content-Type-Options: nosniff
```

## What This Fixes
- Crawlers (Googlebot, Bingbot, etc.) will receive the full pre-rendered HTML with all SEO metadata, JSON-LD schemas, and content -- instead of an empty React shell
- The `200` status code with the file path tells Cloudflare Pages to serve the static file directly
- Regular users also benefit from faster initial page loads (static HTML hydrates into the React app)

## What Does NOT Change
- No middleware changes needed (it already excludes Q&A from edge function routing)
- No build script changes
- No database changes
- No component changes

