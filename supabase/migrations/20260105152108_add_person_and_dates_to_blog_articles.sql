-- Add date tracking columns
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS date_published TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS date_modified TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS author_id TEXT DEFAULT 'hans-beeckman',
ADD COLUMN IF NOT EXISTS author_photo_context TEXT DEFAULT 'blog';

-- Add comments
COMMENT ON COLUMN blog_articles.date_published IS 'Original publication date - set once, never auto-updated';
COMMENT ON COLUMN blog_articles.date_modified IS 'Last meaningful content update - only update when content changes';
COMMENT ON COLUMN blog_articles.author_id IS 'Fixed author identifier - always hans-beeckman';
COMMENT ON COLUMN blog_articles.author_photo_context IS 'Photo context: blog or qa';

-- Add trigger to prevent accidental date_published changes
CREATE OR REPLACE FUNCTION prevent_date_published_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.date_published IS NOT NULL AND NEW.date_published != OLD.date_published THEN
    RAISE EXCEPTION 'date_published cannot be changed once set';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_date_published_update ON blog_articles;
CREATE TRIGGER prevent_date_published_update
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_date_published_change();

-- Set initial dates for existing articles
UPDATE blog_articles 
SET 
  date_published = created_at,
  date_modified = updated_at,
  author_id = 'hans-beeckman',
  author_photo_context = 'blog'
WHERE date_published IS NULL;
