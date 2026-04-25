
-- Create static_pages table for SSR-baked informational pages (team, philosophy, contact)
CREATE TABLE public.static_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  language TEXT NOT NULL,
  page_type TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1 TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT static_pages_slug_check CHECK (slug IN ('team','philosophy','contact')),
  CONSTRAINT static_pages_language_check CHECK (language IN ('en','es')),
  CONSTRAINT static_pages_page_type_check CHECK (page_type IN ('AboutPage','WebPage','ContactPage')),
  CONSTRAINT static_pages_slug_lang_unique UNIQUE (slug, language)
);

-- Enable RLS; content is public (built into HTML), so anon SELECT only.
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Static pages are publicly readable"
  ON public.static_pages
  FOR SELECT
  USING (true);

-- Content-aware updated_at trigger.
-- Only bumps updated_at when title, meta_description, h1, or body_markdown
-- actually change. This makes updated_at an authentic content-change signal
-- suitable for schema.org dateModified and sitemap <lastmod>.
CREATE OR REPLACE FUNCTION public.static_pages_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF (NEW.title IS DISTINCT FROM OLD.title)
     OR (NEW.meta_description IS DISTINCT FROM OLD.meta_description)
     OR (NEW.h1 IS DISTINCT FROM OLD.h1)
     OR (NEW.body_markdown IS DISTINCT FROM OLD.body_markdown) THEN
    NEW.updated_at := now();
  ELSE
    NEW.updated_at := OLD.updated_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_static_pages_set_updated_at
BEFORE UPDATE ON public.static_pages
FOR EACH ROW
EXECUTE FUNCTION public.static_pages_set_updated_at();

-- Extend the existing enforce_fiduciary_term_block trigger to also validate
-- static_pages content fields (title, meta_description, h1, body_markdown).
CREATE OR REPLACE FUNCTION public.enforce_fiduciary_term_block()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pattern TEXT := '\yfiduciar';
  v_item    TEXT;
BEGIN
  IF TG_TABLE_NAME = 'authors' THEN
    IF NEW.credentials IS NOT NULL THEN
      FOREACH v_item IN ARRAY NEW.credentials LOOP
        IF v_item IS NOT NULL AND v_item ~* v_pattern THEN
          RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in authors.credentials. Offending value: %', v_item;
        END IF;
      END LOOP;
    END IF;
    IF NEW.job_title          IS NOT NULL AND NEW.job_title          ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in authors.job_title.'; END IF;
    IF NEW.bio                IS NOT NULL AND NEW.bio                ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in authors.bio.'; END IF;
    IF NEW.bio_short          IS NOT NULL AND NEW.bio_short          ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in authors.bio_short.'; END IF;
    IF NEW.bio_full_markdown  IS NOT NULL AND NEW.bio_full_markdown  ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in authors.bio_full_markdown.'; END IF;
    IF NEW.name               IS NOT NULL AND NEW.name               ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in authors.name.'; END IF;

  ELSIF TG_TABLE_NAME = 'blog_articles' THEN
    IF NEW.headline         IS NOT NULL AND NEW.headline         ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in blog_articles.headline.'; END IF;
    IF NEW.meta_title       IS NOT NULL AND NEW.meta_title       ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in blog_articles.meta_title.'; END IF;
    IF NEW.meta_description IS NOT NULL AND NEW.meta_description ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in blog_articles.meta_description.'; END IF;
    IF NEW.speakable_answer IS NOT NULL AND NEW.speakable_answer ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in blog_articles.speakable_answer.'; END IF;
    IF NEW.slug             IS NOT NULL AND NEW.slug             ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in blog_articles.slug.'; END IF;

  ELSIF TG_TABLE_NAME = 'static_pages' THEN
    IF NEW.title            IS NOT NULL AND NEW.title            ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in static_pages.title.'; END IF;
    IF NEW.meta_description IS NOT NULL AND NEW.meta_description ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in static_pages.meta_description.'; END IF;
    IF NEW.h1               IS NOT NULL AND NEW.h1               ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in static_pages.h1.'; END IF;
    IF NEW.body_markdown    IS NOT NULL AND NEW.body_markdown    ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in static_pages.body_markdown.'; END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach the trigger to static_pages (BEFORE INSERT OR UPDATE)
CREATE TRIGGER trg_static_pages_enforce_fiduciary_block
BEFORE INSERT OR UPDATE ON public.static_pages
FOR EACH ROW
EXECUTE FUNCTION public.enforce_fiduciary_term_block();

-- Helpful index for build-time slug+language lookups
CREATE INDEX IF NOT EXISTS idx_static_pages_slug_lang ON public.static_pages(slug, language);
