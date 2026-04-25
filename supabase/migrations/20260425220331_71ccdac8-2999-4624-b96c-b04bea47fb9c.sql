-- ─────────────────────────────────────────────────────────────
-- PROMPT 15: IndexNow ping log + DB triggers (corrected schema)
-- ─────────────────────────────────────────────────────────────

-- 1. Log table
CREATE TABLE IF NOT EXISTS public.indexnow_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  urls TEXT[] NOT NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indexnow_pings_submitted_at
  ON public.indexnow_pings (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_indexnow_pings_source
  ON public.indexnow_pings (source);

ALTER TABLE public.indexnow_pings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "indexnow_pings_admin_select" ON public.indexnow_pings;
CREATE POLICY "indexnow_pings_admin_select"
  ON public.indexnow_pings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "indexnow_pings_anon_insert" ON public.indexnow_pings;
CREATE POLICY "indexnow_pings_anon_insert"
  ON public.indexnow_pings
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

COMMENT ON TABLE public.indexnow_pings IS
  'Audit log of IndexNow submissions. One row per endpoint per ping batch. Source = insert | update | manual | manual-bulk.';

-- 2. notify_indexnow() function
CREATE OR REPLACE FUNCTION public.notify_indexnow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_lang TEXT;
  v_supabase_url TEXT;
  v_anon_key TEXT;
  v_has_status BOOLEAN;
BEGIN
  v_has_status := TG_TABLE_NAME IN ('blog_articles', 'qa_pages', 'location_pages', 'comparison_pages');

  IF v_has_status THEN
    IF NEW.status IS DISTINCT FROM 'published' THEN
      RETURN NEW;
    END IF;
  END IF;

  v_lang := COALESCE(NEW.language, 'en');

  CASE TG_TABLE_NAME
    WHEN 'blog_articles' THEN
      v_url := 'https://www.everencewealth.com/' || v_lang || '/blog/' || NEW.slug || '/';
    WHEN 'qa_pages' THEN
      v_url := 'https://www.everencewealth.com/' || v_lang || '/qa/' || NEW.slug || '/';
    WHEN 'location_pages' THEN
      v_url := 'https://www.everencewealth.com/' || v_lang || '/locations/' || NEW.city_slug || '/' || NEW.topic_slug || '/';
    WHEN 'comparison_pages' THEN
      IF v_lang = 'es' THEN
        v_url := 'https://www.everencewealth.com/es/comparar/' || NEW.slug || '/';
      ELSE
        v_url := 'https://www.everencewealth.com/en/compare/' || NEW.slug || '/';
      END IF;
    WHEN 'static_pages' THEN
      v_url := 'https://www.everencewealth.com/' || v_lang || '/' || NEW.slug || '/';
    ELSE
      RETURN NEW;
  END CASE;

  v_supabase_url := current_setting('app.settings.supabase_url', true);
  IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
    v_supabase_url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
  END IF;

  v_anon_key := current_setting('app.settings.anon_key', true);
  IF v_anon_key IS NULL OR v_anon_key = '' THEN
    v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienJtcG1xaWp2bWpiaGN0Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjk1MzUsImV4cCI6MjA4Njc0NTUzNX0.cI7HQmbY1XF_wmPMSm9ofbQdR3iujQ5_YNg8h_YLkVg';
  END IF;

  PERFORM net.http_post(
    url     := v_supabase_url || '/functions/v1/ping-indexnow',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body    := jsonb_build_object(
      'urls',   ARRAY[v_url],
      'source', LOWER(TG_OP)
    )
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_indexnow() IS
  'Fires on publish/update of content tables. Builds public URL and async-pings ping-indexnow edge function. Installed 2026-04-25 by PROMPT 15.';

-- 3. Drop any pre-existing IndexNow triggers, then install fresh ones
DROP TRIGGER IF EXISTS on_blog_published_ping_indexnow      ON public.blog_articles;
DROP TRIGGER IF EXISTS on_qa_published_ping_indexnow         ON public.qa_pages;
DROP TRIGGER IF EXISTS on_location_published_ping_indexnow   ON public.location_pages;
DROP TRIGGER IF EXISTS on_comparison_published_ping_indexnow ON public.comparison_pages;
DROP TRIGGER IF EXISTS on_static_pages_ping_indexnow         ON public.static_pages;

DROP TRIGGER IF EXISTS trg_blog_articles_indexnow      ON public.blog_articles;
DROP TRIGGER IF EXISTS trg_qa_pages_indexnow           ON public.qa_pages;
DROP TRIGGER IF EXISTS trg_location_pages_indexnow     ON public.location_pages;
DROP TRIGGER IF EXISTS trg_comparison_pages_indexnow   ON public.comparison_pages;
DROP TRIGGER IF EXISTS trg_static_pages_indexnow       ON public.static_pages;

CREATE TRIGGER trg_blog_articles_indexnow
  AFTER INSERT OR UPDATE OF status, slug, headline, detailed_content, meta_description
  ON public.blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_indexnow();

CREATE TRIGGER trg_qa_pages_indexnow
  AFTER INSERT OR UPDATE OF status, slug, question_main, answer_main, meta_description
  ON public.qa_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_indexnow();

CREATE TRIGGER trg_location_pages_indexnow
  AFTER INSERT OR UPDATE OF status, city_slug, topic_slug, headline, location_overview, final_summary
  ON public.location_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_indexnow();

CREATE TRIGGER trg_comparison_pages_indexnow
  AFTER INSERT OR UPDATE OF status, slug, headline, final_verdict
  ON public.comparison_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_indexnow();

CREATE TRIGGER trg_static_pages_indexnow
  AFTER INSERT OR UPDATE OF slug, title, h1, body_markdown
  ON public.static_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_indexnow();