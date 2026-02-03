

# Create Lead Reassignment Edge Function

## Overview

Create a new edge function `reassign-lead` that enables admins to reassign leads from one agent to another, with automatic access revocation, timer management, and email notifications. This completes the admin workflow for handling SLA breaches.

---

## Architecture Context

The reassignment function is the final step in the SLA monitoring workflow:

```text
Lead Unclaimed (Stage 1)     Lead No Contact (Stage 2)
         │                            │
         ▼                            ▼
  check-claim-window-expiry    check-contact-window-expiry
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
              Admin Notified
                      │
                      ▼
              Admin Reassigns Lead
                      │
                      ▼
              reassign-lead (NEW)
                      │
           ┌──────────┼──────────┐
           │          │          │
           ▼          ▼          ▼
      Revoke Old   Reset     Email New
      Agent Access  Timers    Agent
```

---

## Database Prerequisites

### Existing Schema (Already Available)

The following already exist:
- `crm_leads` columns: `reassignment_count`, `previous_agent_id`, `reassignment_reason`, `reassigned_at`
- `crm_lead_reassignments` table with columns: `id`, `lead_id`, `from_agent_id`, `to_agent_id`, `reassigned_by`, `reason`, `stage`, `notes`, `created_at`
- `decrement_agent_lead_count(p_agent_id UUID)` function

### Required Migration

Need to create the missing `increment_agent_lead_count` function:

```sql
CREATE OR REPLACE FUNCTION increment_agent_lead_count(p_agent_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE crm_agents
  SET current_lead_count = COALESCE(current_lead_count, 0) + 1
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

---

## Deliverables

### 1. Database Migration

Create the `increment_agent_lead_count` function to match the existing decrement function.

### 2. New Edge Function

**File**: `supabase/functions/reassign-lead/index.ts`

The function will:
- Accept: `lead_id`, `to_agent_id`, `reason`, `notes`, `reassigned_by_id`
- Validate inputs and permissions
- Update lead assignment with timer management based on reason
- Record reassignment history in `crm_lead_reassignments`
- Update agent lead counts (decrement old, increment new)
- Revoke old agent's notifications (mark as read)
- Create new notification for target agent
- Log activity for audit trail
- Send email to new agent via Resend

### 3. Config.toml Update

Add new function configuration:
```toml
[functions.reassign-lead]
verify_jwt = false
```

---

## Function Logic

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lead_id` | UUID | Yes | The lead to reassign |
| `to_agent_id` | UUID | Yes | Target agent |
| `reason` | String | Yes | 'unclaimed' \| 'no_contact' \| 'manual' |
| `notes` | String | No | Admin notes |
| `reassigned_by_id` | UUID | Yes | Admin performing reassignment |

### Timer Handling by Reason

| Reason | Timer Actions |
|--------|---------------|
| `unclaimed` | Mark as claimed, clear claim timer, start new 5-min contact timer |
| `no_contact` | Reset contact timer to new 5-min window, clear contact_sla_breached |
| `manual` | No timer changes (standard reassignment) |

### Data Updates

**crm_leads table:**
- `assigned_agent_id` → new agent
- `previous_agent_id` → old agent
- `reassignment_count` → increment
- `reassignment_reason` → reason
- `reassigned_at` → now
- Timer fields based on reason

**crm_lead_reassignments table:**
- Insert new record with full history

**crm_agents table:**
- Decrement old agent's `current_lead_count`
- Increment new agent's `current_lead_count`

---

## Email Notification

The new agent receives an email with:
- Lead details (name, phone, email, source)
- Reason for reassignment
- Warning about 5-minute timer (for unclaimed/no_contact reasons)
- Direct link to lead detail page

---

## Implementation Flow

```text
reassign-lead called
         │
         ▼
    Validate inputs
         │
         ▼
    Fetch lead + old agent details
         │
         ▼
    Fetch new agent details
         │
         ▼
    Update lead assignment + timers
         │
         ▼
    Insert reassignment record
         │
         ▼
    Update agent lead counts
         │
         ▼
    Mark old agent notifications as read
         │
         ▼
    Create notification for new agent
         │
         ▼
    Log activity
         │
         ▼
    Send email to new agent
         │
         ▼
    Return success response
```

---

## Files to Create/Modify

1. **Create**: `supabase/functions/reassign-lead/index.ts`
2. **Modify**: `supabase/config.toml` - add function config
3. **Database**: Create `increment_agent_lead_count` function via migration

---

## Error Handling

The function handles:
- Missing required fields (400)
- Lead not found (404)
- Target agent not found (404)
- Database update failures (500)
- Email send failures (logged but non-blocking)

---

## Security

- Uses service role key for database operations
- Admin authentication should be verified by the calling frontend
- CORS headers enabled for browser access
- No JWT verification (admin operations)

---

## Verification Steps

After deployment:

1. Deploy the edge function
2. Test via admin UI or direct API call:
```json
{
  "lead_id": "<uuid>",
  "to_agent_id": "<uuid>",
  "reason": "unclaimed",
  "notes": "Test reassignment",
  "reassigned_by_id": "<admin-uuid>"
}
```
3. Verify:
   - Lead `assigned_agent_id` updated
   - `previous_agent_id` set correctly
   - `reassignment_count` incremented
   - Timer fields updated based on reason
   - Record in `crm_lead_reassignments`
   - New agent receives email
   - Activity logged

