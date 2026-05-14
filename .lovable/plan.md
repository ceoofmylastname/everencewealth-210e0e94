## Contacts Tab for Advisor Portal (GHL-style)

Add a full-featured Contacts module to the advisor portal, sitting between Dashboard and Clients in the side nav. Each advisor sees only their own contacts; all data scoped via RLS using `advisor_id` resolved from `portal_users.id`.

### 1. Database (new migration)

**`advisor_contacts`** — main contact record
- advisor_id, first_name, last_name, company, job_title
- primary_email, primary_phone, address fields (street/city/state/zip/country)
- date_of_birth, source, lifecycle_stage, tags (text[]), notes_summary
- linked_client_id (nullable FK to portal clients — when contact is also a client)

**`advisor_contact_emails`** / **`advisor_contact_phones`** — multiple per contact, with label + is_primary

**`advisor_contact_custom_fields`** — per-advisor field definitions (label, type: text/number/date/select/boolean, options jsonb)

**`advisor_contact_field_values`** — contact_id + field_id + value

**`advisor_contact_policies`** — carrier_name, product_type, policy_number, monthly_modal_premium, face_amount, issue_date, status, notes (independent of formal `policies` table — these are advisor's CRM-side records)

**`advisor_contact_notes`** — contact_id, advisor_id, body, pinned, created_at

**`advisor_contact_documents`** — contact_id, file_name, storage_path, mime_type, size_bytes (Storage bucket: `advisor-contact-docs`, private, path prefixed by advisor_id)

**`advisor_contact_associations`** — contact_a_id, contact_b_id, relationship_label (spouse, child, parent, business_partner, referral, other). Bidirectional via trigger or paired rows.

**`advisor_contact_appointments`** — contact_id, advisor_id, title, starts_at, ends_at, location, description, status. Joined into existing advisor schedule view.

**`advisor_contact_reminders`** — contact_id, advisor_id, title, body, remind_at, completed_at, dismissed_at. Surfaced on AdvisorDashboard widget.

**RLS:** Every table — advisor can SELECT/INSERT/UPDATE/DELETE only where `advisor_id = get_advisor_id_for_auth()`. Admin override via `is_admin()`.

**Storage bucket:** `advisor-contact-docs` (private). Policies enforce `(storage.foldername(name))[1] = advisor_id::text`.

### 2. Routes & Navigation

Add to `PortalLayout.tsx` advisor nav, between Dashboard and Clients:
```
{ label: "Contacts", icon: Contact, href: "/portal/advisor/contacts" }
```

New routes in `App.tsx`:
- `/portal/advisor/contacts` — list/search/filter + Import CSV button + Add Contact
- `/portal/advisor/contacts/new` — create form
- `/portal/advisor/contacts/:id` — detail page (tabs: Overview, Policies, Notes, Appointments, Documents, Associations, Custom Fields, Activity)
- `/portal/advisor/contacts/import` — CSV upload + column mapper
- `/portal/advisor/contacts/settings` — manage custom field definitions

### 3. Pages / Components

```
src/pages/portal/advisor/contacts/
├── ContactsList.tsx          # table, search, filter by tag/stage, pagination
├── ContactDetail.tsx         # tabbed contact card
├── ContactForm.tsx           # create/edit
├── ContactImport.tsx         # CSV → column mapper → preview → import
└── ContactCustomFields.tsx   # field definitions manager

src/components/portal/contacts/
├── ContactPoliciesTab.tsx
├── ContactNotesTab.tsx
├── ContactAppointmentsTab.tsx
├── ContactDocumentsTab.tsx
├── ContactAssociationsTab.tsx
├── ContactRemindersPanel.tsx
├── AddReminderDialog.tsx
└── ContactCsvMapper.tsx

src/hooks/
├── useAdvisorContacts.ts
├── useAdvisorContact.ts (single contact + related data)
└── useAdvisorReminders.ts
```

### 4. CSV Import flow

1. Upload CSV (parse client-side with PapaParse — already in deps if not, add it).
2. Show preview of first 5 rows.
3. Mapper UI: dropdown per CSV column → contact field (or "skip" / "custom field").
4. Validate required (first_name OR last_name OR email).
5. Bulk insert in batches of 100 via supabase client.
6. Show summary: inserted / skipped / errors.

### 5. Reminders on Dashboard

Add a new widget to `AdvisorDashboard.tsx`: "Upcoming Reminders" — list of `advisor_contact_reminders` where `remind_at <= now() + 7 days` AND `completed_at IS NULL`, joined with contact name. Each row links to contact detail; has Complete/Dismiss buttons. Overdue reminders styled red.

Appointments from `advisor_contact_appointments` also surface on the dashboard "Upcoming" widget and on the existing `SchedulePage` (joined alongside existing global/private events).

### 6. Associations

On contact detail Associations tab: search other contacts → pick → choose relationship label → save. Trigger inserts the reciprocal row so both contacts show the relationship. Display as cards linking to associated contact.

### 7. Privacy guarantees

- Every query filtered by `advisor_id` server-side via RLS.
- Reminders/appointments dashboard widgets query only current advisor's rows.
- Storage bucket private; signed URLs only; advisor-scoped folder.
- No advisor can read another advisor's contacts, notes, documents, reminders, or appointments.

### 8. Out of scope (explicit)

- Email/SMS sending from contacts (can be added later via existing edge function patterns).
- Workflow automation / pipelines (GHL-style).
- Bulk edit / bulk delete (can add after MVP).
- Sharing contacts between advisors.

### Implementation order

1. Migration (tables + RLS + storage bucket + bidirectional association trigger).
2. Hooks + types.
3. Nav + route wiring + ContactsList.
4. ContactForm + ContactDetail with all tabs.
5. CSV Import.
6. Reminders + Dashboard widget integration.
7. Custom fields manager.
