
# Agent Contracting & Onboarding Platform

## Summary
Build a full contracting/onboarding workflow system inside the existing advisor portal. This adds a new "Contracting" section in the sidebar with its own sub-pages: Dashboard, Pipeline, Messages, Documents, and Admin. The system tracks agents through a step-based onboarding process with pipeline views, checklists, file uploads, messaging, automated reminders, and activity logs.

---

## Database Schema (7 new tables)

### 1. `contracting_agents`
Tracks individuals going through contracting -- both new recruits and existing advisors.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| portal_user_id | uuid FK nullable | Links to portal_users if existing advisor |
| auth_user_id | uuid | Links to auth.users |
| first_name | text | |
| last_name | text | |
| email | text | |
| phone | text nullable | |
| contracting_role | text | 'agent', 'manager', 'contracting', 'admin' |
| manager_id | uuid FK nullable | Self-ref to contracting_agents (manager) |
| pipeline_stage | text | 'application', 'background_check', 'licensing', 'carrier_appointments', 'training', 'active' |
| status | text | 'in_progress', 'completed', 'on_hold', 'rejected' |
| started_at | timestamptz | |
| completed_at | timestamptz nullable | |
| notes | text nullable | |
| created_at / updated_at | timestamptz | |

### 2. `contracting_steps`
Defines the master list of onboarding steps.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | e.g. "Submit Background Check" |
| description | text nullable | |
| stage | text | Which pipeline_stage this belongs to |
| step_order | int | Display order within stage |
| is_required | boolean | |
| requires_upload | boolean | |
| created_at | timestamptz | |

### 3. `contracting_agent_steps`
Tracks each agent's progress on each step.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| agent_id | uuid FK | contracting_agents |
| step_id | uuid FK | contracting_steps |
| status | text | 'pending', 'in_progress', 'completed', 'blocked' |
| completed_at | timestamptz nullable | |
| completed_by | uuid nullable | Who marked it done |
| notes | text nullable | |
| created_at / updated_at | timestamptz | |

### 4. `contracting_documents`
File uploads tied to agents/steps.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| agent_id | uuid FK | contracting_agents |
| step_id | uuid FK nullable | contracting_steps |
| file_name | text | |
| file_path | text | Storage path |
| file_size | bigint nullable | |
| uploaded_by | uuid FK | contracting_agents |
| created_at | timestamptz | |

### 5. `contracting_messages`
In-context messaging between agents, managers, and contracting staff.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| thread_id | uuid | Groups conversation (usually agent_id) |
| sender_id | uuid FK | contracting_agents |
| content | text | |
| is_read | boolean | |
| created_at | timestamptz | |

### 6. `contracting_activity_logs`
Audit trail for all actions.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| agent_id | uuid FK | contracting_agents |
| action | text | e.g. 'step_completed', 'document_uploaded', 'stage_changed' |
| description | text | Human-readable |
| performed_by | uuid FK | contracting_agents |
| metadata | jsonb nullable | Extra data |
| created_at | timestamptz | |

### 7. `contracting_reminders`
Automated reminder tracking.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| agent_id | uuid FK | |
| step_id | uuid FK nullable | |
| reminder_type | text | 'overdue_step', 'missing_document', 'stalled_pipeline' |
| sent_at | timestamptz nullable | |
| scheduled_for | timestamptz | |
| status | text | 'pending', 'sent', 'dismissed' |
| created_at | timestamptz | |

### Storage
- New bucket: `contracting-documents` (private)

### RLS Policies
- Agents: see own rows only (WHERE agent_id matches their contracting_agents.id)
- Managers: see agents WHERE manager_id = their id
- Contracting role: can update step statuses and pipeline stages for all agents
- Admins: full access to everything
- Uses a SECURITY DEFINER function `get_contracting_role(auth_uid)` to prevent recursion

### Realtime
- Enable realtime on `contracting_messages` and `contracting_agent_steps` for live updates

---

## UI Pages (6 new pages)

