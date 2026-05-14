## Goal

1. Let advisors link existing **Policies** (from the main Policies table) to a **Contact**, while keeping the standalone "quick add" policy entry on the contact card.
2. Let advisors link a **CNA** to a **Contact** (in addition to the existing CNA → Client link).

## 1. Database migration

Add nullable `contact_id` columns so existing data is untouched:

```sql
ALTER TABLE public.policies
  ADD COLUMN contact_id uuid NULL REFERENCES public.advisor_contacts(id) ON DELETE SET NULL;
CREATE INDEX idx_policies_contact ON public.policies(contact_id);

ALTER TABLE public.client_needs_analysis
  ADD COLUMN contact_id uuid NULL REFERENCES public.advisor_contacts(id) ON DELETE SET NULL;
CREATE INDEX idx_cna_contact ON public.client_needs_analysis(contact_id);
```

RLS already scopes both tables by `advisor_id`, so no policy changes needed (the new column is just metadata an advisor can set on their own row).

## 2. Contact card → Policies tab (`ContactPoliciesTab.tsx`)

Keep current "quick add" form (writes to `advisor_contact_policies`). Add a second section above it:

- **"Linked Policies"** list: query `policies` where `contact_id = :contactId`, render carrier / product / status / premium with a link to `/portal/advisor/policies/:id`.
- **"Link existing policy" button**: opens a modal that lists the advisor's policies (from `policies`) with search by carrier/policy number/client name. Selecting one runs `update policies set contact_id = :contactId`.
- **Unlink** button per row: sets `contact_id = null`.

## 3. Contact card → new "CNAs" tab

Add a new tab "CNAs" between Notes and Appointments (update `TABS` in `ContactDetail.tsx`). New component `ContactCNAsTab.tsx`:

- Lists `client_needs_analysis` rows where `contact_id = :contactId` (id, applicant_name, created_at, linked client name if any). Row click → `/portal/advisor/cna/:id`.
- "Link existing CNA" button: modal with searchable list of advisor's CNAs (filtered to ones with no contact or any of theirs); selecting writes `contact_id`.
- Unlink button.

## 4. Main Policies page (`AdvisorPolicies.tsx`)

Add a small "Link contact" affordance next to each policy row:

- If `policy.contact_id` is set, show contact name as a chip linking to `/portal/advisor/contacts/:id`.
- If unset, show "Link contact" button → opens contact picker modal (search advisor's `advisor_contacts` by name/email) → updates `policies.contact_id`.

## 5. CNA Dashboard (`CNADashboard.tsx`)

Mirror the existing "Link to Client" UX with a parallel "Link to Contact":

- Add a "Link Contact" button on each CNA card; same modal pattern with contact search; writes `client_needs_analysis.contact_id`.
- Show the linked contact name next to the existing "Shared · client name" chip.

## 6. Out of scope

- No changes to `advisor_contact_policies` (kept as quick-entry).
- No automatic two-way creation (linking a policy does not create a contact and vice versa).
- No bulk linking.
- No changes to client-side policy/CNA visibility (RLS unchanged).

## Files

- New migration `supabase/migrations/<ts>_link_policies_cna_to_contacts.sql`
- New `src/components/portal/contacts/ContactCNAsTab.tsx`
- Edit `src/components/portal/contacts/ContactPoliciesTab.tsx`
- Edit `src/pages/portal/advisor/contacts/ContactDetail.tsx` (add CNAs tab)
- Edit `src/pages/portal/advisor/AdvisorPolicies.tsx` (contact chip + picker)
- Edit `src/pages/portal/advisor/CNADashboard.tsx` (link-contact button + picker)
