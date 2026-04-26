## Goal

Force the three lingering P0 fixes from PROMPT 20 over the line:

1. Edge function emits canonicals/hreflangs without trailing slash
2. `/en/about/` and `/es/about/` fall to the SPA shell with wrong canonical
3. Cloudflare HTML cache is serving stale dateModified

---

## Issue 1 — `serve-seo-page` returns bare canonicals

### What I verified by reading the code

`withTrailingSlash` IS already present in `supabase/functions/serve-seo-page/index.ts` and IS already wrapping every URL that flows into the JSON response:

- `metadata.canonical_url` is wrapped at lines 393, 455, 518, 653 (QA / blog / comparison / location)
- Hub generator wraps at 1143–1146
- `generateHreflangTags()` wraps at 740 / 749
- QA hreflang generator wraps at 125–126

The JSON response field at line 3789 (`canonical: metadata.canonical_url`) is fine because `metadata.canonical_url` is already a wrapped value.

The user's curl returned a bare canonical. With the source code already correct, the only consistent explanation is: **the edge function was never redeployed after PROMPT 20.** Lovable Cloud does deploy edge functions on commit, but a failed/skipped deploy would leave the old binary live and produce exactly this symptom.

### One real gap remaining

`generateBuyersGuidePageHtml()` (line 1390) builds canonical + hreflang + og:url WITHOUT `withTrailingSlash`. This is a real PROMPT 20 miss.

### Fix

a. Wrap the buyers-guide canonical + 10 hreflang + x-default + og:url with `withTrailingSlash` (lines 1392, 1397, 1399, plus the schema graph references at 1417, 1418, 1430, 1444, 1447).

b. Force a fresh deploy of `serve-seo-page` via the deploy tool so the live edge function picks up both the PROMPT 20 changes and (a).

### Verification (after deploy)

```
curl -sL "https://zbzrmpmqijvmjbhctfoe.supabase.co/functions/v1/serve-seo-page?path=/en/blog/understanding-the-retirement-gap-why-it-matters-now-more-than-ever/" \
  -H "apikey: <anon>" | grep -oE '"canonical":\s*"[^"]+"'
```

Expected: ends with `/`.

---

## Issue 2 — `/en/about/` and `/es/about/` SPA-shell fallback

### What I verified

`scripts/generateStaticAboutPage.ts` already exists and is invoked from `build.sh` line 47, but it:
- Writes only to `dist/about/index.html` (legacy, no language prefix)
- Defaults canonical to `${BASE_URL}/about` (no trailing slash, no `/en/` or `/es/`)
- Only fetches `language='en'` from `about_page_content`

Result: requests to `/en/about/` and `/es/about/` miss the static file and fall to `dist/index.html`, which has the homepage canonical baked in.

### Fix (Approach A — extend the existing script)

Modify `scripts/generateStaticAboutPage.ts`:

1. Loop over `['en', 'es']` instead of single `.eq('language', 'en').single()`.
2. For each language:
   - Compute `canonicalUrl = ${BASE_URL}/${lang}/about/` (trailing slash, language-prefixed). Fallback only if DB row has nothing.
   - Add hreflang tags inside the `<head>`:
     ```
     <link rel="alternate" hreflang="en" href="https://www.everencewealth.com/en/about/" />
     <link rel="alternate" hreflang="es" href="https://www.everencewealth.com/es/about/" />
     <link rel="alternate" hreflang="x-default" href="https://www.everencewealth.com/en/about/" />
     ```
   - Update breadcrumb / WebPage schema URLs to the language-prefixed canonical with trailing slash.
   - Write to `dist/${lang}/about/index.html`.
3. Keep the legacy `dist/about/index.html` write as well (existing 301 redirect chain expects it).
4. If the `es` row is missing in `about_page_content`, fall back to the `en` row content but keep `lang="es"` and the Spanish canonical — so we always emit a real static file with the correct canonical.

### Verification (after Lovable rebuild + cache purge)

```
curl -sL https://www.everencewealth.com/en/about/ | grep canonical
curl -sL https://www.everencewealth.com/es/about/ | grep canonical
```

Expected: each emits `<link rel="canonical" href="https://www.everencewealth.com/{lang}/about/" />`

---

## Issue 3 — Cloudflare HTML cache holds stale dateModified

DB has 51 distinct `date_modified` values; served HTML shows 3. The PROMPT 20 backfill landed correctly; only the cache is stale. This is not a code change.

### Action — surface to user

After the code changes ship and the build completes, the user must purge Cloudflare's HTML cache. Two options:

**A (fastest)**: Cloudflare dashboard → Caching → Configuration → Purge Everything

**B (API)**:
```
curl -X POST "https://api.cloudflare.com/client/v4/zones/<zone-id>/purge_cache" \
  -H "Authorization: Bearer <api-token>" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Verification (after purge)

```
for slug in $(curl -s https://www.everencewealth.com/sitemaps/en/blog.xml \
  | grep -oE '<loc>[^<]+</loc>' | sed 's/<[^>]*>//g' | tail -n +2 | head -10); do
  curl -sL "$slug" | grep -oE '"dateModified":"[^"]+"' | head -1
done | sort -u | wc -l
```

Expected: 8–10 distinct.

---

## Files changed

Edited:
- `supabase/functions/serve-seo-page/index.ts` — wrap buyers-guide canonical + hreflang + og:url + schema URLs with `withTrailingSlash`
- `scripts/generateStaticAboutPage.ts` — emit `dist/en/about/index.html` and `dist/es/about/index.html` with language-prefixed trailing-slash canonical + hreflang trio; keep legacy `dist/about/index.html` write

Then:
- Deploy `serve-seo-page` via the edge-function deploy tool
- User triggers Lovable rebuild (frontend Update) and Cloudflare cache purge

Untouched (per guard rails):
- All `supabase/migrations/*.sql`
- `functions/_middleware.js` (PROMPT 17 catchall, comma-strip 301)
- `injectSeoTags()` HTMLRewriter
- PROMPT 20 work (llms.txt handler, dateModified trigger, About.tsx react-helmet)
- `BUSINESS.*` constants
