
# Update T+5 Admin Notification Subject

## Change

One single-line edit in `supabase/functions/check-claim-window-expiry/index.ts` at line 118.

**Old (line 118):**
```
subject: `🚨 Lead Unclaimed - ${lead.first_name} ${lead.last_name} (${lead.language.toUpperCase()})`
```

**New (line 118):**
```
subject: `CRM_ADMIN_NO_CLAIM_${lead.language.toUpperCase()} | No agent claimed lead within 5 minutes`
```

## What Does NOT Change

- Recipient: still sends to `adminEmail` resolved from `fallback_admin_id` (line 117)
- `claim_sla_breached` flag update (line 93)
- Email body HTML (lines 119-196)
- In-app notification creation (lines 206-218)
- Activity log entry (lines 221-229)
- `lead.language.toUpperCase()` is already used in the existing line

## Context (lines 115-120 after change)

```typescript
            body: JSON.stringify({
              from: "CRM Alerts <crm@notifications.delsolprimehomes.com>",
              to: [adminEmail],
              subject: `CRM_ADMIN_NO_CLAIM_${lead.language.toUpperCase()} | No agent claimed lead within 5 minutes`,
              html: `
                <!DOCTYPE html>
```

## Full Subject Line Sequence (after all updates)

| Timer | Function | Subject Format |
|-------|----------|---------------|
| T+0 | send-lead-notification | `CRM_NEW_LEAD_EN \| New English lead -- call immediately` |
| T+1 | send-escalating-alarms | `CRM_NEW_LEAD_EN_T1 \| Reminder 1 -- lead not claimed (1 min)` |
| T+2 | send-escalating-alarms | `CRM_NEW_LEAD_EN_T2 \| Reminder 2 -- SLA running (2 min)` |
| T+3 | send-escalating-alarms | `CRM_NEW_LEAD_EN_T3 \| Reminder 3 -- URGENT (3 min)` |
| T+4 | send-escalating-alarms | `CRM_NEW_LEAD_EN_T4 \| FINAL reminder -- fallback in 1 minute` |
| T+5 | check-claim-window-expiry | `CRM_ADMIN_NO_CLAIM_EN \| No agent claimed lead within 5 minutes` |
