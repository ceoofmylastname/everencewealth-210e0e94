

# Add "Send to Client" Action on CNA Dashboard

## Summary
Add a "Send to Client" button on each CNA card in the dashboard so advisors can assign/reassign a completed CNA to a client at any time, without reopening the form.

## Changes

### 1. CNADashboard.tsx
- Add a "Send to Client" icon button (e.g., `Send` or `UserPlus` from Lucide) on each CNA row
- Clicking it opens a small dialog/popover with a dropdown of the advisor's clients (fetched from `portal_users` where `role = 'client'` and `advisor_id` matches)
- On confirm, update the CNA's `client_id` in the database and refresh the list
- If already shared, show the current client name and allow reassigning
- Use `e.preventDefault()` / `e.stopPropagation()` on the button click so it doesn't navigate to the CNA detail page

### Technical Details

**New state:**
- `clients` array fetched on mount (same query as in CNAForm)
- `sendingCnaId` to track which CNA's dialog is open
- `selectedClientId` for the dropdown selection

**Client fetch query:**
```sql
SELECT id, first_name, last_name, email
FROM portal_users
WHERE advisor_id = :portalUserId AND role = 'client' AND is_active = true
```

**Update on confirm:**
```sql
UPDATE client_needs_analysis SET client_id = :selectedClientId WHERE id = :cnaId
```

**UI placement:** A small `Send` icon button on the right side of each CNA card, next to the Net Worth/Retirement stats. When clicked, a Dialog opens with a client dropdown and "Send" / "Cancel" buttons.

**Files to edit:**
- `src/pages/portal/advisor/CNADashboard.tsx` -- add send-to-client dialog and button

