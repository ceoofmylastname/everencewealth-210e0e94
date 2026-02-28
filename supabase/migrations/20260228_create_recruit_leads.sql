-- Create recruit_leads table for the Everence Wealth recruiting portal
CREATE TABLE IF NOT EXISTS public.recruit_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  audit_score INTEGER NOT NULL DEFAULT 0,
  video_watch_time NUMERIC DEFAULT 0,
  audit_answers JSONB DEFAULT '{}',
  status TEXT DEFAULT 'audit_passed',
  interview_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.recruit_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public recruiting form)
CREATE POLICY "Allow anonymous insert" ON public.recruit_leads
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated reads (admin dashboard)
CREATE POLICY "Allow authenticated read" ON public.recruit_leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add index on email for deduplication queries
CREATE INDEX IF NOT EXISTS idx_recruit_leads_email ON public.recruit_leads (email);

-- Add index on created_at for recent leads queries
CREATE INDEX IF NOT EXISTS idx_recruit_leads_created ON public.recruit_leads (created_at DESC);
