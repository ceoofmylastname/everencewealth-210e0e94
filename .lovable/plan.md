
# Fix: Route Blog and Q&A Pages Through SSR Edge Function

## Root Cause

The internal links ARE in the database (confirmed: 3 links on the test article) and the `serve-seo-page` edge function DOES render them correctly (confirmed via direct call). The problem is the **routing layer**:

- **Blog articles**: No SSR routing exists at all. They hit the SPA catch-all (`/* /index.html`) and crawlers get an empty `<div id="root"></div>`.
- **Q&A articles**: Have SSR fallback, but static HTML files were pre-rendered BEFORE the internal links backfill. The middleware prefers static files, so crawlers get the old HTML without internal links.

## Solution: Add Blog SSR Fallback to Middleware

Add the same "try static first, fallback to SSR" pattern that Q&A pages already use (lines 132-220 of `_middleware.js`) for blog articles as well.

### File: `functions/_middleware.js`

**Change 1: Add blog route matching (after Q&A block, before `needsSEO` check)**

Add a new block that matches `/{lang}/blog/{slug}` routes and applies the same logic as Q&A:
1. Try to serve the static file via `next()`
2. Check if it's "substantial HTML" (has DOCTYPE, no empty SPA shell, > 5000 bytes)
3. Additionally check if it contains the `internal-links-section` nav element
4. If static file is missing, thin, or lacks internal links -- call `serve-seo-page` edge function as fallback
5. If SSR also fails, fall through to SPA

This ensures crawlers always get full SSR HTML with internal links, while users with JavaScript still get the React SPA experience.

**Change 2: Update Q&A static check to also verify internal links presence**

For Q&A pages, add an extra check: even if the static file is "substantial", if it doesn't contain internal links but the SSR version would, prefer the SSR version. This handles the stale static files from before the backfill.

### Implementation Detail

```text
// Blog SSR fallback (new block, same pattern as Q&A lines 132-220)
const blogMatch = pathname.match(/^\/([a-z]{2})\/blog\/(.+)/);
if (blogMatch) {
  const staticResponse = await next();
  const staticBody = await staticResponse.clone().text();
  
  // Check if static file has full content WITH internal links
  const isComplete = 
    staticBody.includes('<!DOCTYPE html>') &&
    !staticBody.includes('<div id="root"></div>') &&
    staticBody.length > 5000 &&
    staticBody.includes('internal-links-section');
  
  if (isComplete) {
    // Serve static with cache headers
    return staticResponse;
  }
  
  // Fallback to SSR edge function
  const ssrResponse = await fetch(serve-seo-page?path=...&html=true);
  if (ssrResponse.ok) return ssrResponse;
  
  // Last resort: SPA shell
  return staticResponse;
}
```

### File: `functions/_middleware.js` -- Summary of edits

1. Add blog route matching block (~40 lines, mirrors Q&A pattern)
2. Update Q&A substantial check to also verify `internal-links-section` presence
3. No changes to `_redirects`, `serve-seo-page`, or any other file

### Why This Works

- The edge function already renders internal links correctly (verified)
- The database already has all links populated (verified: 3,271 blog + 8,881 Q&A)
- We just need the middleware to route blog pages through the edge function instead of serving the empty SPA shell
- For Q&A pages with stale static files, adding the internal links check forces a refresh via SSR

### What Crawlers Will See After Fix

- Full HTML with article content
- `<nav class="internal-links-section">` with 2-3 funnel links
- Proper hreflang tags, canonical URLs, structured data
- All of this in the raw HTML source (no JavaScript required)

### Risk Assessment

- Low risk: follows exact same pattern already proven for Q&A pages
- No database changes
- No edge function changes
- Only the Cloudflare middleware routing logic is updated
