-- Add Gmail OAuth columns to crm_agents table
ALTER TABLE crm_agents ADD COLUMN IF NOT EXISTS gmail_access_token TEXT;
ALTER TABLE crm_agents ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT;
ALTER TABLE crm_agents ADD COLUMN IF NOT EXISTS last_gmail_sync TIMESTAMPTZ;