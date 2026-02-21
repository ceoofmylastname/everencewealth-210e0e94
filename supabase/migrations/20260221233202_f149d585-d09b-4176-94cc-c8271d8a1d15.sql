
-- Drop and recreate contracting_reminders with the correct schema for escalating reminders
DROP TABLE IF EXISTS public.contracting_reminders;

CREATE TABLE public.contracting_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.contracting_agents(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.contracting_steps(id) ON DELETE CASCADE,
  stage text NOT NULL,
  reminder_count integer NOT NULL DEFAULT 0,
  last_sent_at timestamptz,
  next_send_at timestamptz NOT NULL,
  phase text NOT NULL DEFAULT 'daily',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_agent_step UNIQUE (agent_id, step_id)
);

ALTER TABLE public.contracting_reminders ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reminders_active_next ON public.contracting_reminders (next_send_at) WHERE is_active = true;
