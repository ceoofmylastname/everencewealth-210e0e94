-- Backup affected rows
CREATE TABLE IF NOT EXISTS public.location_pages_backup_20260424 AS
SELECT * FROM public.location_pages WHERE city_slug LIKE '%,%' OR topic_slug LIKE '%,%';

-- Strip ",-" -> "-", and any other stray commas
UPDATE public.location_pages
SET city_slug = REPLACE(REPLACE(city_slug, ',-', '-'), ',', '')
WHERE city_slug LIKE '%,%';

UPDATE public.location_pages
SET topic_slug = REPLACE(REPLACE(topic_slug, ',-', '-'), ',', '')
WHERE topic_slug LIKE '%,%';

-- Verifier — abort before constraint if anything dirty remains
DO $$
DECLARE dirty INT;
BEGIN
  SELECT COUNT(*) INTO dirty FROM public.location_pages
    WHERE city_slug LIKE '%,%' OR topic_slug LIKE '%,%';
  IF dirty > 0 THEN
    RAISE EXCEPTION 'comma cleanup left % dirty rows', dirty;
  END IF;
END $$;

-- Lock against regression
ALTER TABLE public.location_pages
  ADD CONSTRAINT location_pages_city_slug_no_comma CHECK (city_slug NOT LIKE '%,%');

ALTER TABLE public.location_pages
  ADD CONSTRAINT location_pages_topic_slug_no_comma CHECK (topic_slug NOT LIKE '%,%');