

# Add Claim Timer to Lead Registration

## Overview

Update the `register-crm-lead` edge function to automatically start the 5-minute claim window timer when a new lead is created, populating the new dual-stage SLA tracking fields.

---

## Current State

The lead insert (lines 454-500) already has some timing fields:
- `claim_window_expires_at` - existing field (line 495)
- `sla_breached`, `first_action_completed`, `is_night_held` - existing fields (lines 497-499)

But the **new dual-stage SLA fields** from our migration are NOT being set:
- `claim_timer_started_at` - NEW
- `claim_timer_expires_at` - NEW  
- `claim_sla_breached` - NEW

---

## Changes Required

### File: `supabase/functions/register-crm-lead/index.ts`

**Location**: Lines 454-500 (lead insert statement)

**Add these fields to the insert:**

```typescript
// Calculate claim timer values (5 minutes)
const claimTimerStart = new Date();
const claimTimerExpiry = new Date(claimTimerStart.getTime() + 5 * 60 * 1000);

// In the insert:
claim_timer_started_at: contactComplete ? claimTimerStart.toISOString() : null,
claim_timer_expires_at: contactComplete ? claimTimerExpiry.toISOString() : null,
claim_sla_breached: false,
```

**Add logging after lead creation (line 509):**

```typescript
if (contactComplete) {
  console.log(`[register-crm-lead] Claim timer started for lead ${lead.id}`);
  console.log(`[register-crm-lead] Claim window expires at: ${claimTimerExpiry.toISOString()}`);
}
```

**Night Hold handling (lines 589-597):**

Also clear the new claim timer fields during night hold:

```typescript
claim_timer_started_at: null,
claim_timer_expires_at: null,
```

---

## Technical Details

### Timer Logic

| Field | Value | Condition |
|-------|-------|-----------|
| `claim_timer_started_at` | `NOW()` | Only if `contactComplete = true` |
| `claim_timer_expires_at` | `NOW() + 5 minutes` | Only if `contactComplete = true` |
| `claim_sla_breached` | `false` | Always default to false |

### Why 5 Minutes?

The dual-stage SLA system uses a fixed 5-minute claim window (Stage 1), separate from the existing configurable `claim_window_expires_at` which can vary per round-robin config.

### Edge Cases

- **Incomplete leads** (no phone/email): Timers set to `null`, no SLA tracking
- **Night held leads**: Timers cleared during night hold, will be set when released
- **Rule-based assignments**: Contact timer will start when claimed via routing rule

---

## Verification Steps

1. Create a new lead via Emma chatbot or contact form
2. Query the database to verify:
   ```sql
   SELECT id, first_name, 
          claim_timer_started_at, 
          claim_timer_expires_at,
          claim_sla_breached
   FROM crm_leads 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
3. Confirm `claim_timer_expires_at` is exactly 5 minutes after `claim_timer_started_at`
4. Confirm `claim_sla_breached` is `false`

