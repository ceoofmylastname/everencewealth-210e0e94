

## Appointment Booking System

### Overview
Build a two-sided appointment booking system where clients can request appointments with their advisor, and advisors can confirm, reschedule, or decline. Includes email notifications and optional meeting link support.

### Database Changes

**1. New table: `portal_appointments`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to portal_users(id) -- the client |
| advisor_id | UUID | FK to portal_users(id) -- the advisor |
| title | TEXT | Appointment subject |
| description | TEXT | Optional notes from requester |
| requested_date | DATE | Preferred date |
| requested_time | TIME | Preferred time |
| confirmed_date | DATE | Advisor-confirmed date (may differ) |
| confirmed_time | TIME | Advisor-confirmed time |
| duration_minutes | INTEGER | Default 30 |
| status | TEXT | requested, confirmed, declined, cancelled, completed |
| meeting_link | TEXT | Zoom/Teams/Google Meet URL |
| advisor_notes | TEXT | Private notes from advisor |
| reminder_sent | BOOLEAN | Whether email reminder was sent |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

**RLS Policies:**
- Clients can INSERT new requests (their own client_id) and SELECT their own appointments
- Advisors can SELECT appointments where they are the advisor, and UPDATE status/confirmed fields
- Admins can do everything (via `is_portal_admin`)

**Realtime:** Enable realtime on this table so both sides see live status updates.

### Edge Functions

**2. `supabase/functions/send-appointment-notification/index.ts`**
Handles three notification types via Resend API:
- **request**: Emails the advisor when a client requests an appointment
- **confirmation**: Emails the client when the advisor confirms (includes confirmed date/time and meeting link)
- **reminder**: Emails both parties 24 hours before the appointment

Follows the same pattern as `send-portal-invitation` (auth header validation, service role for DB reads, Resend for delivery).

**3. `supabase/functions/check-appointment-reminders/index.ts`**
Lightweight cron-style function (can be called by a scheduled job or manually):
- Finds confirmed appointments within the next 24 hours where `reminder_sent = false`
- Sends reminder emails to both client and advisor
- Marks `reminder_sent = true`

### Frontend -- Client Side

**4. `src/pages/portal/client/BookAppointment.tsx`**
New page at `/portal/client/appointments`:
- Shows a list of the client's existing appointments with status badges
- "Request Appointment" button opens a dialog with:
  - Date picker (calendar component)
  - Time slot selector
  - Subject/title input
  - Notes textarea
- Submits an INSERT to `portal_appointments` with status = 'requested'
- Calls the edge function to notify the advisor

**5. Update `src/pages/portal/client/ClientDashboard.tsx`**
- Add an "Upcoming Appointments" card showing the next confirmed appointment
- Add appointment count to the stats cards

### Frontend -- Advisor Side

**6. `src/pages/portal/advisor/AppointmentManagement.tsx`**
New page at `/portal/advisor/appointments`:
- Tab view: Pending Requests | Upcoming | Past
- **Pending Requests tab**: Cards for each `status = 'requested'` appointment showing client name, requested date/time, notes. Actions: Confirm (with optional date/time adjustment + meeting link), Decline
- **Upcoming tab**: Confirmed appointments in chronological order. Each card shows client, date/time, meeting link (clickable). Action: Cancel, Add/edit meeting link
- **Past tab**: Completed/cancelled appointments for reference

**7. `src/components/portal/advisor/ConfirmAppointmentDialog.tsx`**
Dialog for confirming an appointment:
- Shows the client's requested date/time
- Advisor can accept as-is or propose a different date/time
- Optional meeting link input (Zoom, Teams, etc.)
- Optional advisor notes
- On confirm: updates the appointment status to 'confirmed', sets confirmed_date/time, calls edge function to email the client

### Routing and Navigation Changes

**8. Update `src/App.tsx`**
- Add lazy imports for `BookAppointment` and `AppointmentManagement`
- Add routes:
  - Client: `<Route path="appointments" element={<BookAppointment />} />`
  - Advisor: `<Route path="appointments" element={<AppointmentManagement />} />`

**9. Update `src/components/portal/PortalLayout.tsx`**
- Add "Appointments" nav item to both `advisorNav` and `clientNav` arrays (using CalendarCheck icon from Lucide)

### Technical Notes
- The existing `schedule_events` table is for general advisor events (trainings, webinars) and remains separate from client-specific appointments
- Meeting links are free-text -- advisors paste their own Zoom/Teams/Meet link. No API integration needed for video providers.
- Email reminders use the existing `RESEND_API_KEY` secret
- The from address follows the existing pattern: `"Everence Wealth <portal@notifications.everencewealth.com>"`
- Realtime subscription on `portal_appointments` lets both client and advisor dashboards update live when status changes
- Duration defaults to 30 minutes but is configurable per appointment

