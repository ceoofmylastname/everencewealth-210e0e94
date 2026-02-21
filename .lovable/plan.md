

# Comprehensive Activity Logging for Contracting System

## Overview
Add activity log entries for every user action across the contracting portal. The `contracting_activity_logs` table already exists with the right schema (`action`, `agent_id`, `performed_by`, `description`, `metadata`, `created_at`). We just need to insert log rows at every action point.

## No Database Changes Needed
The existing `contracting_activity_logs` table already supports all required fields including a `metadata` JSONB column for storing contextual data.

## Actions to Log

| Action | File | Currently Logged? |
|---|---|---|
| Step completed (checkbox) | `ContractingDashboard.tsx` (admin view) | Yes |
| Document uploaded | `ContractingDashboard.tsx` (agent view) | Yes |
| Message sent | `ContractingDashboard.tsx` + `ContractingMessages.tsx` | No |
| Login | `PortalLogin.tsx` | No |
| Stage changed | `ContractingPipeline.tsx` | No |
| Agent added | `ContractingPipeline.tsx` | No |
| Manager assigned | `ContractingAdmin.tsx` | No |
| Pipeline stage changed (admin) | `ContractingAdmin.tsx` | No |
| Status changed (admin) | `ContractingAdmin.tsx` | No |
| Step toggled (detail view) | `ContractingAgentDetail.tsx` | No |
| File uploaded (detail view) | `ContractingAgentDetail.tsx` | No |
| Bundle created | `ContractingAdmin.tsx` | No |
| Needs info sent | `ContractingDashboard.tsx` | No |

## File Changes

### 1. `src/pages/portal/PortalLogin.tsx`
After successful login and portal user verification, insert a log entry:
- Action: `"login"`
- Look up the contracting agent by `auth_user_id` to get the `agent_id` and `performed_by`
- Description: `"Agent logged in"`
- Metadata: `{ role: portalUser.role }`

### 2. `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`
Add logging to two unlogged actions:

**Message sent (agent view, `handleSendMessage`):**
- Action: `"message_sent"`
- Description: `"Sent a message"`

**Needs info sent (`handleSendNeedsInfo`):**
- Action: `"needs_info_sent"`
- Agent ID: the target agent
- Performed by: current user
- Description: `"Information request sent"`

### 3. `src/pages/portal/advisor/contracting/ContractingMessages.tsx`
**Message sent (admin/manager view, `handleSend`):**
- Action: `"message_sent"`
- Description: `"Sent a message in thread"`

### 4. `src/pages/portal/advisor/contracting/ContractingPipeline.tsx`
**Agent added (`handleAddAgent`):**
- Action: `"agent_added"`
- Description: `"New agent added: {name}"`

**Stage changed (`moveStage`):**
- Action: `"stage_changed"`
- Description: `"Stage changed to {newStage}"`
- Metadata: `{ new_stage: newStage }`

### 5. `src/pages/portal/advisor/contracting/ContractingAdmin.tsx`
**`updateAgent` function** -- log every field change:
- Action: `"field_updated"`
- Description: `"{field} updated to {value}"` with human-readable mappings for `manager_id`, `pipeline_stage`, `status`
- Metadata: `{ field, value }`

**Bundle created (`createBundle`):**
- Action: `"bundle_created"`
- Description: `"Bundle created: {name}"`

### 6. `src/pages/portal/advisor/contracting/ContractingAgentDetail.tsx`
**Step toggled (`toggleStep`):**
- Action: `"step_completed"` or `"step_reopened"`
- Description: `"Step toggled to {status}"`

**File uploaded (`handleFileUpload`):**
- Action: `"document_uploaded"`
- Description: `"Document uploaded: {fileName}"`

## Implementation Pattern
Every log insert follows the same pattern (fire-and-forget to avoid blocking the UI):

```typescript
supabase.from("contracting_activity_logs").insert({
  agent_id: targetAgentId,
  performed_by: currentUserId,
  action: "action_name",
  description: "Human-readable description",
  metadata: { /* contextual data */ },
}).then(null, err => console.error("Activity log error:", err));
```

All inserts are non-blocking -- failures are logged to console but do not interrupt the user's workflow.
