-- Add date_published and date_modified columns to qa_pages
ALTER TABLE qa_pages 
ADD COLUMN IF NOT EXISTS date_published TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS date_modified TIMESTAMPTZ;

-- Create trigger function to protect date_published (matches blog_articles pattern)
CREATE OR REPLACE FUNCTION public.protect_qa_date_published()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.date_published IS NOT NULL 
     AND NEW.date_published IS DISTINCT FROM OLD.date_published THEN
    RAISE EXCEPTION 'date_published cannot be changed once set. Use date_modified for content updates.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to enforce protection
DROP TRIGGER IF EXISTS protect_qa_date_published_trigger ON qa_pages;
CREATE TRIGGER protect_qa_date_published_trigger
BEFORE UPDATE ON qa_pages
FOR EACH ROW EXECUTE FUNCTION public.protect_qa_date_published();

-- Backfill existing Q&As with dates and author
UPDATE qa_pages
SET 
  date_published = COALESCE(date_published, created_at),
  date_modified = COALESCE(date_modified, updated_at),
  author_id = '738c1e24-025b-4f15-ac7c-541bb8a5dade'
WHERE date_published IS NULL 
   OR date_modified IS NULL 
   OR author_id IS NULL;