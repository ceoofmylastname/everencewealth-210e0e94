UPDATE public.location_pages
SET canonical_url = REPLACE(REPLACE(canonical_url, ',-', '-'), ',', '')
WHERE canonical_url LIKE '%,%';

DO $$
DECLARE dirty INT;
BEGIN
  SELECT COUNT(*) INTO dirty FROM public.location_pages WHERE canonical_url LIKE '%,%';
  IF dirty > 0 THEN
    RAISE EXCEPTION 'canonical_url cleanup left % dirty rows', dirty;
  END IF;
END $$;

ALTER TABLE public.location_pages
  ADD CONSTRAINT location_pages_canonical_url_no_comma CHECK (canonical_url IS NULL OR canonical_url NOT LIKE '%,%');