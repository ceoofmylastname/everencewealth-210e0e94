

## Admin Management Panel for Everence Portal

### Overview
Build a portal admin section at `/portal/admin/*` with agent (advisor) management and client oversight. Only users with `role='admin'` in `portal_users` can access these pages.

### No Database Changes Needed
The existing schema already supports this feature:
- `portal_users` table has the `role` field (`client`, `advisor`, `admin`)
- `advisors` table links to `portal_users` via `portal_user_id`
- `policies` table links to advisors via `advisor_id`
- `is_portal_admin()` security definer function already exists
- RLS policies on `portal_users` and `advisors` already allow admin reads

### Files to Create

**1. `src/components/portal/AdminRoute.tsx`**
Route guard component (follows the `AdvisorRoute` / `ClientRoute` pattern):
- Checks `portalUser.role === 'admin'`
- Redirects non-admins to their appropriate dashboard
- Shows loading spinner while auth resolves

**2. `src/components/portal/AdminPortalLayout.tsx`**
Admin-specific layout wrapping `<Outlet />`:
- Darker Evergreen sidebar (`#0F2922` background, white text)
- "ADMIN" badge in the sidebar header
- Nav items: Agents, Clients, Dashboard (links to advisor dashboard)
- Same structural pattern as `PortalLayout` but with admin styling
- Main content area stays light (cream/white)

**3. `src/pages/portal/admin/AdminAgents.tsx`**
List view at `/portal/admin/agents`:
- Fetches all advisors joined with portal_users: `supabase.from("advisors").select("*, portal_user:portal_users!advisors_portal_user_id_fkey(*)")`
- For each advisor, fetches client count from `portal_users` where `advisor_id` matches, and active policy count from `policies`
- Table columns: Name, Email, Status (active/inactive badge), Clients (count), Actions
- Search input filters by name/email
- Status filter dropdown (All / Active / Inactive)
- "Add New Agent" button linking to `/portal/admin/agents/new`
- YTD Revenue column omitted since no revenue field exists in the schema (can be added later)

**4. `src/pages/portal/admin/AdminAgentNew.tsx`**
Add agent form at `/portal/admin/agents/new`:
- Fields: first name, last name, email, phone, agency_id (select from existing agencies if any), license number, specializations
- On submit: calls `supabase.auth.admin` -- since we cannot use admin auth client-side, the form will insert directly into `portal_users` (role='advisor') and `advisors` table, and optionally trigger the existing `send-portal-invitation` edge function
- "Send Invitation" checkbox to trigger welcome email
- Commission level is not in the current schema, so this will be noted as a future enhancement
- Validates email is `@everencewealth.com` per domain restriction

**5. `src/pages/portal/admin/AdminAgentDetail.tsx`**
Agent detail/edit at `/portal/admin/agents/:id`:
- Fetches advisor + portal_user data by advisor ID
- Editable fields: name, phone, title, bio, specializations, languages, license number
- Assigned clients list (from `portal_users` where `advisor_id` = this advisor's portal_user_id)
- Each client row has a "Reassign" button to move them to a different advisor
- Activate/Deactivate toggle (updates `is_active` on both `advisors` and `portal_users`)
- Performance section: count of active policies, total clients

**6. `src/pages/portal/admin/AdminClients.tsx`**
Client list at `/portal/admin/clients`:
- Fetches all `portal_users` where `role='client'`
- For each client, fetches advisor info via `advisor_id` FK
- Table columns: Name, Email, Assigned Advisor, Status, Actions
- Search by name/email
- "Reassign" button per row opens a dialog with advisor dropdown
- On reassign: updates `portal_users.advisor_id` to new advisor's `portal_user_id`

**7. `src/components/portal/admin/ReassignAdvisorDialog.tsx`**
Reusable modal for reassigning a client's advisor:
- Fetches all active advisors
- Dropdown to select new advisor
- Confirm button updates `portal_users.advisor_id`
- Shows current advisor for context

### Files to Modify

**8. `src/App.tsx`**
- Add lazy imports for all 4 new admin pages
- Import `AdminRoute` and `AdminPortalLayout`
- Add route block after the existing advisor routes:
```
<Route path="/portal/admin" element={<AdminRoute />}>
  <Route element={<AdminPortalLayout />}>
    <Route path="agents" element={<AdminAgents />} />
    <Route path="agents/new" element={<AdminAgentNew />} />
    <Route path="agents/:id" element={<AdminAgentDetail />} />
    <Route path="clients" element={<AdminClients />} />
  </Route>
</Route>
```

**9. `src/components/portal/PortalLayout.tsx`**
- Add an "Admin Panel" nav item visible only when `portalUser.role === 'admin'`
- Links to `/portal/admin/agents`
- Uses a Shield/Settings icon

### Styling Details
- Admin sidebar: `bg-[#0F2922]` with `text-white` nav items
- Active nav item: `bg-white/10` highlight
- "ADMIN" badge: small uppercase pill in the sidebar header, `bg-amber-500 text-white`
- Main content: keeps the existing light cream/white scheme
- All cards use `shadow-sm` with white backgrounds
- Status badges: green for active, gray for inactive

### Technical Notes
- No new RLS policies needed -- existing `is_portal_admin()` function already gates access, and the `portal_users` and `advisors` tables already have admin-readable policies
- Agent creation without Supabase Auth admin API: the form will create the `portal_users` and `advisors` records, then use the invitation edge function to send a signup link. The new advisor signs up via `/portal/login` and gets matched to their `portal_users` record
- The `advisors` table has `agency_id` and `agency_code` fields -- the form will include these if agencies data exists

