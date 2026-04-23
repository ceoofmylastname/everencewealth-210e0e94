

## Why 0 Q&As were created

The edge function ran successfully and Gemini generated all 4 Q&As, but **every database insert was rejected** with the same error:

```
null value in column "featured_image_url" of relation "qa_pages"
violates not-null constraint
```

### Root cause
`qa_pages.featured_image_url` is defined as `NOT NULL` in the database. The edge function `generate-english-article-qas` copies `featured_image_url` straight from the source article:

```ts
featured_image_url: article.featured_image_url,
featured_image_alt: article.featured_image_alt,
```

The source article (`The Retirement Savings Gap…`, id `0655c0e6…`) has **no featured image set** — its `featured_image_url` is `NULL` in the database. So the insert sends `NULL` into a `NOT NULL` column and Postgres rejects it. This happens for all 4 Q&A types (pitfalls, costs, process, legal), which is exactly why the toast says "0 of 4 created."

This affects every article in the cluster that doesn't have a featured image, not just this one.

## Fix

Two changes, applied together:

### 1. Edge function: provide a safe fallback
In `supabase/functions/generate-english-article-qas/index.ts`, when building `qaRecord`, fall back to a placeholder if the article has no image:

```ts
featured_image_url: article.featured_image_url
  || 'https://www.everencewealth.com/og-image.png',
featured_image_alt: article.featured_image_alt
  || `${qaContent.question} – Everence Wealth`,
```

This unblocks Q&A generation immediately for all articles, regardless of whether their featured image has been set yet.

### 2. Database: relax the constraint so this can never silently break again
Run a migration to make these columns nullable (Q&A pages can legitimately exist without a featured image — the page renderer already handles missing images):

```sql
ALTER TABLE public.qa_pages
  ALTER COLUMN featured_image_url DROP NOT NULL,
  ALTER COLUMN featured_image_alt DROP NOT NULL;
```

This is the durable fix. The edge function fallback is the immediate fix.

## After the fix
- Click "Generate 4 Q&As" on Article 1 again → all 4 inserts succeed.
- Optional follow-up (not part of this fix): a small bulk script to populate `featured_image_url` on the 6 cluster articles that are missing one, so the Q&As inherit a real image instead of the OG fallback.

## Files changed
- `supabase/functions/generate-english-article-qas/index.ts` (fallback values)
- New migration: drop NOT NULL on `qa_pages.featured_image_url` and `featured_image_alt`

## Out of scope
- No prompt changes, no model changes, no UI changes.
- Translation pipeline (`translate-cluster`) is unaffected — it copies the same fields from the English Q&A, which will now always have a value.

