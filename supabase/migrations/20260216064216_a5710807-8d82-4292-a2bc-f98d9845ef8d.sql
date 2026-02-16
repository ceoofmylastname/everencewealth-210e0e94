
-- ============================================
-- AGENT DASHBOARD TABLES
-- ============================================

-- 1. CARRIER NEWS
CREATE TABLE public.carrier_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID REFERENCES public.carriers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  article_type TEXT CHECK (article_type IN ('rate_update', 'product_launch', 'general', 'compliance', 'promotion')) DEFAULT 'general',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_carrier_news_carrier ON public.carrier_news(carrier_id);
CREATE INDEX idx_carrier_news_status ON public.carrier_news(status);
CREATE INDEX idx_carrier_news_published ON public.carrier_news(published_at DESC);

-- 2. LEAD PRODUCTS
CREATE TABLE public.lead_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('verified_life', 'annuity', 'iul', 'final_expense', 'internet', 'inbound_calls', 'medicare')) NOT NULL,
  price_per_lead NUMERIC NOT NULL,
  minimum_quantity INTEGER DEFAULT 1,
  expected_conversion_rate NUMERIC,
  badge_text TEXT,
  description TEXT,
  features TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_lead_products_category ON public.lead_products(category);
CREATE INDEX idx_lead_products_active ON public.lead_products(active);

-- 3. SCHEDULE EVENTS
CREATE TABLE public.schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_type TEXT CHECK (event_type IN ('training', 'meeting', 'webinar', 'call', 'other')) DEFAULT 'other',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  created_by UUID REFERENCES public.portal_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_schedule_date ON public.schedule_events(event_date);
CREATE INDEX idx_schedule_type ON public.schedule_events(event_type);

-- 4. ADVISOR RANK CONFIG
CREATE TABLE public.advisor_rank_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_name TEXT NOT NULL UNIQUE,
  min_ytd_premium NUMERIC NOT NULL,
  min_advisors_recruited INTEGER DEFAULT 0,
  compensation_level_percent NUMERIC NOT NULL,
  badge_color TEXT,
  rank_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rank_order ON public.advisor_rank_config(rank_order);

-- 5. ADVISOR PERFORMANCE
CREATE TABLE public.advisor_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  lead_type TEXT,
  leads_purchased INTEGER DEFAULT 0,
  leads_worked INTEGER DEFAULT 0,
  dials_made INTEGER DEFAULT 0,
  appointments_set INTEGER DEFAULT 0,
  appointments_held INTEGER DEFAULT 0,
  clients_closed INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  total_lead_cost NUMERIC DEFAULT 0,
  comp_level_percent NUMERIC DEFAULT 100,
  advancement_percent NUMERIC DEFAULT 75,
  expected_issue_pay NUMERIC GENERATED ALWAYS AS (revenue * comp_level_percent / 100 * advancement_percent / 100) STORED,
  expected_deferred_pay NUMERIC GENERATED ALWAYS AS (revenue * (100 - advancement_percent) / 100) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_performance_advisor ON public.advisor_performance(advisor_id);
CREATE INDEX idx_performance_date ON public.advisor_performance(entry_date DESC);

-- 6. TRAININGS
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('account_setup', 'product_training', 'sales_techniques', 'compliance', 'technology', 'carrier_specific', 'advanced_strategies')) NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  duration_minutes INTEGER,
  video_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  transcript TEXT,
  attachments JSONB,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_trainings_category ON public.trainings(category);
CREATE INDEX idx_trainings_level ON public.trainings(level);
CREATE INDEX idx_trainings_status ON public.trainings(status);

-- 7. TRAINING PROGRESS
CREATE TABLE public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advisor_id, training_id)
);
CREATE INDEX idx_training_progress_advisor ON public.training_progress(advisor_id);
CREATE INDEX idx_training_progress_training ON public.training_progress(training_id);

-- 8. MARKETING RESOURCES
CREATE TABLE public.marketing_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('recruiting', 'client_acquisition', 'social_media', 'email_templates', 'presentations', 'brochures', 'video_content')) NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('creative', 'template', 'video', 'document', 'script')) NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  description TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_marketing_category ON public.marketing_resources(category);
CREATE INDEX idx_marketing_type ON public.marketing_resources(resource_type);

-- 9. QUOTING TOOLS
CREATE TABLE public.quoting_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID REFERENCES public.carriers(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_url TEXT NOT NULL,
  tool_type TEXT CHECK (tool_type IN ('quick_quote', 'agent_portal', 'microsite', 'illustration_system', 'application_portal')) NOT NULL,
  requires_login BOOLEAN DEFAULT FALSE,
  login_instructions TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_quoting_carrier ON public.quoting_tools(carrier_id);
CREATE INDEX idx_quoting_type ON public.quoting_tools(tool_type);

-- 10. CALCULATORS
CREATE TABLE public.calculators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('cash_flow', 'retirement', 'life_income', 'tax_planning', 'estate_planning')) NOT NULL,
  description TEXT,
  calculator_type TEXT CHECK (calculator_type IN ('embedded', 'external', 'interactive_widget')) DEFAULT 'embedded',
  external_url TEXT,
  config JSONB,
  sort_order INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_calculators_category ON public.calculators(category);
