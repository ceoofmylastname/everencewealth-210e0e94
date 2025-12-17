-- Create faq_pages table
CREATE TABLE public.faq_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_article_id UUID NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  faq_type TEXT NOT NULL CHECK (faq_type IN ('core', 'decision')),
  
  -- Content Fields
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  question_main TEXT NOT NULL,
  answer_main TEXT NOT NULL,
  related_faqs JSONB DEFAULT '[]'::jsonb,
  speakable_answer TEXT NOT NULL,
  
  -- SEO Fields
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT,
  
  -- Image Fields (reused from source article)
  featured_image_url TEXT NOT NULL,
  featured_image_alt TEXT NOT NULL,
  featured_image_caption TEXT,
  
  -- Translation Links
  translations JSONB DEFAULT '{}'::jsonb,
  source_article_slug TEXT,
  
  -- Internal Links
  internal_links JSONB DEFAULT '[]'::jsonb,
  
  -- Author (from source article)
  author_id UUID REFERENCES authors(id),
  
  -- Status & Timestamps
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index for slug + language
CREATE UNIQUE INDEX faq_pages_slug_language_idx ON faq_pages(slug, language);
CREATE INDEX faq_pages_source_article_idx ON faq_pages(source_article_id);
CREATE INDEX faq_pages_status_idx ON faq_pages(status);
CREATE INDEX faq_pages_language_idx ON faq_pages(language);

-- Create faq_generation_jobs table for progress tracking
CREATE TABLE public.faq_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'partial')),
  mode TEXT NOT NULL DEFAULT 'single' CHECK (mode IN ('single', 'bulk')),
  languages TEXT[] DEFAULT ARRAY['en']::text[],
  
  -- Input
  article_ids UUID[] DEFAULT ARRAY[]::uuid[],
  
  -- Progress tracking
  total_articles INTEGER DEFAULT 0,
  processed_articles INTEGER DEFAULT 0,
  total_faq_pages INTEGER DEFAULT 0,
  generated_faq_pages INTEGER DEFAULT 0,
  
  -- Per-article status
  article_status JSONB DEFAULT '{}'::jsonb,
  
  -- Results
  results JSONB DEFAULT '[]'::jsonb,
  error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX faq_generation_jobs_user_idx ON faq_generation_jobs(user_id);
CREATE INDEX faq_generation_jobs_status_idx ON faq_generation_jobs(status);

-- Enable RLS
ALTER TABLE public.faq_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_generation_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for faq_pages
CREATE POLICY "Public can read published FAQ pages"
ON public.faq_pages FOR SELECT
USING (status = 'published');

CREATE POLICY "Authenticated users can manage FAQ pages"
ON public.faq_pages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS policies for faq_generation_jobs
CREATE POLICY "Users can view their own jobs"
ON public.faq_generation_jobs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs"
ON public.faq_generation_jobs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update jobs"
ON public.faq_generation_jobs FOR UPDATE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_faq_pages_updated_at
BEFORE UPDATE ON faq_pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_generation_jobs_updated_at
BEFORE UPDATE ON faq_generation_jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();