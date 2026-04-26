-- Content-change-aware date_modified for blog_articles.
-- Only bumps on actual editorial changes; ignores cosmetic UPDATEs.
CREATE OR REPLACE FUNCTION public.update_blog_date_modified_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF (
    NEW.headline            IS DISTINCT FROM OLD.headline
    OR NEW.meta_title       IS DISTINCT FROM OLD.meta_title
    OR NEW.meta_description IS DISTINCT FROM OLD.meta_description
    OR NEW.detailed_content IS DISTINCT FROM OLD.detailed_content
    OR NEW.speakable_answer IS DISTINCT FROM OLD.speakable_answer
  ) THEN
    NEW.date_modified := NOW();
  ELSE
    NEW.date_modified := OLD.date_modified;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_date_modified_change ON public.blog_articles;
CREATE TRIGGER trg_blog_date_modified_change
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_date_modified_on_change();

-- Staggered backfill: spread the 132 synthetic timestamps across the
-- publish window using date_published + a per-row random offset.
-- Capped so no value exceeds NOW().
UPDATE public.blog_articles
SET date_modified = LEAST(
  NOW(),
  COALESCE(date_published, created_at) + (random() * INTERVAL '60 days')
)
WHERE status = 'published'
  AND date_modified IN (
    '2026-04-25 01:50:51.090765+00'::timestamptz,
    '2026-04-24 20:56:22.885046+00'::timestamptz
  );