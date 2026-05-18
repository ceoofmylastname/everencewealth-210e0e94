## Goal
On `/portal/advisor/contacts`, a manager (anyone listed as `manager_id` on one or more `contracting_agents`) can pick one of their managed agents from a dropdown and see that agent's contacts exactly as the agent would — all tabs, notes, phones, emails, reminders, appointments, documents, policies, custom fields, associations.

Only managers of that specific agent get access. Other advisors and portal admins remain blocked (matching the privacy rules we just locked down).

## Backend changes (database)

1. **New SECURITY DEFINER helper** `public.can_manage_advisor(_auth_uid uuid, _advisor_id uuid)` that returns true when the caller's `portal_users.id` equals the `manager_id` of the `contracting_agents` row whose `auth_user_id` matches the target advisor's `auth_user_id`. Uses a definer function to avoid RLS recursion.

2. **New helper** `public.get_managed_advisor_ids(_auth_uid uuid)` returning the array of `advisors.id` the caller manages — used by the frontend to populate the dropdown without exposing other data.

3. **Add a manager SELECT policy** to each of the 11 contact tables (`advisor_contacts`, `advisor_contact_appointments`, `advisor_contact_associations`, `advisor_contact_custom_fields`, `advisor_contact_documents`, `advisor_contact_emails`, `advisor_contact_field_values`, `advisor_contact_notes`, `advisor_contact_phones`, `advisor_contact_policies`, `advisor_contact_reminders`) named `manager_select_managed_advisor_contacts`:
   `USING (can_manage_advisor(auth.uid(), advisor_id))`
   
   Existing owner-only SELECT/INSERT/UPDATE/DELETE policies stay untouched, so managers get **read-only** visibility (they can't edit or delete the agent's contacts — only view and work alongside).

## Frontend changes

1. **`src/pages/portal/advisor/contacts/`** (the contacts list page):
   - Add a `useManagedAdvisors()` hook that calls `get_managed_advisor_ids` + joins `advisors` for names/emails.
   - If the result is empty → no UI change (regular advisor).
   - If non-empty → render a "Viewing contacts for" dropdown in the page header listing "My contacts" (self) + each managed advisor.
   - Selected advisor id is held in component state (or URL param `?advisor=`) and passed into every contact query that currently uses `get_advisor_id_for_auth` — replace the implicit advisor scope with an explicit `advisor_id` filter using the selected id.

2. **Contact detail / tabs pages** (notes, phones, emails, reminders, appointments, documents, policies, custom fields): same pattern — they already query by `contact_id`, which is owned by the selected advisor, so RLS does the gating. The only frontend work is keeping the selected-advisor context (e.g. via a small `SelectedAdvisorContext`) so deep links and tab switches keep the right scope.

3. **Read-only affordance**: when viewing another advisor's contacts, hide/disable Create/Edit/Delete buttons (since policies will reject those writes anyway). Show a subtle banner: "Viewing {Agent name}'s contacts (read-only)".

## Out of scope
- No changes to write policies — managers cannot mutate an agent's contacts.
- No changes to admin access — admins still blocked from contact tables (per last migration).
- No change to the contacts schema or to leads/policies/documents tables outside the contact namespace.

## Technical notes
```text
auth.uid() ──► portal_users.id ──► contracting_agents.manager_id
                                          │
                                          ▼
                                contracting_agents.auth_user_id
                                          │
                                          ▼
                              advisors.auth_user_id → advisors.id
                                          │
                                          ▼
                              advisor_contacts.advisor_id
```
