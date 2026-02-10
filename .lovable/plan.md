

# Fix Admin Email Routing with Smart Fallback Logic

## Overview

Two edge functions need modification to filter admins out of broadcast/escalation emails while falling back to admins when no regular agents exist for a language (e.g., Polish).

## Changes

### File 1: `supabase/functions/register-crm-lead/index.ts`

**Location A (Lines 713-728):** Round robin agent fetch

- Fetch all configured agents as before
- After the capacity filter (line 725-728), add smart admin filtering:
  - Split `availableAgents` into non-admin vs all
  - If non-admin agents exist, use only those
  - If zero non-admin agents, fall back to all (including admins)
  - Add console logging indicating which path was taken

**Location B (Lines 735-750):** Language match fallback

- Same pattern: fetch all, filter capacity, then smart admin split
- If non-admin agents exist, use only those
- If zero, fall back to admins

### File 2: `supabase/functions/send-escalating-alarms/index.ts`

**Location (Lines 107-118):** Agent fetch for escalation emails

- Add `role` to the select fields
- After fetching, split into non-admin vs all
- If non-admin agents exist, use only those
- If zero non-admin agents, use all (admin fallback)
- **Bug fix:** Currently when no agents are found (line 113-116), the function does `continue` which skips updating `last_alarm_level`. This must be fixed so the state machine still progresses to T+5 even with zero recipients.

### Files NOT Modified (verified correct)

- `check-claim-window-expiry/index.ts` -- sends to `fallback_admin_id` only
- `check-contact-window-expiry/index.ts` -- sends to admins only
- Form/night-hold alerts in `register-crm-lead` -- already filter `role = 'admin'` explicitly

## Technical Details

### Smart Fallback Logic (applied in all 3 locations)

```text
allAgents = fetch from DB (active, accepts_new_leads)
nonAdminAgents = allAgents.filter(role != 'admin')

if (nonAdminAgents.length > 0):
    use nonAdminAgents          -- normal path
else:
    use allAgents               -- admin fallback
    log warning
```

### Language Routing After Fix

| Language | Configured Agents | After Filter | Fallback? |
|----------|------------------|--------------|-----------|
| FI | Juho, Eetu, John, Hans(admin) | Juho, Eetu, John | No |
| NL | Cindy, Nederlands, Hans(admin) | Cindy, Nederlands | No |
| FR | Cedric, Nathalie, Augustin | Cedric, Nathalie, Augustin | No |
| PL | Hans(admin) only | ZERO | Yes - Hans gets emails |
| EN, DE, ES, SV, DA, HU, NO | Steven(agent) + Hans(admin) | Steven | No |

### Escalation State Machine Bug Fix

Current code at lines 113-116:
```typescript
if (agentsError || !agents?.length) {
    console.warn(...);
    continue;  // BUG: skips alarm level update
}
```

Fix: When zero agents remain after filtering AND the admin fallback also yields zero (e.g., all inactive), still update `last_alarm_level` before continuing, so T+5 breach alert fires correctly.

## Expected Outcome

- Hans's inbox: ~100+ emails/day reduced to ~10-20/day
- Polish leads: Hans still receives all notifications (only person available)
- All other languages: only agents receive T+0 through T+4
- T+5 breach alerts: unchanged, admins only
- Form submissions and night holds: unchanged, admins only
