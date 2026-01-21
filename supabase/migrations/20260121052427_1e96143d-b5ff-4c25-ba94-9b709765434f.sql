-- Add role column to crm_agents
ALTER TABLE public.crm_agents 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'agent';

-- Add check constraint for role
ALTER TABLE public.crm_agents 
DROP CONSTRAINT IF EXISTS crm_agents_role_check;

ALTER TABLE public.crm_agents 
ADD CONSTRAINT crm_agents_role_check 
CHECK (role IN ('agent', 'admin'));

-- Enable Realtime on CRM tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_reminders;

-- Create claim_lead function with race condition protection
CREATE OR REPLACE FUNCTION public.claim_lead(
  p_lead_id UUID,
  p_agent_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lead RECORD;
  v_agent RECORD;
  v_result JSONB;
BEGIN
  -- Lock the lead row for update
  SELECT * INTO v_lead
  FROM crm_leads
  WHERE id = p_lead_id
  FOR UPDATE NOWAIT;
  
  -- Check if lead exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead not found');
  END IF;
  
  -- Check if already claimed
  IF v_lead.lead_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead already claimed');
  END IF;
  
  -- Get agent info
  SELECT * INTO v_agent
  FROM crm_agents
  WHERE id = p_agent_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Agent not found or inactive');
  END IF;
  
  -- Check if agent can accept more leads
  IF v_agent.current_lead_count >= v_agent.max_active_leads THEN
    RETURN jsonb_build_object('success', false, 'error', 'Agent at maximum lead capacity');
  END IF;
  
  -- Check language match
  IF NOT (v_lead.language = ANY(v_agent.languages)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Language mismatch');
  END IF;
  
  -- Claim the lead
  UPDATE crm_leads
  SET 
    lead_claimed = true,
    assigned_agent_id = p_agent_id,
    assigned_at = NOW(),
    assignment_method = 'claimed'
  WHERE id = p_lead_id;
  
  -- Increment agent lead count
  UPDATE crm_agents
  SET current_lead_count = current_lead_count + 1
  WHERE id = p_agent_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'lead_id', p_lead_id,
    'agent_id', p_agent_id,
    'claimed_at', NOW()
  );
  
EXCEPTION
  WHEN lock_not_available THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead is being claimed by another agent');
END;
$$;

-- Create function to notify other agents when lead is claimed
CREATE OR REPLACE FUNCTION public.notify_lead_claimed(
  p_lead_id UUID,
  p_claiming_agent_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update notifications for other agents to mark as claimed
  UPDATE crm_notifications
  SET 
    notification_type = 'lead_claimed',
    title = 'Lead Already Claimed',
    message = 'This lead was claimed by another agent',
    read = true,
    read_at = NOW()
  WHERE lead_id = p_lead_id
    AND agent_id != p_claiming_agent_id
    AND notification_type = 'new_lead_available';
END;
$$;

-- Add index for faster claim queries
CREATE INDEX IF NOT EXISTS idx_crm_leads_claimable 
ON crm_leads(lead_claimed, language) 
WHERE lead_claimed = false;