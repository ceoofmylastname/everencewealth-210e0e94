

# Replace Pipeline Stages with New Onboarding Flow

## Overview

Replace the current 6-stage pipeline (Application, Background Check, Licensing, Carrier Appointments, Training, Active) with 8 new stages that better reflect the actual onboarding workflow. Add automatic stage advancement when all required steps in a stage are completed, and track progress percentage per agent.

## New Pipeline Stages

| Key | Label | Color |
|-----|-------|-------|
| intake_submitted | Intake Submitted | #3B82F6 |
| agreement_pending | Agreement Pending | #8B5CF6 |
| surelc_setup | SureLC Setup | #F59E0B |
| bundle_selected | Bundle Selected | #EC4899 |
| carrier_selection | Carrier Selection | #10B981 |
| contracting_submitted | Contracting Submitted | #6366F1 |
| contracting_approved | Contracting Approved | #14B8A6 |
| completed | Completed | #1A4D3E |

## Changes

### 1. Database -- Add auto-advance trigger + progress column

- Add a `progress_pct` column (integer, default 0) to `contracting_agents` for quick access to progress percentage.
- Replace old `contracting_steps` seed data with new steps mapped to the 8 new stages.
- Create a database trigger on `contracting_agent_steps`: when a step is marked `completed`, check if all required steps for that agent's current stage are done. If so, auto-advance `pipeline_stage` to the next stage, update `updated_at`, and set `completed_at` if the new stage is `completed`. Also recalculate `progress_pct`.

### 2. Edge Function -- `contracting-intake/index.ts`

- Change the default `pipeline_stage` from `"application"` to `"intake_submitted"` for new recruits.

### 3. Frontend -- 4 files updated

**`ContractingDashboard.tsx`**: Replace `PIPELINE_STAGES` array with the 8 new stages.

**`ContractingPipeline.tsx`**: Replace `PIPELINE_STAGES` array with the 8 new stages.

**`ContractingAgentDetail.tsx`**: Replace `STAGE_LABELS` map with the 8 new stage labels.

**`ContractingAdmin.tsx`**: Replace `STAGES` array with the 8 new stage keys.

### 4. Login Routing -- `PortalLogin.tsx`

- Update the condition from `pipeline_stage !== "active"` to `pipeline_stage !== "completed"` so agents route to the onboarding dashboard until they finish all stages.

## Technical Details

### Database Migration SQL

```text
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

  -- Count required steps in current stage
  SELECT COUNT(*) INTO v_total_required
  FROM contracting_steps WHERE stage = v_current_stage AND is_required = true;

  SELECT COUNT(*) INTO v_completed_required
  FROM contracting_agent_steps cas
  JOIN contracting_steps cs ON cs.id = cas.step_id
  WHERE cas.agent_id = v_agent_id
    AND cs.stage = v_current_stage
    AND cs.is_required = true
    AND cas.status = 'completed';

  -- Calculate overall progress
  SELECT COUNT(*) INTO v_total_steps FROM contracting_steps WHERE is_required = true;
  SELECT COUNT(*) INTO v_completed_steps
  FROM contracting_agent_steps cas
  JOIN contracting_steps cs ON cs.id = cas.step_id
  WHERE cas.agent_id = v_agent_id AND cs.is_required = true AND cas.status = 'completed';

  -- Update progress_pct
  UPDATE contracting_agents
  SET progress_pct = CASE WHEN v_total_steps > 0
    THEN ROUND((v_completed_steps::numeric / v_total_steps) * 100) ELSE 0 END,
    updated_at = now()
  WHERE id = v_agent_id;

  -- Auto-advance if all required steps done
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
```

### Files Changed Summary

| File | Change |
|------|--------|
| DB migration | New column, seed data, trigger |
| `contracting-intake/index.ts` | `pipeline_stage: "intake_submitted"` |
| `ContractingDashboard.tsx` | New PIPELINE_STAGES array |
| `ContractingPipeline.tsx` | New PIPELINE_STAGES array |
| `ContractingAgentDetail.tsx` | New STAGE_LABELS map |
| `ContractingAdmin.tsx` | New STAGES array |
| `PortalLogin.tsx` | `!== "completed"` instead of `!== "active"` |

