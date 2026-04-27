# Wave 1.5 — Three Middleware Fixes (Single Commit)

All edits land in `functions/_middleware.js`. Single commit, one deploy, verify with curl.

## Item 1 — Delete dead `is404Blocked` block (lines ~498-519)

The block hand-rolls 404s for `/es/property/*` and two `/blog/category/*` paths. Both are now better handled:
- `/es/property/R*` → matches `STRUCTURAL_410_PATTERNS[0]` → 410 (correct semantic, not 404)
- `/blog/category/buying property` and `/blog/category/retirement planning` → already caught by the prefix redirect at line ~486 (`/blog/category/*` → 301 → `/en/`)

**Action:** Delete the entire block from `// 404 BLOCKLIST` header through the closing `}` of the `if (is404Blocked)` return. Removes dead code and lets `STRUCTURAL_410_PATTERNS` deliver proper 410 status for property URLs.

## Item 2 — Hoist structural 410 check so `/retirement-planning/*` fires

**Root cause confirmed:** `STRUCTURAL_410_PATTERNS` is currently only evaluated inside the `if (CONTENT_PATH_CATCHALL_REGEX.test(...) || TWO_SEGMENT_CATCHALL_REGEX.test(...))` gate at line ~580. `CONTENT_PATH_CATCHALL_REGEX` whitelists sections `blog|qa|compare|comparisons|comparar|estrategias|strategies|guides|glossary|state-guides`. `retirement-planning` is **not** in that list, so `/en/retirement-planning/wealth-protection-florida-es` skips the entire catchall block and falls through to SPA → 200.

The regex `/^\/(en|es)\/retirement-planning\/.+/i` already exists in `STRUCTURAL_410_PATTERNS` — it's just unreachable for this path.

**Action:** Extract the structural 410 loop into a standalone block placed **before** the catchall gate (after asset-path skip, before `CONTENT_PATH_CATCHALL_REGEX` check). The loop runs unconditionally on every non-asset path. Then remove the duplicate loop inside the catchall block (keep the `STATIC_ROUTE_EXEMPT` + DB lookup logic intact for soft-404 handling).

Order after change:
```text
asset skip
↓
STRUCTURAL_410_PATTERNS loop  ← NEW position, fires for any path
↓
CONTENT_PATH_CATCHALL gate
  └─ STATIC_ROUTE_EXEMPT skip → SPA
  └─ all_published_slugs DB lookup → 410 / 404
↓
SSR / SPA fallback
```

This also benefits `/es/property/R*` (item 1's deleted paths) — they now hit structural 410 even outside the catchall.

## Item 3 — Normalize IUL redirect trailing slash

Line 408 currently:
```js
'/indexed-universal-life-insurance/introduction': '/en/strategies/iul',
```

**Action:** Change target to `/en/strategies/iul/` (trailing slash) for consistency with the other entries in `REDIRECT_MAP` (e.g. `/financial-planning/three-tax-buckets` → `/en/strategies/tax-free-retirement/`). Eliminates the 301 → 301 chain when Cloudflare or the SPA normalizes trailing slash separately.

## Files changed

- `functions/_middleware.js` (3 edits, single commit)

## Post-deploy verification (paste output)

```bash
curl -sI https://www.everencewealth.com/es/property/R5295292 | head -1
# Expected: HTTP/2 410

curl -sI https://www.everencewealth.com/en/retirement-planning/wealth-protection-florida-es | head -1
# Expected: HTTP/2 410

curl -sIL https://www.everencewealth.com/indexed-universal-life-insurance/introduction | grep -E "HTTP|location" | head -3
# Expected: HTTP/2 301, location: .../en/strategies/iul/, HTTP/2 200

# Regression checks (Wave 1 wins must stay green):
curl -sI https://www.everencewealth.com/en/strategies/iul | head -1   # 200
curl -sI https://www.everencewealth.com/en/blog/costadelsol/anything | head -1  # 410
curl -sI https://www.everencewealth.com/blog/category/buying%20property | head -1  # 301 → /en/
```

After verification passes, proceed to Wave 2 (slug suffix dedup + language mismatch + url_redirects table).
