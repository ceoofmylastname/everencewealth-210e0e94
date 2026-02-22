
CREATE OR REPLACE FUNCTION public.auto_advance_pipeline_stage()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_agent_id uuid;
  v_current_stage text;
  v_total_required int;
  v_completed_required int;
  v_total_steps int;
  v_completed_steps int;
  v_next_stage text;
  v_stages text[] := ARRAY[
    'intake_submitted','agreement_pending','surelc_setup',
    'bundle_selected','carrier_selection','contracting_submitted',
    'contracting_approved','completed'
  ];
  v_idx int;
  v_loop_count int := 0;
BEGIN
  IF NEW.status != 'completed' THEN RETURN NEW; END IF;

  v_agent_id := NEW.agent_id;

  -- Calculate overall progress first
  SELECT COUNT(*) INTO v_total_steps FROM contracting_steps WHERE is_required = true;
  SELECT COUNT(*) INTO v_completed_steps
  FROM contracting_agent_steps cas
  JOIN contracting_steps cs ON cs.id = cas.step_id
  WHERE cas.agent_id = v_agent_id AND cs.is_required = true AND cas.status = 'completed';

  UPDATE contracting_agents
  SET progress_pct = CASE WHEN v_total_steps > 0
    THEN ROUND((v_completed_steps::numeric / v_total_steps) * 100) ELSE 0 END,
    updated_at = now()
  WHERE id = v_agent_id;

  -- Cascading stage advancement loop
  SELECT pipeline_stage INTO v_current_stage
  FROM contracting_agents WHERE id = v_agent_id;

  LOOP
    v_loop_count := v_loop_count + 1;
    IF v_loop_count > 8 THEN EXIT; END IF;

    SELECT COUNT(*) INTO v_total_required
    FROM contracting_steps WHERE stage = v_current_stage AND is_required = true;

    SELECT COUNT(*) INTO v_completed_required
    FROM contracting_agent_steps cas
    JOIN contracting_steps cs ON cs.id = cas.step_id
    WHERE cas.agent_id = v_agent_id
      AND cs.stage = v_current_stage
      AND cs.is_required = true
      AND cas.status = 'completed';

    -- Advance if stage has no required steps OR all required steps are completed
    IF v_total_required = 0 OR v_completed_required >= v_total_required THEN
      v_idx := array_position(v_stages, v_current_stage);
      IF v_idx IS NOT NULL AND v_idx < array_length(v_stages, 1) THEN
        v_next_stage := v_stages[v_idx + 1];
        UPDATE contracting_agents
        SET pipeline_stage = v_next_stage,
            updated_at = now(),
            completed_at = CASE WHEN v_next_stage = 'completed' THEN now() ELSE completed_at END
        WHERE id = v_agent_id;
        v_current_stage := v_next_stage;
      ELSE
        EXIT;
      END IF;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;
