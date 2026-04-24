-- Migration: Remove foreign Supabase project reference (kazggnufaoicopvmwhdl)
-- from notify_sitemap_ping() and auto_generate_faqs(). Replace with Everence
-- Wealth project (zbzrmpmqijvmjbhctfoe) and harden via GUC fallback so URLs
-- can never silently drift to a foreign project again.

-- ─────────────────────────────────────────────────────────────
-- 1. notify_sitemap_ping() — replaces hardcoded foreign URL
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_sitemap_ping()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_slug         TEXT;
  v_supabase_url TEXT;
BEGIN
  -- Only proceed if status is being set to 'published'
  IF TG_OP = 'INSERT' THEN
    IF NEW.status != 'published' THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status != 'published' OR OLD.status = 'published' THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Slug source depends on table
  IF TG_TABLE_NAME = 'location_pages' THEN
    v_slug := NEW.topic_slug;
  ELSE
    v_slug := NEW.slug;
  END IF;

  -- Resolve Supabase URL: GUC first, then Everence fallback (NEVER foreign)
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
    v_supabase_url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
  END IF;

  PERFORM net.http_post(
    url     := v_supabase_url || '/functions/v1/ping-indexnow',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object(
      'table',  TG_TABLE_NAME,
      'slug',   v_slug,
      'action', TG_OP
    )
  );

  RAISE NOTICE 'IndexNow ping triggered for % - %', TG_TABLE_NAME, v_slug;
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.notify_sitemap_ping() IS
  'Pings IndexNow on publish. Updated 2026-04-24: removed hardcoded foreign Supabase project ref (kazggnufaoicopvmwhdl); now uses GUC app.settings.supabase_url with Everence (zbzrmpmqijvmjbhctfoe) fallback.';

-- ─────────────────────────────────────────────────────────────
-- 2. auto_generate_faqs() — replaces hardcoded foreign fallback
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.auto_generate_faqs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_supabase_url     TEXT;
  v_service_role_key TEXT;
BEGIN
  IF NEW.status = 'published'
     AND (NEW.qa_entities IS NULL OR jsonb_array_length(NEW.qa_entities) = 0) THEN

    v_supabase_url     := current_setting('app.settings.supabase_url',     true);
    v_service_role_key := current_setting('app.settings.service_role_key', true);

    -- Everence fallback ONLY (never foreign)
    IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
      v_supabase_url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
    END IF;

    PERFORM net.http_post(
      url     := v_supabase_url || '/functions/v1/backfill-article-faqs',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || COALESCE(v_service_role_key, '')
      ),
      body := jsonb_build_object(
        'articles', jsonb_build_array(
          jsonb_build_object(
            'id',               NEW.id,
            'headline',         NEW.headline,
            'detailed_content', NEW.detailed_content,
            'meta_description', NEW.meta_description,
            'language',         NEW.language,
            'funnel_stage',     NEW.funnel_stage
          )
        ),
        'single_article_mode', true
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.auto_generate_faqs() IS
  'Auto-backfills FAQs on publish. Updated 2026-04-24: removed hardcoded foreign Supabase project ref (kazggnufaoicopvmwhdl); now uses GUC app.settings.supabase_url with Everence (zbzrmpmqijvmjbhctfoe) fallback. Service role key sourced from GUC, never literal.';