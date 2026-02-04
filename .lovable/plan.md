
# Update claim-lead to Cancel Escalating Alarms

## Overview

When an agent claims a lead, we need to stop any remaining escalating alarms (levels 1-4) from being sent. This prevents agents from receiving alarm emails after someone has already claimed the lead.

---

## Current State

The contact timer update (lines 62-71) currently sets:
- `contact_timer_started_at`
- `contact_timer_expires_at`
- `contact_sla_breached: false`
- `claim_timer_expires_at: null`

The activity log (lines 81-87) notes: "Lead claimed - 5-minute contact window started"

---

## Changes Required

### 1. Add Alarm Cancellation to Timer Update (lines 64-70)

Add `last_alarm_level: 99` to stop the escalation sequence:

```typescript
.update({
  contact_timer_started_at: now.toISOString(),
  contact_timer_expires_at: contactWindowExpiry.toISOString(),
  contact_sla_breached: false,
  claim_timer_expires_at: null,
  // Stop escalating alarms - set to 99 so cron job ignores this lead
  last_alarm_level: 99,
})
```

### 2. Add Alarm Cancellation Logging (after line 77)

Add a log message confirming alarms are cancelled:

```typescript
console.log(`[claim-lead] Escalating alarms cancelled - lead claimed by agent`);
```

### 3. Update Activity Log Message (line 85)

Update the notes to reflect alarm cancellation:

```typescript
notes: "Lead claimed - 5-minute contact window started - escalating alarms cancelled",
```

---

## How It Works

```text
Escalating Alarm Cron Job Query:
└── Looks for: last_alarm_level = 0, 1, 2, or 3

After Lead Claimed:
└── last_alarm_level = 99 → No longer matches query → No more alarms sent
```

The value 99 is used as a "sentinel value" meaning "alarms complete/stopped".

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/claim-lead/index.ts` | Add `last_alarm_level: 99`, update logging and activity note |

---

## Verification

After implementation:
1. Claim a test lead
2. Query: `SELECT last_alarm_level FROM crm_leads WHERE id = 'lead-id'` → should be 99
3. Wait 1+ minutes → no escalating emails should arrive for that lead
