
-- Add progress_pct column
ALTER TABLE contracting_agents ADD COLUMN IF NOT EXISTS progress_pct integer DEFAULT 0;

-- Delete old steps and re-seed with new stages
DELETE FROM contracting_agent_steps;
DELETE FROM contracting_steps;

INSERT INTO contracting_steps (title, description, stage, step_order, is_required, requires_upload) VALUES
  ('Submit Application', 'Complete the online intake form', 'intake_submitted', 1, true, false),
  ('Review Application Details', 'Admin reviews submitted application', 'intake_submitted', 2, true, false),
  ('Sign Agent Agreement', 'Review and sign the independent agent agreement', 'agreement_pending', 1, true, true),
  ('Submit W-9 Form', 'Provide completed W-9 tax form', 'agreement_pending', 2, true, true),
  ('Create SureLC Account', 'Set up SureLC account for contracting', 'surelc_setup', 1, true, false),
  ('Complete SureLC Profile', 'Fill in all required SureLC profile fields', 'surelc_setup', 2, true, false),
  ('Select Product Bundle', 'Choose your carrier bundle package', 'bundle_selected', 1, true, false),
  ('Confirm Bundle Selection', 'Review and confirm selected bundle', 'bundle_selected', 2, true, false),
  ('Select Carriers', 'Choose individual carriers from your bundle', 'carrier_selection', 1, true, false),
  ('Submit Carrier Appointments', 'Submit appointment paperwork to selected carriers', 'carrier_selection', 2, true, true),
  ('Submit Contracting Paperwork', 'All contracting documents submitted for review', 'contracting_submitted', 1, true, true),
  ('Contracting Under Review', 'Paperwork is being reviewed by carriers', 'contracting_submitted', 2, true, false),
  ('All Carriers Approved', 'All carrier appointments confirmed', 'contracting_approved', 1, true, false),
  ('E&O Insurance Verified', 'Errors & Omissions insurance policy confirmed', 'contracting_approved', 2, true, true),
  ('Final Review & Activation', 'Final review by management before full activation', 'completed', 1, true, false);

-- Create auto-advance trigger function
CREATE OR REPLACE FUNCTION public.auto_advance_pipeline_stage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
BEGIN
  IF NEW.status != 'completed' THEN RETURN NEW; END IF;

  v_agent_id := NEW.agent_id;

  SELECT pipeline_stage INTO v_current_stage
  FROM contracting_agents WHERE id = v_agent_id;

  SELECT COUNT(*) INTO v_total_required
  FROM contracting_steps WHERE stage = v_current_stage AND is_required = true;

  SELECT COUNT(*) INTO v_completed_required
  FROM contracting_agent_steps cas
  JOIN contracting_steps cs ON cs.id = cas.step_id
  WHERE cas.agent_id = v_agent_id
    AND cs.stage = v_current_stage
    AND cs.is_required = true
    AND cas.status = 'completed';

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

  IF v_total_required > 0 AND v_completed_required >= v_total_required THEN
    v_idx := array_position(v_stages, v_current_stage);
    IF v_idx IS NOT NULL AND v_idx < array_length(v_stages, 1) THEN
      v_next_stage := v_stages[v_idx + 1];
      UPDATE contracting_agents
      SET pipeline_stage = v_next_stage,
          updated_at = now(),
          completed_at = CASE WHEN v_next_stage = 'completed' THEN now() ELSE completed_at END
      WHERE id = v_agent_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_auto_advance_pipeline ON contracting_agent_steps;
CREATE TRIGGER trg_auto_advance_pipeline
  AFTER UPDATE ON contracting_agent_steps
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION auto_advance_pipeline_stage();
