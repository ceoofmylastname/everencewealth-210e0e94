
# Create Workshop Page

## Overview

Add a new page at `/portal/advisor/workshops/create` where advisors can create workshops with a 3-section form (Basic Details, Schedule, Zoom Info). The page pre-checks whether the advisor has set up their slug; if not, it blocks the form and redirects them to slug setup first.

## Files to Create

### `src/pages/portal/advisor/WorkshopCreate.tsx`

The main page component with:

**Pre-check logic:**
- Uses `usePortalAuth()` to get auth user
- Queries `advisors` table for `advisor_id`
- Queries `advisor_slugs` for active slug
- If no slug: shows alert banner with link to `/portal/advisor/workshops/slug-setup`, form disabled
- If slug exists: renders the full form

**Section 1 - Basic Details:**
- Title (text input, default "Tax-Free Retirement Workshop", required, max 200)
- Description (textarea, optional, max 1000)
- Custom Headline (text input, optional, max 150, help text)
- Custom Subheadline (text input, optional, max 200)

**Section 2 - Schedule:**
- Workshop Date (date picker using Popover + Calendar, required, must be future)
- Workshop Time (select with 12-hour AM/PM options, required)
- Timezone (select dropdown, default "America/Los_Angeles", 6 US timezone options)
- Duration (number input, default 60, min 15, max 240, "minutes" suffix)
- Max Attendees (number input, default 100, min 1, max 1000)

**Section 3 - Zoom Details (read-only info card):**
- Info icon with message explaining admin assigns Zoom details post-creation
- Visually distinct with light gray background and border

**Submit behavior:**
- Inserts into `workshops` table with `status: 'draft'`
- On success: toast + redirect to `/portal/advisor/workshops/slug-setup` (temporary until workshop dashboard exists)
- On error: toast with error, form data preserved

**Design:** Everence brand (#1A4D3E primary, 0px border radius, GeistSans font, large clear inputs)

## Files to Modify

### `src/App.tsx`
- Add lazy import for `WorkshopCreate`
- Add route `workshops/create` alongside existing `workshops/slug-setup` (line ~405)

### `src/components/portal/PortalLayout.tsx`
- Add "Create Workshop" sub-item or ensure "Workshops" nav item exists in Resources group (already added from previous work)

## Technical Details

- Uses `react-hook-form` for form state management
- Uses `date-fns` for date validation (isBefore, startOfToday)
- Uses existing shadcn Calendar + Popover for date picker (with `pointer-events-auto`)
- Debounce not needed here (no real-time checks)
- Double-submit prevention via `isSubmitting` state disabling the button
- All validation inline with red error messages
- Required fields marked with asterisk
- No database schema changes needed -- `workshops` table already has all columns with correct defaults
