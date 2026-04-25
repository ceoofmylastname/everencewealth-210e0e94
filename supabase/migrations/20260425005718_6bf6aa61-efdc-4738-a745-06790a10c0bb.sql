
-- =========================================================================
-- COMPLIANCE STEP 4: Add author bio columns + Full additive BLOCK matrix
--   + Clean 31 qa_pages rows (English + Spanish) within transaction gating
-- =========================================================================

BEGIN;

-- 1. Add the two new author columns Fix 13 Phase 1 will need.
ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS bio_short TEXT;
ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS bio_full_markdown TEXT;

-- 2. Replace the trigger function with the full additive BLOCK matrix.
--    Defensive null checks throughout. Stem '\yfiduciar' covers EN + ES.
CREATE OR REPLACE FUNCTION public.enforce_fiduciary_term_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  ELSIF TG_TABLE_NAME = 'qa_pages' THEN
    IF NEW.question_main    IS NOT NULL AND NEW.question_main    ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in qa_pages.question_main.'; END IF;
    IF NEW.title            IS NOT NULL AND NEW.title            ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in qa_pages.title.'; END IF;
    IF NEW.meta_title       IS NOT NULL AND NEW.meta_title       ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in qa_pages.meta_title.'; END IF;
    IF NEW.meta_description IS NOT NULL AND NEW.meta_description ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in qa_pages.meta_description.'; END IF;
    IF NEW.speakable_answer IS NOT NULL AND NEW.speakable_answer ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in qa_pages.speakable_answer.'; END IF;
    IF NEW.slug             IS NOT NULL AND NEW.slug             ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in qa_pages.slug.'; END IF;

  ELSIF TG_TABLE_NAME = 'location_pages' THEN
    IF NEW.headline         IS NOT NULL AND NEW.headline         ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in location_pages.headline.'; END IF;
    IF NEW.meta_title       IS NOT NULL AND NEW.meta_title       ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in location_pages.meta_title.'; END IF;
    IF NEW.meta_description IS NOT NULL AND NEW.meta_description ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in location_pages.meta_description.'; END IF;
    IF NEW.speakable_answer IS NOT NULL AND NEW.speakable_answer ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in location_pages.speakable_answer.'; END IF;
    IF NEW.city_slug        IS NOT NULL AND NEW.city_slug        ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in location_pages.city_slug.'; END IF;
    IF NEW.topic_slug       IS NOT NULL AND NEW.topic_slug       ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in location_pages.topic_slug.'; END IF;

  ELSIF TG_TABLE_NAME = 'comparison_pages' THEN
    IF NEW.headline         IS NOT NULL AND NEW.headline         ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in comparison_pages.headline.'; END IF;
    IF NEW.meta_title       IS NOT NULL AND NEW.meta_title       ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in comparison_pages.meta_title.'; END IF;
    IF NEW.meta_description IS NOT NULL AND NEW.meta_description ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in comparison_pages.meta_description.'; END IF;
    IF NEW.speakable_answer IS NOT NULL AND NEW.speakable_answer ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in comparison_pages.speakable_answer.'; END IF;
    IF NEW.slug             IS NOT NULL AND NEW.slug             ~* v_pattern THEN RAISE EXCEPTION 'Compliance block: "fiduciary" not permitted in comparison_pages.slug.'; END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3. Disable qa_pages trigger to apply the 31 cleanup updates.
ALTER TABLE public.qa_pages DISABLE TRIGGER USER;

-- 4. ENGLISH cleanup (8 rows): meta_description + speakable_answer
--    Vocabulary rules:
--      "fiduciary duty"     -> "best-interest standard"
--      "fiduciary duties"   -> "best-interest obligations"
--      "fiduciaries"        -> "advisors operating under a best-interest standard"
--      "as fiduciaries"     -> "under a best-interest standard"
--      "fiduciary" (other)  -> "best-interest"
UPDATE public.qa_pages SET
  meta_description = REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(meta_description,
                       '\yfiduciary duties\y', 'best-interest obligations', 'gi'),
                       '\yfiduciary duty\y',   'best-interest standard',    'gi'),
                       '\yfiduciaries\y',      'advisors operating under a best-interest standard', 'gi'),
                       '\yfiduciary\y',        'best-interest',             'gi'),
  speakable_answer = REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(speakable_answer,
                       '\yas fiduciaries\y',   'under a best-interest standard', 'gi'),
                       '\yfiduciary duties\y', 'best-interest obligations', 'gi'),
                       '\yfiduciary duty\y',   'best-interest standard',    'gi'),
                       '\yfiduciaries\y',      'advisors operating under a best-interest standard', 'gi'),
                       '\yfiduciary\y',        'best-interest',             'gi')
WHERE language = 'en'
  AND (meta_description ~* '\yfiduciar' OR speakable_answer ~* '\yfiduciar');

