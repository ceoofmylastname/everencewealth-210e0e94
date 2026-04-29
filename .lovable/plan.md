# Fix cluster_completion_progress sync bug

## Problem

`cluster_completion_progress` is a static tracker — nothing updates it when content lands in `blog_articles` or `qa_pages`. Live data confirms the bug: tracker reports **36/660** completed across 11 clusters, while the actual tables hold **12 rows per cluster** (6 EN blogs + 6 ES blogs, with QA still pending). Dashboard reads from the tracker, so every cluster appears stuck at 0.

There are currently **no triggers** on `blog_articles` or `qa_pages` writing to the tracker. An orphan `update_cluster_progress()` function exists but is unused (and references columns that don't exist on these tables), so it can be ignored.

## Fix

Single migration that installs one shared trigger function and attaches it to both content tables, then backfills existing rows in the same migration.

### Migration file
`supabase/migrations/<TIMESTAMP>_cluster_progress_sync_trigger.sql`

### Step 1 — `sync_cluster_progress()` function
- `SECURITY DEFINER`, `search_path = public`.
- Resolves `target_cluster_id := COALESCE(NEW.cluster_id, OLD.cluster_id)`; exits early if NULL.
- Recomputes from source of truth:
  - `en_blogs`, `es_blogs` from `blog_articles` filtered by `cluster_id`.
  - `en_qas`, `es_qas` from `qa_pages` filtered by `cluster_id`.
  - `total_count = en_blogs + es_blogs + en_qas + es_qas`.
- Reads `total_articles_needed` for the cluster (defaults to 60 if missing).
- `UPDATE cluster_completion_progress` setting:
  - `english_articles = en_blogs`
  - `translations_completed = es_blogs`
  - `articles_completed = total_count`
  - `status` = `'complete' | 'in_progress' | 'not_started'` per spec
  - `completed_at` set to `now()` on first crossover, cleared if it drops back below the threshold
  - `last_updated = now()`
- Returns `COALESCE(NEW, OLD)`.

Note: the spec uses `status='complete'` (not the `'completed'` value seen in the existing orphan function). Following the spec exactly so the dashboard contract stays as the user wrote it.

### Step 2 — Triggers
```sql
CREATE TRIGGER sync_cluster_progress_blog_articles
  AFTER INSERT OR UPDATE OF cluster_id, language OR DELETE
  ON blog_articles
  FOR EACH ROW EXECUTE FUNCTION sync_cluster_progress();

CREATE TRIGGER sync_cluster_progress_qa_pages
  AFTER INSERT OR UPDATE OF cluster_id, language OR DELETE
  ON qa_pages
  FOR EACH ROW EXECUTE FUNCTION sync_cluster_progress();
```
These fire only on the columns that affect counts, so normal content edits (headline, body, status) won't thrash the tracker.

### Step 3 — One-time backfill (in the same migration)
After the function is defined, reconcile every existing tracker row from current table contents:

```sql
WITH counts AS (
  SELECT
    ccp.cluster_id,
    COUNT(*) FILTER (WHERE ba.language = 'en') AS en_blogs,
    COUNT(*) FILTER (WHERE ba.language = 'es') AS es_blogs
  FROM cluster_completion_progress ccp
  LEFT JOIN blog_articles ba ON ba.cluster_id = ccp.cluster_id
  GROUP BY ccp.cluster_id
),
qa_counts AS (
  SELECT
    ccp.cluster_id,
    COUNT(*) FILTER (WHERE qp.language = 'en') AS en_qas,
    COUNT(*) FILTER (WHERE qp.language = 'es') AS es_qas
  FROM cluster_completion_progress ccp
  LEFT JOIN qa_pages qp ON qp.cluster_id = ccp.cluster_id
  GROUP BY ccp.cluster_id
)
UPDATE cluster_completion_progress ccp
SET
  english_articles       = c.en_blogs,
  translations_completed = c.es_blogs,
  articles_completed     = c.en_blogs + c.es_blogs + q.en_qas + q.es_qas,
  status = CASE
    WHEN (c.en_blogs + c.es_blogs + q.en_qas + q.es_qas) >= COALESCE(ccp.total_articles_needed, 60) THEN 'complete'
    WHEN (c.en_blogs + c.es_blogs + q.en_qas + q.es_qas) > 0 THEN 'in_progress'
    ELSE 'not_started'
  END,
  completed_at = CASE
    WHEN (c.en_blogs + c.es_blogs + q.en_qas + q.es_qas) >= COALESCE(ccp.total_articles_needed, 60)
      AND ccp.completed_at IS NULL THEN now()
    WHEN (c.en_blogs + c.es_blogs + q.en_qas + q.es_qas) <  COALESCE(ccp.total_articles_needed, 60)
      THEN NULL
    ELSE ccp.completed_at
  END,
  last_updated = now()
FROM counts c
JOIN qa_counts q ON q.cluster_id = c.cluster_id
WHERE ccp.cluster_id = c.cluster_id;
```

## Verification (after deploy)

1. Query `cluster_completion_progress` — every cluster with 12 blog rows should now show `english_articles=6`, `translations_completed=6`, `articles_completed=12`, `status='in_progress'`.
2. Insert a throwaway blog row pointing at any existing `cluster_id`; counters bump by 1. Delete it; counters drop back. Then refresh `/cluster-dashboard`.

## Files touched
- New: `supabase/migrations/<TIMESTAMP>_cluster_progress_sync_trigger.sql` (function + 2 triggers + backfill UPDATE)

No application code changes required — dashboard already reads from `cluster_completion_progress`.
