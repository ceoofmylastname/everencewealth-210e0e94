

## Fix Escalating Email CTA Button Link

### Problem Identified
The "CLAIM THIS LEAD NOW" button in escalating alarm emails (1 min, 2 min, 3 min, 4 min reminders) links to an **incorrect URL** that results in a 404 error:
- **Current URL:** `/crm/leads/${lead.id}` (does not exist)
- **Correct URL:** `/crm/agent/leads/${lead.id}/claim` (the ClaimLeadPage route)

### Why This Matters
Agents receiving escalating reminder emails cannot claim leads because the CTA button takes them to a broken page. This defeats the purpose of the entire escalating alarm system.

### The Fix

**File to modify:** `supabase/functions/send-escalating-alarms/index.ts`

**Current code (Line 197):**
```typescript
<a href="${APP_URL}/crm/leads/${lead.id}"
```

**Updated code:**
```typescript
<a href="${APP_URL}/crm/agent/leads/${lead.id}/claim"
```

### Already Handled: Lead Already Claimed Scenario

The existing `ClaimLeadPage.tsx` already handles the case when an agent clicks the link but the lead was already claimed by another agent:

```text
+-------------------------------------------+
|     ⚠️  (amber warning icon)              |
|                                           |
|     Lead Already Claimed                  |
|                                           |
|     Another agent claimed this lead       |
|     first. Don't worry — new leads        |
|     are assigned regularly. Check your    |
|     dashboard for other opportunities.    |
|                                           |
|     [Go to Dashboard]                     |
+-------------------------------------------+
```

This means no additional code changes are needed to handle the "missed opportunity" scenario.

### Technical Summary

| Item | Details |
|------|---------|
| File | `supabase/functions/send-escalating-alarms/index.ts` |
| Line | 197 |
| Change | Update href from `/crm/leads/` to `/crm/agent/leads/.../claim` |
| Deployment | Edge function will auto-deploy |

### After Implementation

When agents click "CLAIM THIS LEAD NOW" from escalating emails:
1. **If lead is unclaimed** - They see the ClaimLeadPage with countdown timer and claim button
2. **If lead was already claimed** - They see a friendly message explaining another agent claimed it first, with a button to return to dashboard

