

## Changes Required

### 1. Remove role labels from the apply form
The `(Admin)` and `(Manager)` labels next to each name on Step 7 of the apply form are internal details that clients should not see. These will be removed entirely.

**File: `src/pages/ContractingIntake.tsx` (lines 398-403)**
- Remove the `(Admin)` and `(Manager)` spans after the name
- Keep just the name display: `{m.first_name} {m.last_name?.charAt(0)}.`

### 2. Exclude the test admin account "Admin U."
The portal_user "Admin User" (id: `e82dd92c-...`, email: `jrmenterprisegroup@gmail.com`) is a test account and should not appear in the manager list for clients.

Two approaches:
- **Option A (recommended):** Set `is_active = false` on that test account so it's filtered out automatically by the existing `.eq("is_active", true)` query. This is the cleanest approach — no code changes needed for this part, just a one-line database update.
- **Option B:** Add a hardcoded exclusion or a `is_test_account` flag. Heavier and unnecessary.

**I will use Option A** — a small database migration to deactivate the test admin account so it no longer appears in the manager dropdown (or anywhere else that filters by `is_active`).

### Summary of changes
| Change | Where |
|--------|-------|
| Remove `(Admin)` / `(Manager)` labels | `ContractingIntake.tsx` line 399-403 |
| Deactivate test admin "Admin User" | Database update on `portal_users` |

No edge function changes needed. No frontend logic changes beyond removing the label text.

