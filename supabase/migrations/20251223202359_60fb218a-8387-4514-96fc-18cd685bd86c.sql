-- =====================================================
-- PHASE 0: DATABASE FOUNDATION FOR HREFLANG SYSTEM
-- Fixed: Cast UUID to text for MIN() operations
-- =====================================================

-- Step 1: Add missing columns to blog_articles
-- =====================================================
ALTER TABLE blog_articles
ADD COLUMN IF NOT EXISTS hreflang_group_id UUID,
ADD COLUMN IF NOT EXISTS source_language VARCHAR(2) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_blog_articles_hreflang_group 
ON blog_articles(hreflang_group_id);

-- Set content_type based on funnel_stage
UPDATE blog_articles
SET content_type = CASE
  WHEN funnel_stage = 'TOFU' THEN 'blog_tofu'
  WHEN funnel_stage = 'MOFU' THEN 'blog_mofu'
  WHEN funnel_stage = 'BOFU' THEN 'blog_bofu'
  ELSE 'blog_tofu'
END
WHERE content_type IS NULL;

-- Populate hreflang_group_id for existing blog articles
-- Articles in same cluster share the same hreflang_group_id
UPDATE blog_articles b1
SET hreflang_group_id = (
  SELECT id 
  FROM blog_articles b2 
  WHERE b2.cluster_id = b1.cluster_id 
    AND b2.is_primary = true
  LIMIT 1
)
WHERE hreflang_group_id IS NULL
  AND cluster_id IS NOT NULL;

-- For articles without cluster_id, use their own ID
UPDATE blog_articles
SET hreflang_group_id = id
WHERE hreflang_group_id IS NULL;

COMMENT ON COLUMN blog_articles.hreflang_group_id IS 'Groups the same content across 10 languages';
COMMENT ON COLUMN blog_articles.source_language IS 'Original language this content was created in (en=English)';
COMMENT ON COLUMN blog_articles.content_type IS 'Type: blog_tofu, blog_mofu, blog_bofu';

-- Step 2: Add missing columns to qa_pages
-- =====================================================
ALTER TABLE qa_pages
ADD COLUMN IF NOT EXISTS hreflang_group_id UUID,
ADD COLUMN IF NOT EXISTS source_language VARCHAR(2) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'qa';

CREATE INDEX IF NOT EXISTS idx_qa_pages_hreflang_group 
ON qa_pages(hreflang_group_id);

-- Group Q&A pages by source_article_id and question_main (using text cast for MIN)
UPDATE qa_pages q1
SET hreflang_group_id = (
  SELECT id
  FROM qa_pages q2
  WHERE q2.source_article_id = q1.source_article_id
    AND q2.question_main = q1.question_main
  ORDER BY q2.id::text
  LIMIT 1
)
WHERE hreflang_group_id IS NULL
  AND source_article_id IS NOT NULL;

-- Fallback: use own ID if no group found
UPDATE qa_pages
SET hreflang_group_id = id
WHERE hreflang_group_id IS NULL;

COMMENT ON COLUMN qa_pages.hreflang_group_id IS 'Groups the same Q&A across 10 languages';
COMMENT ON COLUMN qa_pages.source_language IS 'Must be "en" - Q&As must be extracted from English articles only';
COMMENT ON COLUMN qa_pages.content_type IS 'Always "qa"';

-- Step 3: Add missing columns to location_pages
-- =====================================================
ALTER TABLE location_pages
ADD COLUMN IF NOT EXISTS hreflang_group_id UUID,
ADD COLUMN IF NOT EXISTS source_language VARCHAR(2) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'location';

CREATE INDEX IF NOT EXISTS idx_location_pages_hreflang_group 
ON location_pages(hreflang_group_id);

-- Group location pages by city_slug + topic_slug combination
UPDATE location_pages l1
SET hreflang_group_id = (
  SELECT id
  FROM location_pages l2
  WHERE l2.city_slug = l1.city_slug 
    AND l2.topic_slug = l1.topic_slug
  ORDER BY l2.id::text
  LIMIT 1
)
WHERE hreflang_group_id IS NULL;

-- Fallback
UPDATE location_pages
SET hreflang_group_id = id
WHERE hreflang_group_id IS NULL;

COMMENT ON COLUMN location_pages.hreflang_group_id IS 'Groups same location page across 10 languages';
COMMENT ON COLUMN location_pages.source_language IS 'Original language (usually en)';
COMMENT ON COLUMN location_pages.content_type IS 'Always "location"';

-- Step 4: Add missing columns to comparison_pages
-- =====================================================
ALTER TABLE comparison_pages
ADD COLUMN IF NOT EXISTS hreflang_group_id UUID,
ADD COLUMN IF NOT EXISTS source_language VARCHAR(2) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'comparison';

CREATE INDEX IF NOT EXISTS idx_comparison_pages_hreflang_group 
ON comparison_pages(hreflang_group_id);

-- Group comparison pages by option_a + option_b
UPDATE comparison_pages c1
SET hreflang_group_id = (
  SELECT id
  FROM comparison_pages c2
  WHERE c2.option_a = c1.option_a 
    AND c2.option_b = c1.option_b
  ORDER BY c2.id::text
  LIMIT 1
)
WHERE hreflang_group_id IS NULL;

-- Fallback
UPDATE comparison_pages
SET hreflang_group_id = id
WHERE hreflang_group_id IS NULL;

COMMENT ON COLUMN comparison_pages.hreflang_group_id IS 'Groups same comparison across 10 languages';
COMMENT ON COLUMN comparison_pages.source_language IS 'Original language (usually en)';
COMMENT ON COLUMN comparison_pages.content_type IS 'Always "comparison"';

-- Step 5: Create helper view for hreflang tag generation
-- =====================================================
CREATE OR REPLACE VIEW hreflang_siblings AS
SELECT 
  'blog' as content_type,
  id,
  hreflang_group_id,
  language,
  slug,
  CONCAT('/', language, '/blog/', slug) as url_path
FROM blog_articles
WHERE status = 'published'

UNION ALL

SELECT 
  'qa' as content_type,
  id,
  hreflang_group_id,
  language,
  slug,
  CONCAT('/', language, '/qa/', slug) as url_path
FROM qa_pages
WHERE status = 'published'

UNION ALL

SELECT 
  'location' as content_type,
  id,
  hreflang_group_id,
  language,
  CONCAT(city_slug, '-', topic_slug) as slug,
  CONCAT('/', language, '/locations/', city_slug, '/', topic_slug) as url_path
FROM location_pages
WHERE status = 'published'

UNION ALL

SELECT 
  'comparison' as content_type,
  id,
  hreflang_group_id,
  language,
  slug,
  CONCAT('/', language, '/compare/', slug) as url_path
FROM comparison_pages
WHERE status = 'published';

COMMENT ON VIEW hreflang_siblings IS 'Unified view for generating hreflang tags across all content types';