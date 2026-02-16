
## Admin Management Panel for Portal

### Overview
Build a full admin section at `/portal/admin/*` that allows portal administrators to manage agents (advisors), reassign clients, set commission levels, and view global analytics. This uses the existing `portal_users` role system where `role = 'admin'` grants access.

### Database Changes

**1. New table: `advisor_commission_config`**

Stores commission levels per advisor (currently `comp_level_percent` exists on `advisor_performance` per entry, but there's no global default per advisor).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| advisor_id | UUID | FK to advisors(id) |
| default_comp_level | NUMERIC | Default commission % |
| default_advancement | NUMERIC | Default advancement % |
| effective_date | DATE | When this rate took effect |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

RLS: Admins (via `is_portal_admin`) can CRUD; advisors can read their own.

### Files to Create

**2. `src/components/portal/AdminRoute.tsx`**
- Route guard checking `portalUser.role === 'admin'`
- Redirects to `/portal/advisor/dashboard` if not admin (since admins are also advisors)
- Same pattern as `AdvisorRoute` and `ClientRoute`

**3. `src/components/portal/AdminLayout.tsx`**
- Sidebar layout specifically for admin section
- Nav items: Dashboard (analytics), Agent Management, Client Reassignment
- Same visual style as `PortalLayout` but with admin-specific navigation
- Reuses the brand header, sign-out section, and mobile responsive patterns

**4. `src/pages/portal/admin/AdminDashboard.tsx`**
- Global analytics overview with cards:
  - Total advisors (active/inactive)
  - Total clients
  - Total policies (active/lapsed/pending)
  - Total premium volume (sum of monthly_premium from policies)
- Charts: policies by product type, clients per advisor, premium by advisor
- Recent activity feed (latest portal_messages, documents, policy changes)

**5. `src/pages/portal/admin/AgentManagement.tsx`**
- Table listing all advisors with columns: Name, Email, Phone, Status, Clients count, Policies count, Commission Level
- Search/filter bar
- "Add Agent" button opens a dialog/form
- Each row has actions: Edit, Activate/Deactivate
- Clicking a row navigates to agent detail

**6. `src/pages/portal/admin/AgentDetail.tsx`**
- Full agent profile view with editable fields (name, phone, specializations, languages, license_number, bio)
- Commission settings section (reads/writes `advisor_commission_config`)
- Client list for this advisor (from `portal_users` where `advisor_id` = this advisor's portal_user_id)
- Policy summary for this advisor
- Toggle active/inactive status

**7. `src/pages/portal/admin/AddAgentDialog.tsx`**
- Dialog component for creating new advisor accounts
- Fields: email, first name, last name, phone, password, specializations, languages
- Creates auth user + portal_users record + advisors record (via an edge function similar to `create-crm-agent`)

**8. `src/pages/portal/admin/ClientReassignment.tsx`**
- Shows all clients grouped by their current advisor
- Drag-and-drop or select-based reassignment
- Select a client, pick a new advisor, confirm
- Updates `portal_users.advisor_id` and `policies.advisor_id` for all the client's policies
- Logs the reassignment with a toast confirmation

**9. `supabase/functions/create-portal-agent/index.ts`**
- Edge function to create a new advisor (needs service role to create auth user)
- Creates: auth user, portal_users row (role=advisor), advisors row
- Validates @everencewealth.com domain restriction

### Files to Modify

**10. `src/App.tsx`**
- Add lazy imports for all new admin pages
- Import `AdminRoute` and `AdminLayout`
- Add route block:
```
<Route path="/portal/admin" element={<AdminRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="agents" element={<AgentManagement />} />
    <Route path="agents/:id" element={<AgentDetail />} />
    <Route path="clients" element={<ClientReassignment />} />
  </Route>
</Route>
```

**11. `src/components/portal/PortalLayout.tsx`**
- For admin users, add an "Admin Panel" link in the sidebar nav that links to `/portal/admin/dashboard`
- Show it with a distinct icon (Settings or ShieldCheck) separated from regular advisor nav

### Technical Notes

- The `portal_users` table already supports `role = 'admin'` and the `is_portal_admin()` function exists
- `AdvisorRoute` already allows `admin` role access (line 23), so admins can see all advisor pages too
- Client reassignment updates both `portal_users.advisor_id` and iterates through `policies` to update `advisor_id`
- The edge function for creating agents mirrors the pattern from `create-crm-agent` but targets portal tables
- Global analytics queries aggregate across all advisors (no advisor_id filter) using admin RLS policies
- Commission config table is separate from `advisor_performance` to maintain a clean default vs per-entry distinction
