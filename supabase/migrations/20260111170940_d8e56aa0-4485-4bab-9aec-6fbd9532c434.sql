CREATE OR REPLACE FUNCTION get_cluster_image_health()
RETURNS TABLE (
  cluster_id uuid,
  unique_images bigint,
  total_images bigint,
  health_percent integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ba.cluster_id,
    COUNT(DISTINCT ba.featured_image_url) as unique_images,
    COUNT(*) as total_images,
    CASE 
      WHEN COUNT(*) = 0 THEN 100
      ELSE ROUND((COUNT(DISTINCT ba.featured_image_url)::numeric / COUNT(*)::numeric) * 100)::integer
    END as health_percent
  FROM blog_articles ba
  WHERE ba.cluster_id IS NOT NULL
    AND ba.status = 'published'
  GROUP BY ba.cluster_id;
END;
$$;