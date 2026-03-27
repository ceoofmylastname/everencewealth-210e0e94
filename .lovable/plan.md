

## Self-Service Advisor Availability + Full 2026 Calendar

### What this does
1. **Advisors manage their own Socorro availability** — When an admin adds an agent who is already an Everence Wealth advisor (has a portal account), their Socorro workshop advisor record gets linked to their `auth_user_id`. The "Socorro Workshop" nav link already exists for advisors, and the `SocorroWorkshopManage` page already checks `auth_user_id` to find the advisor's Socorro profile. The missing piece is that the admin flow never sets `auth_user_id` on the Socorro advisor record.

2. **Replace fixed week dates with a full 2026 calendar date picker** — Instead of 5 hardcoded dates, advisors and admins pick any date in 2026 using a calendar input. The public-facing AvailabilityPicker dynamically derives available dates from the advisor's actual slots instead of showing a static week.

---

### Changes

**1. Admin: Link Socorro advisors to portal accounts**
- **File**: `src/components/portal/AdminSocorroApproval.tsx`
  - In the `AdvisorProfileEditor`, add a "Link to Portal Account" dropdown that queries `portal_users` where `role = 'advisor'` and lets admin select which portal user this Socorro advisor maps to
  - On save, update `auth_user_id` on `socorro_workshop_advisors` to match the selected portal user's `auth_user_id`
  - Show a "Linked" badge if already linked, with the advisor's portal name
  - When adding a new advisor, optionally include the portal account link

**2. Advisor nav visibility** (already works)
- The sidebar already shows "Socorro Workshop" for all advisors
- `SocorroWorkshopManage` already checks `auth_user_id` match — once linked, the advisor sees their availability manager
- Optionally: only show the nav link if the advisor actually has a Socorro profile (minor UX improvement)

**3. Replace fixed dates with calendar date picker everywhere**

- **Files affected**:
  - `src/components/portal/AdminSocorroApproval.tsx` (AdvisorScheduleManager)
  - `src/components/portal/SocorroAvailabilityManager.tsx`
  - `src/components/socorro/AvailabilityPicker.tsx`
  - `src/pages/socorro/SocorroAdvisors.tsx` (remove "March 23-27" text)

- **Admin + Advisor schedule managers**: Replace the date `<Select>` dropdown with a date `<input type="date">` (or the shadcn Calendar/Popover component if available), constrained to 2026 (min `2026-01-01`, max `2026-12-31`). Keep the time slot `<Select>` as-is.

- **Public AvailabilityPicker**: Remove hardcoded `WORKSHOP_DATES`. Instead, derive unique dates from the slots data. Show date pills dynamically based on what dates have available slots. Group by week or show a scrollable date list.

**4. Conditional Socorro Workshop nav link**
- **File**: `src/components/portal/PortalLayout.tsx`
  - Add a check: query `socorro_workshop_advisors` for the current user's `auth_user_id`. Only show the "Socorro Workshop" nav item if a matching record exists (similar to `presentation_access` pattern).

### Technical details
- No database migration needed — `auth_user_id` column already exists on `socorro_workshop_advisors`
- No new RLS policies needed — existing policies cover advisor access
- The portal account linking uses the existing `portal_users` table to find `auth_user_id` values
- Date inputs will be standard HTML date inputs or shadcn Calendar components, no new dependencies

