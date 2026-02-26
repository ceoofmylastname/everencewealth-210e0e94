

## Plan: Remove Admin Command Center, Merge Unique Features

The Admin Command Center is largely redundant with the Contracting Dashboard. Consolidate the two unique features and remove the page.

### Steps

1. **Move CSV Export to Contracting Dashboard** — Add the "Export CSV" button to the Dashboard header (next to Analytics / Add Agent buttons)

2. **Move Bundle Management to Contracting Settings** — The Settings page (`/contracting/settings`) is already described as the "configuration hub for bundle management." Move the Bundles CRUD UI there (or confirm it already exists there)

3. **Remove ContractingAdmin page** — Delete `src/pages/portal/advisor/contracting/ContractingAdmin.tsx`, remove its route from `App.tsx`, and remove the nav link pointing to `/contracting/admin`

4. **Update navigation** — Remove "Admin" or "Settings → Admin Panel" link from the contracting sidebar that pointed to this page

### Files affected
- `src/pages/portal/advisor/contracting/ContractingDashboard.tsx` — add CSV export button
- `src/pages/portal/advisor/contracting/ContractingSettings.tsx` — verify/add Bundles tab
- `src/pages/portal/advisor/contracting/ContractingAdmin.tsx` — delete
- `src/App.tsx` — remove route
- Navigation component (sidebar) — remove link

