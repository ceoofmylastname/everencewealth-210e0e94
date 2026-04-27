## PROMPT 25 — GSC Page Indexing Remediation (revised with your 3 adjustments)

Plan re-issued with: (1) explicit gone_urls seed list from your inline data, (2) FIX 4 path-prefix filter (Option B), (3) FIX 4 audit-gate pause for row confirmation. FIX 8 deferred to Wave 3. IndexNow ping confirmed for after Wave 2.

---

## Wave 1 — auto-ship

### FIX 1 — gone_urls catchall coverage

**Regex pre-filter** added inside the existing PROMPT 17 catchall block (`functions/_middleware.js` ~line 533, before the DB lookup). Short-circuits to 410 for structural patterns:

- `/^\/(en|es)\/property\/R\d+\/?$/i`
- `/^\/(en|es)\/properties(\/|\?|$)/i`
- `/^\/(en|es)\/retirement-planning\/.+/i`
- `/^\/en\/blog\/(insurance-management|insurance-strategies|investment-strategies|investment|wealth-management|tax-planning|retirement-planning|retirement|financial-planning)\/.+/i`
- `/^\/en\/blog\/costadelsol\/.+/i`
- `/^\/blog\/category\//i`
- `/^\/(en\/|es\/)?\?transactionType=/i` (matched against pathname + search)

**Seed `gone_urls` rows** via insert tool (reason='costa_del_sol_legacy' / 'old_blog_hierarchy'):

Property R-IDs (7): R5295292, R5253436, R5183233, R5298961, R4568725, R5147944, R4862224 (regex pre-filter handles these too — seed for belt-and-suspenders).

Specific location pages (10): the exact `/es/locations/...` and `/en/locations/nevada/...` and `/en|es/retirement-planning/...` slugs you provided.

Costa del Sol blog leftovers (5): the 5 `/en/blog/costadelsol/...` slugs (regex covers, seed for safety).

Old blog hierarchy (~22): all the specific `/en/blog/{insurance-management,...}/...` slugs (regex covers, seed for safety).

### FIX 2 — REDIRECT_MAP reconciliation
Update existing `REDIRECT_MAP` (lines 361–377) to point to the targets specified in the prompt — currently several entries point to `/en/` instead. Verify each target returns 200 via live curl before mapping. Update:

- `/disclosures` → `/en/disclosures/` (verify; fall back to `/en/about/`)
- `/financial-needs-assessment` → `/en/assessment/`
- `/schedule` → `/en/contact/`
- `/financial-planning/three-tax-buckets` → `/en/strategies/tax-free-retirement/`
- `/indexed-universal-life-insurance/introduction` → `/en/strategies/iul/` (already correct)
- `/wealth-strategies/zero-is-your-hero` → `/en/strategies/tax-free-retirement/`
- Add `/philosophy` → `/en/philosophy/` (verify; fall back to `/en/about/`)

### FIX 6 — SearchAction schema (diagnostic-first)
Run live curl: `curl -sL https://www.everencewealth.com/ | grep -c "{search_term_string}"`. If count == 1 (only inside `urlTemplate`), no code change — Google has cached the bad URL and will revalidate. If > 1, locate duplicate emission and remove. Same diagnostic for `/en/glossary/`.

### FIX 9 — /en/contact canonical (verify-first)
Source declares the correct canonical. Live curl to confirm. If the prerendered HTML at `dist/en/contact/index.html` is stale, re-run the static generator. No source change unless live differs from source.

### FIX 10 — /en/locations noindex
Verify intent only. Add `Disallow: /en/locations` and `Disallow: /es/locations` to `public/robots.txt` to save crawl budget.

---

## Wave 1 verification block (paste results)
```
curl -sI https://www.everencewealth.com/es/property/R5295292               # expect 410
curl -sI https://www.everencewealth.com/en/blog/costadelsol/best-neighborhoods  # expect 410
curl -sI https://www.everencewealth.com/en/blog/insurance-management/whole-life-benefits  # expect 410
curl -sIL https://www.everencewealth.com/disclosures                        # expect 301 → /en/disclosures/ → 200
curl -sIL https://www.everencewealth.com/philosophy                         # expect 301 → /en/philosophy/ → 200
curl -sL  https://www.everencewealth.com/ | grep -c "{search_term_string}"  # expect 1
curl -sL  https://www.everencewealth.com/en/contact/ | grep canonical       # expect /en/contact/
```

---

## Wave 2 — auto-ship after Wave 1 verification passes

### FIX 3 — Slug suffix dedup
- Migration `20260428000001_slug_dedup_es_blog.sql`: add `redirect_to_id` column + index.
- Data ops: enumerate `language='es' AND slug ~ '-\d+-[a-z0-9]{4}$'` rows, classify into 3 cases, archive duplicates with `redirect_to_id` set.
- Middleware: narrow regex match for `/es/blog/<slug-N-XXXX>/` triggers DB lookup (only on suffixed paths, not all blog paths).
- Slug generator fix in `supabase/functions/translate-cluster/index.ts:386` — Option B (deterministic `${slug}-${cluster_number}` only on collision).

