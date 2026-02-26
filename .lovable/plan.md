

## Question: Should the Apply Form Pull Managers from Agent Management?

### Current Behavior
The edge function `list-contracting-managers` queries `portal_users` where `role = 'advisor'` and `is_active = true`. This returns **all active advisors** as potential managers — not a curated list of actual managers.

Agent Management (`/crm/admin/agents`) manages a separate `crm_agents` table used for lead distribution, which has no connection to the contracting pipeline.

### The Real Problem
Neither source is ideal. The apply form should only show people who are actually **managers** in the contracting context — not every advisor and not CRM agents.

### Options

**Option A: Filter portal_users by contracting role**
The `contracting_agents` table has a `contracting_role` column. Update the edge function to only return portal users who have a matching `contracting_agents` record with `contracting_role = 'manager'` (or similar). This keeps the manager list scoped to the contracting system.

**Option B: Use a dedicated flag on portal_users**
Add an `is_manager` boolean to `portal_users` so admins can designate who appears in the manager dropdown. The admin portal would need a toggle for this.

**Option C: Pull from portal_users with role = 'admin'**
If only admins should appear as selectable managers, change the filter from `role = 'advisor'` to `role = 'admin'`.

### Recommendation
**Option C is the simplest and most likely correct.** In most setups, the people recruits select as "their manager" are the portal admins — not fellow advisors. This is a one-line change in the edge function:

```typescript
// Change from:
.eq("role", "advisor")
// To:
.eq("role", "admin")
```

No database migration needed. No frontend changes needed.

### If you want it tied to Agent Management instead
That would require joining `crm_agents` and returning those records. But CRM agents are for lead routing, not contracting oversight — so this likely isn't the right source.

Let me know which option fits your intent, or clarify who exactly should appear in the "Select your manager" dropdown.

