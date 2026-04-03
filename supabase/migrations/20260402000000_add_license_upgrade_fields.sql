-- Add license upgrade tracking fields to contracting_agents
ALTER TABLE public.contracting_agents
  ADD COLUMN IF NOT EXISTS license_reminder_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS license_reminder_next_at timestamptz;

-- Initialize reminder schedule for existing unlicensed agents
UPDATE public.contracting_agents
SET license_reminder_next_at = now() + interval '3 days'
WHERE is_licensed = false AND license_reminder_next_at IS NULL;

-- Index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_agents_license_reminders
  ON public.contracting_agents (license_reminder_next_at)
  WHERE is_licensed = false;
