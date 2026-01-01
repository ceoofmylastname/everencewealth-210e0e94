-- Add author_bio_localized column to blog_articles for storing translated author bios
ALTER TABLE public.blog_articles 
ADD COLUMN IF NOT EXISTS author_bio_localized TEXT;