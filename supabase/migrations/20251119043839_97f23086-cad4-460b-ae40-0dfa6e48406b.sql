-- ===================================================
-- CREATE DIVERSITY TRACKING VIEW
-- ===================================================

CREATE OR REPLACE VIEW domain_diversity_report AS
SELECT 
  ad.domain,
  ad.category,
  ad.language,
  ad.region,
  ad.tier,
  ad.trust_score,
  COALESCE(dus.total_uses, 0) as total_uses,
  CASE 
    WHEN COALESCE(dus.total_uses, 0) = 0 THEN 'UNUSED - Priority 1'
    WHEN COALESCE(dus.total_uses, 0) < 5 THEN 'LIGHTLY USED - Priority 2'
    WHEN COALESCE(dus.total_uses, 0) < 10 THEN 'MODERATE - Priority 3'
    WHEN COALESCE(dus.total_uses, 0) < 20 THEN 'HIGH USE - Limit'
    ELSE 'BLOCKED - Overused'
  END as usage_status,
  (100 - (COALESCE(dus.total_uses, 0) * 5))::integer as diversity_score
FROM approved_domains ad
LEFT JOIN domain_usage_stats dus ON ad.domain = dus.domain
WHERE ad.is_allowed = true
ORDER BY diversity_score DESC, ad.tier, ad.trust_score DESC, ad.domain;

-- ===================================================
-- CREATE DIVERSITY ALERT SYSTEM
-- ===================================================

CREATE TABLE IF NOT EXISTS citation_diversity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  current_uses INTEGER NOT NULL,
  threshold_reached TEXT NOT NULL CHECK (threshold_reached IN ('10_uses', '15_uses', '20_uses')),
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE citation_diversity_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view alerts
CREATE POLICY "Authenticated users view diversity alerts" ON citation_diversity_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Service can insert alerts
CREATE POLICY "Service inserts diversity alerts" ON citation_diversity_alerts
  FOR INSERT WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_diversity_alerts_domain ON citation_diversity_alerts(domain, resolved);
CREATE INDEX IF NOT EXISTS idx_diversity_alerts_threshold ON citation_diversity_alerts(threshold_reached, resolved);

-- ===================================================
-- CREATE USAGE THRESHOLD TRIGGER
-- ===================================================

CREATE OR REPLACE FUNCTION check_domain_usage_threshold()
RETURNS TRIGGER AS $$
BEGIN
  -- Alert at 10 uses (warning)
  IF NEW.total_uses = 10 AND OLD.total_uses < 10 THEN
    INSERT INTO citation_diversity_alerts (domain, current_uses, threshold_reached)
    VALUES (NEW.domain, 10, '10_uses');
  END IF;
  
  -- Alert at 15 uses (high warning)
  IF NEW.total_uses = 15 AND OLD.total_uses < 15 THEN
    INSERT INTO citation_diversity_alerts (domain, current_uses, threshold_reached)
    VALUES (NEW.domain, 15, '15_uses');
  END IF;
  
  -- Alert at 20 uses (BLOCK threshold)
  IF NEW.total_uses >= 20 AND OLD.total_uses < 20 THEN
    INSERT INTO citation_diversity_alerts (domain, current_uses, threshold_reached)
    VALUES (NEW.domain, 20, '20_uses');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS domain_usage_alert_trigger ON domain_usage_stats;
CREATE TRIGGER domain_usage_alert_trigger
AFTER UPDATE ON domain_usage_stats
FOR EACH ROW
WHEN (OLD.total_uses IS DISTINCT FROM NEW.total_uses)
EXECUTE FUNCTION check_domain_usage_threshold();