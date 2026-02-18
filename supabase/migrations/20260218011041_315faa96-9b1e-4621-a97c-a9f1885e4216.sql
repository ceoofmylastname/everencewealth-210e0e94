
-- ============================================================
-- Security Fix 1: Recreate views with security_invoker = true
-- ============================================================

-- Fix duplicate_image_articles view
DROP VIEW IF EXISTS public.duplicate_image_articles;
CREATE OR REPLACE VIEW public.duplicate_image_articles
WITH (security_invoker = true)
AS
SELECT
  featured_image_url,
  COUNT(*) AS article_count,
  ARRAY_AGG(id) AS article_ids,
  ARRAY_AGG(slug) AS slugs,
  ARRAY_AGG(language) AS languages
FROM public.blog_articles
WHERE featured_image_url IS NOT NULL AND featured_image_url != ''
GROUP BY featured_image_url
HAVING COUNT(*) > 1;

-- Fix hreflang_siblings view (qa_pages uses question_main, not question)
DROP VIEW IF EXISTS public.hreflang_siblings;
CREATE OR REPLACE VIEW public.hreflang_siblings
WITH (security_invoker = true)
AS
SELECT
  a.id,
  a.slug,
  a.language,
  a.hreflang_group_id,
  a.headline AS title,
  'blog_article' AS content_type
FROM public.blog_articles a
WHERE a.hreflang_group_id IS NOT NULL
UNION ALL
SELECT
  q.id,
  q.slug,
  q.language,
  q.hreflang_group_id,
  q.title AS title,
  'qa_page' AS content_type
FROM public.qa_pages q
WHERE q.hreflang_group_id IS NOT NULL;

-- ============================================================
-- Security Fix 4: Tighten overly permissive RLS policies
-- ============================================================

-- --- link_suggestions ---
DROP POLICY IF EXISTS "Allow public insert on link_suggestions" ON public.link_suggestions;
DROP POLICY IF EXISTS "Allow public update on link_suggestions" ON public.link_suggestions;
DROP POLICY IF EXISTS "Allow public delete on link_suggestions" ON public.link_suggestions;
DROP POLICY IF EXISTS "link_suggestions_insert" ON public.link_suggestions;
DROP POLICY IF EXISTS "link_suggestions_update" ON public.link_suggestions;
DROP POLICY IF EXISTS "link_suggestions_delete" ON public.link_suggestions;
DROP POLICY IF EXISTS "Allow all operations on link_suggestions" ON public.link_suggestions;
DROP POLICY IF EXISTS "Admins can insert link_suggestions" ON public.link_suggestions;
DROP POLICY IF EXISTS "Admins can update link_suggestions" ON public.link_suggestions;
DROP POLICY IF EXISTS "Admins can delete link_suggestions" ON public.link_suggestions;

CREATE POLICY "Admins can insert link_suggestions"
  ON public.link_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update link_suggestions"
  ON public.link_suggestions FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete link_suggestions"
  ON public.link_suggestions FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- --- image_regeneration_queue ---
DROP POLICY IF EXISTS "Allow all on image_regeneration_queue" ON public.image_regeneration_queue;
DROP POLICY IF EXISTS "image_regeneration_queue_all" ON public.image_regeneration_queue;
DROP POLICY IF EXISTS "Allow public access to image_regeneration_queue" ON public.image_regeneration_queue;
DROP POLICY IF EXISTS "Admins can manage image_regeneration_queue" ON public.image_regeneration_queue;

CREATE POLICY "Admins can manage image_regeneration_queue"
  ON public.image_regeneration_queue FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- --- email_tracking ---
DROP POLICY IF EXISTS "Allow public insert on email_tracking" ON public.email_tracking;
DROP POLICY IF EXISTS "email_tracking_insert" ON public.email_tracking;
DROP POLICY IF EXISTS "Allow insert on email_tracking" ON public.email_tracking;
DROP POLICY IF EXISTS "Service role can insert email_tracking" ON public.email_tracking;

CREATE POLICY "Admins can insert email_tracking"
  ON public.email_tracking FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
