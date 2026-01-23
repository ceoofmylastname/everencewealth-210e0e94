-- Add fallback_admin_id column to crm_round_robin_config
ALTER TABLE crm_round_robin_config 
ADD COLUMN IF NOT EXISTS fallback_admin_id UUID REFERENCES crm_agents(id);

COMMENT ON COLUMN crm_round_robin_config.fallback_admin_id IS 
  'The specific admin who receives leads when this fallback round is triggered';