-- Create strategy_form_submissions table for storing strategy page form submissions
CREATE TABLE IF NOT EXISTS public.strategy_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contact Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  income_range TEXT,

  -- Form Source
  form_source TEXT NOT NULL, -- e.g., "Index Strategy", "Tax-Free Retirement", "Asset Protection", "Whole Life"
  page_url TEXT,

  -- UTM Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Metadata
  user_agent TEXT,
  language TEXT DEFAULT 'en',

  -- Status Management
  status TEXT DEFAULT 'new',
  assigned_to UUID,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.strategy_form_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (including anonymous) to INSERT submissions
CREATE POLICY "Anyone can insert strategy form submissions"
  ON public.strategy_form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can view submissions
CREATE POLICY "Authenticated users can view strategy form submissions"
  ON public.strategy_form_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update submissions
CREATE POLICY "Authenticated users can update strategy form submissions"
  ON public.strategy_form_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_strategy_form_submissions_updated_at
  BEFORE UPDATE ON public.strategy_form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for faster queries
CREATE INDEX idx_strategy_form_submissions_status ON public.strategy_form_submissions(status);
CREATE INDEX idx_strategy_form_submissions_created_at ON public.strategy_form_submissions(created_at DESC);
CREATE INDEX idx_strategy_form_submissions_form_source ON public.strategy_form_submissions(form_source);
CREATE INDEX idx_strategy_form_submissions_email ON public.strategy_form_submissions(email);

-- Add comment
COMMENT ON TABLE public.strategy_form_submissions IS 'Stores form submissions from strategy pages (Index Strategy, Tax-Free Retirement, Asset Protection, Whole Life)';
