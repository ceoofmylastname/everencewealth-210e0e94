-- Create function to get accurate citation health stats via server-side aggregation
CREATE OR REPLACE FUNCTION public.get_citation_health_stats()
RETURNS JSON
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'healthy', COUNT(*) FILTER (WHERE status = 'healthy'),
    'broken', COUNT(*) FILTER (WHERE status IN ('broken', 'unreachable')),
    'unchecked', COUNT(*) FILTER (WHERE status IS NULL OR status = '')
  )
  FROM external_citation_health;
$$;