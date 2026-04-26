## P0 Hotfix: Catchall 404'ing real published URLs

### Problem
The PROMPT 17 catchall in `functions/_middleware.js` (lines 487–535) queries the `all_published_slugs` view with `eq.full_path=<pathname>`. The view stores paths **with** trailing slashes (e.g. `/en/blog/foo/`), but requests without a trailing slash (e.g. `/en/blog/foo`) miss the lookup and fall into the 404/410 branch — even when the page is published.

This is hitting production right now across `/blog/`, `/qa/`, `/compare/`, `/comparisons/`, `/comparar/`, `/strategies/`, `/estrategias/`, `/guides/`, `/glossary/`, `/state-guides/`, and 2-segment `/locations/<city>/<topic>/` style URLs.

### Fix (surgical, 2 lookup URLs only)

In `functions/_middleware.js`, inside the catchall block, before the `all_published_slugs` lookup at line ~492, add a single path-normalization line and reuse it for both lookups:

```js
// Normalize path: all_published_slugs view stores paths with trailing
// slash. Always look up the trailing-slash variant.
const normalizedPath = pathname.endsWith('/') ? pathname : pathname + '/';
const lookupUrl =
  `${SUPABASE_URL}/rest/v1/all_published_slugs` +
  `?full_path=eq.${encodeURIComponent(normalizedPath)}&select=slug&limit=1`;
```

And in the `gone_urls` lookup just below (line ~507):

```js
const goneUrl =
  `${SUPABASE_URL}/rest/v1/gone_urls` +
  `?url_path=eq.${encodeURIComponent(normalizedPath)}&select=id&limit=1`;
```

Both lookups use the same `normalizedPath` so behavior is identical regardless of whether the request URL has a trailing slash.

### Untouched (per guard rails)
- Catchall regex definitions, response shape, headers, status logic
- Canonical/hreflang HTMLRewriter dedup
- Comma-strip 301 redirect
- Everything outside lines ~492–508

### Verification (post-deploy)
```
curl -sI https://www.everencewealth.com/en/blog/understanding-the-retirement-gap-why-it-matters-now-more-than-ever | head -1
# expect: HTTP/2 200

curl -sI https://www.everencewealth.com/en/blog/this-slug-does-not-exist | head -1
curl -sI https://www.everencewealth.com/en/blog/this-slug-does-not-exist/ | head -1
# expect: HTTP/2 404 (both)

curl -sI https://www.everencewealth.com/en/blog/costadelsol/best-neighborhoods | head -1
curl -sI https://www.everencewealth.com/en/blog/costadelsol/best-neighborhoods/ | head -1
# expect: HTTP/2 410 (both — gone_urls still match)
```

### Files changed
- `functions/_middleware.js` (one block, ~3 lines added/changed)
