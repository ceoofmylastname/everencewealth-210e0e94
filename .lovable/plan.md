# Verification Results + Combined Audit Steps 1-3 + PROMPT 25 Wave 2

## Verification 1: "San Francisco" source location

**Single source of truth:** `src/config/business.ts`

| Line | Field | Current Value |
|------|-------|---------------|
| 64-65 | `description` | "Independent wealth architects… Serving clients in **San Francisco** and nationwide." |
| 73 | `streetAddress` | "455 Market St Ste 1940 PMB 350011" |
| 74 | `addressLocality` | "San Francisco" |
| 76 | `postalCode` | "94105" |
| 81 | `addressFormatted` | "455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105" |

`COMPANY_ADDRESS` in `src/constants/company.ts` re-exports BUSINESS, so editing `business.ts` propagates everywhere (Home schema, footer, all JSON-LD). Zero hardcoded "San Francisco" elsewhere in `src/`.

**Also relevant:** `src/constants/company.ts` line 32 contains a hardcoded Google Maps embed URL pinning `455+Market+St` — needs swap.

**Question for you:** What address replaces it? Per memory the target is "Pleasanton" but no street/zip is in the codebase. Options:
1. Pleasanton CA mailing address (you provide street + zip)
2. Drop street entirely → schema uses only `addressLocality: "Pleasanton"`, `addressRegion: "CA"`, `addressCountry: "US"` (valid PostalAddress, looser local-SEO signal)
3. Keep address private; use only `areaServed: "US"` and remove PostalAddress block

---

## Verification 2: locations.xml contents — NOT Costa del Sol legacy

Both files contain real US wealth-strategy URLs. NOT safe to delete wholesale.

**EN: 35 URLs** — all `/en/locations/{city|state}/{strategy}` covering: LA, Seattle, NYC, Pennsylvania, San Diego, Ohio, Michigan, NC, San Francisco, Houston, Phoenix, Philadelphia, San Antonio, Charlotte, California, Austin, Indianapolis, Denver, DC, Boston, Georgia, Dallas, Florida, Arizona, Jacksonville, Columbus, Texas, NYC, Miami, Nevada, Colorado, Chicago, Indiana, Illinois.

**ES: 21 URLs** — Spanish counterparts of subset above.

**Conflict diagnosis:** robots.txt `Disallow: /en/locations` blocks ALL of these. Either the Disallow is wrong, or the sitemap is wrong. Per `mem://project/cleanup-legacy-purge` "locations" was supposedly purged, but the URLs above are clearly current US strategy hubs.

**Question for you (pick one):**
1. **Keep locations live** → remove Disallow lines from robots.txt; keep sitemap; verify pages render (likely fix is just removing Disallow). Best for SEO.
2. **Kill locations entirely** → delete both XMLs + sitemap-index entries + the `/en/locations/*` route + DB rows (whatever is rendering them). Aligns with purge memory but sacrifices 56 indexed pages.
3. **Selective:** keep state-level pages (CA, FL, TX…), drop city-level. Need DB review of `locations` table to do this cleanly.

---

## Verification 3: AEO truncation samples (5 random Q&As, before → after)

All 5 samples below: original 850-918 chars / 107-133 words. All truncated cleanly at sentence boundary, no ellipsis fallback used, all end on `.`. Coherence preserved (each truncation drops only the final summary sentence, retains the substance).

| ID | Lang | Before | After | Loss |
|----|------|--------|-------|------|
| 0ddba9fc | es | 891c/133w | 757c/111w | Drops final summary sentence about plan validity |
| 34337643 | es | 871c/128w | 665c/98w | Drops "over-reliance on single tool" closer |
| 44a18652 | es | 850c/119w | 493c/69w | Drops final allocation sentence (most aggressive cut) |
| 79aadacf | en | 850c/107w | 743c/94w | Drops "comprehensive compliance" closer |
| 9d20c212 | es | 918c/132w | 717c/105w | Drops "proactively manage" closer |

Full text in this thread above. Sample `44a18652` is the worst case: 357 chars dropped because the answer's only sentence boundaries were front-loaded. Still ends mid-thought-but-grammatical. **Recommendation:** pair the truncation pass with an AI-rewrite for any answer where post-truncation length < 500c (regenerate at 80-120w using Lovable AI). I'll bake this into the script.

