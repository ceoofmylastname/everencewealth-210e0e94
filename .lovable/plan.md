## Hotfix to PROMPT 27 — gone_urls bypass for `/es/stories`

### Root cause

In `functions/_middleware.js`, the `gone_urls` DB lookup is nested inside the catchall regex gate (line 626):

```js
if (CONTENT_PATH_CATCHALL_REGEX.test(pathname) || TWO_SEGMENT_CATCHALL_REGEX.test(pathname)) {
  // ... all_published_slugs lookup ...
  // ... gone_urls lookup ...
}
```

`CONTENT_PATH_CATCHALL_REGEX` only matches `/<lang>/(blog|qa|compare|comparisons|comparar|estrategias|strategies|guides|glossary|state-guides)/...`. **`/es/stories` doesn't match `stories` (it's not in the alternation), so it skips the gone_urls lookup and falls through to the SPA catch-all → 200.**

### Order audit vs. spec

Spec order: IndexNow → STRUCTURAL_410 → gone_urls → REDIRECT_MAP → STATIC_ROUTE_EXEMPT → SPA.

Current order:
1. IndexNow key file (line 408) — correct
2. REDIRECT_MAP (line 469) — runs before STRUCTURAL_410 (harmless: no overlap), but out of spec
3. STRUCTURAL_410_PATTERNS (line 596) — correct position relative to catchall
4. gone_urls (line 661) — **WRONG: gated behind catchall regex; must be unconditional**
5. SPA catchall via `next()` — correct

### Fix (two parts)

**Part 1 — Hoist gone_urls into an unconditional block** between STRUCTURAL_410 (line 596–611) and the existing catchall block (~line 626). New block:

```js
// PROMPT 27 HOTFIX: Unconditional gone_urls lookup. Previously this ran
// only inside the CONTENT_PATH_CATCHALL gate, so paths like /es/stories
// fell through to SPA → 200. Run BEFORE the catchall and BEFORE SPA so
// any retired path returns 410 regardless of section.
if (!STATIC_ROUTE_EXEMPT.has(pathname)) {
  try {
    const slashed = pathname.endsWith('/') ? pathname : pathname + '/';
    const unslashed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const goneUrl =
      `${SUPABASE_URL}/rest/v1/gone_urls` +
      `?or=(url_path.eq.${encodeURIComponent(slashed)},url_path.eq.${encodeURIComponent(unslashed)})&select=id&limit=1`;
    const goneResp = await fetch(goneUrl, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    const goneRows = goneResp.ok ? await goneResp.json() : [];
    if (Array.isArray(goneRows) && goneRows.length > 0) {
      const html = render410Page(pathname, 410);
      console.log(`[Middleware] gone_urls 410 (hoisted): ${pathname}`);
      return new Response(html, {
        status: 410,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-410-Source': 'middleware-gone-urls',
          'X-Middleware-Status': 'Active',
          'Cache-Control': 'public, max-age=3600',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }
  } catch (err) {
    console.error(`[Middleware] gone_urls lookup failed for ${pathname}:`, err && err.message);
  }
}
```

The existing catchall block (all_published_slugs + nested gone_urls) stays as-is — the inner gone_urls call is now redundant but harmless.

**Part 2 — Belt-and-suspenders regex** added to `STRUCTURAL_410_PATTERNS` (line 81):

```js
/^\/es\/stories\/?$/,
```

Guarantees `/es/stories` returns 410 even if the DB lookup ever fails.

### Other gone_urls rows scanned

Production GET status check needed for these (from `pattern_match=false` query):
- `/es/stories`, `/es/stories/` — **confirmed broken** (the bug)
- `/blog/category/...` — already 301'd by prefix redirect (line 529); OK
- `/en/blog/costadelsol/...`, `/en/retirement-planning/...`, `/es/property/...` — caught by STRUCTURAL_410; OK
- `/<lang>/locations/<city>/<topic>/` rows — match TWO_SEGMENT_CATCHALL; OK
- `/es/locations/los-angeles,-ca` and `/es/locations/los-angeles,-ca/` — comma-strip 301 (line 513) fires first; OK
- `/en/blog/{insurance-management,...}/...` — caught by STRUCTURAL_410 line 85; OK

Only `/es/stories[/]` is structurally outside every existing gate. The hoisted gone_urls block fixes that and any future entries.

### Verification

After deploy:
- `curl -sI https://www.everencewealth.com/es/stories` → expect `HTTP/2 410` + `X-410-Source: middleware-structural` (regex hit) or `middleware-gone-urls` (DB hit)
- `curl -sI https://www.everencewealth.com/es/stories/` → expect 410
- Run `~/.bun/bin/bun run /Users/johnmelvin/Documents/everence-wealth-wiki/branded/verify-prompt-27.ts` → expect PASS

### Files changed

- `functions/_middleware.js` — add `/^\/es\/stories\/?$/` to STRUCTURAL_410_PATTERNS, insert unconditional gone_urls block after the STRUCTURAL_410 loop.

No DB migration needed (`/es/stories` row already present).
