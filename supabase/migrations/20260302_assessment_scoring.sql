-- Add scoring columns and new question columns to assessment_leads
ALTER TABLE public.assessment_leads
  -- New question answers
  ADD COLUMN IF NOT EXISTS savings_status TEXT,
  ADD COLUMN IF NOT EXISTS income_range TEXT,
  ADD COLUMN IF NOT EXISTS tax_diversification TEXT,
  ADD COLUMN IF NOT EXISTS insurance_coverage TEXT,
  ADD COLUMN IF NOT EXISTS market_volatility TEXT,
  ADD COLUMN IF NOT EXISTS retirement_plan_formality TEXT,
  ADD COLUMN IF NOT EXISTS legacy_planning TEXT,

  -- Scoring results
  ADD COLUMN IF NOT EXISTS overall_score INTEGER,
  ADD COLUMN IF NOT EXISTS score_savings INTEGER,
  ADD COLUMN IF NOT EXISTS score_tax INTEGER,
  ADD COLUMN IF NOT EXISTS score_protection INTEGER,
  ADD COLUMN IF NOT EXISTS score_timeline INTEGER,
  ADD COLUMN IF NOT EXISTS score_tier TEXT,
  ADD COLUMN IF NOT EXISTS recommendations JSONB,

  -- Email tracking
  ADD COLUMN IF NOT EXISTS results_email_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS results_email_sent_at TIMESTAMPTZ,

  -- UTM tracking
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS page_url TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Add indexes for analytics
CREATE INDEX IF NOT EXISTS idx_assessment_leads_overall_score
  ON public.assessment_leads(overall_score);
CREATE INDEX IF NOT EXISTS idx_assessment_leads_score_tier
  ON public.assessment_leads(score_tier);
CREATE INDEX IF NOT EXISTS idx_assessment_leads_created_at
  ON public.assessment_leads(created_at DESC);

COMMENT ON COLUMN public.assessment_leads.overall_score IS 'Retirement Readiness Score 0-100';
COMMENT ON COLUMN public.assessment_leads.score_tier IS 'excellent | good | fair | needs_attention';
COMMENT ON COLUMN public.assessment_leads.recommendations IS 'JSON array of personalized service recommendations';
