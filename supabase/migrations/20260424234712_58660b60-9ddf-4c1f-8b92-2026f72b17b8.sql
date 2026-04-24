-- Fix 7 follow-up: strip remaining body-level <h1> tags from blog_articles.detailed_content
-- and lock with a CHECK constraint so future inserts/updates can't reintroduce them.

UPDATE blog_articles
SET detailed_content = regexp_replace(
  detailed_content,
  '<head[[:space:]]*[^>]*>.*?</head[[:space:]]*>',
  '',
  'gis'
)
WHERE detailed_content ~* '<head[[:space:]>]';

UPDATE blog_articles
SET detailed_content = regexp_replace(
  detailed_content,
  '<h1[[:space:]]*[^>]*>.*?</h1[[:space:]]*>',
  '',
  'gis'
)
WHERE detailed_content ~* '<h1[[:space:]>]';

DO $$
DECLARE
  v_remaining INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_remaining
  FROM blog_articles
  WHERE status = 'published'
    AND (detailed_content ~* '<head[[:space:]>]'
         OR detailed_content ~* '<h1[[:space:]>]');
  RAISE NOTICE 'Rows still containing <head> or <h1> after strip: %', v_remaining;
  IF v_remaining > 0 THEN
    RAISE EXCEPTION 'Strip incomplete: % rows still dirty. Aborting before CHECK constraint.', v_remaining;
  END IF;
END $$;

ALTER TABLE blog_articles
  DROP CONSTRAINT IF EXISTS blog_articles_body_no_head_h1;

ALTER TABLE blog_articles
  ADD CONSTRAINT blog_articles_body_no_head_h1 CHECK (
    detailed_content IS NULL
    OR (
      detailed_content !~* '<head[[:space:]>]'
      AND detailed_content !~* '<h1[[:space:]>]'
    )
  );