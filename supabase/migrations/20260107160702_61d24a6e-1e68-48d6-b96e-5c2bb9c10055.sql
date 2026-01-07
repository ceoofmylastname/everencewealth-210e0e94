-- Create function to aggregate Q&A counts by cluster and language (server-side)
-- This avoids the 1000-row API limit issue when fetching raw qa_pages

CREATE OR REPLACE FUNCTION public.get_cluster_qa_counts()
RETURNS TABLE (
  cluster_id uuid,
  language text,
  total_count bigint,
  published_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT
    qa_pages.cluster_id,
    qa_pages.language,
    COUNT(*)::bigint AS total_count,
    COUNT(*) FILTER (WHERE qa_pages.status = 'published')::bigint AS published_count
  FROM public.qa_pages
  WHERE qa_pages.cluster_id IS NOT NULL
  GROUP BY qa_pages.cluster_id, qa_pages.language;
$$;

-- Security: Only allow authenticated users to execute
REVOKE EXECUTE ON FUNCTION public.get_cluster_qa_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cluster_qa_counts() TO authenticated;