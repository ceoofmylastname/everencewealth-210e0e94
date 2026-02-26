

## Fix "Select your manager" to Show Only Admins and Managers

### Problem
The "Select your manager" dropdown on `/apply` currently shows all `portal_users` with `role = 'admin'`. The user wants it to also include designated **managers** — advisors who have been flagged as managers by an admin. Currently there is no `is_manager` concept in the system.

### Changes Required

#### 1. Database Migration: Add `is_manager` column to `portal_users`
Add a boolean `is_manager` column (default `false`) to the `portal_users` table. This lets admins designate specific advisors as managers without changing their role.

```sql
ALTER TABLE public.portal_users
ADD COLUMN is_manager boolean NOT NULL DEFAULT false;
```

#### 2. Update Edge Function: `list-contracting-managers`
Change the query to return users who are either `role = 'admin'` OR `is_manager = true` (and active):

```typescript
const { data, error } = await supabase
  .from("portal_users")
  .select("id, first_name, last_name, role, is_manager")
  .eq("is_active", true)
  .or("role.eq.admin,is_manager.eq.true")
  .order("first_name");
```

#### 3. Admin Agent Management UI: Add Manager Toggle
In `AdminAgents.tsx`, add a "Manager" toggle (similar to the existing Dashboard toggle) in the agent table. This lets admins flip `is_manager` on/off for any advisor directly from the Agent Management page.

- Add a new "Manager" column header in the table.
- Add a `Switch` component for each agent row that toggles `is_manager` on `portal_users`.
- Show a "Manager" badge in the Role column when `is_manager = true` (in addition to the existing Admin/Advisor badge).

#### 4. Apply Form UI: Show Role Context
Optionally display a subtle label on each manager option (e.g., "Admin" or "Manager") so recruits can see what type of person they're selecting.

### Technical Details
- **Database**: One new column on `portal_users` (`is_manager boolean DEFAULT false`).
- **Edge function**: One query change using `.or()` filter.
- **Frontend**: `AdminAgents.tsx` gets a new toggle column; `ContractingIntake.tsx` optionally shows role context on each option.
- **No RLS changes needed** — the edge function uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS.
- The `fetchAgents` function in `AdminAgents.tsx` already joins `portal_users` via `portal_user_id`, so reading `is_manager` just requires adding it to the select.

