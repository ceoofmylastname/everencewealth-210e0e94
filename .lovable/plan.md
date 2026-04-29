# Lovable Prompt 26 — P0 Five Fixes (corrected after live recon)

Five P0 fixes shipped together. Plan corrects three architecture mismatches in the prompt before any code is written.

## Architecture corrections (read first)

The audit assumed an SSR edge function with a `hub_cache`-driven content table. That is wrong for the pages in scope. Live recon shows:

1. **Live `/en/about/` HTML carries `data-static="true"`** — it is a pre-baked SSG file produced at build time by `scripts/generateStaticAboutPage.ts`, not the React `About.tsx` and not `serve-seo-page`. The `aboutSchemaGenerator.ts` (already clean) never reaches crawlers. **Real source of fabricated rating + "Spanish Property Market" is `scripts/generateStaticAboutPage.ts` lines 188 and 227.**
2. **`hub_cache` table has a CHECK constraint** restricting `hub_type` to `blog | qa | locations | compare` and is a 10-min TTL CACHE, not a content store. The hub copy lives procedurally in `serve-seo-page/index.ts` `getHubMeta()`. We will NOT add strategies/assessment to `hub_cache`. We use the existing **SSG generator pattern** (`generateStaticStrategyPages.ts`, etc., already invoked by `build.sh`).
3. **`functions/_middleware.js` REDIRECT_MAP currently 301-redirects `/en/strategies` → `/en/`** (lines 416–417). This is why the URL "404s" — it actually redirects to home, then home renders. These two map entries must be **deleted** before adding the index hub. Same for `/es/strategies`.

Other confirmed findings:
- `/:lang/assessment` route is missing in `App.tsx` (only `/assessment` exists at line 297).
- `/en/qa/what-is-iul` has no row in `qa_pages` and no row in `gone_urls`.
- IndexNow key file `public/6ef3ee9b…da93.txt` exists but middleware has zero IndexNow handling, so SPA fallback wins.
- `team_members` table has Steven Rosenberg with clean `specializations` (no Costa del Sol leftover). Confirmed safe.
- No `/sitemaps/static.xml` file exists. The `/assessment` cleanup item in the audit is a no-op.

---

## Fix 1A — `/en/strategies/` and `/es/estrategias/` index hubs (SSG)

Use the same SSG pattern as `generateStaticStrategyPages.ts` (already in `build.sh` line ~57). Bake fully-rendered HTML to `dist/en/strategies/index.html` and `dist/es/estrategias/index.html`.

Files:
- **NEW** `src/pages/strategies/StrategiesIndex.tsx` — bilingual React hub for hydration after SSG load. Reads `lang` from `useParams`, renders 4 strategy cards with internal links + Helmet metadata.
- **NEW** `scripts/generateStaticStrategiesIndex.ts` — Node script that emits 2 baked HTML files with: `<title>`, meta description, canonical, full hreflang cluster (en/es/x-default), JSON-LD `CollectionPage` (with `hasPart` FinancialProduct array, Speakable, BreadcrumbList, Organization @id reference), and ~250-word body covering all 4 strategies + CTA. Use real address from `src/config/business.ts` (455 Market St SF). Hydrates the React component below the SSG body.
- **EDIT** `build.sh` — add a line after `generateStaticStrategyPages.ts`: `npx tsx scripts/generateStaticStrategiesIndex.ts dist`.
- **EDIT** `src/App.tsx` — add lazy import + 4 routes: `/:lang/strategies`, `/:lang/strategies/`, `/:lang/estrategias`, `/:lang/estrategias/` → `<StrategiesIndex />`.
- **EDIT** `functions/_middleware.js`:
  - **REMOVE** `'/en/strategies': '/en/'` and `'/es/strategies': '/es/'` from `REDIRECT_MAP` (lines 416–417). These currently neuter the URL.
  - **ADD** to `STATIC_ROUTE_EXEMPT`: `/en/strategies`, `/en/strategies/`, `/es/strategies`, `/es/strategies/`, `/en/estrategias`, `/en/estrategias/`, `/es/estrategias`, `/es/estrategias/`.

## Fix 1B — `/:lang/assessment` route + SSG intro

