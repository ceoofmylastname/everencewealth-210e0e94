

## Fix 46 Soft 404 Errors — Redirects, 404s, and Edge Function Hardening

### Problem
Google Search Console reports 46 Soft 404s because the SPA returns HTTP 200 for URLs where content doesn't exist. Legacy URLs need 301 redirects, and certain paths (costadelsol content, dead categories) need real 404 responses.

### Changes

#### 1. `functions/_middleware.js` — Add redirect map and 404 blocklist

**Add BEFORE the static extensions check (~line 170)**, right after `withMiddlewareStatus` is defined:

**301 Redirect Map** — a simple object mapping old paths to new paths:
- `/financial-planning/three-tax-buckets` -> `/en/blog/tax-planning/understanding-three-tax-buckets`
- `/wealth-strategies/zero-is-your-hero` -> `/en/blog/wealth-management/three-tax-buckets`
- `/indexed-universal-life-insurance/introduction` -> `/en/strategies/iul`
- `/schedule` -> `/en/contact`
- `/financial-needs-assessment` -> `/en/contact`
- `/en/strategies` -> `/en/`
- `/es/strategies` -> `/es/`
- `/en/tax-bucket-guide` -> `/en/blog/tax-planning/understanding-three-tax-buckets`
- `/es/tax-bucket-guide` -> `/es/`
- `/en/calculator` -> `/en/`
- `/es/calculator` -> `/es/`
- `/en/careers` -> `/en/`
- `/es/careers` -> `/es/`
- `/en/contact/fna` -> `/en/contact`
- `/disclosures` -> `/en/`

**Prefix redirect**: Any path starting with `/blog/category/` -> `/en/`

**Logic**: Check `pathname` against the map. If matched, return 301 with `Location: BASE_URL + target`. Check `/blog/category/` prefix separately.

**404 Blocklist** — return real HTTP 404 for:
- Any path matching `/en/blog/costadelsol/` or `/es/blog/costadelsol/` (regex: `^/(en|es)/blog/costadelsol/`)
- `/blog/category/buying property`
- `/blog/category/retirement planning`

**Logic**: Check pathname against blocklist. If matched, return a minimal HTML 404 response with `<meta name="robots" content="noindex">` and HTTP status 404.

These checks go right after the asset/static-file skip blocks and BEFORE the blog SSR fallback section.

#### 2. `functions/_middleware.js` — Fix blog SSR fallback to respect 410/404 from edge function

Currently at lines 249-265, when the SSR edge function returns a non-200 (like 410 for missing content), the middleware logs it but falls through to serve the SPA shell with status 200 (lines 272-284). This is the core Soft 404 problem.

**Fix**: After the SSR response is received, if `ssrResponse.status === 410 || ssrResponse.status === 404`, return that response directly with the same status code instead of falling through to the SPA shell. Same fix needed in the Q&A SSR fallback section (lines 348-369).

Also: when both static and SSR fail and SPA fallback is used for blog/QA paths, return status **404** instead of the original `staticResponse.status` (which is 200).

#### 3. `supabase/functions/serve-seo-page/index.ts` — Already handles missing content

The edge function already returns 410 when `metadata` is null (line 2447-2461). No changes needed here — the fix is in the middleware properly forwarding that 410 instead of swallowing it.

#### 4. `src/pages/BlogArticle.tsx` — Already handles not-found client-side

The React component already throws `"Article not found"` when data is null (line 57), renders a "not found" UI with `<meta name="robots" content="noindex, nofollow">` (lines 193-208). This is a reasonable client-side fallback. No changes needed.

### Summary of file changes
- **`functions/_middleware.js`**: Add redirect map (~15 entries), prefix redirect for `/blog/category/`, 404 blocklist for costadelsol paths, and fix SSR fallback to forward 410/404 status codes instead of falling through to 200 SPA shell.
- No changes to edge function or React components — they already handle missing content correctly.

### Deployment
The middleware deploys automatically with the Cloudflare Pages build. No edge function redeployment needed.

