-- =====================================================================
-- PROMPT 27 — Soft 404 sweep + slug-suffix dedup
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Bucket A: 410 sweep (literal soft-404 URLs)
-- ---------------------------------------------------------------------
-- Note: most legacy blog category paths are already short-circuited to
-- 410 by STRUCTURAL_410_PATTERNS in functions/_middleware.js. These rows
-- are defense-in-depth so any future middleware change still 410s them.

INSERT INTO public.gone_urls (url_path, reason) VALUES
  ('/blog/category/buying property',                                                    'legacy /blog/category/ prefix'),
  ('/blog/category/retirement planning',                                                'legacy /blog/category/ prefix'),
  ('/en/blog/costadelsol/financing-options',                                            'costa del sol artifact'),
  ('/en/blog/costadelsol/legal-guide',                                                  'costa del sol artifact'),
  ('/en/blog/costadelsol/real-estate-trends',                                           'costa del sol artifact'),
  ('/en/blog/costadelsol/sustainable-investments',                                      'costa del sol artifact'),
  ('/en/blog/financial-planning/reduce-tax-liabilities',                                'old category hierarchy'),
  ('/en/blog/insurance-management/annuity-planning',                                    'old category hierarchy'),
  ('/en/blog/insurance-management/disability-significance',                             'old category hierarchy'),
  ('/en/blog/insurance-management/roles-and-uses',                                      'old category hierarchy'),
  ('/en/blog/insurance-management/understanding-structures',                            'old category hierarchy'),
  ('/en/blog/insurance-management/whole-life-benefits',                                 'old category hierarchy'),
  ('/en/blog/insurance-strategies/uncover-potential',                                   'old category hierarchy'),
  ('/en/blog/investment-strategies/cash-flow-importance',                               'old category hierarchy'),
  ('/en/blog/investment/portfolio-diversification-strategies',                          'old category hierarchy'),
  ('/en/blog/retirement-planning/secure-future',                                        'old category hierarchy'),
  ('/en/blog/retirement/impact-of-roth-conversions',                                    'old category hierarchy'),
  ('/en/retirement-planning/wealth-protection-florida-es',                              'costa del sol retirement variant'),
  ('/es/stories',                                                                        'never existed'),
  ('/es/qa/qu-pasos-prcticos-mitigan-el-dficit-de-ahorro-process-es-b1e3dfdd',          'slug-suffix duplicate, canonical kept')
ON CONFLICT (url_path) DO NOTHING;

-- Audit-then-410 the wealth-management & charitable-giving paths only if
-- they have no live blog_articles match.
DO $$
DECLARE
  v_paths TEXT[] := ARRAY[
    '/en/blog/wealth-management/charitable-giving-strategies',
    '/en/blog/wealth-management/estate-planning-essentials'
  ];
  v_path TEXT;
  v_slug TEXT;
  v_live_count INT;
BEGIN
  FOREACH v_path IN ARRAY v_paths LOOP
    v_slug := split_part(v_path, '/', 5);
    SELECT count(*) INTO v_live_count
    FROM public.blog_articles
    WHERE language = 'en' AND slug = v_slug;
    IF v_live_count = 0 THEN
      INSERT INTO public.gone_urls (url_path, reason)
      VALUES (v_path, 'old category hierarchy (audit-confirmed orphan)')
      ON CONFLICT (url_path) DO NOTHING;
    END IF;
  END LOOP;
END $$;


-- ---------------------------------------------------------------------
-- 2. Slug-dedup audit table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slug_dedup_log (
  id            BIGSERIAL PRIMARY KEY,
  table_name    TEXT NOT NULL,
  language      TEXT NOT NULL,
  original_slug TEXT NOT NULL,
  canonical_slug TEXT NOT NULL,
  action        TEXT NOT NULL CHECK (action IN ('renamed','merged','deferred_manual')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.slug_dedup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "slug_dedup_log: admin read"
  ON public.slug_dedup_log FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "slug_dedup_log: admin write"
  ON public.slug_dedup_log FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));


-- ---------------------------------------------------------------------
-- 3. Slug-suffix dedup: qa_pages
--    (blog_articles confirmed to have 0 matching rows)
-- ---------------------------------------------------------------------
DO $$
DECLARE
  r            RECORD;
  v_canonical  TEXT;
  v_exists_id  UUID;
  v_url_path   TEXT;
  v_count_renamed INT := 0;
  v_count_merged  INT := 0;
  v_count_deferred INT := 0;
BEGIN
  FOR r IN
    SELECT id, language, slug
    FROM public.qa_pages
    WHERE slug ~ '-process-(en|es|de|fr)-[0-9a-f]{8}$'
    ORDER BY language, slug
  LOOP
    v_canonical := regexp_replace(r.slug, '-process-(en|es|de|fr)-[0-9a-f]{8}$', '');

    -- Check if canonical already exists in same language
    SELECT id INTO v_exists_id
    FROM public.qa_pages
    WHERE language = r.language AND slug = v_canonical
    LIMIT 1;

    IF v_exists_id IS NOT NULL THEN
      -- Case 1: canonical exists → merge (delete suffixed + 410 the old URL)
      v_url_path := '/' || r.language || '/qa/' || r.slug;
      INSERT INTO public.gone_urls (url_path, reason)
      VALUES (v_url_path, 'slug-suffix dedup, canonical kept')
      ON CONFLICT (url_path) DO NOTHING;

      DELETE FROM public.qa_pages WHERE id = r.id;

      INSERT INTO public.slug_dedup_log (table_name, language, original_slug, canonical_slug, action)
      VALUES ('qa_pages', r.language, r.slug, v_canonical, 'merged');
      v_count_merged := v_count_merged + 1;
    ELSE
      -- Case 2: canonical does not exist → rename
      BEGIN
        UPDATE public.qa_pages SET slug = v_canonical WHERE id = r.id;
        INSERT INTO public.slug_dedup_log (table_name, language, original_slug, canonical_slug, action)
        VALUES ('qa_pages', r.language, r.slug, v_canonical, 'renamed');
        v_count_renamed := v_count_renamed + 1;
      EXCEPTION WHEN unique_violation THEN
        -- Race: another row took the canonical between SELECT and UPDATE → defer
        INSERT INTO public.slug_dedup_log (table_name, language, original_slug, canonical_slug, action)
        VALUES ('qa_pages', r.language, r.slug, v_canonical, 'deferred_manual');
        v_count_deferred := v_count_deferred + 1;
      END;
    END IF;
  END LOOP;

  RAISE NOTICE 'qa_pages dedup: % renamed, % merged, % deferred',
    v_count_renamed, v_count_merged, v_count_deferred;
END $$;