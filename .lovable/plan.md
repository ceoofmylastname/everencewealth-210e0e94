
## Revert SSR 410/404 Forwarding in `functions/_middleware.js`

Restore the prior behavior where the middleware never returns hard 404/410 status codes for blog or Q&A SSR paths. Any non-200 response from the Supabase edge function falls through to the SPA shell (200 HTML).

### Changes — Blog SSR section (≈ lines 316–366)

1. **Remove the 404/410 forwarding block** (lines 316–328). The middleware will no longer forward edge-function 404/410 status to the browser.
2. **Remove the "Both failed — serve 404 for blog paths" terminal block** (lines 353–366). Replace it with a fall-through to the SPA shell:
   ```js
   console.log(`[Middleware] Blog SSR did not yield substantial HTML for ${pathname}, falling through to SPA`);
   return next();
   ```

### Changes — Q&A SSR section (≈ lines 430–480)

1. **Remove the 404/410 forwarding block** (lines 430–442).
2. **Remove the "Both failed — serve 404 for Q&A paths" terminal block** (lines 467–480). Replace with a fall-through to the SPA shell:
   ```js
   console.log(`[Middleware] Q&A SSR did not yield substantial HTML for ${pathname}, falling through to SPA`);
   return next();
   ```

### Net behavior after revert
- Edge function returns 200 with substantial HTML → serve SSR HTML (unchanged).
- Edge function returns 404 / 410 / any non-200 → fall through to the SPA shell (200 HTML), so Googlebot sees a working page instead of a 404.
- Edge function fetch throws or times out → fall through to the SPA shell (same as above).

### Untouched (per user instructions)
- 404 blocklist for `costadelsol` and property pages.
- Redirect map.
- `injectSeoTags()` function.
- `SEO_ROUTE_PATTERNS = []`.
- `LANGUAGES = ['en','es']`.
- `BASE_URL` and all other middleware logic.

### File touched
- `functions/_middleware.js` — only the four blocks above. No other files.
