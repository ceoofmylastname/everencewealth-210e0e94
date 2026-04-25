-- 1a. Catalog view: every published, indexable URL on the site
CREATE OR REPLACE VIEW public.all_published_slugs AS
  SELECT ('/' || language || '/blog/' || slug || '/') AS full_path,
         slug, language
    FROM public.blog_articles WHERE status = 'published'
  UNION ALL
  SELECT ('/' || language || '/qa/' || slug || '/'), slug, language
    FROM public.qa_pages WHERE status = 'published'
  UNION ALL
  SELECT ('/' || language || '/locations/' || city_slug || '/' || topic_slug || '/'),
         topic_slug, language
    FROM public.location_pages WHERE status = 'published'
  UNION ALL
  SELECT ('/en/compare/' || slug || '/'), slug, 'en'
    FROM public.comparison_pages WHERE status = 'published' AND language = 'en'
  UNION ALL
  SELECT ('/es/comparar/' || slug || '/'), slug, 'es'
    FROM public.comparison_pages WHERE status = 'published' AND language = 'es'
  UNION ALL
  SELECT ('/' || language || '/' || slug || '/'), slug, language
    FROM public.static_pages;

-- 1b. Partial indexes on source tables
CREATE INDEX IF NOT EXISTS idx_blog_articles_pub_lang_slug
  ON public.blog_articles(language, slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_qa_pages_pub_lang_slug
  ON public.qa_pages(language, slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_location_pages_pub_lang_city_topic
  ON public.location_pages(language, city_slug, topic_slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_comparison_pages_pub_lang_slug
  ON public.comparison_pages(language, slug) WHERE status = 'published';

-- 1c. Bot traffic log table
CREATE TABLE IF NOT EXISTS public.bot_traffic_log (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ua TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status INT NOT NULL,
  cf_ray TEXT,
  country TEXT,
  response_bytes INT
);
CREATE INDEX IF NOT EXISTS bot_traffic_log_ts_idx
  ON public.bot_traffic_log (ts DESC);
CREATE INDEX IF NOT EXISTS bot_traffic_log_bot_name_idx
  ON public.bot_traffic_log (bot_name, ts DESC);

ALTER TABLE public.bot_traffic_log ENABLE ROW LEVEL SECURITY;

-- Write-only INSERT for anon (middleware fire-and-forget)
DROP POLICY IF EXISTS "bot_traffic_log_insert_anon" ON public.bot_traffic_log;
CREATE POLICY "bot_traffic_log_insert_anon"
  ON public.bot_traffic_log FOR INSERT TO anon WITH CHECK (true);

-- Admin SELECT via existing has_role()
DROP POLICY IF EXISTS "bot_traffic_log_admin_select" ON public.bot_traffic_log;
CREATE POLICY "bot_traffic_log_admin_select"
  ON public.bot_traffic_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 1d. Hourly summary view for the admin dashboard
CREATE OR REPLACE VIEW public.bot_traffic_summary AS
  SELECT bot_name,
         DATE_TRUNC('hour', ts) AS hour,
         COUNT(*) AS hits,
         COUNT(*) FILTER (WHERE status = 200) AS hits_200,
         COUNT(*) FILTER (WHERE status BETWEEN 400 AND 499) AS hits_4xx,
         COUNT(*) FILTER (WHERE status = 410) AS hits_410,
         COUNT(*) FILTER (WHERE status = 308) AS hits_308,
         COUNT(DISTINCT path) AS unique_paths
    FROM public.bot_traffic_log
   WHERE ts > NOW() - INTERVAL '7 days'
   GROUP BY bot_name, hour
   ORDER BY hour DESC, bot_name;