

## Update Workshop Zoom Link Flow for Advisors

### What's Changing

The current workshop creation page tells advisors "An admin will assign your Zoom Meeting ID" -- but that's no longer accurate. Advisors already have the ability to enter Zoom links on the Workshop Detail page (added in the previous update). This plan updates the messaging to reflect that.

### Changes

**File: `src/pages/portal/advisor/WorkshopCreate.tsx`**

1. Update the "Zoom Meeting Details" section (lines 387-399) to replace the "admin will assign" info box with a friendlier message telling the advisor they can add their Zoom link after creating the workshop from the workshop detail page.
2. Update the success toast message (line 153) from "An admin will assign your Zoom link." to something like "You can now add your Zoom link from the workshop detail page."
3. After creation, navigate to the new workshop's detail page instead of the slug-setup page, so the advisor can immediately enter the Zoom link.

**File: `src/pages/portal/advisor/WorkshopDetail.tsx`** -- No changes needed. The Zoom link editor is already there and functional. The saved `zoom_join_url` is already used by the `process-workshop-reminders` edge function for the 10-minute reminder email.

### Technical Details

- The insert call on the create page will need to return the new workshop ID using `.select("id").single()` so we can navigate to `/portal/advisor/workshops/{id}` after creation. Since the advisor is authenticated and has RLS SELECT access, this will work.
- The Zoom link editor on the detail page already saves to the `workshops` table, and the 10-minute reminder edge function already reads `zoom_join_url` from there -- so the full flow is already wired up.
