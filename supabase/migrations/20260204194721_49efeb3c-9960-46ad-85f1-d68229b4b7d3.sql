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