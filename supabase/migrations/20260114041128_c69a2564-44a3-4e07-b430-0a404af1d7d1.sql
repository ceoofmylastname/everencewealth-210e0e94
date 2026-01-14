-- Create table for tracking permanently removed URLs (410 Gone)
CREATE TABLE public.gone_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_path TEXT UNIQUE NOT NULL,
  reason TEXT,
  pattern_match BOOLEAN DEFAULT FALSE,
  marked_gone_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups on URL path
CREATE INDEX idx_gone_urls_path ON public.gone_urls(url_path);

-- Create table for tracking Googlebot hits on 410 URLs (monitoring)
CREATE TABLE public.gone_url_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_path TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  hit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_gone_url_hits_path ON public.gone_url_hits(url_path);
CREATE INDEX idx_gone_url_hits_time ON public.gone_url_hits(hit_at);

-- Enable RLS for admin access only
ALTER TABLE public.gone_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gone_url_hits ENABLE ROW LEVEL SECURITY;

-- RLS policies for gone_urls - admin only
CREATE POLICY "Admins can view gone_urls"
ON public.gone_urls FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert gone_urls"
ON public.gone_urls FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update gone_urls"
ON public.gone_urls FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete gone_urls"
ON public.gone_urls FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS policies for gone_url_hits - admin read only, public insert (for logging)
CREATE POLICY "Admins can view gone_url_hits"
ON public.gone_url_hits FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow anonymous insert for logging (edge function will do this)
CREATE POLICY "Allow insert for logging"
ON public.gone_url_hits FOR INSERT
TO anon, authenticated
WITH CHECK (true);