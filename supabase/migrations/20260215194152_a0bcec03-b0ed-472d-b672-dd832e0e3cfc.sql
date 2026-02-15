
-- Phase 2: Schema Changes for Everence Wealth Transformation
-- Strategy: Add new columns, keep old ones for backward compat, deactivate unused languages

-- =============================================
-- 1. Deactivate non-EN/ES languages in site_languages
-- =============================================
UPDATE public.site_languages
SET is_active = false
WHERE language_code NOT IN ('en', 'es');

-- Ensure EN and ES are active
UPDATE public.site_languages
SET is_active = true
WHERE language_code IN ('en', 'es');

-- Insert ES if it doesn't exist
INSERT INTO public.site_languages (language_code, language_name, hreflang_code, display_flag, is_active, is_default, sort_order, url_prefix)
VALUES ('es', 'Spanish', 'es', '🇪🇸', true, false, 2, '/es')
ON CONFLICT (language_code) DO UPDATE SET is_active = true;

-- =============================================
-- 2. Add advisor-specific columns to crm_agents
-- =============================================
ALTER TABLE public.crm_agents
ADD COLUMN IF NOT EXISTS credentials TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS advisor_title TEXT;

COMMENT ON COLUMN public.crm_agents.credentials IS 'Professional credentials: CFP, CLU, ChFC, RICP, etc.';
COMMENT ON COLUMN public.crm_agents.specialties IS 'Areas of expertise: retirement, tax-planning, estate-planning, asset-protection';
COMMENT ON COLUMN public.crm_agents.advisor_title IS 'Display title e.g. Senior Wealth Strategist';

-- =============================================
-- 3. Add insurance context columns to crm_leads
-- =============================================
ALTER TABLE public.crm_leads
ADD COLUMN IF NOT EXISTS strategy_interest TEXT,
ADD COLUMN IF NOT EXISTS product_type_interest TEXT[],
ADD COLUMN IF NOT EXISTS retirement_timeline TEXT,
ADD COLUMN IF NOT EXISTS current_savings_range TEXT,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT,
ADD COLUMN IF NOT EXISTS tax_situation TEXT;

COMMENT ON COLUMN public.crm_leads.strategy_interest IS 'Insurance/wealth strategy interest (replaces property_interest context)';
COMMENT ON COLUMN public.crm_leads.product_type_interest IS 'Product types: iul, wl, term, annuity, ltc, disability';
COMMENT ON COLUMN public.crm_leads.retirement_timeline IS 'Years until retirement target';
COMMENT ON COLUMN public.crm_leads.current_savings_range IS 'Current savings/investment range';
COMMENT ON COLUMN public.crm_leads.risk_tolerance IS 'low, moderate, high';
COMMENT ON COLUMN public.crm_leads.tax_situation IS 'Current tax bracket or situation description';

-- =============================================
-- 4. Add insurance columns to properties table
-- =============================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS product_type TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS monthly_premium NUMERIC,
ADD COLUMN IF NOT EXISTS death_benefit NUMERIC,
ADD COLUMN IF NOT EXISTS cash_value_projection JSONB,
ADD COLUMN IF NOT EXISTS living_benefits TEXT[],
ADD COLUMN IF NOT EXISTS product_highlights TEXT[],
ADD COLUMN IF NOT EXISTS illustration_url TEXT;

COMMENT ON COLUMN public.properties.product_type IS 'Insurance product type: iul, wl, term, annuity, ltc, disability';
COMMENT ON COLUMN public.properties.carrier IS 'Insurance carrier name';
COMMENT ON COLUMN public.properties.monthly_premium IS 'Monthly premium amount';
COMMENT ON COLUMN public.properties.death_benefit IS 'Death benefit amount';
COMMENT ON COLUMN public.properties.cash_value_projection IS 'JSON with year-by-year cash value projections';
COMMENT ON COLUMN public.properties.living_benefits IS 'Array of living benefits included';
COMMENT ON COLUMN public.properties.product_highlights IS 'Key product highlights/features';
COMMENT ON COLUMN public.properties.illustration_url IS 'URL to product illustration PDF';

-- =============================================
-- 5. Add insurance columns to apartments_properties
-- =============================================
ALTER TABLE public.apartments_properties
ADD COLUMN IF NOT EXISTS strategy_type TEXT,
ADD COLUMN IF NOT EXISTS min_investment NUMERIC,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS risk_level TEXT;

COMMENT ON COLUMN public.apartments_properties.strategy_type IS 'Premium strategy type: captive, ppli, premium-financing, executive-bonus, split-dollar';
COMMENT ON COLUMN public.apartments_properties.min_investment IS 'Minimum investment/premium amount';
COMMENT ON COLUMN public.apartments_properties.target_audience IS 'Target audience: hnw, uhnw, business-owner, executive';
COMMENT ON COLUMN public.apartments_properties.risk_level IS 'Risk level: conservative, moderate, aggressive';

-- =============================================
-- 6. Add insurance context to leads table
-- =============================================
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS strategy_interest TEXT;

COMMENT ON COLUMN public.leads.strategy_interest IS 'Insurance/wealth strategy interest (replaces property_interest context)';

-- =============================================
-- 7. Add insurance context to emma_leads
-- =============================================
ALTER TABLE public.emma_leads
ADD COLUMN IF NOT EXISTS strategy_interest TEXT,
ADD COLUMN IF NOT EXISTS retirement_goals TEXT,
ADD COLUMN IF NOT EXISTS tax_concerns TEXT;

COMMENT ON COLUMN public.emma_leads.strategy_interest IS 'Insurance strategy interest from AI conversation';
COMMENT ON COLUMN public.emma_leads.retirement_goals IS 'Retirement goals captured during conversation';
COMMENT ON COLUMN public.emma_leads.tax_concerns IS 'Tax-related concerns captured during conversation';

-- =============================================
-- 8. Add state-based columns to location_pages
-- =============================================
ALTER TABLE public.location_pages
ADD COLUMN IF NOT EXISTS state_code TEXT,
ADD COLUMN IF NOT EXISTS tax_advantages TEXT,
ADD COLUMN IF NOT EXISTS regulations_summary TEXT,
ADD COLUMN IF NOT EXISTS featured_carriers TEXT[];

COMMENT ON COLUMN public.location_pages.state_code IS 'US state code (CA, TX, NY, etc.)';
COMMENT ON COLUMN public.location_pages.tax_advantages IS 'State-specific tax advantages summary';
COMMENT ON COLUMN public.location_pages.regulations_summary IS 'State insurance regulations summary';
COMMENT ON COLUMN public.location_pages.featured_carriers IS 'Insurance carriers featured in this state';

-- =============================================
-- 9. Update chatbot_conversations for insurance context
-- =============================================
ALTER TABLE public.chatbot_conversations
ADD COLUMN IF NOT EXISTS strategy_interest TEXT,
ADD COLUMN IF NOT EXISTS retirement_timeline TEXT;

COMMENT ON COLUMN public.chatbot_conversations.strategy_interest IS 'Insurance strategy interest (replaces property_type context)';
COMMENT ON COLUMN public.chatbot_conversations.retirement_timeline IS 'Years until retirement';
