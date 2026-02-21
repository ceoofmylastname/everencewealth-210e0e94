

# Checkbox-Triggered Notifications and Emails

## Overview
When an admin/manager checks a step in the manager dashboard, the system will trigger stage-specific notifications and emails based on which stage the step belongs to.

## Notification Rules

| Stage Checked | Action |
|---|---|
| `contracting_submitted` | Create in-app notification for contracting team members |
| `contracting_approved` | Send congratulations email to agent + in-app notification |
| `bundle_selected` | Create in-app notification for contracting team members |
| Any step marked "needs info" | Send email to agent requesting info (future -- currently steps are binary complete/incomplete, so this will be handled as a manual action via chat or a new "needs info" button) |

## Changes

### 1. New Edge Function: `notify-contracting-step`

**File:** `supabase/functions/notify-contracting-step/index.ts`

Accepts a POST with `{ agentId, stageName, stepTitle }` and performs the appropriate action:

- **`contracting_submitted`**: Query all agents with `contracting_role = 'contracting'` or `'admin'`, insert a `contracting_notifications` row for each with title "Contracting Submitted" and link to the agent's profile.

- **`contracting_approved`**: Send a congratulations email to the agent's email address via Resend (using the existing `RESEND_API_KEY` and the branded email wrapper pattern from `send-portal-invitation`). Also insert an in-app notification for the agent.

- **`bundle_selected`**: Same as `contracting_submitted` -- notify contracting team members via in-app notifications.

- **Needs Info**: Add a "Needs Info" button next to each agent row in the table. Clicking it opens a small dialog for a message, then calls the edge function with `stageName = 'needs_info'` and the custom message. The function sends an email to the agent with the message content.

### 2. Update `handleStepComplete` in ManagerDashboard

After successfully marking a step complete and logging activity, call the new edge function:

```
await supabase.functions.invoke("notify-contracting-step", {
  body: { agentId, stageName: agent.pipeline_stage, stepTitle: nextStep.title }
});
```

This is fire-and-forget -- notification failures won't block the step completion.

### 3. Add "Needs Info" Button to Table

Add a small icon button (e.g., `MessageSquareWarning`) in each agent row. Clicking it opens a dialog with a textarea for the admin to type a message, then calls the edge function with `stageName: "needs_info"` and `message` in the body. The function sends an email to the agent's address.

### 4. Edge Function Details

The function uses:
- `RESEND_API_KEY` (already configured) for sending emails
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` for inserting notifications
- The branded email wrapper from `send-portal-invitation` for consistent styling
- Sender: `onboarding@everencewealth.com`

Email templates:
- **Congratulations**: "Congratulations! Your contracting has been approved. You're now ready to start writing business."
- **Needs Info**: "Your contracting team needs additional information: [message]. Please log in to your dashboard to respond."

### 5. No Database Changes Required

The `contracting_notifications` table already has all needed columns (`agent_id`, `title`, `message`, `notification_type`, `link`). The `contracting_agents` table has `email` for sending emails. No schema changes needed.

## Technical Summary

| Item | Detail |
|---|---|
| New edge function | `supabase/functions/notify-contracting-step/index.ts` |
| Modified file | `src/pages/portal/advisor/contracting/ContractingDashboard.tsx` |
| New UI element | "Needs Info" icon button + dialog in table rows |
| Existing secrets used | `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Database changes | None |

