-- Refined trigger: only override date_modified when the caller did NOT
-- explicitly change it. This lets backfills and admin-tools set
-- date_modified directly while still auto-bumping on real content edits.
CREATE OR REPLACE FUNCTION public.update_blog_date_modified_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- If caller explicitly changed date_modified, respect it (backfill path).
  IF NEW.date_modified IS DISTINCT FROM OLD.date_modified THEN
    RETURN NEW;
  END IF;

  -- Otherwise, bump on real content changes; preserve on cosmetic UPDATEs.
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

-- Now the backfill lands because the trigger respects explicit changes.
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