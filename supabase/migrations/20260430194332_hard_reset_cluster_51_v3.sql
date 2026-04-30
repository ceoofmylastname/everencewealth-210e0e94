-- Hard reset Cluster 51 (f6dd2754-72a4-43cf-a9b2-b19b179db6a7) for v3 retest
-- after Diff: CLAUDE_TIMEOUT_MS 4→8min, max_tokens 16k→12k, watchdog 20→35min.

-- 1. Delete any blog articles / qa pages keyed by either the true cluster UUID
--    or by the prior generation_id (Bug 3 mis-keying coverage).
DELETE FROM public.blog_articles
 WHERE cluster_id = 'f6dd2754-72a4-43cf-a9b2-b19b179db6a7'
    OR cluster_id IN (
      SELECT id FROM public.cluster_generations
       WHERE topic = 'Insurance Career'
         AND created_at > '2026-04-29'::timestamptz
    );

DELETE FROM public.qa_pages
 WHERE cluster_id = 'f6dd2754-72a4-43cf-a9b2-b19b179db6a7'
    OR cluster_id IN (
      SELECT id FROM public.cluster_generations
       WHERE topic = 'Insurance Career'
         AND created_at > '2026-04-29'::timestamptz
    );

-- 2. Delete the failed v3 generation job (63d056f2-...).
DELETE FROM public.cluster_generations
 WHERE id = '63d056f2-6dfa-470b-9717-fb729634bf31';

-- 3. Delete the misleading-completed v3 batch job (c2f7618f-...).
DELETE FROM public.cluster_step_logs
 WHERE batch_job_id = 'c2f7618f-6c1b-40c2-86a0-265cb9f6b19f';

DELETE FROM public.cluster_batch_jobs
 WHERE id = 'c2f7618f-6c1b-40c2-86a0-265cb9f6b19f';

-- 4. Reset progress row.
UPDATE public.cluster_completion_progress
   SET articles_completed     = 0,
       english_articles       = 0,
       translations_completed = 0,
       status                 = 'not_started',
       completed_at           = NULL,
       last_updated           = now()
 WHERE cluster_id = 'f6dd2754-72a4-43cf-a9b2-b19b179db6a7';
