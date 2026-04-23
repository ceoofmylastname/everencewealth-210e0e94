ALTER TABLE public.qa_pages
  ALTER COLUMN featured_image_url DROP NOT NULL,
  ALTER COLUMN featured_image_alt DROP NOT NULL;