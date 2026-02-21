

# Contracting Automation Engine: Event Emails + Escalating Reminders

## Overview
Build a centralized automation engine that sends branded emails on key contracting events and follows up with escalating reminders when agents stall on incomplete steps.

## Part 1: Event-Triggered Emails

Expand the existing `notify-contracting-step` edge function to handle all five event types. Each event sends a branded email to the agent and creates an in-app notification.

| Event | Trigger | Email To | Subject |
|---|---|---|---|
| Step Completed | Frontend calls after step upsert | Agent | "Step Completed: {step title}" |
| Stage Change | Frontend calls after stage advances | Agent + Manager | "Stage Update: {new stage}" |
| Manager Assignment | Admin assigns manager | Agent | "Your Manager Has Been Assigned" |
| Bundle Selection | Agent selects bundle | Agent + Contracting team | "Bundle Selected: {bundle name}" |
| Contracting Approved | Admin marks approved | Agent | Already exists -- keep as-is |

**File modified:** `supabase/functions/notify-contracting-step/index.ts`

New event types added to the same function:
- `step_completed` -- emails the agent confirming a step was finished
- `stage_changed` -- emails the agent (and their manager if assigned) about the new stage
- `manager_assigned` -- emails the agent introducing their manager with the manager's name and contact
- `bundle_selected` -- already partially handled, will add agent-facing email

The existing `contracting_approved` and `needs_info` handlers stay unchanged.

## Part 2: Reminder System

### New Database Table: `contracting_reminders`

Tracks scheduled reminders per agent per step. Each row represents a reminder sequence for one incomplete step.

| Column | Type | Purpose |
|---|---|---|
| id | uuid PK | |
| agent_id | uuid FK | The agent being reminded |
| step_id | uuid FK | The step that needs completing |
| stage | text | The pipeline stage |
| reminder_count | int (default 0) | How many reminders sent so far |
| last_sent_at | timestamptz | When the last reminder was sent |
| next_send_at | timestamptz | When the next reminder should fire |
| phase | text | 'daily', 'every_3_days', 'weekly' |
| is_active | boolean (default true) | Set to false when step is completed |
| created_at | timestamptz | |

**RLS:** Service role only (edge function access). No client-side reads needed.

**Unique constraint:** `(agent_id, step_id)` -- one reminder sequence per step per agent.

### Reminder Schedule Logic

The 15-reminder escalation pattern:
- **Phase 1 (Daily):** Reminders 1-5, sent once per day
- **Phase 2 (Every 3 days):** Reminders 6-10, sent every 3 days
- **Phase 3 (Weekly):** Reminders 11-15, sent every 7 days

After 15 reminders (about 7 weeks), the reminder stops and the manager is notified that the agent is unresponsive.

### New Edge Function: `process-contracting-reminders`

**File:** `supabase/functions/process-contracting-reminders/index.ts`

Called by a cron job every hour. It:
1. Queries `contracting_reminders` where `is_active = true` and `next_send_at <= now()`
2. For each due reminder:
   - Sends branded email to the agent: "Reminder: Complete your {step title}"
   - Increments `reminder_count`, updates `last_sent_at`
   - Calculates `next_send_at` based on current phase
   - If count reaches 15, sets `is_active = false` and emails the manager
3. Cross-checks `contracting_agent_steps` -- if the step is already completed, deactivates the reminder (stop condition)

### Auto-Create Reminders

When a stage changes (detected in the updated `notify-contracting-step`), the function:
1. Deactivates any reminders for the old stage's steps (they're done)
2. Creates new reminder rows for all required steps in the new stage
3. Sets `next_send_at` to 24 hours from now (first daily reminder)

### Auto-Stop Reminders

When a step is completed, the function deactivates the matching reminder row. This is handled in two places:
- In `notify-contracting-step` when `step_completed` is called
- In `process-contracting-reminders` as a safety check before sending

### Cron Job

A new cron schedule running every hour to process due reminders:
```
process-contracting-reminders: '0 * * * *'
```

## Part 3: Email Templates

All emails use the existing `brandedEmailWrapper` with Everence Wealth branding. Each event type gets a distinct subtitle and inner content:

- **Step Completed:** Green checkmark icon, step name, encouraging next-step message
- **Stage Change:** Progress bar visual, new stage name, what to expect next
- **Manager Assigned:** Manager's name, "reach out with questions" message
- **Bundle Selected:** Bundle name confirmation, next steps
- **Reminder:** Friendly nudge with step name, link to dashboard, reminder count ("This is reminder 3 of 15")

## Files Summary

| File | Action |
|---|---|
| `supabase/functions/notify-contracting-step/index.ts` | Modify -- add step_completed, stage_changed, manager_assigned handlers + reminder creation logic |
| `supabase/functions/process-contracting-reminders/index.ts` | Create -- cron-driven reminder processor |
| Database | Add `contracting_reminders` table |
| Cron | Add hourly `process-contracting-reminders` schedule |

## No Frontend Changes

All automation is backend-only. The existing frontend already calls `notify-contracting-step` on relevant events -- the new event types just need the correct `stageName` parameter passed from existing UI actions.

