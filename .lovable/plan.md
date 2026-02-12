

# Backfill Internal Links — Phased Approach

## Current State
- **Blog articles**: 3,271 published, all have `cluster_id`, only 518 have `internal_links` populated
- **Q&A pages**: 9,600 published, all have `source_article_id`, zero have `internal_links`

## Key Discovery
The existing `regenerate-all-cluster-links` edge function already implements your full TOFU/MOFU/BOFU funnel linking strategy for blog articles. It groups articles by cluster + language and generates up to 3 strategic links per article. **We just need to run it.**

---

## Phase 1: Test Blog Backfill (10 articles)

Run the existing function in **dry-run mode** first to verify output, then run it with a small batch to confirm database writes.

1. Call `regenerate-all-cluster-links` with `{ "dryRun": true, "batchSize": 10 }` to preview results
2. Verify the summary shows correct funnel stage distribution
3. Call it again with `{ "dryRun": false, "batchSize": 10 }` to apply a small batch
4. Query 10 updated articles to inspect the generated links

**No code changes needed** — the function already exists and is deployed.

## Phase 2: Full Blog Backfill (all 3,271 articles)

Run the same function at scale:
- Call with `{ "dryRun": false, "batchSize": 50 }`
- This processes all clusters and all languages in one pass
- Built-in 100ms delay between batches prevents rate limiting
- Expected result: ~3,271 articles updated with 2-3 links each

## Phase 3: Q&A Page Backfill (9,600 pages)

Create a **new** edge function `backfill-qa-internal-links` that:

1. Fetches all published Q&A pages with their `source_article_id` and `language`
2. For each Q&A page, looks up the source blog article's `cluster_id`
3. Finds sibling blog articles in the same cluster + language
4. Generates 2-3 links per Q&A page:
   - 1 link back to the source blog article (context)
   - 1-2 links to related cluster articles (funnel progression)
5. Updates Q&A pages in batches of 50

### Q&A Linking Strategy
- Link back to the parent blog article (always — provides context)
- Link to 1-2 other blog articles in the same cluster/language (funnel progression)
- Max 3 links per Q&A page
- URL format: `/{language}/blog/{slug}` for blog targets

## Phase 4: Verification

After each phase, spot-check by:
1. Querying 20 random updated articles across languages
2. Calling the `serve-seo-page` edge function to confirm links appear in raw HTML
3. Monitoring Google Search Console for crawl rate changes

---

## Technical Details

### Files to Create
- `supabase/functions/backfill-qa-internal-links/index.ts` — New function for Q&A pages

### Files Unchanged
- `supabase/functions/regenerate-all-cluster-links/index.ts` — Already handles all blog articles correctly

### Execution Order
1. Run existing blog function (dry run) — verify output
2. Run existing blog function (live) — backfill 3,271 blog articles
3. Deploy new QA function — backfill 9,600 QA pages
4. Spot-check SSR rendering across languages

### Q&A Function Schema
```text
Input:  { batchSize?: number, dryRun?: boolean, limit?: number }
Output: { success: true, summary: { total, updated, byLanguage, errors } }
```

The QA function will use the same batch-and-delay pattern as the existing blog function for reliability.