### FIX 4 — Language-mismatch redirects (PAUSE FOR CONFIRMATION)
- Migration `20260428000002_url_redirects.sql`: new table + RLS + admin write policy.
- Migration `20260428000003_language_consistency.sql`: blog_articles language CHECK.

**Audit gate:** Run heuristic SELECT and paste row list in chat. Compare against your expected ~14 articles (6 ES under /en/ + 7 EN under /es/). **DO NOT proceed with UPDATEs or url_redirects INSERTs until you confirm the row set matches.**

If confirmed → flip `language` column, generate new slugs, INSERT into `url_redirects`.

If row set differs substantially → pause and report. Could indicate routing-layer bug instead of data bug.

**Middleware url_redirects lookup with path-prefix filter (Option B):**
```js
// Only check url_redirects on blog/qa/guides paths — the only routes with mismatch redirects
if (/^\/(en|es)\/(blog|qa|guides)\//.test(pathname)) {
  const { data: r } = await supabase.from('url_redirects')
    .select('target_path,status_code').eq('source_path', pathname).maybeSingle();
  if (r) return Response.redirect(`${url.origin}${r.target_path}`, r.status_code);
}
```

---

## Wave 2 verification block
```
-- Should return 0 rows
SELECT COUNT(*) FROM blog_articles WHERE language='es' AND slug ~ '-\d+-[a-z0-9]{4}$' AND status='published';

# Spot-check a known suffixed slug
curl -sIL "https://www.everencewealth.com/es/blog/principales-desafios-...-2-8x7e/"
# Expect: 301 → canonical slug

# Spot-check a known mismatched URL
curl -sIL "https://www.everencewealth.com/en/blog/la-brecha-en-el-ahorro-...-1-sw5q"
# Expect: 301 → /es/blog/<new-slug>/
```

---

## IndexNow ping (after Wave 2 verification)

Compile URL list:
- Costa del Sol property URLs (7)
- Costa del Sol location URLs (10)
- Costa del Sol blog URLs (5)
- Old blog hierarchy URLs (~22)
- Suffixed ES blog URLs (from FIX 3 audit)
- Mismatched language URLs (from FIX 4 audit, both old and new)
- BOFU money pages (6, for FIX 7 even though no fix yet — refresh signal)
- Thin pages (17, for FIX 8 — refresh signal)
- /en/glossary, /en/contact, /en/locations (FIX 6/9/10)

Total ~127 URLs. POST to `https://www.everencewealth.com/api/indexnow` (PROMPT 15 endpoint).

---

## Wave 3 — HARD STOP, diagnostic report only

After IndexNow ping, write report covering:
- **FIX 7:** comparison of working `/en/strategies/asset-protection` vs 6 not-indexing money pages (word count, schema, canonical, hreflang, internal link count, title, meta description).
- **FIX 5:** `/es/*` SSR diagnostic for 7 primary pages (HTML byte size, H1 presence, schema count) cross-referenced with `scripts/generateStatic*` coverage.
- **FIX 8:** for each of 17 thin pages, current behavior (REDIRECT_MAP entry, prerender, route definition) + proposed POPULATE/301/410 with reasoning.

Wait for user approval before any FIX 5/7/8 implementation.

---

## Files touched (Waves 1+2 only)

**Edited:**
- `functions/_middleware.js` — FIX 1 regex pre-filter, FIX 2 REDIRECT_MAP update, FIX 3 slug suffix lookup, FIX 4 path-prefix-filtered url_redirects lookup
- `public/robots.txt` — FIX 10 Disallow rules
- `supabase/functions/translate-cluster/index.ts:386` — FIX 3 collision-aware slug
- (Conditional) `src/lib/glossarySchemaGenerator.ts` or homepage WebSite schema source — only if FIX 6 diagnostic finds a real bug
- (Conditional) static-page generator for /en/contact — only if FIX 9 live-vs-source mismatch

**New migrations:**
- `20260428000001_slug_dedup_es_blog.sql`
- `20260428000002_url_redirects.sql`
- `20260428000003_language_consistency.sql`

**Data ops via insert tool:** gone_urls seed (Wave 1); blog_articles archive/redirect_to_id + url_redirects INSERTs (Wave 2, after audit gate confirmed).

**Untouched:** generate-cluster, generate-cluster-chunk, build-cluster-step, tick-cluster-batches, bulk-build-clusters; existing migrations; OptimizedImage.tsx; editorialImagePrompt.ts; injectSeoTags HTMLRewriter; static-asset bypass; comma-strip 301; PROMPT 17 catchall logic (extending only); BUSINESS config.

---

## Hard stops

- After Wave 1: paste curl verification, wait briefly for any user objection then proceed to Wave 2.
- During Wave 2: **PAUSE after FIX 4 audit SELECT** — paste rows, wait for explicit user confirmation before any UPDATE/INSERT.
- After IndexNow ping: **HARD STOP**, write Wave 3 diagnostic report, wait for approval.