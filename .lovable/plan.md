

# Contracting Chat System: Agent-to-Team Messaging with Email Notifications

## Overview
Replace the current single-thread messaging model with a channel-based system that allows agents to chat directly with their manager, admin team, and contracting team. Each agent gets three dedicated chat channels. When a message is received, an email notification is sent to the recipient(s).

## Current State
- The `contracting_messages` table exists with `thread_id` (always the agent's ID) and `sender_id`
- All messages for an agent go into one thread -- no way to distinguish who the agent is talking to
- No email notifications on new messages
- The `ContractingMessages.tsx` page shows threads (admin/manager view) or a single thread (agent view)

## Database Changes

### Add `channel` column to `contracting_messages`
Add a `channel` text column to distinguish conversation targets:
- `"manager"` -- agent talks with their assigned manager
- `"admin"` -- agent talks with admin team
- `"contracting"` -- agent talks with contracting team

Default: `"general"` (for existing messages, backward compatible).

```
ALTER TABLE contracting_messages
ADD COLUMN channel text NOT NULL DEFAULT 'general';
```

No RLS policy changes needed -- the existing policies already allow the right people to read/write. The `channel` is simply a filter on top.

## New Edge Function: `notify-contracting-message`

**File:** `supabase/functions/notify-contracting-message/index.ts`

When a message is sent, the frontend calls this function (fire-and-forget) with `{ threadId, senderId, senderName, channel, messagePreview }`. The function determines the recipients based on the channel:

- **`manager` channel**: Look up the agent's `manager_id` in `contracting_agents`, get the manager's email, send notification
- **`admin` channel**: Query all agents with `contracting_role = 'admin'`, send email to each (excluding sender)
- **`contracting` channel**: Query all agents with `contracting_role = 'contracting'` or `'admin'`, send email to each (excluding sender)
- **Agent receives message** (sender is manager/admin/contracting): Look up the agent's email from `thread_id` and send notification

Uses the existing `RESEND_API_KEY` and branded email wrapper pattern from `notify-contracting-step`.

## UI Changes

### Agent Dashboard Chat Panel (`ContractingDashboard.tsx`)
Replace the existing single chat panel with a tabbed interface:
- Three tabs: **Manager**, **Admin**, **Contracting**
- Each tab filters messages by `channel`
- Sending a message includes the `channel` in the insert
- After sending, fire-and-forget call to `notify-contracting-message`
- If the agent has no manager assigned, the Manager tab shows "No manager assigned"

### ContractingMessages.tsx (Admin/Manager/Contracting View)
Update the thread list and message panel:
- Thread list shows agent name + channel indicator badge (color-coded)
- When selecting a thread, add channel tabs within the conversation to switch between channels
- Admin/contracting see all three channels per agent
- Managers see only the `manager` channel for their assigned agents
- Sending from this view also triggers the email notification edge function

## Technical Summary

| Item | Detail |
|---|---|
| Database migration | Add `channel` column to `contracting_messages` |
| New edge function | `supabase/functions/notify-contracting-message/index.ts` |
| Modified files | `ContractingDashboard.tsx` (agent chat panel), `ContractingMessages.tsx` (admin/manager view) |
| Existing secrets used | `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Email sender | `onboarding@everencewealth.com` |

