

# Fix Contracting Messages: Permissions, Routing, and Email Notifications

## Current Problems

1. **Managers cannot insert messages** -- The RLS INSERT policy only allows the sender themselves (if sender_id matches their contracting agent ID), contracting roles, or portal admins. Managers are excluded, so they get a row-level security error when trying to message an agent.

2. **No email notifications on messages** -- When anyone sends a message, it's saved to the database but no email is sent. The existing `notify-contracting-step` edge function handles step/stage events but not chat messages.

3. **Admin cannot message managers directly** -- The thread model uses `thread_id = agent_id`, which only supports conversations about/with a specific agent. There's no way for admins to have a direct thread with a manager.

4. **Thread visibility gaps** -- Managers can only see threads for agents assigned to them (via `manager_id`), but the insert policy doesn't grant them write access.

---

## Plan

### 1. Fix RLS INSERT Policy for Managers

Update the `contracting_messages_insert` policy to allow managers to insert messages into threads for agents assigned to them.

```sql
DROP POLICY "contracting_messages_insert" ON contracting_messages;

CREATE POLICY "contracting_messages_insert" ON contracting_messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = get_contracting_agent_id(auth.uid())
  AND (
    -- Agents can message in their own thread
    thread_id = get_contracting_agent_id(auth.uid())
    -- Managers can message in threads of their assigned agents
    OR EXISTS (
      SELECT 1 FROM contracting_agents ca
      WHERE ca.id = thread_id
      AND ca.manager_id = get_contracting_agent_id(auth.uid())
    )
    -- Contracting/admin can message anywhere
    OR get_contracting_role(auth.uid()) IN ('contracting', 'admin')
    OR is_portal_admin(auth.uid())
  )
);
```

### 2. Create Edge Function: `notify-contracting-message`

New edge function that sends branded email notifications when a contracting message is sent.

**Key behaviors:**
- Accepts `thread_id`, `sender_id`, `message_content`, and `recipients` (array of agent IDs to notify)
- Looks up each recipient's email and name from `contracting_agents`
- Sends individual emails with 2-second delays between them using `await new Promise(r => setTimeout(r, 2000))`
- Uses the same branded email wrapper as existing contracting notifications
- Email includes: sender name, message preview (truncated at 300 chars), and a CTA button to the contracting dashboard

### 3. Update `ContractingMessages.tsx` to Send Email Notifications

After successfully inserting a message, call the new `notify-contracting-message` edge function with:
- The thread participants who are NOT the sender
- For agent threads: notify the agent + their manager (if any)
- For manager/admin sending: notify the agent in the thread
- For agent sending: notify their manager + any contracting/admin who has messaged in that thread

### 4. Enable Admin-to-Manager Direct Messaging

Extend the thread model so admins can create threads with `thread_id = manager_id`:
- Update the SELECT RLS policy to let managers see threads where `thread_id` equals their own ID
- In the admin/contracting UI, add a "New Conversation" option that lists managers as well as agents
- Thread list in the sidebar will show both agent threads and manager threads

### 5. Update Thread List UI for Admins

For admin/contracting users, the thread sidebar will show:
- A section header "Agents" with all agent threads
- A section header "Managers" with direct manager threads
- A "New Message" button to start a conversation with any agent or manager

---

## Technical Details

### Files to Create
- `supabase/functions/notify-contracting-message/index.ts` -- Edge function for email notifications with 2-second delay between sends

### Files to Modify
- `src/pages/portal/advisor/contracting/ContractingMessages.tsx` -- Add email notification call after message send; add "New Conversation" button for admins; show manager threads
- Database migration: Fix RLS INSERT policy and update SELECT policy for manager self-threads

### Database Changes (Migration)
1. Drop and recreate `contracting_messages_insert` policy to include manager access
2. Update `contracting_messages_select` policy to include `thread_id = own agent ID` for managers receiving direct messages

### Email Template
Uses the existing `brandedEmailWrapper` pattern from `notify-contracting-step`:
- Header: Everence Wealth | Contracting Messages
- Body: "Hi {firstName}, {senderName} sent you a message:" + quoted preview
- CTA: "View Messages" button linking to `/portal/advisor/contracting/messages`
- Footer: Standard Everence branding

### Email Delay Logic (in edge function)
```text
for each recipient:
  send email
  if more recipients remain:
    wait 2 seconds
```

