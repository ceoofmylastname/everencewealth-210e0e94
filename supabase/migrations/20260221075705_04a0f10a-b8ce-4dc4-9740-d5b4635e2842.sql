
-- Add intake-specific columns to contracting_agents
ALTER TABLE public.contracting_agents
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS referring_director text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS is_licensed boolean DEFAULT false;
