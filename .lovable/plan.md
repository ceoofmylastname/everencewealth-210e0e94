

# Simplified Checklist Step System

## What Already Exists
- `contracting_steps` table (step definitions)
- `contracting_agent_steps` table with `status`, `completed_by`, `completed_at`, `notes` columns
- `auto_advance_pipeline_stage` database trigger that automatically moves the pipeline when all required steps in a stage are completed

## The Change

Replace the current 15 granular steps with 6 clear, one-per-stage checklist items. The auto-advance trigger already handles pipeline movement -- no code changes needed.

### New Steps

| Step | Pipeline Stage | Upload Required |
|------|---------------|-----------------|
| Agreement Signed | agreement_pending | Yes |
| SureLC Screenshot Uploaded | surelc_setup | Yes |
| Bundle Selected | bundle_selected | No |
| Carriers Selected | carrier_selection | No |
| Contracting Submitted | contracting_submitted | Yes |
| Contracting Approved | contracting_approved | No |

The `intake_submitted` stage has no manual step (it completes automatically when the form is submitted). The `completed` stage is reached when all prior stages finish.

### Database Data Update
- Delete existing `contracting_agent_steps` records (old step references)
- Delete existing `contracting_steps` records
- Insert the 6 new steps

### How It Works
1. Manager/admin checks off "Agreement Signed" on the agent detail page
2. The `contracting_agent_steps` row is marked `completed` with `completed_by` and `completed_at`
3. The database trigger fires, sees all required steps for `agreement_pending` are done
4. Pipeline automatically advances to `surelc_setup`
5. Progress percentage recalculates

### Files Changed
No frontend or edge function changes needed. The dashboard and agent detail pages already dynamically load steps from the database, so they will automatically display the new 6-step checklist.

| Component | Impact |
|-----------|--------|
| Database (data only) | Replace seed data with 6 steps |
| `ContractingDashboard.tsx` | No change (reads steps dynamically) |
| `ContractingAgentDetail.tsx` | No change (reads steps dynamically) |
| `auto_advance_pipeline_stage` trigger | No change (already works with any step count) |

