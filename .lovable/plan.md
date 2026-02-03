

# Add Contact Timer to Lead Claiming

## Overview

Update the `claim-lead` edge function to automatically start the 5-minute contact window timer (Stage 2 SLA) when an agent successfully claims a lead, completing the dual-stage SLA tracking system.

---

## Current Flow

```text
1. Agent claims lead via RPC claim_lead()
2. Notification marked as read
3. Other agents notified
4. Full lead data returned
```

## New Flow

```text
1. Agent claims lead via RPC claim_lead()
2. ✅ NEW: Start 5-minute contact timer
3. ✅ NEW: Clear claim timer (no longer needed)
4. ✅ NEW: Log activity for audit trail
5. Notification marked as read
6. Other agents notified
7. Full lead data returned
```

---

## Changes Required

### File: `supabase/functions/claim-lead/index.ts`

### Location: After successful claim (line 56), before notification handling

### New Code Block

```typescript
// NEW: Start contact window timer (5 minutes for first contact)
const now = new Date();
const contactWindowExpiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

const { error: timerError } = await supabase
  .from("crm_leads")
  .update({
    contact_timer_started_at: now.toISOString(),
    contact_timer_expires_at: contactWindowExpiry.toISOString(),
    contact_sla_breached: false,
    // Clear claim timer since lead is now claimed
    claim_timer_expires_at: null,
  })
  .eq("id", leadId);

if (timerError) {
  console.error("[claim-lead] Failed to start contact timer:", timerError);
} else {
  console.log(`[claim-lead] Contact timer started for lead ${leadId}`);
  console.log(`[claim-lead] Contact window expires at: ${contactWindowExpiry.toISOString()}`);
}

// Log activity for audit trail
await supabase.from("crm_activities").insert({
  lead_id: leadId,
  agent_id: agentId,
  activity_type: "note",
  notes: "Lead claimed - 5-minute contact window started",
  created_at: now.toISOString(),
});
```

---

## Timer Behavior

| Field | Before Claim | After Claim |
|-------|--------------|-------------|
| `claim_timer_started_at` | Set | Unchanged |
| `claim_timer_expires_at` | Set | **Cleared (null)** |
| `claim_sla_breached` | false | Unchanged |
| `contact_timer_started_at` | null | **NOW()** |
| `contact_timer_expires_at` | null | **NOW() + 5 min** |
| `contact_sla_breached` | false | false |

---

## Dual-Stage SLA Flow

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         LEAD CREATED                                 │
│                    claim_timer_started_at = NOW()                    │
│                    claim_timer_expires_at = NOW() + 5 min           │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    STAGE 1: CLAIM     │
                    │    5-minute window    │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
        ┌─────▼─────┐    ┌──────▼──────┐   ┌─────▼─────┐
        │  CLAIMED  │    │   EXPIRED   │   │  EXPIRED  │
        │  (success)│    │  (breach)   │   │(reassign) │
        └─────┬─────┘    └─────────────┘   └───────────┘
              │
              │ claim_timer_expires_at = null
              │ contact_timer_started_at = NOW()
              │ contact_timer_expires_at = NOW() + 5 min
              │
    ┌─────────▼─────────┐
    │   STAGE 2: CALL   │
    │   5-minute window │
    └─────────┬─────────┘
              │
        ┌─────▼─────┐
        │  CALLED   │ → first_action_completed = true
        │  (success)│   contact_timer_expires_at = null
        └───────────┘
```

---

## Verification Steps

1. Claim a lead as an agent
2. Query database to verify:
   ```sql
   SELECT id, 
          claim_timer_started_at, 
          claim_timer_expires_at,
          contact_timer_started_at, 
          contact_timer_expires_at,
          contact_sla_breached
   FROM crm_leads 
   WHERE id = '<lead-id>';
   ```
3. Confirm:
   - `claim_timer_expires_at` is `NULL`
   - `contact_timer_started_at` is set
   - `contact_timer_expires_at` is 5 minutes after `contact_timer_started_at`
   - Activity log shows "Lead claimed - 5-minute contact window started"

