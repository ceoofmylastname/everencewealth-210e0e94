-- Rename faq_pages table to qa_pages
ALTER TABLE public.faq_pages RENAME TO qa_pages;

-- Rename faq_generation_jobs table to qa_generation_jobs
ALTER TABLE public.faq_generation_jobs RENAME TO qa_generation_jobs;

-- Rename columns in qa_pages
ALTER TABLE public.qa_pages RENAME COLUMN faq_type TO qa_type;
ALTER TABLE public.qa_pages RENAME COLUMN related_faqs TO related_qas;

-- Rename column in blog_articles
ALTER TABLE public.blog_articles RENAME COLUMN faq_entities TO qa_entities;

-- Update RLS policies for qa_pages (recreate with new names)
DROP POLICY IF EXISTS "Public can view published faq pages" ON public.qa_pages;
DROP POLICY IF EXISTS "Admins can manage faq pages" ON public.qa_pages;

CREATE POLICY "Public can view published qa pages" 
ON public.qa_pages 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage qa pages" 
ON public.qa_pages 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Update RLS policies for qa_generation_jobs (recreate with new names)
DROP POLICY IF EXISTS "Users can create jobs" ON public.qa_generation_jobs;
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.qa_generation_jobs;
DROP POLICY IF EXISTS "Service role can update jobs" ON public.qa_generation_jobs;

CREATE POLICY "Users can create qa jobs" 
ON public.qa_generation_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own qa jobs" 
ON public.qa_generation_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can update qa jobs" 
ON public.qa_generation_jobs 
FOR UPDATE 
USING (true);