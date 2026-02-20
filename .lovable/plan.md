
# Admin Full Advisor Capabilities + Agency Oversight

## Summary

The admin needs to work both as a full advisor (own clients, policies, documents, messages) AND have oversight of all agents' activities. This requires changes across 4 pages plus 1 database record, and adding more navigation links to the admin layout.

## Changes Required

### 1. Create an Advisors Record for the Admin

The admin currently has no entry in the `advisors` table, which is required for creating policies (the `policies.advisor_id` references `advisors.id`). We need to insert a record so the admin can function as an advisor.

- Insert into `advisors` table: `portal_user_id = admin's portal_user ID`, with the admin's name and auth_user_id

### 2. Update Admin Navigation (AdminPortalLayout.tsx)

Add links to the admin sidebar so they can access the advisor pages directly from the admin panel:

- Clients (already exists)
- Policies (new link to `/portal/advisor/policies`)
- Documents (new link to `/portal/advisor/documents`)
- Messages (new link to `/portal/advisor/messages`)

### 3. Update Policies Page (AdvisorPolicies.tsx)

**Current problem**: Queries `advisors` table for the user's advisor record. Admin has no record, so it returns nothing.

**Fix**:
- If admin: load ALL policies across all advisors (no `advisor_id` filter), so they see every policy in the agency
- Fetch advisor names and display which advisor owns each policy
- Add an advisor filter dropdown (similar to the clients page)
- Keep the `?client=` URL filter working so clicking "Policies" from a client card still works
- Admin can still create/edit/delete policies (they will use their own advisor record)

### 4. Update Documents Page (AdvisorDocuments.tsx)

**Current problem**: Filters documents by `uploaded_by = portalUser.id`. Admin sees only their own uploads, not other agents' documents.

**Fix**:
- If admin: load ALL documents across all advisors (no `uploaded_by` filter)
- Show which advisor uploaded each document
- Add an advisor filter dropdown
- For the upload form client dropdown: load all active clients (not just admin's own)
- Keep `?client=` URL filter working

### 5. Update Messages Page (AdvisorMessages.tsx)

**Current problem**: Admin is read-only for all conversations. But the admin also needs to be able to message their own clients.

**Fix**:
- Admin can still see ALL conversations (oversight mode)
- When viewing someone else's conversation, it remains read-only
- When viewing their own conversation (where `advisor_id` matches admin's portal user ID), they CAN send messages
- Admin can also start new conversations with their own clients
- Add visual indicator showing "Your conversation" vs "Observing"

## Technical Details

### Database: Insert admin advisor record

```sql
INSERT INTO advisors (portal_user_id, auth_user_id, first_name, last_name, email)
SELECT pu.id, pu.auth_user_id, pu.first_name, pu.last_name, pu.email
FROM portal_users pu
WHERE pu.id = 'e82dd92c-819b-47ca-889a-a67f9e90aae3'
AND NOT EXISTS (SELECT 1 FROM advisors WHERE portal_user_id = pu.id);
```

### AdminPortalLayout.tsx

Add navigation items for Policies, Documents, and Messages pointing to the advisor routes.

### AdvisorPolicies.tsx

- Add role check: if admin, skip the `advisors` table lookup and load all policies
- Fetch advisor names from the `advisors` table for display
- Add advisor filter dropdown (admin only)
- Show advisor name badge on each policy card

### AdvisorDocuments.tsx

- Add role check: if admin, load all documents (no `uploaded_by` filter)
- For client dropdown in upload form: if admin, load all active clients
- Fetch uploader names for display
- Add advisor filter dropdown (admin only)

### AdvisorMessages.tsx

- Change from fully read-only to conditional: admin can send in conversations where they are the advisor
- Allow admin to start new conversations with their own clients
- Show "Observing" badge only on other advisors' conversations, not admin's own

## Files Changed

- `src/components/portal/AdminPortalLayout.tsx` -- add nav links for Policies, Documents, Messages
- `src/pages/portal/advisor/AdvisorPolicies.tsx` -- admin sees all policies with advisor labels and filter
- `src/pages/portal/advisor/AdvisorDocuments.tsx` -- admin sees all documents with uploader info and filter
- `src/pages/portal/advisor/AdvisorMessages.tsx` -- admin can send in own conversations, read-only for others
- Database: insert advisor record for admin user