The existing `Assessment.tsx` is a 567-line interactive quiz. It needs a lang-aware route + a pre-rendered intro block for crawlers.

Files:
- **EDIT** `src/App.tsx` — keep `/assessment`; add `/:lang/assessment` and `/:lang/assessment/` → `<Assessment />`.
- **NEW** `scripts/generateStaticAssessmentPage.ts` — bake `dist/en/assessment/index.html` and `dist/es/assessment/index.html` with ~120-word intro inside `<main>`, full meta+hreflang+JSON-LD `WebPage` with Speakable. The interactive React quiz hydrates over the intro after JS load (intro stays visible until hydration; that's fine — bots only see SSG output).
- **EDIT** `build.sh` — invoke the new generator after the strategies index.
- **EDIT** `functions/_middleware.js` `STATIC_ROUTE_EXEMPT` — add `/en/assessment`, `/en/assessment/`, `/es/assessment`, `/es/assessment/`.
- The existing `UNPREFIXED_TO_EN` block (line ~440) already redirects `/assessment` → `/en/assessment/`. Leave it.

## Fix 2 — `/en/qa/what-is-iul/` 301

**EDIT** `functions/_middleware.js` `REDIRECT_MAP` — add 6 entries:

```js
'/en/qa/what-is-iul':                       '/en/strategies/iul/',
'/en/qa/what-is-iul/':                      '/en/strategies/iul/',
'/es/qa/what-is-iul':                       '/es/estrategias/seguro-universal-indexado/',
'/es/qa/what-is-iul/':                      '/es/estrategias/seguro-universal-indexado/',
'/es/qa/que-es-iul':                        '/es/estrategias/seguro-universal-indexado/',
'/es/qa/que-es-iul/':                       '/es/estrategias/seguro-universal-indexado/',
```

GSC 404 export classification deferred to Prompt 27 (noted in PR description).

## Fix 4 — Strip fabricated AggregateRating + "Spanish Property Market"

Three real source files (verified by grep on the actual codebase):

1. **`scripts/generateStaticAboutPage.ts`**:
   - Delete `aggregateRating` block at lines 188–193.
   - Replace line 227 `knowsAbout` array with the canonical 9-topic list:
     ```ts
     "knowsAbout": [
       "Indexed Universal Life Insurance",
       "Tax-Free Retirement Income",
       "Roth Conversion Strategies",
       "Sequence of Returns Risk",
       "High-Earner Tax Strategy",
       "Whole Life Insurance",
       "Annuities",
       "Asset Protection Planning",
       "Cash-Value Life Insurance"
     ],
     ```
2. **`src/pages/Contact.tsx`** — delete `aggregateRating` block at lines 51–55.
3. **`src/lib/schemaGenerator.ts`** — delete fabricated `aggregateRating` (line 371) AND fake `review` array with mock names "James Richardson"/"Maria van der Berg" (lines ~380–410). This is in `generateProductSchema`. Verify with `rg -n "generateProductSchema" src/` whether it's still imported anywhere; if dead code, leave it but strip the fakes regardless.

No DB updates needed — `team_members` is clean.

## Fix 5 — IndexNow key file route

The key string is hardcoded at `public/6ef3ee9b142c08d0d1766cbca6419279d3558d720518d27ce752a79fba85da93.txt`. Cloudflare Pages SPA fallback intercepts it.

**EDIT** `functions/_middleware.js` — insert at the very top of the request handler (BEFORE structural-410 patterns, BEFORE REDIRECT_MAP, BEFORE SSR call):

```js
const INDEXNOW_KEY = '6ef3ee9b142c08d0d1766cbca6419279d3558d720518d27ce752a79fba85da93';
if (
  pathname === `/${INDEXNOW_KEY}.txt` ||
  pathname === '/indexnow.txt'
) {
  return new Response(INDEXNOW_KEY, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
```

Verify `INDEXNOW_KEY` secret matches the 64-char string (will check via `secrets--fetch_secrets`; if missing, request via `add_secret` before deploy). `supabase/functions/ping-indexnow/index.ts` already constructs `keyLocation` correctly — no changes there.

Bulk submission via `bun run scripts/indexnowBulkSubmit.ts` runs post-deploy.

---

## Files changed summary

| File | Change |
|---|---|
| `src/pages/strategies/StrategiesIndex.tsx` | NEW — bilingual hub component |
| `scripts/generateStaticStrategiesIndex.ts` | NEW — SSG bake |
| `scripts/generateStaticAssessmentPage.ts` | NEW — SSG bake |
| `scripts/generateStaticAboutPage.ts` | -6 lines aggregateRating, knowsAbout array replaced |
| `src/pages/Contact.tsx` | -5 lines (aggregateRating) |
| `src/lib/schemaGenerator.ts` | strip fabricated aggregateRating + reviews from generateProductSchema |
| `src/App.tsx` | +1 lazy import, +6 route entries |
| `functions/_middleware.js` | +IndexNow handler at top, +6 REDIRECT_MAP entries (what-is-iul), -2 REDIRECT_MAP entries (/en/strategies, /es/strategies), +8 STATIC_ROUTE_EXEMPT entries |
| `build.sh` | +2 generator invocations |

No DB migrations. No edge function changes. No new secrets unless `INDEXNOW_KEY` is missing.

## Post-deploy verification (will paste output)

```bash
# Fix 1A
curl -sL -A "ClaudeBot/1.0" https://www.everencewealth.com/en/strategies/ | python3 -c "import sys,re;h=sys.stdin.read();b=re.search(r'<body[^>]*>(.*?)</body>',h,re.DOTALL);print('words:',len(re.sub(r'<[^>]+>',' ',b.group(1) if b else '').split()))"
curl -sL -A "ClaudeBot/1.0" https://www.everencewealth.com/es/estrategias/ | python3 -c "..."  # same

# Fix 1B
curl -sIL -A "ClaudeBot/1.0" https://www.everencewealth.com/en/assessment/ | grep HTTP/
curl -sL  -A "ClaudeBot/1.0" https://www.everencewealth.com/en/assessment/ | python3 -c "..."  # words > 80

# Fix 2
curl -sIL https://www.everencewealth.com/en/qa/what-is-iul/ | grep -E "HTTP/|location:"

# Fix 4
curl -sL https://www.everencewealth.com/en/about/    | grep -cE "aggregateRating|ratingValue"  # = 0
curl -sL https://www.everencewealth.com/en/contact/  | grep -cE "aggregateRating|ratingValue"  # = 0
curl -sL https://www.everencewealth.com/en/about/    | grep -c "Spanish Property Market"        # = 0

# Fix 5
curl -sI https://www.everencewealth.com/6ef3ee9b142c08d0d1766cbca6419279d3558d720518d27ce752a79fba85da93.txt | grep -iE "HTTP/|content-type"
curl -sX POST https://api.indexnow.org/IndexNow -H "Content-Type: application/json" \
  -d '{"host":"www.everencewealth.com","key":"6ef3...da93","keyLocation":"https://www.everencewealth.com/6ef3...da93.txt","urlList":["https://www.everencewealth.com/en/blog/"]}' \
  -w "\nHTTP %{http_code}\n"
```

## Acceptance criteria

1. `/en/strategies/` body words > 150 to ClaudeBot UA.
2. `/es/estrategias/` body words > 150.
3. `/en/assessment/` 200 + body words > 80 to ClaudeBot UA.
4. `/es/assessment/` same.
5. `/en/qa/what-is-iul/` returns 301 with `Location: /en/strategies/iul/`.
6. `/en/about/` aggregateRating count = 0; `/en/contact/` aggregateRating count = 0; `/en/about/` "Spanish Property Market" count = 0.
7. `/{INDEXNOW_KEY}.txt` returns 200 + `Content-Type: text/plain` + body = key.
8. Test IndexNow POST returns 200 or 202.
9. No regressions on other 200 / 410 / sitemap URLs and the 4 strategy detail pages.

## Out of scope (deferred to follow-up prompts)

GSC 404 export classification (Prompt 27); 100 EN blog slug-vs-content audit; Steven `@id` unification; strategy-page Person/reviewedBy schema; homepage og:image; Contact canonical/OG dedupe; recruiting clusters; glossary entries; inline citation system.
