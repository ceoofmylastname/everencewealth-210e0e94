-- Hard-reset Cluster 51 test environment (PROMPT 28 v3 retry)
DELETE FROM public.blog_articles
  WHERE cluster_id IN (
    'f6dd2754-72a4-43cf-a9b2-b19b179db6a7',
    '02c64b31-b0bc-4368-94cf-c1facbcdabaa'
  );

DELETE FROM public.flagged_articles
  WHERE cluster_generation_id = '02c64b31-b0bc-4368-94cf-c1facbcdabaa';

DELETE FROM public.cluster_generations
  WHERE id = '02c64b31-b0bc-4368-94cf-c1facbcdabaa';

DELETE FROM public.cluster_batch_jobs
  WHERE id = '4933b5ef-3da9-4d0c-aaee-5d23df24e9cc';

UPDATE public.cluster_completion_progress
   SET articles_completed = 0,
       english_articles = 0,
       translations_completed = 0,
       status = 'not_started',
       completed_at = NULL,
       last_updated = NOW()
 WHERE cluster_id = 'f6dd2754-72a4-43cf-a9b2-b19b179db6a7';