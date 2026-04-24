

# Diagnostic findings + corrected SSR / route plan

## What the audit document got right

- React Helmet runs after hydration. AI crawlers don't execute JS. Anything Helmet-only is invisible on first fetch.
- Some page types ARE missing schema, H1, or correct titles in raw HTML.

## What the audit document got wrong (verified against the live site)

I curl'd 6 representative URLs with a normal browser UA. Reality differs from the audit's premise:

| URL | Status | JSON-LD blocks in raw HTML | H1 in raw HTML | Title | SSR/Static source |
|---|---|---|---|---|---|
| `/` → `/en/` | 200 | 1 | empty `<h1></h1>` | "Bridge the Retirement Gap" generic | Helmet-only fallback |
| `/en/strategies/asset-protection/` | 200 | **6** | **MISSING** | correct | static prerender (schema OK, body in JS) |
| `/en/qa/` | 200 | 1 | "Questions & Answers" | correct | static index ✓ |
| `/en/qa/what-process-steps-…` | 200 | **3** | present | correct | **edge function SSR works** ✓ (header `x-seo-source: edge-function-ssr`) |
| `/en/blog/tax-planning/understanding-three-tax-buckets` (no slash) | 200 | 1 | empty | "Bridge the Retirement Gap" generic | **SPA shell — broken** |
| `/en/blog` index | 200 | 1 | present | correct | static index ✓ |

So the actual problems are:

1. **Q&A detail pages already work** (Prompts 2 + 3 are partly already shipped via `serve-seo-page` + middleware fallback). No rebuild needed for `/en/qa/{slug}`.
2. **Blog detail pages serve the SPA shell** when accessed without a trailing slash. Static prerender exists at `dist/en/blog/.../index.html` but middleware's `isComplete` check requires the `internal-links-section` marker that older static files don't contain — so it falls through, hits the edge function, but the edge function doesn't currently handle `blog_articles` SSR (only does it for QA). Then it falls through to `next()` which returns the SPA shell.
3. **Strategy / BOFU pages have all 6 JSON-LD blocks in raw HTML** (good) **but no H1** — those pages render H1 inside React components, so the prerendered HTML body is empty. AI crawlers see schema but no visible content.
4. **Homepage** is essentially Helmet-only.
5. **Sitemap-vs-route mismatch is FALSE** — `/:lang/qa/:slug` and `/:lang/blog/:slug` are registered in `src/App.tsx` lines 557–562, and live URLs return 200. No 410 work needed.

## The actual fix (much smaller than the original 5-prompt pack)

### 1. Extend `serve-seo-page` to handle blog articles + strategies + homepage

The function already does Q&A correctly. Add three new route handlers in `supabase/functions/serve-seo-page/index.ts`:

- `blog-detail` — fetch from `blog_articles` by slug + language, emit Article + FAQPage + Breadcrumb + Speakable JSON-LD, real `<h1>` and visible body text in raw HTML.
- `strategy-detail` — for `/en/strategies/*` and `/es/estrategias/*`, emit Service + FAQPage + Breadcrumb + Speakable, plus an `<h1>` and the speakable answer block in raw HTML so crawlers see content, not just schema.
- `home` — for `/`, `/en/`, `/es/`, emit Organization + WebSite + FAQPage and the visible H1 + hero summary in raw HTML.

Reuse the existing schema-builder helpers in `serve-seo-page/index.ts`. Output the same shape the static QA generator produces (the QA generator's structure is the proven template).

### 2. Update `functions/_middleware.js` to route blog + strategy + homepage to SSR

Currently the middleware:
- Catches `/en/blog/*` but only checks for static file completeness; if incomplete it still passes through to SPA. Fix: when static file is thin, call `serve-seo-page` (already in the code) — but extend `serve-seo-page` to actually return blog HTML (step 1 above).
- Doesn't catch strategy pages or homepage at all. Add the route patterns and the same static-then-SSR fallback.

### 3. Add the three SSR markers so the middleware completeness check passes

The middleware checks for `internal-links-section` substring to decide "static file is complete." Make sure every SSR response from `serve-seo-page` includes:
- `<!DOCTYPE html>`
- A real `<h1>` inside `<body>`
- The `internal-links-section` marker
- All required JSON-LD blocks
- Canonical, hreflang, meta description
- `X-SSR-Schema: injected=true` response header (new — for verification)

### 4. Don't strip Helmet (do NOT ship Prompt 4 from the pack)

Helmet stays. It's the SPA fallback for users navigating client-side between routes after hydration. Removing it would break route changes inside an active session. The duplication concern only matters if Helmet emits the SAME tags the SSR did — and it does today, but browsers/crawlers de-dup `<title>` / `<canonical>` / `<meta>` automatically, and JSON-LD with the same `@id` values are treated as one entity by Google. Leave it.

### 5. Skip Prompt 3 entirely

Routes are registered, content exists, URLs return 200. The audit's "72 dead Q&A URLs" claim is wrong against the live site. No 410 work, no `gone_urls` table changes, no router changes.

## Files that change

- `supabase/functions/serve-seo-page/index.ts` — add `blog-detail`, `strategy-detail`, `home` route handlers and emit `X-SSR-Schema: injected=true`.
- `functions/_middleware.js` — add fallback patterns for `^/(en|es)/strategies/` (and `^/(en|es)/estrategias/`), and for `/`, `/en/`, `/es/`. Keep existing blog + QA handlers.

## Files that don't change

- `src/App.tsx` — routes are already correct.
- React Helmet calls in page components — keep as SPA fallback.
- `vite.config.ts` — SSG plugins stay disabled (build.sh handles static generation).
- `public/_routes.json` — already excludes static assets correctly.
- No DB schema changes.
- No new edge functions.

## How to verify after deploy

```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
for U in "/" "/en/" "/en/strategies/asset-protection" \
         "/en/blog/tax-planning/understanding-three-tax-buckets" \
         "/en/qa/what-process-steps-bridge-the-retirement-gap-using-process-eeb9ac85"; do
  curl -sL -A "$UA" "https://www.everencewealth.com$U" -o /tmp/p -D /tmp/h
  echo "=== $U ==="
  grep -i "x-ssr-schema\|x-seo-source" /tmp/h
  echo "JSONLD=$(grep -c 'application/ld+json' /tmp/p) H1=$(grep -oE '<h1[^>]*>[^<]+</h1>' /tmp/p | head -1)"
done
```

Pass criteria for each URL:
- `X-SSR-Schema: injected=true` header present
- ≥ 2 JSON-LD blocks
- Non-empty `<h1>` in raw HTML
- Unique `<title>` (not "Bridge the Retirement Gap" generic)

## Out of scope

- Helmet removal (intentionally skipped — see step 4).
- `gone_urls` / 410 work (intentionally skipped — see step 5).
- Sitemap regeneration (URLs are valid, no removal needed).
- Any new Pages Function file at `functions/[[path]].js` — the existing `_middleware.js` handles routing fine; adding `[[path]].js` would conflict.
- Any new Cloudflare HTMLRewriter pipeline — the existing edge function approach already returns full HTML.

Reply approve to ship steps 1 and 2.
