

# Fix Night Hold Email "View Lead Details" Button Redirect

## Problem Identified

When admins receive the "After-Hours Lead Night Hold" email and click "View Lead Details," they may see an "Account Deactivated" page. This happens because:

1. **Incorrect URL path**: The email uses `/crm/agent/leads/${lead.id}` which goes through agent authentication checks
2. **Deactivated admin**: If a deactivated admin (like Johnathon Melvin with `is_active = false`) clicks the link, they see "Account Deactivated"
3. **Role mismatch**: Admins should be directed to the admin lead view, not the agent lead view

## Current Flow (Broken)

```text
Night Hold Email → "View Lead Details" button
     ↓
/crm/agent/leads/{leadId}
     ↓
CrmAgentRoute checks:
  - Is user logged in? → If no → Login redirect
  - Is user in crm_agents? → If no → Login redirect
  - Is user.is_active = true? → If no → "Account Deactivated" page ← PROBLEM
```

## Solution

### 1. Use Admin-Specific URL for Night Hold Alerts

Since night hold alerts go exclusively to admins, the "View Lead Details" button should link to the admin lead detail page:

**Change in `send-lead-notification/index.ts`:**

```typescript
// Before (line 222):
const leadDetailUrl = `${appUrl}/crm/agent/leads/${lead.id}`;

// After - Use admin URL for admin-targeted notifications:
const leadDetailUrl = useNightHoldAlertTemplate || useAdminUnclaimedTemplate || useSlaWarningTemplate
  ? `${appUrl}/crm/admin/leads/${lead.id}`
  : `${appUrl}/crm/agent/leads/${lead.id}`;
```

### 2. Verify Admin Query Filters Active Admins

The current code already filters for active admins (confirmed in `register-crm-lead/index.ts` line 545):
```typescript
.eq("role", "admin")
.eq("is_active", true)  // ← Already filtering for active only
```

This is correct - deactivated admins shouldn't receive night hold alerts.

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/send-lead-notification/index.ts` | Use `/crm/admin/leads/` URL for admin-targeted notifications (night_hold_alert, admin_unclaimed, sla_warning) |

---

## Technical Details

### Current URL Logic (Line 221-222)
```typescript
const claimUrl = `${appUrl}/crm/agent/leads/${lead.id}/claim`;
const leadDetailUrl = `${appUrl}/crm/agent/leads/${lead.id}`;
```

### New URL Logic
```typescript
const claimUrl = `${appUrl}/crm/agent/leads/${lead.id}/claim`;
// Admin-targeted notifications should use admin routes
const isAdminTargetedNotification = notification_type === 'night_hold_alert' 
  || notification_type === 'admin_unclaimed' 
  || notification_type === 'sla_warning';
const leadDetailUrl = isAdminTargetedNotification
  ? `${appUrl}/crm/admin/leads/${lead.id}`
  : `${appUrl}/crm/agent/leads/${lead.id}`;
```

---

## Expected Result After Fix

| Notification Type | Recipients | "View Lead Details" Links To |
|-------------------|------------|------------------------------|
| Night Hold Alert | Active Admins | `/crm/admin/leads/{id}` |
| Admin Unclaimed | Active Admins | `/crm/admin/leads/{id}` |
| SLA Warning | Active Admins | `/crm/admin/leads/{id}` |
| Broadcast | Active Agents | `/crm/agent/leads/{id}` |
| Direct Assignment | Target Agent | `/crm/agent/leads/{id}` |

Admins will now land on the correct admin lead detail page where they can view full lead info and manually assign to agents if needed.