CREATE INDEX idx_calculators_active ON public.calculators(active);

-- 11. RAG DOCUMENTS
CREATE TABLE public.rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID REFERENCES public.carriers(id) ON DELETE CASCADE,
  document_title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('underwriting_guide', 'product_guide', 'compliance_doc', 'training_material', 'rate_sheet')) NOT NULL,
  product_type TEXT,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')) DEFAULT 'pending',
  processing_error TEXT,
  file_size INTEGER,
  embeddings_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rag_carrier ON public.rag_documents(carrier_id);
CREATE INDEX idx_rag_status ON public.rag_documents(processing_status);

-- 12. AGENCY HIERARCHY
CREATE TABLE public.agency_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_code TEXT NOT NULL UNIQUE,
  agency_name TEXT NOT NULL,
  parent_agency_id UUID REFERENCES public.agency_hierarchy(id),
  manager_names TEXT[],
  compensation_structure JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_agency_code ON public.agency_hierarchy(agency_code);
CREATE INDEX idx_agency_parent ON public.agency_hierarchy(parent_agency_id);

-- 13. ZONE CONFIG
CREATE TABLE public.zone_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_key TEXT NOT NULL UNIQUE,
  zone_label TEXT NOT NULL,
  zone_color TEXT NOT NULL,
  description TEXT,
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_zone_key ON public.zone_config(zone_key);

-- ALTER advisors table
ALTER TABLE public.advisors
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agency_hierarchy(id),
  ADD COLUMN IF NOT EXISTS agency_code TEXT,
  ADD COLUMN IF NOT EXISTS current_zone TEXT REFERENCES public.zone_config(zone_key);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_carrier_news_updated_at BEFORE UPDATE ON public.carrier_news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lead_products_updated_at BEFORE UPDATE ON public.lead_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON public.schedule_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rank_config_updated_at BEFORE UPDATE ON public.advisor_rank_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_updated_at BEFORE UPDATE ON public.advisor_performance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_updated_at BEFORE UPDATE ON public.marketing_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calculators_updated_at BEFORE UPDATE ON public.calculators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quoting_tools_updated_at BEFORE UPDATE ON public.quoting_tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rag_documents_updated_at BEFORE UPDATE ON public.rag_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agency_hierarchy_updated_at BEFORE UPDATE ON public.agency_hierarchy FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.carrier_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_rank_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quoting_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_config ENABLE ROW LEVEL SECURITY;

-- Read-only content for advisors/admins
CREATE POLICY "Portal advisors can view published news" ON public.carrier_news FOR SELECT
  USING (status = 'published' AND (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid())));

CREATE POLICY "Portal advisors can view active lead products" ON public.lead_products FOR SELECT
  USING (active = TRUE AND (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid())));

CREATE POLICY "Portal advisors can view schedule events" ON public.schedule_events FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

CREATE POLICY "Portal advisors can view rank config" ON public.advisor_rank_config FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

CREATE POLICY "Portal advisors can view published trainings" ON public.trainings FOR SELECT
  USING (status = 'published' AND (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid())));

CREATE POLICY "Portal advisors can view marketing resources" ON public.marketing_resources FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

CREATE POLICY "Portal advisors can view quoting tools" ON public.quoting_tools FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

CREATE POLICY "Portal advisors can view active calculators" ON public.calculators FOR SELECT
  USING (active = TRUE AND (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid())));

CREATE POLICY "Portal advisors can view rag documents" ON public.rag_documents FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

CREATE POLICY "Portal advisors can view agency hierarchy" ON public.agency_hierarchy FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

CREATE POLICY "Portal advisors can view zone config" ON public.zone_config FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

