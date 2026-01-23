-- Update the escalate_lead_to_next_round function to return fallback_admin_id
CREATE OR REPLACE FUNCTION public.escalate_lead_to_next_round(p_lead_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      'admin_agent_ids', v_next_config.agent_ids,
      'fallback_admin_id', v_next_config.fallback_admin_id
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
$function$;