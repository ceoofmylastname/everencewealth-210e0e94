
-- ============================================
-- PORTAL_USERS TABLE
-- ============================================
CREATE TABLE public.portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'advisor', 'admin')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  advisor_id UUID REFERENCES public.portal_users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_users_auth ON public.portal_users(auth_user_id);
CREATE INDEX idx_portal_users_role ON public.portal_users(role);
CREATE INDEX idx_portal_users_advisor ON public.portal_users(advisor_id);

CREATE TRIGGER update_portal_users_updated_at
  BEFORE UPDATE ON public.portal_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ADVISORS TABLE
-- ============================================
CREATE TABLE public.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_user_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  title TEXT,
  bio TEXT,
  photo_url TEXT,
  license_number TEXT,
  specializations TEXT[],
  languages TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_advisors_auth ON public.advisors(auth_user_id);
CREATE INDEX idx_advisors_portal_user ON public.advisors(portal_user_id);

CREATE TRIGGER update_advisors_updated_at
  BEFORE UPDATE ON public.advisors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- POLICIES TABLE
-- ============================================
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id),
  carrier_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('iul', 'wl', 'term', 'annuity', 'ltc', 'disability')),
  policy_status TEXT NOT NULL DEFAULT 'active' CHECK (policy_status IN ('active', 'pending', 'lapsed', 'paid-up')),
  death_benefit NUMERIC,
  cash_value NUMERIC,
  monthly_premium NUMERIC,
  premium_frequency TEXT DEFAULT 'monthly' CHECK (premium_frequency IN ('monthly', 'quarterly', 'annual')),
  issue_date DATE,
  maturity_date DATE,
  beneficiaries JSONB,
  riders JSONB,
  policy_illustration_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_policies_client ON public.policies(client_id);
CREATE INDEX idx_policies_advisor ON public.policies(advisor_id);
CREATE INDEX idx_policies_status ON public.policies(policy_status);
CREATE INDEX idx_policies_carrier ON public.policies(carrier_name);

CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CLIENT INVITATIONS TABLE
-- ============================================
CREATE TABLE public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES public.advisors(id),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  invitation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_advisor ON public.client_invitations(advisor_id);
CREATE INDEX idx_invitations_email ON public.client_invitations(email);
CREATE INDEX idx_invitations_token ON public.client_invitations(invitation_token);
CREATE INDEX idx_invitations_status ON public.client_invitations(status);

-- ============================================
-- AGENT RESOURCES TABLE
-- ============================================
CREATE TABLE public.agent_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('calculator', 'carrier-info', 'product-guide', 'compliance', 'training', 'template')),
  category TEXT,
  file_url TEXT,
  external_url TEXT,
  content JSONB,
  featured BOOLEAN NOT NULL DEFAULT false,
  access_level TEXT NOT NULL DEFAULT 'all-agents' CHECK (access_level IN ('all-agents', 'admin-only')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resources_type ON public.agent_resources(resource_type);
CREATE INDEX idx_resources_category ON public.agent_resources(category);
CREATE INDEX idx_resources_featured ON public.agent_resources(featured);

CREATE TRIGGER update_agent_resources_updated_at
  BEFORE UPDATE ON public.agent_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CARRIERS TABLE
-- ============================================
CREATE TABLE public.carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_name TEXT NOT NULL UNIQUE,
  carrier_logo_url TEXT,
  am_best_rating TEXT,
  products_offered TEXT[],
  commission_structure JSONB,
  contact_info JSONB,
  contracting_requirements TEXT,
  notes TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carriers_name ON public.carriers(carrier_name);
CREATE INDEX idx_carriers_featured ON public.carriers(featured);

CREATE TRIGGER update_carriers_updated_at
  BEFORE UPDATE ON public.carriers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PORTAL DOCUMENTS TABLE
-- ============================================
CREATE TABLE public.portal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.portal_users(id),
  client_id UUID NOT NULL REFERENCES public.portal_users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  document_type TEXT NOT NULL DEFAULT 'other' CHECK (document_type IN ('policy', 'illustration', 'amendment', 'beneficiary-form', 'statement', 'correspondence', 'other')),
  is_client_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_documents_policy ON public.portal_documents(policy_id);
CREATE INDEX idx_portal_documents_client ON public.portal_documents(client_id);
CREATE INDEX idx_portal_documents_type ON public.portal_documents(document_type);

CREATE TRIGGER update_portal_documents_updated_at
  BEFORE UPDATE ON public.portal_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('document', 'message', 'appointment', 'policy-update', 'system')),
  read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================
