
-- Recreate duplicate_image_articles view with all columns expected by DuplicateImageFixer
DROP VIEW IF EXISTS public.duplicate_image_articles;
CREATE OR REPLACE VIEW public.duplicate_image_articles
WITH (security_invoker = true)
AS
SELECT
  ba.featured_image_url,
  COUNT(*) AS article_count,
  COUNT(*) AS usage_count,
  ARRAY_AGG(ba.id) AS article_ids,
  ARRAY_AGG(ba.slug) AS slugs,
  ARRAY_AGG(ba.language) AS languages,
  ARRAY_AGG(ba.headline) AS headlines,
  ARRAY_AGG(ba.cluster_id) AS cluster_ids
FROM public.blog_articles ba
WHERE ba.featured_image_url IS NOT NULL AND ba.featured_image_url != ''
GROUP BY ba.featured_image_url
HAVING COUNT(*) > 1;