---

## Cluster Batch Jobs Status (smoke test recovery)

Latest job:
```
id:            9e9eed7b-5cff-4401-9676-e826f9aba220
status:        completed
mode:          live
current_index: 10 / 10
build_count:   4
skip_count:    6
fail_count:    0
current_topic: (empty — completed)
started:       2026-04-27 05:04:53 UTC
completed:     2026-04-27 07:15:01 UTC
triggered_by:  431e15bd-… (you)
```

That run finished 4 builds / 6 skips. **Roth Conversion 2/6 status is NOT visible in this row** — no in-flight job exists. Either the prior run already completed silently (the 4 builds may be the Roth set), or the smoke test was on a different `cluster_topic`/manifest path. Need to query `cluster_step_logs` for that job ID to confirm — will include in next pass. No data lost; resuming requires a new triggered run.

---

## Combined Ship Plan: Audit Steps 1-3 + PROMPT 25 Wave 2

### Files to edit (no overlap between audit + wave 2)

**Audit Steps 1-3:**
- `src/config/business.ts` — line 64-65 description, lines 73/74/76/81 address (pending your Q1 answer)
- `src/constants/company.ts` — line 32 Google Maps embed URL
- `src/pages/Home.tsx` — canonical → `/en/`, og:url → `/en/`, hreflang triplet
- `public/_redirects` — `/  /en/  301` (single hop)
- `public/robots.txt` — depending on Q2 answer
- `public/sitemap-index.xml`, `public/sitemap.xml` — sync depending on Q2
- `public/sitemaps/en/glossary.xml`, `public/sitemaps/es/glossary.xml` — delete (empty, no content backing)
- `public/llms.txt`, `public/llm.txt`, `public/llms-full.txt`, `public/ai-sitemap.xml` — remove glossary refs; locations refs depend on Q2
- `public/.well-known/ai-plugin.json` — remove broken `api.url` block

**Wave 2:**
- Migration: slug-suffix dedup (move `-en/-es/-nl/-sv` slugs to canonical via `url_redirects` table)
- Migration: create `url_redirects` table (from + to + status_code + created_at)
- Migration: language mismatch cleanup (rows where `language` ≠ slug language marker)
- `functions/_middleware.js` — read `url_redirects` for 301s; ensure no double-hop on root

### Database operations
- `qa_pages`: invoke existing `fix-aeo-compliance` edge function with `{dryRun: false, contentType: "qa"}` — it already handles 211 violations using the exact logic verified above
- Same function with `contentType: "blog"` and `contentType: "comparison"` for completeness
- `blog_articles.canonical_url` backfill (30 rows): SQL UPDATE
- `blog_articles.meta_description` backfill (14 rows): one-shot Deno script using Lovable AI

### Verification curls (post-deploy)
```text
curl -sI https://www.everencewealth.com/                     # expect 301 → /en/
curl -sI https://www.everencewealth.com/en                   # expect 308 or 200 (no chain)
curl -sL https://www.everencewealth.com/ | grep -c "San Francisco"   # expect 0
curl -sL https://www.everencewealth.com/en/ | grep -E "canonical|og:url"   # expect /en/
curl -sI https://www.everencewealth.com/sitemap-index.xml    # 200
curl -s  https://www.everencewealth.com/llms.txt | grep -c "glossary"    # expect 0
curl -s  https://www.everencewealth.com/sitemaps/en/glossary.xml         # expect 404
psql -c "SELECT count(*) FROM qa_pages WHERE length(speakable_answer) > 800;"   # expect 0
psql -c "SELECT count(*) FROM blog_articles WHERE is_published AND canonical_url IS NULL;"   # expect 0
```

---

## Two answers I need before shipping

1. **Replacement address?** (option 1, 2, or 3 from Verification 1 above)
2. **Locations sitemap fate?** (option 1, 2, or 3 from Verification 2 above)

Reply with two numbers (e.g. "Q1=2, Q2=1") and I'll execute the combined ship in one build pass. Person-schema enrichment (Step 4) still parked until you provide headshots + sameAs URLs.
