
# Fix T+5 Admin Email Subject Lines

## Problem

The T+5 admin email for the Finnish test lead used the old emoji subject format:
- **Sent**: `🚨 UNCLAIMED: Fin Test - Manual Assignment Required`
- **Expected**: `CRM_ADMIN_NO_CLAIM_FI | No agent claimed lead within 5 minutes`

The email was sent by `check-unclaimed-leads` which calls `send-lead-notification` with `notification_type: 'admin_unclaimed'`. That function still has legacy subject lines.

## Root Cause

`send-lead-notification/index.ts` line 424 has the old format. The direct-sending functions (`check-claim-window-expiry`, `check-contact-window-expiry`) already use the correct deterministic format, but `send-lead-notification` was never updated for its admin templates.

## Changes

### File: `supabase/functions/send-lead-notification/index.ts`

**Line 422** -- SLA Warning subject (used by `check-sla-breaches`):
```
// Before:
emailSubject = `⚠️ SLA Warning: ${lead.first_name} ${lead.last_name} not worked by ${assigned_agent_name || 'Agent'}`;

// After:
const slaLangCode = (normalizedLead.language || "EN").toUpperCase();
emailSubject = `CRM_ADMIN_CLAIMED_NOT_CALLED_${slaLangCode} | Lead claimed but not called (SLA breach)`;
```

**Line 424** -- Admin Unclaimed subject (used by `check-unclaimed-leads`):
```
// Before:
emailSubject = `🚨 UNCLAIMED: ${lead.first_name} ${lead.last_name} - Manual Assignment Required`;

// After:
const unclaimedLangCode = (normalizedLead.language || "EN").toUpperCase();
emailSubject = `CRM_ADMIN_NO_CLAIM_${unclaimedLangCode} | No agent claimed lead within 5 minutes`;
```

These two changes align `send-lead-notification` with the deterministic subject standard already used by `check-claim-window-expiry` and `check-contact-window-expiry`.

No other files need changes. The `urgent` template (line 426) is a separate notification type not part of the 7-tier escalation sequence.
