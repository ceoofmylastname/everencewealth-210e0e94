-- ============================================================
-- hub_cache: one cached payload per (hub_type, language)
-- Used by the serve-seo-page edge function to render hub/index
-- pages (/blog, /qa, /locations, /compare) without re-querying
-- detail tables on every request.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.hub_cache (
  hub_type        TEXT NOT NULL,
  language        TEXT NOT NULL,
  payload         JSONB NOT NULL,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  is_stale        BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (hub_type, language),
  CONSTRAINT hub_cache_hub_type_check
    CHECK (hub_type IN ('blog', 'qa', 'locations', 'compare')),
  CONSTRAINT hub_cache_language_check
    CHECK (language IN ('en', 'es'))
);

CREATE INDEX IF NOT EXISTS idx_hub_cache_lookup
  ON public.hub_cache (hub_type, language, is_stale, expires_at);

-- ============================================================
-- RLS: payloads are public (no PII), only admins can mutate
-- manually. The edge function uses the service role and bypasses
-- RLS automatically.
-- ============================================================

ALTER TABLE public.hub_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hub_cache: public read" ON public.hub_cache;
CREATE POLICY "hub_cache: public read"
  ON public.hub_cache
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "hub_cache: admin write" ON public.hub_cache;
CREATE POLICY "hub_cache: admin write"
  ON public.hub_cache
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- Invalidation: mark cache stale when source content changes.
-- Single shared trigger function, reused on all four source
-- tables. Only fires for published rows (or status transitions).
-- ============================================================

CREATE OR REPLACE FUNCTION public.invalidate_hub_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hub_type TEXT;
  v_language TEXT;
BEGIN
  -- Map source table -> hub_type
  v_hub_type := CASE TG_TABLE_NAME
    WHEN 'blog_articles'    THEN 'blog'
    WHEN 'qa_pages'         THEN 'qa'
    WHEN 'location_pages'   THEN 'locations'
    WHEN 'comparison_pages' THEN 'compare'
    ELSE NULL
  END;

  IF v_hub_type IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Determine language: prefer NEW.language, fallback to OLD.language (deletes)
  IF TG_OP = 'DELETE' THEN
    v_language := OLD.language;
  ELSE
    v_language := NEW.language;
    -- Only invalidate when the row is or was published (skip pure draft churn)
    IF TG_OP = 'UPDATE'
       AND NEW.status <> 'published'
       AND OLD.status <> 'published' THEN
      RETURN NEW;
    END IF;
    IF TG_OP = 'INSERT' AND NEW.status <> 'published' THEN
      RETURN NEW;
    END IF;
  END IF;

  IF v_language IS NULL OR v_language NOT IN ('en','es') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Mark the corresponding hub cache row stale (idempotent UPSERT).
  -- Edge function checks is_stale OR expires_at < now() and regenerates.
  INSERT INTO public.hub_cache (hub_type, language, payload, generated_at, expires_at, is_stale)
  VALUES (v_hub_type, v_language, '{}'::jsonb, now(), now(), true)
  ON CONFLICT (hub_type, language)
  DO UPDATE SET is_stale = true;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach trigger to all four source tables
DROP TRIGGER IF EXISTS trg_invalidate_hub_cache_blog       ON public.blog_articles;
CREATE TRIGGER trg_invalidate_hub_cache_blog
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_hub_cache();

DROP TRIGGER IF EXISTS trg_invalidate_hub_cache_qa         ON public.qa_pages;
CREATE TRIGGER trg_invalidate_hub_cache_qa
  AFTER INSERT OR UPDATE OR DELETE ON public.qa_pages
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_hub_cache();

DROP TRIGGER IF EXISTS trg_invalidate_hub_cache_locations  ON public.location_pages;
CREATE TRIGGER trg_invalidate_hub_cache_locations
  AFTER INSERT OR UPDATE OR DELETE ON public.location_pages
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_hub_cache();

DROP TRIGGER IF EXISTS trg_invalidate_hub_cache_compare    ON public.comparison_pages;
CREATE TRIGGER trg_invalidate_hub_cache_compare
  AFTER INSERT OR UPDATE OR DELETE ON public.comparison_pages
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_hub_cache();