-- Performance: advisor sees own records
CREATE POLICY "Advisors view own performance" ON public.advisor_performance FOR SELECT
  USING (advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Advisors insert own performance" ON public.advisor_performance FOR INSERT
  WITH CHECK (advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Advisors update own performance" ON public.advisor_performance FOR UPDATE
  USING (advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Advisors delete own performance" ON public.advisor_performance FOR DELETE
  USING (advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid()));

-- Training progress: advisor sees own
CREATE POLICY "Advisors view own training progress" ON public.training_progress FOR SELECT
  USING (advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Advisors upsert own training progress" ON public.training_progress FOR INSERT
  WITH CHECK (advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Advisors update own training progress" ON public.training_progress FOR UPDATE
  USING (advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid()));

-- Admin full CRUD on all tables
CREATE POLICY "Admins manage carrier news" ON public.carrier_news FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage lead products" ON public.lead_products FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage schedule events" ON public.schedule_events FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage rank config" ON public.advisor_rank_config FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage trainings" ON public.trainings FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage marketing resources" ON public.marketing_resources FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage quoting tools" ON public.quoting_tools FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage calculators" ON public.calculators FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage rag documents" ON public.rag_documents FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage agency hierarchy" ON public.agency_hierarchy FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage zone config" ON public.zone_config FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage advisor performance" ON public.advisor_performance FOR ALL USING (public.is_portal_admin(auth.uid()));
CREATE POLICY "Admins manage training progress" ON public.training_progress FOR ALL USING (public.is_portal_admin(auth.uid()));

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO public.advisor_rank_config (rank_name, min_ytd_premium, min_advisors_recruited, compensation_level_percent, badge_color, rank_order) VALUES
  ('Associate Advisor', 0, 0, 50, '#3b82f6', 1),
  ('Advisor', 100000, 0, 65, '#8b5cf6', 2),
  ('Senior Advisor', 250000, 2, 80, '#f97316', 3),
  ('Managing Director', 500000, 5, 90, '#eab308', 4),
  ('Executive Director', 1000000, 10, 100, '#22c55e', 5);

INSERT INTO public.zone_config (zone_key, zone_label, zone_color, description) VALUES
  ('producing', 'Producing', '#22C55E', 'Active business written this month'),
  ('investing', 'Investing', '#8B5CF6', 'Marketing spend but no closed business yet'),
  ('red', 'Critical', '#EF4444', 'Compliance issues or license expiring'),
  ('blue', 'Onboarding', '#3B82F6', 'New advisor, verification incomplete'),
  ('black', 'Inactive', '#64748B', 'No activity for 30+ days'),
  ('yellow', 'Warning', '#F59E0B', 'Pending contracts or renewals needed'),
  ('green', 'Active', '#10B981', 'All systems operational');

INSERT INTO public.agency_hierarchy (agency_code, agency_name, manager_names) VALUES
  ('EW100', 'Everence Wealth Direct', ARRAY['Michael Reynolds', 'Sarah Martinez']),
  ('EW200', 'Bay Area Wealth Partners', ARRAY['David Chen']),
  ('EW300', 'Phoenix Strategic Advisors', ARRAY['Lisa Garcia']),
  ('EW400', 'Legacy Planning Group', ARRAY['James Thompson']),
  ('EW500', 'Retirement Solutions Network', ARRAY['Amanda Foster']);

INSERT INTO public.calculators (calculator_name, category, description, calculator_type, sort_order, active) VALUES
  ('Retirement Gap Calculator', 'retirement', 'Calculate the gap between current savings trajectory and retirement income needs', 'embedded', 1, TRUE),
  ('Tax Bucket Optimizer', 'tax_planning', 'Determine optimal asset allocation across Taxable, Tax-Deferred, and Tax-Exempt buckets', 'embedded', 2, TRUE),
  ('Social Security Estimator', 'retirement', 'Estimate Social Security benefits based on earnings history', 'embedded', 3, TRUE),
  ('Life Expectancy Calculator', 'life_income', 'Calculate life expectancy based on health factors', 'embedded', 4, TRUE),
  ('IUL vs 401k Comparison', 'cash_flow', 'Compare indexed universal life vs traditional 401k over 30 years', 'embedded', 5, TRUE),
  ('Estate Tax Calculator', 'estate_planning', 'Calculate potential estate tax exposure', 'embedded', 6, TRUE),
  ('RMD Calculator', 'retirement', 'Calculate Required Minimum Distributions from retirement accounts', 'embedded', 7, TRUE),
  ('Inflation Impact Calculator', 'cash_flow', 'See how inflation erodes purchasing power over time', 'embedded', 8, TRUE);

INSERT INTO public.trainings (title, category, level, duration_minutes, description, status) VALUES
  ('Three Tax Buckets Fundamentals', 'product_training', 'beginner', 15, 'Master the Three Tax Buckets framework', 'published'),
  ('IUL Product Deep Dive', 'product_training', 'intermediate', 30, 'Comprehensive training on Indexed Universal Life insurance', 'published'),
  ('Objection Handling Masterclass', 'sales_techniques', 'advanced', 45, 'Advanced techniques for handling common objections', 'published'),
  ('Compliance Essentials', 'compliance', 'beginner', 20, 'Required compliance training covering fiduciary duty', 'published');

INSERT INTO public.lead_products (product_name, category, price_per_lead, minimum_quantity, expected_conversion_rate, badge_text, description, features) VALUES
  ('Verified Retirement Planning Leads', 'verified_life', 45.00, 25, 0.28, 'Premium Lead', 'High-intent leads verified for retirement planning interest', ARRAY['Age 45-65', 'Income verified', 'Recent web activity', 'Double-verified contact info']),
  ('IUL Strategy Leads', 'iul', 50.00, 20, 0.30, 'MOST POPULAR', 'Qualified leads interested in indexed universal life strategies', ARRAY['Pre-qualified income', 'Life insurance interest confirmed', 'Tax planning mindset']),
  ('Tax Planning Leads', 'annuity', 65.00, 15, 0.32, 'Premium Lead', 'High-net-worth leads seeking tax-efficient strategies', ARRAY['$150K+ income', 'Tax concern expressed', 'Retirement timeline 5-15 years']),
  ('Aged Retirement Leads', 'internet', 12.00, 100, 0.22, 'Value Lead', 'Aged leads for high-volume outreach', ARRAY['30-90 days old', 'Retirement interest', 'Contact info verified']);
