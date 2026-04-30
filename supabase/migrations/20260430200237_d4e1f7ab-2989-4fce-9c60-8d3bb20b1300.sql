-- Hard reset Cluster 51 (f6dd2754-72a4-43cf-a9b2-b19b179db6a7) for v4 retest.
-- Covers v1 (450b3a2d), v2 (63d056f2 / c2f7618f / 02c64b31 lineage),
-- and v3 (698dddd7 / 76a10272 + mis-keyed article 32e15601) leftovers.
-- Order matters: child rows first, then parents.

-- 1a. Delete blog_articles keyed by the true cluster UUID OR by any
--     v1/v2/v3 generation_id (Bug 3 mis-keying coverage).
DELETE FROM public.blog_articles
 WHERE cluster_id IN (
   'f6dd2754-72a4-43cf-a9b2-b19b179db6a7',
   '450b3a2d-0661-4fbe-ae70-577df6e83f3b',
   '63d056f2-6dfa-470b-9717-fb729634bf31',
   '698dddd7-d942-45e9-92fd-9cd75015e79b'
 );

-- 1b. Same for qa_pages (defensive; current count = 0).
DELETE FROM public.qa_pages
 WHERE cluster_id IN (
   'f6dd2754-72a4-43cf-a9b2-b19b179db6a7',
   '450b3a2d-0661-4fbe-ae70-577df6e83f3b',
   '63d056f2-6dfa-470b-9717-fb729634bf31',
   '698dddd7-d942-45e9-92fd-9cd75015e79b'
 );

-- 1c. Belt-and-suspenders catch-all by topic+date.
DELETE FROM public.blog_articles
 WHERE cluster_id IN (
   SELECT id FROM public.cluster_generations
    WHERE topic = 'Insurance Career'
      AND created_at > '2026-04-29'::timestamptz
 );

DELETE FROM public.qa_pages
 WHERE cluster_id IN (
   SELECT id FROM public.cluster_generations
    WHERE topic = 'Insurance Career'
      AND created_at > '2026-04-29'::timestamptz
 );

-- 2. Delete cluster_article_chunks for any v1/v2/v3 generation.
DELETE FROM public.cluster_article_chunks
 WHERE parent_job_id IN (
   '450b3a2d-0661-4fbe-ae70-577df6e83f3b',
   '63d056f2-6dfa-470b-9717-fb729634bf31',
   '698dddd7-d942-45e9-92fd-9cd75015e79b'
 );

-- 3. Delete failed/killed generation rows (v1, v2, v3).
DELETE FROM public.cluster_generations
 WHERE id IN (
   '450b3a2d-0661-4fbe-ae70-577df6e83f3b',
   '63d056f2-6dfa-470b-9717-fb729634bf31',
   '698dddd7-d942-45e9-92fd-9cd75015e79b'
 );

-- 4. Delete batch step logs, then batch jobs (v2 + v3).
DELETE FROM public.cluster_step_logs
 WHERE batch_job_id IN (
   'c2f7618f-6c1b-40c2-86a0-265cb9f6b19f',
   '76a10272-66f9-41ae-b78c-46fd5dac2ba1'
 );

DELETE FROM public.cluster_batch_jobs
 WHERE id IN (
   'c2f7618f-6c1b-40c2-86a0-265cb9f6b19f',
   '76a10272-66f9-41ae-b78c-46fd5dac2ba1'
 );

-- 5. Reset Cluster 51 progress row to clean baseline.
UPDATE public.cluster_completion_progress
   SET articles_completed     = 0,
       english_articles       = 0,
       translations_completed = 0,
       status                 = 'not_started',
       completed_at           = NULL,
       started_at             = NULL,
       error_count            = 0,
       last_updated           = now()
 WHERE cluster_id = 'f6dd2754-72a4-43cf-a9b2-b19b179db6a7';