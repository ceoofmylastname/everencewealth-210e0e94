

## How Admins Can Add More Admins

### Current State

The `create-agent` edge function (line 133) always sets `role: "advisor"` when creating a new portal user. The `AdminAgentNew.tsx` form has no role selector. There is no way for an existing admin to promote someone to admin through the UI.

### Proposed Changes

#### 1. Add a "Role" selector to `AdminAgentNew.tsx`

- Add a dropdown with two options: **Advisor** (default) and **Admin**
- Place it after the Email field
- When "Admin" is selected, show a brief warning: "This user will have full administrative access to the portal."

#### 2. Update `supabase/functions/create-agent/index.ts`

- Accept an optional `role` field from the request body (default: `"advisor"`)
- Validate that the role is either `"advisor"` or `"admin"`
- Use the provided role when inserting into `portal_users` (line 133) instead of hardcoding `"advisor"`

#### 3. Show role badge in `AdminAgents.tsx` agent list

- Add a "Role" column to the agents table showing "Admin" or "Advisor" badge
- This requires fetching the `role` from the `portal_users` table (already joined via `portal_user_id`)

### Technical Details

**Edge function change** (`create-agent/index.ts`, line 58-68 and 129-141):
```typescript
// Accept role from body
const { first_name, last_name, email, phone, agency_id, license_number, specializations, send_invitation, role } = body;

// Validate role
const validRole = role === "admin" ? "admin" : "advisor";

// Use in insert
.insert({
  auth_user_id: authUserId,
  role: validRole,  // was hardcoded "advisor"
  ...
})
```

**Frontend change** (`AdminAgentNew.tsx`):
- Add a `role` field to form state (default `"advisor"`)
- Add a Select dropdown: Advisor / Admin
- Pass `role` in the edge function body

**Agent list change** (`AdminAgents.tsx`):
- Query `portal_users.role` alongside advisor data
- Display role badge in the table

### Files to Modify
- `supabase/functions/create-agent/index.ts` — Accept and use `role` parameter
- `src/pages/portal/admin/AdminAgentNew.tsx` — Add role selector to form
- `src/pages/portal/admin/AdminAgents.tsx` — Show role column in table

No database changes needed — `portal_users.role` already supports `"admin"` as a value.

