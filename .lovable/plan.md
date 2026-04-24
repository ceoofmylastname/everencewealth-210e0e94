

# SSR Schema + Route Fix — Status check and remaining work

The corrected scope at the bottom of your prompt pack (Step 1 + Step 2) was **already implemented and shipped earlier today** in the prior approved plan. Specifically:

- `supabase/functions/serve-seo-page/index.ts` — `blog-detail`, `strategy-detail`, and `home` route handlers were added, all emitting the `internal-links-section` marker and `X-SSR-Schema: injected=true` header.
- `functions/_middleware.js` — fallback patterns for `^/(en|es)/(strategies|estrategias)/...` and for `/`, `/en/`, `/es/` were added, reusing the static-then-SSR fallback pattern.

So Steps 1 and 2 from the "Corrected Scope (2026-04-23)" section don't need to be re-shipped. What remains is **Prompt 5 — Verification** to confirm the deploy actually behaves the way we intended in production.

## What I'll do

Run the verification table from the corrected scope against the live site (`https://www.everencewealth.com`) using a normal browser UA AND `ClaudeBot/1.0`, then report the gap (if any).

### URLs to verify

1. `/` (and `/en/`)
2. `/en/qa` (index)
3. `/en/qa/what-process-steps-bridge-the-retirement-gap-using-process-eeb9ac85` (real slug)
4. `/en/blog` (index)
5. `/en/blog/tax-planning/understanding-three-tax-buckets` (no trailing slash — the previously broken case)
6. `/en/strategies/asset-protection`
7. `/en/strategies/iul`
8. `/es/` (Spanish home)
9. A real `/es/qa/{slug}` and `/es/estrategias/{slug}` pulled from sitemaps

### What I'll extract per URL

- HTTP status
- `X-SSR-Schema` and `X-Seo-Source` headers
- Count of `<script type="application/ld+json">` blocks
- `@type` values of each JSON-LD block
- Whether `<h1>` exists and is non-empty
- `<title>` value (must NOT be the generic "Bridge the Retirement Gap")
- `<link rel="canonical">` href (must self-reference)
- `<meta name="description">` content (must be unique)
- Whether `datePublished` and `dateModified` appear in JSON-LD for article-type pages
- All `<link rel="alternate" hreflang="...">` tags

### Plus three infrastructure checks

- `/robots.txt` — confirm no `Disallow: /` for ClaudeBot, GPTBot, PerplexityBot, Google-Extended, Applebot-Extended
- `/llms.txt` — confirm `Content-Type: text/plain` and that BOFU strategies are listed
- `/sitemap.xml` and the 11 sub-sitemaps — confirm `Content-Type: application/xml` and valid XML (not SPA shell HTML)

### Output

A single results table with a Pass/Fail column per URL. Pass = `X-SSR-Schema: injected=true`, ≥ 2 JSON-LD blocks, non-empty `<h1>`, unique `<title>`. Any Fail row gets a one-line root cause and a one-line proposed fix.

## What I won't do

- No code changes in this run — verification only, per Prompt 5's "Do not change any code" rule.
- No Helmet removal (Prompt 4 stays out of scope, as the corrected pack confirms).
- No 410 / `gone_urls` work (Prompt 3 stays out of scope).
- No `functions/[[path]].js` or HTMLRewriter pipeline (would conflict with existing `_middleware.js`).

## After the verification

If everything passes, you're cleared to resume the 50-cluster build plan. If any row fails, I'll come back with a focused fix plan for that specific failure mode (most likely candidates: blog SSR fetch returning empty for a particular slug, strategy page missing one of the four allowed slugs, or homepage middleware not catching the bare `/` correctly).

Reply approve to run the verification table.

