-- STEP 0: Backup
DROP TABLE IF EXISTS public.blog_articles_backup_20260424;
CREATE TABLE public.blog_articles_backup_20260424 AS
SELECT * FROM public.blog_articles
WHERE language IN ('en','es');

-- STEP 2: Fix meta_title — copy headline, intelligently truncated to <= 70 chars
UPDATE public.blog_articles
SET meta_title = CASE
  WHEN char_length(headline) <= 70 THEN headline
  ELSE
    rtrim(
      regexp_replace(substring(headline FROM 1 FOR 67), '\s+\S*$', ''),
      ' .,;:-'
    ) || '…'
END
WHERE status = 'published'
  AND (meta_title IS NULL
       OR meta_title = ''
       OR meta_title NOT ILIKE '%' || LEFT(headline, 25) || '%');

-- STEP 3: Strip embedded <head> blocks
UPDATE public.blog_articles
SET detailed_content = regexp_replace(
  detailed_content,
  '<head[^>]*>.*?</head>',
  '',
  'gis'
)
WHERE detailed_content ILIKE '%<head>%'
   OR detailed_content ILIKE '%</head>%';

-- STEP 4: Strip inline canonical / alternate <link> tags
UPDATE public.blog_articles
SET detailed_content = regexp_replace(
  detailed_content,
  '<link[^>]*rel=["\x27](canonical|alternate)["\x27][^>]*/?>',
  '',
  'gi'
)
WHERE detailed_content ILIKE '%rel="canonical"%'
   OR detailed_content ILIKE '%rel=''canonical''%'
   OR detailed_content ILIKE '%rel="alternate"%'
   OR detailed_content ILIKE '%rel=''alternate''%';

-- STEP 5: Strip inline JSON-LD <script> blocks
UPDATE public.blog_articles
SET detailed_content = regexp_replace(
  detailed_content,
  '<script[^>]*type=["\x27]application/ld\+json["\x27][^>]*>.*?</script>',
  '',
  'gis'
)
WHERE detailed_content ILIKE '%application/ld+json%';

-- STEP 6: Bump date_modified on all published rows so SSR/JSON-LD re-propagates
UPDATE public.blog_articles
SET date_modified = NOW()
WHERE status = 'published';

-- STEP 7: Lock the table - prevent re-introduction of the corruption patterns
ALTER TABLE public.blog_articles
DROP CONSTRAINT IF EXISTS blog_articles_body_no_head_or_canonical;

ALTER TABLE public.blog_articles
ADD CONSTRAINT blog_articles_body_no_head_or_canonical CHECK (
  detailed_content IS NULL
  OR (
    detailed_content NOT ILIKE '%<head>%'
    AND detailed_content NOT ILIKE '%</head>%'
    AND detailed_content NOT ILIKE '%rel="canonical"%'
    AND detailed_content NOT ILIKE '%rel=''canonical''%'
    AND detailed_content NOT ILIKE '%rel="alternate"%'
    AND detailed_content NOT ILIKE '%rel=''alternate''%'
    AND detailed_content NOT ILIKE '%application/ld+json%'
  )
);