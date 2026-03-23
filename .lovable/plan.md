

## Add Display Order to Socorro Advisors

Currently there's no way to control advisor ordering — they sort by `last_name` on the public page and `created_at` on the admin page. Here's the plan to add drag-and-drop reordering.

### Database Change
- Add a `display_order` integer column to `socorro_workshop_advisors` with a default of `0`
- Backfill existing rows with sequential values based on current `last_name` order

### Admin UI — Reorder Controls (AdminSocorroApproval.tsx)
- Add up/down arrow buttons next to each advisor row for reordering
- When an arrow is clicked, swap `display_order` values between adjacent advisors and persist to the database
- Sort the admin list by `display_order` ascending instead of `created_at`
- When adding a new advisor, set `display_order` to `max + 1`

### Public Page Ordering (useSocorroAdvisors.ts)
- Change `.order("last_name")` to `.order("display_order", { ascending: true })` so the public-facing advisor grid respects the admin-defined order

### Files affected
- **Migration**: Add `display_order` column, backfill existing rows
- `src/components/portal/AdminSocorroApproval.tsx`: Add reorder arrows, sort by `display_order`, set order on new advisors
- `src/hooks/useSocorroAdvisors.ts`: Order by `display_order` instead of `last_name`

