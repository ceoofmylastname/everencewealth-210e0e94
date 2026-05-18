## Goal
Make each advisor's contacts strictly private — only the owning advisor can view them. Block admins (and everyone else) from reading other advisors' contact data.

## Current state
- Database already isolates contacts per advisor via `advisor_id = get_advisor_id_for_auth(auth.uid())`, so **no other advisor can see your 17 contacts today**.
- The only leak is at the admin level: every SELECT policy on contact tables has `OR is_admin(auth.uid())`, which lets portal admins read all advisors' contacts.

## Change
Drop the `OR is_admin(...)` clause from the SELECT policy on all 11 contact-related tables, so the only readable rows are those owned by the authed advisor:

- `advisor_contacts`
- `advisor_contact_appointments`
- `advisor_contact_associations`
- `advisor_contact_custom_fields`
- `advisor_contact_documents`
- `advisor_contact_emails`
- `advisor_contact_field_values`
- `advisor_contact_notes`
- `advisor_contact_phones`
- `advisor_contact_policies`
- `advisor_contact_reminders`

New SELECT rule for each: `USING (advisor_id = get_advisor_id_for_auth(auth.uid()))`.

INSERT / UPDATE / DELETE policies are already advisor-scoped and stay as-is.

## Technical details
Single migration that, for each table above, drops the existing `advisor_select_own_*` policy and recreates it without the admin OR-branch. No app code changes required — the frontend already queries through Supabase with the user's session, so the tighter policy applies automatically.

## Out of scope
- No changes to leads, policies for clients, documents bucket, or any non-contact tables.
- No UI changes.
- No data migration — your 17 contacts stay exactly as they are.