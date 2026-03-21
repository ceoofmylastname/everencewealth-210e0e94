

## Pull Contracting Agents into Client Invite Dropdown

### Problem
The "Invite on Behalf of Advisor" dropdown on the Invite Client page only queries the `advisors` table (4 people). You want it to also include all 24 contracting agents from the Contracting Agents page.

### Challenge
The `client_invitations.advisor_id` column has a foreign key constraint pointing to `advisors.id`. Most contracting agents (20 of 24) do not have a corresponding `advisors` record, so they cannot be directly used for invitations without one.

### Plan

**1. Auto-create advisor records for contracting agents (database migration)**
- Create an edge function or run a migration that, for each contracting agent without a matching `advisors` record (matched by `auth_user_id` or email), inserts a minimal `advisors` row linking them.
- This is a one-time backfill + we add a database trigger so future contracting agents automatically get an `advisors` record created.

**2. Update `ClientInvite.tsx` to merge both sources**
- In the `init()` function, fetch from both `advisors` and `contracting_agents` tables.
- Merge and deduplicate by email, using the `advisors.id` as the value (since that's what the FK requires).
- Label contracting-only agents with a "(Contracting)" tag in the dropdown for clarity.

### Technical Details

**Migration SQL:**
```sql
-- Backfill: create advisors records for contracting agents who don't have one
INSERT INTO advisors (auth_user_id, email, first_name, last_name, portal_user_id, is_active)
SELECT ca.auth_user_id, ca.email, ca.first_name, ca.last_name, 
       ca.portal_user_id, true
FROM contracting_agents ca
WHERE NOT EXISTS (
  SELECT 1 FROM advisors a WHERE a.email = ca.email
)
AND ca.auth_user_id IS NOT NULL;
```

Note: `portal_user_id` is required on advisors but is NULL for most contracting agents. We may need to also create portal_users entries or make the column nullable. I will verify and handle this in implementation.

**File: `src/pages/portal/advisor/ClientInvite.tsx`** (lines 51-58)
- After fetching advisors, also fetch contracting agents
- Join/merge by email, adding any contracting agents not already in the advisors list
- For agents that now have advisors records (from the backfill), they'll appear naturally

### Alternative simpler approach
If auto-creating advisor records is too invasive, we can instead just query contracting agents who already have a matching advisor record (by email) and merge those into the dropdown. This would show David Rosenberg, Steven Rosenberg, and Admin User (who already overlap) but not the other 20+ agents. Given your request, the backfill approach is recommended.

