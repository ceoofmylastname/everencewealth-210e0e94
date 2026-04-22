ALTER TABLE public.blog_articles 
  ALTER COLUMN featured_image_url DROP NOT NULL;

UPDATE public.cluster_generations 
SET status = 'failed', 
    error = 'featured_image_url NOT NULL constraint violation - fixed in this migration'
WHERE id = '007ecf30-7466-43e5-a5e2-cea3800ae5a3';