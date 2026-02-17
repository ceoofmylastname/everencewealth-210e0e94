
CREATE TABLE public.assessment_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  retirement_concern TEXT,
  age_range TEXT,
  tax_strategy_familiarity TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_leads ENABLE ROW LEVEL SECURITY;

-- Public-facing form: anyone can insert
CREATE POLICY "Anyone can submit assessment"
  ON public.assessment_leads
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read submissions
CREATE POLICY "Admins can read assessment leads"
  ON public.assessment_leads
  FOR SELECT
  USING (public.is_admin(auth.uid()));