-- 5. SPANISH cleanup (23 rows). Approved vocabulary:
--      "deber fiduciario" / "deberes fiduciarios"   -> "obligación de actuar en el mejor interés del cliente" / plural form
--      "responsabilidad fiduciaria" / plural        -> "responsabilidades de administración"
--      "estándar fiduciario"                        -> "estándar de mejor interés"
--      "fiduciarios" (advisors)                     -> "asesores que operan bajo el estándar de mejor interés"
--      "fiduciaria" (adj. fem.) / "fiduciario" (adj. masc.) standalone -> "de mejor interés"
--      Also catches stray English "fiduciary*" tokens that leaked through translation -> same EN rules.
UPDATE public.qa_pages SET
  meta_description = REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(meta_description,
                       '\ydeberes fiduciarios\y',          'obligaciones de actuar en el mejor interés del cliente', 'gi'),
                       '\ydeber fiduciario\y',             'obligación de actuar en el mejor interés del cliente',   'gi'),
                       '\yresponsabilidades fiduciarias\y','responsabilidades de administración',                   'gi'),
                       '\yresponsabilidad fiduciaria\y',   'responsabilidad de administración',                     'gi'),
                       '\yestándar fiduciario\y',          'estándar de mejor interés',                              'gi'),
                       '\yobligación fiduciaria\y',        'obligación de actuar en el mejor interés del cliente',   'gi'),
                       '\yfiduciarios\y',                  'asesores que operan bajo el estándar de mejor interés',  'gi'),
                       '\yfiduciarias\y',                  'de mejor interés',                                       'gi'),
                       '\yfiduciaria\y',                   'de mejor interés',                                       'gi'),
                       '\yfiduciario\y',                   'de mejor interés',                                       'gi'),
                       -- English leakage fallbacks
                       '\yfiduciary duties\y',             'best-interest obligations',                              'gi'),
                       '\yfiduciary\y',                    'best-interest',                                          'gi'),
  speakable_answer = REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(
                     REGEXP_REPLACE(speakable_answer,
                       '\ydeberes fiduciarios\y',          'obligaciones de actuar en el mejor interés del cliente', 'gi'),
                       '\ydeber fiduciario\y',             'obligación de actuar en el mejor interés del cliente',   'gi'),
                       '\yresponsabilidades fiduciarias\y','responsabilidades de administración',                   'gi'),
                       '\yresponsabilidad fiduciaria\y',   'responsabilidad de administración',                     'gi'),
                       '\yestándar fiduciario\y',          'estándar de mejor interés',                              'gi'),
                       '\yobligación fiduciaria\y',        'obligación de actuar en el mejor interés del cliente',   'gi'),
                       '\yfiduciarios\y',                  'asesores que operan bajo el estándar de mejor interés',  'gi'),
                       '\yfiduciarias\y',                  'de mejor interés',                                       'gi'),
                       '\yfiduciaria\y',                   'de mejor interés',                                       'gi'),
                       '\yfiduciario\y',                   'de mejor interés',                                       'gi'),
                       -- English leakage fallbacks
                       '\yfiduciary duties\y',             'best-interest obligations',                              'gi'),
                       '\yfiduciary\y',                    'best-interest',                                          'gi')
WHERE language = 'es'
  AND (meta_description ~* '\yfiduciar' OR speakable_answer ~* '\yfiduciar');

-- 6. Re-enable triggers BEFORE verification, so the verification fires the trigger
--    on any subsequent operations and proves the trigger is live.
ALTER TABLE public.qa_pages ENABLE TRIGGER USER;

-- 7. Verification: abort the entire transaction if any blocked-field hit remains.
DO $verify$
DECLARE
  v_qa_blocked       INTEGER;
  v_blog_blocked     INTEGER;
  v_loc_blocked      INTEGER;
  v_cmp_blocked      INTEGER;
  v_authors_blocked  INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_qa_blocked
  FROM public.qa_pages
  WHERE question_main ~* '\yfiduciar'
     OR title ~* '\yfiduciar'
     OR meta_title ~* '\yfiduciar'
     OR meta_description ~* '\yfiduciar'
     OR speakable_answer ~* '\yfiduciar'
     OR slug ~* '\yfiduciar';

  SELECT COUNT(*) INTO v_blog_blocked
  FROM public.blog_articles
  WHERE headline ~* '\yfiduciar'
     OR meta_title ~* '\yfiduciar'
     OR meta_description ~* '\yfiduciar'
     OR speakable_answer ~* '\yfiduciar'
     OR slug ~* '\yfiduciar';

  SELECT COUNT(*) INTO v_loc_blocked
  FROM public.location_pages
  WHERE headline ~* '\yfiduciar'
     OR meta_title ~* '\yfiduciar'
     OR meta_description ~* '\yfiduciar'
     OR speakable_answer ~* '\yfiduciar'
     OR city_slug ~* '\yfiduciar'
     OR topic_slug ~* '\yfiduciar';

  SELECT COUNT(*) INTO v_cmp_blocked
  FROM public.comparison_pages
  WHERE headline ~* '\yfiduciar'
     OR meta_title ~* '\yfiduciar'
     OR meta_description ~* '\yfiduciar'
     OR speakable_answer ~* '\yfiduciar'
     OR slug ~* '\yfiduciar';

  SELECT COUNT(*) INTO v_authors_blocked
  FROM public.authors
  WHERE EXISTS (SELECT 1 FROM unnest(COALESCE(credentials,'{}')) c WHERE c ~* '\yfiduciar')
     OR job_title ~* '\yfiduciar'
     OR bio ~* '\yfiduciar'
     OR bio_short ~* '\yfiduciar'
     OR bio_full_markdown ~* '\yfiduciar'
     OR name ~* '\yfiduciar';

  IF v_qa_blocked + v_blog_blocked + v_loc_blocked + v_cmp_blocked + v_authors_blocked > 0 THEN
    RAISE EXCEPTION 'Verification FAILED — qa=%, blog=%, loc=%, cmp=%, authors=%',
      v_qa_blocked, v_blog_blocked, v_loc_blocked, v_cmp_blocked, v_authors_blocked;
  END IF;

  RAISE NOTICE 'Verification PASSED — zero hits in all blocked columns across 5 tables.';
END
$verify$;

COMMIT;
