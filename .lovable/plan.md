## Goal

Extend PROMPT 17 catchall in `functions/_middleware.js` so multi-segment junk URLs under content prefixes (e.g. `/en/blog/costadelsol/best-neighborhoods`) hit the catchall instead of falling through to the SSR shell, and make the `gone_urls` lookup tolerant of both trailing-slash variants. Surgical changes only — no signature/response shape changes.

## Changes (single file: `functions/_middleware.js`)

### Change 1 — Rename + broaden the one-segment catchall regex (lines 31-32)

Before:
```js
const ONE_SEGMENT_CATCHALL_REGEX =
  /^\/(en|es)\/(blog|qa|compare|comparisons|comparar|estrategias|strategies|guides|glossary|state-guides)\/[^\/]+\/?$/;
```

After:
```js
const CONTENT_PATH_CATCHALL_REGEX =
  /^\/(en|es)\/(blog|qa|compare|comparisons|comparar|estrategias|strategies|guides|glossary|state-guides)\/.+$/;
```

`TWO_SEGMENT_CATCHALL_REGEX` (line 33-34, locations) is left untouched.

### Change 2 — Update the catchall test reference (line 488)

Before:
```js
ONE_SEGMENT_CATCHALL_REGEX.test(pathname) ||
TWO_SEGMENT_CATCHALL_REGEX.test(pathname)
```

After:
```js
CONTENT_PATH_CATCHALL_REGEX.test(pathname) ||
TWO_SEGMENT_CATCHALL_REGEX.test(pathname)
```

No other file references the old constant — it is local to `functions/_middleware.js`.

### Change 3 — Tolerant `gone_urls` lookup (lines 510-511)

`all_published_slugs` lookup at lines 494-497 stays exactly as-is (view always stores trailing slash; `normalizedPath` is correct).

Before:
```js
const goneUrl =
  `${SUPABASE_URL}/rest/v1/gone_urls` +
  `?url_path=eq.${encodeURIComponent(normalizedPath)}&select=id&limit=1`;
```

After:
```js
const slashed = pathname.endsWith('/') ? pathname : pathname + '/';
const unslashed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
const goneUrl =
  `${SUPABASE_URL}/rest/v1/gone_urls` +
  `?or=(url_path.eq.${encodeURIComponent(slashed)},url_path.eq.${encodeURIComponent(unslashed)})&select=id&limit=1`;
```

## Out of scope (do not touch)

- `TWO_SEGMENT_CATCHALL_REGEX`
- `all_published_slugs` lookup / `normalizedPath` derivation
- Response shape, status code logic, headers
- HTMLRewriter canonical/hreflang dedup
- Comma-strip 301 redirect
- Any file other than `functions/_middleware.js`

## Verification (post-deploy)

```bash
# Real published URL still 200 (with and without slash)
curl -sI https://www.everencewealth.com/en/blog/understanding-the-retirement-gap-why-it-matters-now-more-than-ever | head -1
curl -sI https://www.everencewealth.com/en/blog/understanding-the-retirement-gap-why-it-matters-now-more-than-ever/ | head -1
# Expected: HTTP/2 200

# Bad 1-segment slug still 404 (both variants)
curl -sI https://www.everencewealth.com/en/blog/this-slug-does-not-exist | head -1
curl -sI https://www.everencewealth.com/en/blog/this-slug-does-not-exist/ | head -1
# Expected: HTTP/2 404

# Multi-segment Del Sol leftover NOW 410 (was 200)
curl -sI https://www.everencewealth.com/en/blog/costadelsol/best-neighborhoods | head -1
curl -sI https://www.everencewealth.com/en/blog/costadelsol/best-neighborhoods/ | head -1
# Expected: HTTP/2 410

# Multi-segment garbage not in gone_urls → 404
curl -sI https://www.everencewealth.com/en/blog/random/garbage/path | head -1
# Expected: HTTP/2 404

# Locations 2-segment routing unchanged
curl -sI https://www.everencewealth.com/en/locations/florida/this-city-does-not-exist | head -1
# Expected: HTTP/2 404
```
