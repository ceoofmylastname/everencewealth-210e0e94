

## Add Zoom Link Management + Batch Email Sending

### Problem
1. The `zoom_join_url`, `zoom_meeting_id`, and `zoom_passcode` columns exist on the `workshops` table, but there is **no UI** for admins or advisors to enter them. The reminder emails already use these fields -- they just show an empty "Join" button when no link is set.
2. The 10-minute reminder currently fires all emails simultaneously. It needs to send **2 at a time with a 3-second delay** between batches to stay within Resend rate limits.

### Changes

**1. Workshop Detail Page -- Add Zoom Link Editor** (`src/pages/portal/advisor/WorkshopDetail.tsx`)

- Add an editable section in the workshop details card where the advisor (or admin) can enter/update:
  - Zoom Join URL
  - Zoom Passcode (optional)
- Show a "Save" button that updates the `workshops` table
- Once saved, the link will automatically appear in all reminder emails (the edge function already reads `zoom_join_url` from the workshops table)

**2. Batch the 10-minute reminder emails** (`supabase/functions/process-workshop-reminders/index.ts`)

- For the `10m` window specifically, process eligible registrations in batches of 2
- After each batch of 2 emails, wait 3 seconds before sending the next batch
- Other reminder windows (24h, 4h, 1h) continue sending normally since volume is lower at those intervals

### Technical Details

**File: `src/pages/portal/advisor/WorkshopDetail.tsx`**
- Add state for `zoomUrl` and `zoomPasscode`, pre-filled from `workshop.zoom_join_url` / `workshop.zoom_passcode`
- Add an inline form with two text inputs and a Save button
- On save, call `supabase.from("workshops").update({ zoom_join_url, zoom_passcode }).eq("id", workshop.id)`
- Show toast on success/failure
- Both advisors and admins can set this since the workshop detail page is already role-gated

**File: `supabase/functions/process-workshop-reminders/index.ts`**
- Add a helper: `async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }`
- For the 10m window, chunk the eligible array into groups of 2
- After sending each chunk, `await sleep(3000)` before the next
- All other windows send as before (one at a time, no delay)
