CREATE OR REPLACE FUNCTION public.sync_cluster_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_cluster_id UUID;
  en_blogs INT;
  es_blogs INT;
  en_qas INT;
  es_qas INT;
  total_count INT;
  needed INT;
BEGIN
  target_cluster_id := COALESCE(NEW.cluster_id, OLD.cluster_id);
  IF target_cluster_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE language = 'en'),
    COUNT(*) FILTER (WHERE language = 'es')
  INTO en_blogs, es_blogs
  FROM public.blog_articles
  WHERE cluster_id = target_cluster_id;

  SELECT
    COUNT(*) FILTER (WHERE language = 'en'),
    COUNT(*) FILTER (WHERE language = 'es')
  INTO en_qas, es_qas
  FROM public.qa_pages
  WHERE cluster_id = target_cluster_id;

  total_count := COALESCE(en_blogs, 0) + COALESCE(es_blogs, 0)
               + COALESCE(en_qas, 0)   + COALESCE(es_qas, 0);

  SELECT total_articles_needed INTO needed
  FROM public.cluster_completion_progress
  WHERE cluster_id = target_cluster_id;

  UPDATE public.cluster_completion_progress
  SET
    english_articles       = COALESCE(en_blogs, 0),
    translations_completed = COALESCE(es_blogs, 0),
    articles_completed     = total_count,
    status = CASE
      WHEN total_count >= COALESCE(needed, 60) THEN 'completed'
      WHEN total_count > 0 THEN 'in_progress'
      ELSE 'not_started'
    END,
    completed_at = CASE
      WHEN total_count >= COALESCE(needed, 60) AND completed_at IS NULL THEN now()
      WHEN total_count <  COALESCE(needed, 60) THEN NULL
      ELSE completed_at
    END,
    last_updated = now()
  WHERE cluster_id = target_cluster_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS sync_cluster_progress_blog_articles ON public.blog_articles;
CREATE TRIGGER sync_cluster_progress_blog_articles
  AFTER INSERT OR UPDATE OF cluster_id, language OR DELETE
  ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.sync_cluster_progress();

DROP TRIGGER IF EXISTS sync_cluster_progress_qa_pages ON public.qa_pages;
CREATE TRIGGER sync_cluster_progress_qa_pages
  AFTER INSERT OR UPDATE OF cluster_id, language OR DELETE
  ON public.qa_pages
  FOR EACH ROW EXECUTE FUNCTION public.sync_cluster_progress();

WITH counts AS (
  SELECT
    ccp.cluster_id,
    COUNT(ba.id) FILTER (WHERE ba.language = 'en') AS en_blogs,
    COUNT(ba.id) FILTER (WHERE ba.language = 'es') AS es_blogs
  FROM public.cluster_completion_progress ccp
  LEFT JOIN public.blog_articles ba ON ba.cluster_id = ccp.cluster_id
  GROUP BY ccp.cluster_id
),
qa_counts AS (
  SELECT
    ccp.cluster_id,
    COUNT(qp.id) FILTER (WHERE qp.language = 'en') AS en_qas,
    COUNT(qp.id) FILTER (WHERE qp.language = 'es') AS es_qas
  FROM public.cluster_completion_progress ccp
  LEFT JOIN public.qa_pages qp ON qp.cluster_id = ccp.cluster_id
  GROUP BY ccp.cluster_id
)
UPDATE public.cluster_completion_progress ccp
SET
  english_articles       = c.en_blogs,
  translations_completed = c.es_blogs,
  articles_completed     = c.en_blogs + c.es_blogs + q.en_qas + q.es_qas,
  status = CASE
    WHEN (c.en_blogs + c.es_blogs + q.en_qas + q.es_qas) >= COALESCE(ccp.total_articles_needed, 60) THEN 'completed'
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