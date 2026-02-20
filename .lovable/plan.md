

# Admin Read-Only Access to All Advisor-Client Messages

## What's Wrong

1. **Code**: The Messages page only loads conversations where `advisor_id` matches the logged-in user. Admin's ID doesn't match any advisor, so they see nothing.
2. **Database security policies**: Only conversation participants (the advisor and their client) are allowed to read conversations and messages. No admin access exists at the database level.

All messages are permanently stored and safe -- the admin simply has no access path to view them.

## The Fix

### 1. Database: Add admin read access (2 new policies)

Add SELECT policies so admins can read all conversations and messages:

- **portal_conversations**: "Admins can view all conversations" -- allows SELECT when `is_portal_admin(auth.uid())` returns true
- **portal_messages**: "Admins can view all messages" -- allows SELECT when `is_portal_admin(auth.uid())` returns true

Admins get **read-only** access. They cannot send messages or modify conversations.

### 2. Code: Update AdvisorMessages.tsx

**For admins:**
- Load ALL conversations (no `advisor_id` filter)
- Show each conversation labeled with both the advisor name AND the client name (e.g., "John Mel <-> jm mel")
- Add an advisor filter dropdown so admins can filter conversations by specific advisor
- Hide the message input box -- admins observe only, they don't participate
- Hide the "new conversation" dropdown since admins don't start conversations

**For advisors (unchanged):**
- Continue to see only their own conversations
- Can still send messages as before

### Visual Layout for Admin

```
Conversations sidebar:
  [Filter by Advisor: All v]
  ----------------------------------------
  | [avatar] John Mel <-> jm mel         |
  |         Feb 20, 2026                 |
  ----------------------------------------

Message area (read-only):
  Header: "John Mel <-> jm mel"
  Messages displayed normally (advisor on right, client on left)
  NO input box at the bottom for admin
```

## Technical Details

### Database migration (2 RLS policies)

```sql
-- Admin can view all conversations
CREATE POLICY "Admins can view all conversations"
ON public.portal_conversations FOR SELECT
TO authenticated
USING (is_portal_admin(auth.uid()));

-- Admin can view all messages
CREATE POLICY "Admins can view all messages"
ON public.portal_messages FOR SELECT
TO authenticated
USING (is_portal_admin(auth.uid()));
```

### File: `src/pages/portal/advisor/AdvisorMessages.tsx`

- In `loadConversations()`: if admin, remove the `.eq("advisor_id", ...)` filter and fetch advisor names alongside client names
- Add `advisorName` to each conversation entry for display
- Add advisor filter state and dropdown (admin only)
- In the message view: label messages with sender name (advisor or client), not just "mine vs theirs"
- Conditionally hide the send form and "new conversation" dropdown when user is admin
- Admin sees messages as an observer: advisor messages on one side, client messages on the other

## Files Changed

- Database: 2 new RLS policies on `portal_conversations` and `portal_messages`
- `src/pages/portal/advisor/AdvisorMessages.tsx` -- admin-aware conversation loading, advisor labels, read-only mode