All under `/portal/advisor/contracting/*` using the existing PortalLayout sidebar.

### 1. Contracting Dashboard (`ContractingDashboard.tsx`)
- Stat cards: Total agents, In Progress, Completed, On Hold
- Pipeline stage breakdown (horizontal bar)
- Recent activity feed (from activity_logs)
- Overdue steps alert banner
- Quick actions: Add Agent, View Pipeline

### 2. Pipeline Board (`ContractingPipeline.tsx`)
- Kanban-style board with 6 columns (one per pipeline_stage)
- Each card shows agent name, progress %, days in stage
- Drag not required -- click to move between stages
- Filter by manager, status
- Toggle between Board view and Table view (spreadsheet-style)

### 3. Agent Detail (`ContractingAgentDetail.tsx`)
- Agent profile header with status badge
- Step-by-step checklist with completion toggles
- Document upload area per step (uses contracting-documents bucket)
- Progress bar showing overall completion
- Activity log for this agent
- Inline messaging thread

### 4. Messages (`ContractingMessages.tsx`)
- Thread list on left, message panel on right (mirrors existing portal messaging pattern)
- Threads grouped by agent
- Real-time updates via Supabase Realtime

### 5. Documents (`ContractingDocuments.tsx`)
- Filterable list of all uploaded documents
- Filter by agent, step, date
- Upload new documents with agent/step assignment
- Download via signed URLs (private bucket)

### 6. Admin View (`ContractingAdmin.tsx`)
- Spreadsheet-style table of all agents with inline editing
- Columns: Name, Email, Stage, Status, Progress %, Manager, Days Active, Actions
- Bulk actions: assign manager, change status
- Export capability
- Reminder management section

---

## Navigation Changes

Add "Contracting" group to advisor sidebar in `PortalLayout.tsx`:

```text
Contracting
  - Dashboard    /portal/advisor/contracting
  - Pipeline     /portal/advisor/contracting/pipeline
  - Messages     /portal/advisor/contracting/messages
  - Documents    /portal/advisor/contracting/documents
  - Admin        /portal/advisor/contracting/admin  (admin only)
```

---

## Edge Function: `contracting-reminders`
- Checks for overdue steps (step pending > X days)
- Checks stalled pipelines (no activity > X days)
- Sends email via Resend to agent and manager
- Creates contracting_reminders records
- Triggered via cron (daily)

---

## Design System
Follows the existing portal design:
- Light mode, bg #F8F9FA, cards white with `rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]`
- Primary #1A4D3E, accent #EBD975
- 3D hover lift effect on interactive cards
- Clean Notion + Pipedrive aesthetic with minimal chrome

---

## Files to Create/Modify

| File | Action |
|---|---|
| Database migration | 7 tables + RLS + storage bucket + realtime |
| `src/pages/portal/advisor/contracting/ContractingDashboard.tsx` | Create |
| `src/pages/portal/advisor/contracting/ContractingPipeline.tsx` | Create |
| `src/pages/portal/advisor/contracting/ContractingAgentDetail.tsx` | Create |
| `src/pages/portal/advisor/contracting/ContractingMessages.tsx` | Create |
| `src/pages/portal/advisor/contracting/ContractingDocuments.tsx` | Create |
| `src/pages/portal/advisor/contracting/ContractingAdmin.tsx` | Create |
| `src/hooks/useContractingAuth.ts` | Create -- helper to get contracting role |
| `src/components/portal/PortalLayout.tsx` | Add Contracting nav group |
| `src/App.tsx` | Add contracting routes |
| `supabase/functions/contracting-reminders/index.ts` | Create -- daily reminder edge function |

---

## Implementation Order

Due to the size, this will be built in phases:

**Phase 1** (this prompt): Database migration + Dashboard + Pipeline board + Agent Detail page + navigation/routing changes

**Phase 2** (follow-up): Messages + Documents + Admin spreadsheet view

**Phase 3** (follow-up): Edge function for reminders + email notifications + activity log enhancements
