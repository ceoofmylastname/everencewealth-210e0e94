-- Create round robin configuration table for language-based agent routing
CREATE TABLE public.crm_round_robin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  agent_ids UUID[] NOT NULL,
  claim_window_minutes INTEGER DEFAULT 5,
  is_admin_fallback BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(language, round_number)
);

-- Add round tracking columns to crm_leads
ALTER TABLE public.crm_leads 
  ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS round_broadcast_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS round_escalated_at TIMESTAMPTZ;

-- Enable RLS on round robin config
ALTER TABLE public.crm_round_robin_config ENABLE ROW LEVEL SECURITY;

-- Admins can manage round robin config
CREATE POLICY "Admins can manage round robin config" 
ON public.crm_round_robin_config 
FOR ALL TO authenticated 
USING (public.is_admin(auth.uid()));

-- Agents can read round robin config
CREATE POLICY "Agents can read round robin config" 
ON public.crm_round_robin_config 
FOR SELECT TO authenticated 
USING (public.is_crm_agent(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_crm_round_robin_config_updated_at
  BEFORE UPDATE ON public.crm_round_robin_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get agents for a specific round
CREATE OR REPLACE FUNCTION public.get_round_agents(p_language TEXT, p_round INTEGER)
RETURNS TABLE(agent_id UUID) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT unnest(agent_ids) as agent_id
  FROM crm_round_robin_config
  WHERE language = p_language
    AND round_number = p_round
    AND is_active = true;
$$;

-- Create function to get next round config
CREATE OR REPLACE FUNCTION public.get_next_round_config(p_language TEXT, p_current_round INTEGER)
RETURNS TABLE(
  round_number INTEGER,
  agent_ids UUID[],
  claim_window_minutes INTEGER,
  is_admin_fallback BOOLEAN
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT round_number, agent_ids, claim_window_minutes, is_admin_fallback
  FROM crm_round_robin_config
  WHERE language = p_language
    AND round_number = p_current_round + 1
    AND is_active = true
  LIMIT 1;
$$;

-- Create function to escalate lead to next round
CREATE OR REPLACE FUNCTION public.escalate_lead_to_next_round(p_lead_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lead RECORD;
  v_next_config RECORD;
  v_result JSONB;
BEGIN
  -- Get lead info
  SELECT * INTO v_lead
  FROM crm_leads
  WHERE id = p_lead_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead not found');
  END IF;
  
  -- Skip if already claimed
  IF v_lead.lead_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead already claimed');
  END IF;
  
  -- Get next round config
  SELECT * INTO v_next_config
  FROM crm_round_robin_config
  WHERE language = v_lead.language
    AND round_number = v_lead.current_round + 1
    AND is_active = true;
  
  IF NOT FOUND THEN
    -- No more rounds - return for admin fallback
    RETURN jsonb_build_object(
      'success', true, 
      'action', 'admin_fallback',
      'lead_id', p_lead_id,
      'language', v_lead.language
    );
  END IF;
  
  -- Check if next round is admin fallback
  IF v_next_config.is_admin_fallback THEN
    RETURN jsonb_build_object(
      'success', true,
      'action', 'admin_fallback',
      'lead_id', p_lead_id,
      'language', v_lead.language,
      'admin_agent_ids', v_next_config.agent_ids
    );
  END IF;
  
  -- Escalate to next round
  UPDATE crm_leads
  SET 
    current_round = v_lead.current_round + 1,
    round_escalated_at = NOW(),
    round_broadcast_at = NOW(),
    claim_window_expires_at = NOW() + (v_next_config.claim_window_minutes || ' minutes')::INTERVAL
  WHERE id = p_lead_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'action', 'escalated',
    'lead_id', p_lead_id,
    'new_round', v_lead.current_round + 1,
    'agent_ids', v_next_config.agent_ids,
    'claim_window_minutes', v_next_config.claim_window_minutes
  );
END;
$$;

-- Enable realtime for round robin config
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_round_robin_config;