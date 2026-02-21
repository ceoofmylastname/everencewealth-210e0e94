

# SureLC Screenshot Upload Step for Agents

## What This Does
Adds the ability for agents to upload a SureLC screenshot directly from their personal dashboard. When the file is uploaded, the step is automatically marked complete, the file is stored securely, and activity is logged.

## Current State
- The `contracting_steps` table already has a SureLC step (`surelc_setup` stage, `requires_upload: true`).
- The agent dashboard checklist currently shows steps as read-only icons -- agents cannot upload files.
- The `contracting-documents` storage bucket already exists (private).

## Changes

### 1. Update AgentDashboard Checklist (UI)
**File:** `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`

For steps where `requires_upload` is true (the SureLC step), show an upload button next to the step in the agent's current stage checklist. This allows agents to:
- Click an upload icon to select an image/file
- See a loading indicator while uploading
- See the step automatically marked as completed after successful upload

This requires:
- Adding `requires_upload` to the `StepRow` interface
- Including `requires_upload` in the steps query
- Adding `Upload` icon import from lucide-react
- Adding upload state (`uploading`) and a `handleStepUpload` function
- Rendering the upload button for steps with `requires_upload: true` that are not yet completed

### 2. Upload and Completion Logic
When an agent uploads a file:
1. **Store file** in `contracting-documents` bucket at path `{agentId}/surelc/{timestamp}_{filename}`
2. **Insert record** into `contracting_documents` table with `agent_id`, `step_id`, `file_name`, `file_path`, `file_size`, `uploaded_by`
3. **Mark step complete** by upserting into `contracting_agent_steps` with `status: 'completed'`, `completed_at: now()`, `completed_by: agentId`
4. **Log activity** in `contracting_activity_logs` with description "SureLC profile completed"
5. **Refresh data** to reflect the completed step and updated progress

The existing `auto_advance_pipeline_stage` trigger will automatically fire when the step is marked complete, advancing the agent to the next stage if all required steps are done.

### 3. Show Uploaded Documents
After upload, show the uploaded file name beneath the step (matching the pattern used in `ContractingAgentDetail.tsx`). This requires fetching documents for the agent filtered by step_id.

## Technical Details

### File Modified
- `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`

### No Database or Schema Changes Needed
- The `contracting_steps` row already exists with `requires_upload: true`
- The `contracting-documents` bucket exists
- The `contracting_documents`, `contracting_agent_steps`, and `contracting_activity_logs` tables all exist
- The `auto_advance_pipeline_stage` trigger handles stage progression automatically
