
## Ad-hoc Email Sending for Advisor Portal

### Overview
Add the ability for advisors to compose and send emails directly to their clients from within the portal. This includes an email composition modal, a history log of sent emails, and a reusable email templates library.

### Database Changes

**1. New table: `portal_advisor_emails`**
Stores every email sent by an advisor through the portal.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| advisor_id | UUID | FK to portal_users(id) |
| client_id | UUID | FK to portal_users(id) |
| to_email | TEXT | Recipient email address |
| subject | TEXT | Email subject |
| body_html | TEXT | Email body (HTML) |
| template_id | UUID | Optional FK to template used |
| status | TEXT | sent, failed |
| error_message | TEXT | Error details if failed |
| sent_at | TIMESTAMPTZ | When sent |
| created_at | TIMESTAMPTZ | Auto |

RLS: Advisors can read/insert their own emails. Admins can read all.

**2. New table: `portal_email_templates`**
Reusable email templates advisors can pick from when composing.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Template name (e.g. "Welcome Email") |
| subject | TEXT | Default subject line |
| body_html | TEXT | Template body with placeholders |
| category | TEXT | welcome, follow_up, policy_update, general |
| created_by | UUID | FK to portal_users(id), nullable for system templates |
| is_system | BOOLEAN | System-wide vs advisor-created |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

RLS: All advisors/admins can read. Admins can insert/update/delete. Advisors can manage templates they created.

### Files to Create

**3. `supabase/functions/send-portal-email/index.ts`**
Edge function that:
- Validates the caller is an advisor (via auth token)
- Accepts `to_email`, `subject`, `body_html`, `client_id`, optional `template_id`
- Sends the email via Resend API (already configured with `RESEND_API_KEY`)
- Inserts a record into `portal_advisor_emails` with status
- From address: `"Everence Wealth <portal@notifications.everencewealth.com>"`

**4. `src/components/portal/advisor/ComposeEmailDialog.tsx`**
Modal dialog for composing an email:
- Pre-filled "To" field with client name and email (read-only)
- Subject input
- Template selector dropdown (loads from `portal_email_templates`)
- Rich text body area (Textarea for now, with placeholder substitution for `{{first_name}}`, `{{last_name}}`)
- Send button that calls the `send-portal-email` edge function
- Loading/success/error states

**5. `src/pages/portal/advisor/AdvisorEmailHistory.tsx`**
Full-page email log at `/portal/advisor/emails`:
- Table listing all emails sent by the current advisor
- Columns: Date, Client, Subject, Status
- Search and filter by client or status
- Click to view email content in a detail dialog

**6. `src/pages/portal/advisor/EmailTemplatesPage.tsx`**
Template library page at `/portal/advisor/email-templates`:
- List of available templates (system + personal)
- Create new template button
- Edit/delete own templates
- Preview template content

### Files to Modify

**7. `src/pages/portal/advisor/AdvisorClients.tsx`**
- Add an "Email" button to each client card (next to Policies/Docs buttons)
- Clicking opens the `ComposeEmailDialog` with that client pre-selected

**8. `src/App.tsx`**
- Add lazy imports for `AdvisorEmailHistory` and `EmailTemplatesPage`
- Add routes inside the advisor block:
  - `<Route path="emails" element={<AdvisorEmailHistory />} />`
  - `<Route path="email-templates" element={<EmailTemplatesPage />} />`

**9. `src/components/portal/PortalLayout.tsx`**
- Add "Email History" nav item in the advisor sidebar (using Mail icon)

### Technical Notes
- Resend API key is already configured as a secret
- Email sending follows the same pattern as `send-portal-invitation` edge function
- Template placeholders (`{{first_name}}`, `{{last_name}}`) are replaced client-side before sending
- The compose dialog can be triggered from client cards or from the email history page
- No client-detail page exists yet -- the "Email Client" button goes directly on the client cards in AdvisorClients
