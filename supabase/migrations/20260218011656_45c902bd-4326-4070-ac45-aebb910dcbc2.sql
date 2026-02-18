
-- Fix 1: Add SET search_path to functions missing it

CREATE OR REPLACE FUNCTION public.get_cluster_qa_counts()
 RETURNS TABLE(cluster_id uuid, language text, total_count bigint, published_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path = public
AS $function$
  SELECT
    qa_pages.cluster_id,
    qa_pages.language,
    COUNT(*)::bigint AS total_count,
    COUNT(*) FILTER (WHERE qa_pages.status = 'published')::bigint AS published_count
  FROM public.qa_pages
  WHERE qa_pages.cluster_id IS NOT NULL
  GROUP BY qa_pages.cluster_id, qa_pages.language;
$function$;

CREATE OR REPLACE FUNCTION public.get_diversity_report()
 RETURNS TABLE(domain text, category text, language text, region text, tier text, trust_score integer, total_uses bigint, usage_status text, diversity_score integer)
 LANGUAGE sql
 STABLE
 SET search_path = public
AS $function$
  SELECT 
    domain,
    category,
    language,
    region,
    tier,
    trust_score,
    total_uses,
    usage_status,
    diversity_score
  FROM domain_diversity_report 
  LIMIT 200;
$function$;

CREATE OR REPLACE FUNCTION public.normalize_url(url text, strip_query boolean DEFAULT false, domain_only boolean DEFAULT false)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
DECLARE
  normalized TEXT;
  domain_part TEXT;
BEGIN
  normalized := LOWER(TRIM(url));
  IF normalized LIKE '%/' THEN
    normalized := LEFT(normalized, LENGTH(normalized) - 1);
  END IF;
  IF strip_query AND normalized LIKE '%?%' THEN
    normalized := SPLIT_PART(normalized, '?', 1);
  END IF;
  IF domain_only THEN
    normalized := REGEXP_REPLACE(normalized, '^https?://', '');
    domain_part := SPLIT_PART(normalized, '/', 1);
    domain_part := REGEXP_REPLACE(domain_part, '^www\.', '');
    RETURN domain_part;
  END IF;
  RETURN normalized;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_approved_domains_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_qa_article_tracking_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix 2: Recreate security definer views as security invoker
-- content_freshness_report
DROP VIEW IF EXISTS public.content_freshness_report;
CREATE VIEW public.content_freshness_report
WITH (security_invoker = true)
AS SELECT 
    id,
    slug,
    headline,
    language,
    status,
    date_published,
    date_modified,
    CASE
        WHEN (date_modified IS NULL) THEN 'never_updated'::text
        WHEN (date_modified < (now() - '90 days'::interval)) THEN 'stale'::text
        WHEN (date_modified < (now() - '30 days'::interval)) THEN 'needs_refresh'::text
        ELSE 'fresh'::text
    END AS freshness_status,
    EXTRACT(day FROM (now() - COALESCE(date_modified, date_published))) AS days_since_update,
    ( SELECT count(*) AS count
           FROM content_updates
          WHERE (content_updates.article_id = blog_articles.id)) AS update_count
FROM blog_articles
WHERE (status = 'published'::text)
ORDER BY COALESCE(date_modified, date_published);

-- domain_diversity_report
DROP VIEW IF EXISTS public.domain_diversity_report;
CREATE VIEW public.domain_diversity_report
WITH (security_invoker = true)
AS SELECT 
    ad.domain,
    ad.category,
    ad.language,
    ad.region,
    ad.tier,
    ad.trust_score,
    COALESCE(dus.total_uses, 0) AS total_uses,
    CASE
        WHEN (COALESCE(dus.total_uses, 0) = 0) THEN 'UNUSED - Priority 1'::text
        WHEN (COALESCE(dus.total_uses, 0) < 5) THEN 'LIGHTLY USED - Priority 2'::text
        WHEN (COALESCE(dus.total_uses, 0) < 10) THEN 'MODERATE - Priority 3'::text
        WHEN (COALESCE(dus.total_uses, 0) < 20) THEN 'HIGH USE - Limit'::text
        ELSE 'BLOCKED - Overused'::text
    END AS usage_status,
    (100 - (COALESCE(dus.total_uses, 0) * 5)) AS diversity_score
FROM (approved_domains ad
  LEFT JOIN domain_usage_stats dus ON ((ad.domain = dus.domain)))
WHERE (ad.is_allowed = true)
ORDER BY (100 - (COALESCE(dus.total_uses, 0) * 5)) DESC, ad.tier, ad.trust_score DESC, ad.domain;