-- SECURITY-DEFINER HELPER FUNCTIONS (after tables exist)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_portal_user_id(_auth_uid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.portal_users WHERE auth_user_id = _auth_uid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_portal_advisor(_auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_users
    WHERE auth_user_id = _auth_uid AND role = 'advisor' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_portal_admin(_auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_users
    WHERE auth_user_id = _auth_uid AND role = 'admin' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_portal_role(_auth_uid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.portal_users WHERE auth_user_id = _auth_uid AND is_active = true LIMIT 1;
$$;

-- ============================================
-- RLS POLICIES (after helper functions exist)
-- ============================================

ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portal users can view own record"
  ON public.portal_users FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Advisors can view their clients"
  ON public.portal_users FOR SELECT
  USING (
    advisor_id = public.get_portal_user_id(auth.uid())
    OR public.is_portal_admin(auth.uid())
  );

CREATE POLICY "Admins can manage portal users"
  ON public.portal_users FOR ALL
  USING (public.is_portal_admin(auth.uid()));

-- Advisors RLS
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view own profile"
  ON public.advisors FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Advisors can update own profile"
  ON public.advisors FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage advisors"
  ON public.advisors FOR ALL
  USING (public.is_portal_admin(auth.uid()));

CREATE POLICY "Clients can view their advisor"
  ON public.advisors FOR SELECT
  USING (
    id IN (
      SELECT a.id FROM public.advisors a
      JOIN public.portal_users pu ON pu.advisor_id = a.portal_user_id
      WHERE pu.auth_user_id = auth.uid()
    )
  );

-- Policies RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own policies"
  ON public.policies FOR SELECT
  USING (client_id = public.get_portal_user_id(auth.uid()));

CREATE POLICY "Advisors can manage their clients policies"
  ON public.policies FOR ALL
  USING (
    advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid())
    OR public.is_portal_admin(auth.uid())
  );

-- Client invitations RLS
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can manage invitations"
  ON public.client_invitations FOR ALL
  USING (
    advisor_id IN (SELECT id FROM public.advisors WHERE auth_user_id = auth.uid())
    OR public.is_portal_admin(auth.uid())
  );

-- Agent resources RLS
ALTER TABLE public.agent_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view resources"
  ON public.agent_resources FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

CREATE POLICY "Admins can manage resources"
  ON public.agent_resources FOR ALL
  USING (public.is_portal_admin(auth.uid()));

-- Carriers RLS
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view carriers"
  ON public.carriers FOR SELECT
  USING (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()));

CREATE POLICY "Admins can manage carriers"
  ON public.carriers FOR ALL
  USING (public.is_portal_admin(auth.uid()));

-- Portal documents RLS
ALTER TABLE public.portal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their visible documents"
  ON public.portal_documents FOR SELECT
  USING (
    client_id = public.get_portal_user_id(auth.uid()) AND is_client_visible = true
  );

CREATE POLICY "Advisors can manage client documents"
  ON public.portal_documents FOR ALL
  USING (
    uploaded_by = public.get_portal_user_id(auth.uid())
    OR public.is_portal_admin(auth.uid())
  );

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = public.get_portal_user_id(auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = public.get_portal_user_id(auth.uid()));

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (public.is_portal_admin(auth.uid()));
