-- Create table to track article image issues
CREATE TABLE public.article_image_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('duplicate', 'text_detected', 'expired_url')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  details JSONB DEFAULT '{}',
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, issue_type)
);

-- Enable RLS
ALTER TABLE public.article_image_issues ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read
CREATE POLICY "Authenticated users can read image issues"
ON public.article_image_issues
FOR SELECT
TO authenticated
USING (true);

-- Create policy for authenticated users to insert/update
CREATE POLICY "Authenticated users can manage image issues"
ON public.article_image_issues
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_article_image_issues_article_id ON public.article_image_issues(article_id);
CREATE INDEX idx_article_image_issues_issue_type ON public.article_image_issues(issue_type);
CREATE INDEX idx_article_image_issues_severity ON public.article_image_issues(severity);
CREATE INDEX idx_article_image_issues_unresolved ON public.article_image_issues(resolved_at) WHERE resolved_at IS NULL;

-- Add comment
COMMENT ON TABLE public.article_image_issues IS 'Tracks problematic article images: duplicates, text detected, expired URLs';