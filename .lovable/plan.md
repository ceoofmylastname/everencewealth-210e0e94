

## Three Targeted Middleware Fixes

### Fix 1 — Add `/es/property/` to 404 blocklist
**File:** `functions/_middleware.js`, line 219-222

Update the `is404Blocked` check to also match real estate property pages:

```js
const is404Blocked =
  /^\/(en|es)\/blog\/costadelsol\//.test(pathname) ||
  /^\/es\/property\//.test(pathname) ||
  pathname === '/blog/category/buying property' ||
  pathname === '/blog/category/retirement planning';
```

The existing 404 response handler (lines 224-237) already returns HTTP 404 with `<meta name="robots" content="noindex">` and `X-Robots-Tag: noindex` header — no other changes needed.

---

### Fix 2 — Break the `/en/locations` redirect loop

**Root cause found:** `/en/locations` matches `SEO_ROUTE_PATTERNS` (line 91), so the middleware calls the Supabase edge function. The edge function's `generateHubPageHtml()` (in `supabase/functions/serve-seo-page/index.ts`, lines 808-821) returns HTML containing:

```html
<meta http-equiv="refresh" content="0;url=/en/locations">
<script>window.location.href='/en/locations';</script>
```

This sends the browser back to the same URL, which the middleware routes back to the edge function, which returns the same redirect HTML — **infinite loop**.

**Fix (single file, in middleware):** Stop intercepting the locations hub at the edge entirely. Let it render through the React SPA (the `LocationHub` component already exists in `src/App.tsx` at `/:lang/locations` and queries Supabase directly for the city list).

Remove the `SEO_ROUTE_PATTERNS` entry on line 88-92 — change to an empty array, or remove the locations regex specifically:

```js
const SEO_ROUTE_PATTERNS = [];
```

Then `needsSEO('/en/locations')` returns false → middleware falls through to the SPA HTML response → `injectSeoTags()` at line 600-608 still adds canonical/hreflang tags server-side. No loop, full SEO coverage preserved.

---

### Fix 3 — Verify canonical injection for `/en/` and `/es/` root paths

**Verification result: already works correctly.**

Tracing `/es/` through the middleware:
1. Not in `REDIRECT_MAP` ✓
2. Not in `is404Blocked` ✓
3. No static extension ✓
4. Doesn't match `/blogMatch` or `qaMatch` regex ✓
5. `needsSEO('/es/')` → false (after Fix 2) ✓
6. Reaches `langRouteMatch` block (line 600): regex `^\/([a-z]{2})(\/|$)` matches `/es/` with group 1=`es`, group 2=`/` ✓
7. `injectSeoTags()` runs:
   - `canonicalUrl` = `https://www.everencewealth.com/es/`
   - `buildAlternatePath('/es/', 'es', 'en')` strips `^/es` → `/`, no slug map hit → returns `/en/`
   - `alternateUrl` = `https://www.everencewealth.com/en/`
   - `defaultUrl` = `https://www.everencewealth.com/en/` ✓

The same chain works for `/es` (no trailing slash, group 2 = empty string). All four tags inject correctly. **No code change needed.**

---

### Summary of file changes

**`functions/_middleware.js`** — two small edits:
1. Add `/^\/es\/property\//` to the `is404Blocked` regex chain (line 219-222)
2. Empty out `SEO_ROUTE_PATTERNS` (line 88-92) to stop the locations hub redirect loop

No other files modified. No edge function redeployment needed.

