

# Auto-Notify Manager When Agent Selects Them During Intake

## What's Already Working
- The intake form already saves `manager_id` on the `contracting_agents` record (this IS the relationship).
- The RLS policy already uses `manager_id` to grant managers visibility into their recruits' data.
- So **relationship creation** and **permission granting** are already handled.

## What's Missing
A notification to the manager. When a recruit selects a manager on Step 8 of the intake form, the manager should receive an in-app notification saying a new agent has been assigned to them.

## The Change

### Edge Function -- `supabase/functions/contracting-intake/index.ts`

After the activity log insert (around line 145), add a notification insert when a `manager_id` is provided:

```typescript
// Notify the selected manager
if (manager_id) {
  await adminClient.from("portal_notifications").insert({
    user_id: manager_id,
    title: "New Agent Assigned to You",
    message: `${first_name} ${last_name} has submitted an application and selected you as their manager.`,
    notification_type: "contracting",
    link: "/portal/advisor/contracting/dashboard",
  });
}
```

This uses the existing `portal_notifications` table (which the manager can already see via the portal UI) rather than `contracting_notifications` (which requires a `contracting_agents` record the manager may not have).

No database changes or new tables are needed -- everything uses existing infrastructure.
