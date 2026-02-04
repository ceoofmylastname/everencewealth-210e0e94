

# Add Alarm Level Tracking to CRM Leads

## Overview

Add a new column `last_alarm_level` to the `crm_leads` table to support escalating email alerts during the claim window. This enables a 5-alarm notification system (0-4) before admin escalation triggers at T+5 minutes.

---

## Alarm System Context

```text
T+0: Lead Created → Initial "New Lead" email (alarm level 0)
T+1: 1 minute passed → "1 Min Passed" email (alarm level 1)
T+2: 2 minutes passed → "2 Min Passed" email (alarm level 2)
T+3: 3 minutes passed → "3 Min Passed" email (alarm level 3)
T+4: 4 minutes passed → "4 Min Passed" email (alarm level 4)
T+5: 5 minutes passed → Admin escalation (existing logic)
```

The `last_alarm_level` column allows the cron job to determine which alarm to send next by comparing the current time against `claim_timer_started_at` and the stored alarm level.

---

## Database Changes

### 1. Add Column

```sql
ALTER TABLE crm_leads
ADD COLUMN IF NOT EXISTS last_alarm_level INTEGER DEFAULT 0;
```

Column specifications:
- Type: INTEGER
- Default: 0 (new leads start at alarm level 0)
- NOT NULL: No (default handles this)
- Purpose: Tracks which escalation email was last sent (0-4)

### 2. Add Comment

```sql
COMMENT ON COLUMN crm_leads.last_alarm_level IS 
'Tracks which alarm level was last sent (0-4). Used for escalating email notifications during claim window. 0 = initial alarm, 4 = final alarm before admin escalation at T+5.';
```

### 3. Create Performance Index

```sql
CREATE INDEX IF NOT EXISTS idx_crm_leads_alarm_level 
ON crm_leads(last_alarm_level, claim_timer_started_at) 
WHERE lead_claimed = FALSE AND claim_timer_expires_at IS NOT NULL;
```

This partial index optimizes queries for the cron job that checks unclaimed leads with pending alarms.

---

## How It Will Be Used

The cron job will query leads like this:

```sql
SELECT * FROM crm_leads
WHERE lead_claimed = FALSE
  AND claim_timer_expires_at IS NOT NULL
  AND last_alarm_level < 5
  AND EXTRACT(EPOCH FROM (NOW() - claim_timer_started_at))/60 > last_alarm_level;
```

This finds leads where:
- Not yet claimed
- Claim timer is active
- Haven't sent all 5 alarms yet
- Enough time has passed to send the next alarm

---

## Key Points

| Aspect | Detail |
|--------|--------|
| Migration Type | Additive only (no existing columns modified) |
| Default Value | 0 (new leads auto-start at alarm level 0) |
| Nullable | Not needed (DEFAULT ensures value exists) |
| Index Purpose | Optimize cron job queries on unclaimed leads |
| Backward Compatible | Yes, existing leads get default value of 0 |

---

## Files Changed

1. **Database Migration**: Create new migration to add column and index

---

## Technical Details

### SQL Migration

```sql
-- Add alarm level tracking column
ALTER TABLE crm_leads
ADD COLUMN IF NOT EXISTS last_alarm_level INTEGER DEFAULT 0;

-- Add documentation
COMMENT ON COLUMN crm_leads.last_alarm_level IS 
'Tracks which alarm level was last sent (0-4). Used for escalating email notifications during claim window. 0 = initial alarm, 4 = final alarm before admin escalation at T+5.';

-- Create partial index for efficient querying by cron job
CREATE INDEX IF NOT EXISTS idx_crm_leads_alarm_level 
ON crm_leads(last_alarm_level, claim_timer_started_at) 
WHERE lead_claimed = FALSE AND claim_timer_expires_at IS NOT NULL;
```

