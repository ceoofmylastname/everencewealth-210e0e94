-- Fix the orphan SV Q&A to join the correct hreflang group
UPDATE qa_pages
SET 
  hreflang_group_id = 'a0ee2e50-2c8d-4be9-8589-6c64659343e4',
  source_article_id = 'ccd1ecaf-2293-4ac0-8d37-2133b6aca145'
WHERE id = '6963ecda-a15e-4e1a-a2ae-c8059fce33b2';

-- Sync translations JSONB for the corrected hreflang group (a0ee2e50)
WITH group_siblings AS (
  SELECT id, language, slug
  FROM qa_pages
  WHERE hreflang_group_id = 'a0ee2e50-2c8d-4be9-8589-6c64659343e4'
    AND status = 'published'
),
translations_map AS (
  SELECT jsonb_object_agg(language, slug) as all_translations
  FROM group_siblings
)
UPDATE qa_pages
SET translations = tm.all_translations
FROM translations_map tm
WHERE hreflang_group_id = 'a0ee2e50-2c8d-4be9-8589-6c64659343e4';

-- Sync translations JSONB for the old hreflang group (689eff29) - now has one fewer member
WITH group_siblings AS (
  SELECT id, language, slug
  FROM qa_pages
  WHERE hreflang_group_id = '689eff29-b39a-4bb0-80b0-96f422e1b422'
    AND status = 'published'
),
translations_map AS (
  SELECT jsonb_object_agg(language, slug) as all_translations
  FROM group_siblings
)
UPDATE qa_pages
SET translations = tm.all_translations
FROM translations_map tm
WHERE hreflang_group_id = '689eff29-b39a-4bb0-80b0-96f422e1b422';