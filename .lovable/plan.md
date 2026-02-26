

## Fix: Grant Full Admin Access + Fix Manager FK Error

### Problem 1: Missing admin role assignments
`jrmenterprisegroup@gmail.com` (auth: `431e15bd-29b2-46cb-a037-83c9162ae1b5`) has `portal_users.role = admin` but:
- No `user_roles` row → blocks CRM & Blog admin access
- No `admin_email_whitelist` entry → won't auto-grant on future sign-ins

**Fix:** Database migration to insert both records.

### Problem 2: FK constraint error on manager assignment
`contracting_agents.manager_id` references `portal_users.id`. The manager dropdown likely passes a value that doesn't match a valid `portal_users.id`.

**Fix:** Investigate and patch the manager selection component to ensure it only passes valid `portal_users.id` values. Also check if existing `contracting_agents` rows have stale/invalid `manager_id` values.

### Implementation steps

1. **Run migration** to insert `user_roles` admin entry + `admin_email_whitelist` entry for `jrmenterprisegroup@gmail.com`
2. **Query for broken manager_id references** in `contracting_agents` and null them out
3. **Verify manager dropdown** in the contracting admin UI sends correct `portal_users.id` values

