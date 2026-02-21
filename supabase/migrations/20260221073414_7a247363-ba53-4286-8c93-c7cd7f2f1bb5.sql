
-- ============================================================
-- Contracting & Onboarding System
-- ============================================================

-- 1. contracting_agents
CREATE TABLE public.contracting_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_user_id uuid REFERENCES public.portal_users(id) ON DELETE SET NULL,
  auth_user_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  contracting_role text NOT NULL DEFAULT 'agent',
  manager_id uuid REFERENCES public.contracting_agents(id) ON DELETE SET NULL,
  pipeline_stage text NOT NULL DEFAULT 'application',
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. contracting_steps
CREATE TABLE public.contracting_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  stage text NOT NULL,
  step_order int NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  requires_upload boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. contracting_agent_steps
CREATE TABLE public.contracting_agent_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.contracting_agents(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.contracting_steps(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  completed_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, step_id)
);

-- 4. contracting_documents
CREATE TABLE public.contracting_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.contracting_agents(id) ON DELETE CASCADE,
  step_id uuid REFERENCES public.contracting_steps(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_by uuid NOT NULL REFERENCES public.contracting_agents(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. contracting_messages
CREATE TABLE public.contracting_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  sender_id uuid NOT NULL REFERENCES public.contracting_agents(id),
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. contracting_activity_logs
CREATE TABLE public.contracting_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.contracting_agents(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text NOT NULL,
  performed_by uuid NOT NULL REFERENCES public.contracting_agents(id),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. contracting_reminders
CREATE TABLE public.contracting_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.contracting_agents(id) ON DELETE CASCADE,
  step_id uuid REFERENCES public.contracting_steps(id) ON DELETE SET NULL,
  reminder_type text NOT NULL DEFAULT 'overdue_step',
  sent_at timestamptz,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Security definer functions (tables exist now)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_contracting_role(_auth_uid uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT contracting_role FROM public.contracting_agents
  WHERE auth_user_id = _auth_uid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_contracting_agent_id(_auth_uid uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.contracting_agents
  WHERE auth_user_id = _auth_uid LIMIT 1;
$$;

-- ============================================================
-- RLS on all tables
-- ============================================================
ALTER TABLE public.contracting_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracting_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracting_agent_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracting_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracting_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracting_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracting_reminders ENABLE ROW LEVEL SECURITY;

-- contracting_agents policies
CREATE POLICY "contracting_agents_select" ON public.contracting_agents FOR SELECT TO authenticated
USING (
  auth_user_id = auth.uid()
  OR manager_id = public.get_contracting_agent_id(auth.uid())
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_agents_insert" ON public.contracting_agents FOR INSERT TO authenticated
WITH CHECK (
  public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_agents_update" ON public.contracting_agents FOR UPDATE TO authenticated
USING (
  public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_agents_delete" ON public.contracting_agents FOR DELETE TO authenticated
USING (
  public.get_contracting_role(auth.uid()) = 'admin'
  OR public.is_portal_admin(auth.uid())
);

-- contracting_steps policies
CREATE POLICY "contracting_steps_select" ON public.contracting_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "contracting_steps_insert" ON public.contracting_steps FOR INSERT TO authenticated
WITH CHECK (public.get_contracting_role(auth.uid()) = 'admin' OR public.is_portal_admin(auth.uid()));
CREATE POLICY "contracting_steps_update" ON public.contracting_steps FOR UPDATE TO authenticated
USING (public.get_contracting_role(auth.uid()) = 'admin' OR public.is_portal_admin(auth.uid()));
CREATE POLICY "contracting_steps_delete" ON public.contracting_steps FOR DELETE TO authenticated
USING (public.get_contracting_role(auth.uid()) = 'admin' OR public.is_portal_admin(auth.uid()));

-- contracting_agent_steps policies
CREATE POLICY "contracting_agent_steps_select" ON public.contracting_agent_steps FOR SELECT TO authenticated
USING (
  agent_id = public.get_contracting_agent_id(auth.uid())
  OR EXISTS (SELECT 1 FROM public.contracting_agents ca WHERE ca.id = agent_id AND ca.manager_id = public.get_contracting_agent_id(auth.uid()))
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_agent_steps_insert" ON public.contracting_agent_steps FOR INSERT TO authenticated
WITH CHECK (public.get_contracting_role(auth.uid()) IN ('contracting', 'admin') OR public.is_portal_admin(auth.uid()));
CREATE POLICY "contracting_agent_steps_update" ON public.contracting_agent_steps FOR UPDATE TO authenticated
USING (
  agent_id = public.get_contracting_agent_id(auth.uid())
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);

-- contracting_documents policies
CREATE POLICY "contracting_documents_select" ON public.contracting_documents FOR SELECT TO authenticated
USING (
  agent_id = public.get_contracting_agent_id(auth.uid())
  OR EXISTS (SELECT 1 FROM public.contracting_agents ca WHERE ca.id = agent_id AND ca.manager_id = public.get_contracting_agent_id(auth.uid()))
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_documents_insert" ON public.contracting_documents FOR INSERT TO authenticated
WITH CHECK (
  agent_id = public.get_contracting_agent_id(auth.uid())
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_documents_delete" ON public.contracting_documents FOR DELETE TO authenticated
USING (public.get_contracting_role(auth.uid()) IN ('contracting', 'admin') OR public.is_portal_admin(auth.uid()));

-- contracting_messages policies
CREATE POLICY "contracting_messages_select" ON public.contracting_messages FOR SELECT TO authenticated
USING (
  thread_id = public.get_contracting_agent_id(auth.uid())
  OR sender_id = public.get_contracting_agent_id(auth.uid())
  OR EXISTS (SELECT 1 FROM public.contracting_agents ca WHERE ca.id = thread_id AND ca.manager_id = public.get_contracting_agent_id(auth.uid()))
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_messages_insert" ON public.contracting_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = public.get_contracting_agent_id(auth.uid())
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);

-- contracting_activity_logs policies
CREATE POLICY "contracting_activity_logs_select" ON public.contracting_activity_logs FOR SELECT TO authenticated
USING (
  agent_id = public.get_contracting_agent_id(auth.uid())
  OR EXISTS (SELECT 1 FROM public.contracting_agents ca WHERE ca.id = agent_id AND ca.manager_id = public.get_contracting_agent_id(auth.uid()))
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_activity_logs_insert" ON public.contracting_activity_logs FOR INSERT TO authenticated
WITH CHECK (
  performed_by = public.get_contracting_agent_id(auth.uid())
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);

-- contracting_reminders policies
CREATE POLICY "contracting_reminders_select" ON public.contracting_reminders FOR SELECT TO authenticated
USING (
  agent_id = public.get_contracting_agent_id(auth.uid())
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
CREATE POLICY "contracting_reminders_insert" ON public.contracting_reminders FOR INSERT TO authenticated
WITH CHECK (public.get_contracting_role(auth.uid()) IN ('contracting', 'admin') OR public.is_portal_admin(auth.uid()));
CREATE POLICY "contracting_reminders_update" ON public.contracting_reminders FOR UPDATE TO authenticated
USING (public.get_contracting_role(auth.uid()) IN ('contracting', 'admin') OR public.is_portal_admin(auth.uid()));
CREATE POLICY "contracting_reminders_delete" ON public.contracting_reminders FOR DELETE TO authenticated
USING (public.get_contracting_role(auth.uid()) IN ('contracting', 'admin') OR public.is_portal_admin(auth.uid()));

-- ============================================================
-- Triggers
-- ============================================================
CREATE TRIGGER update_contracting_agents_updated_at
  BEFORE UPDATE ON public.contracting_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracting_agent_steps_updated_at
  BEFORE UPDATE ON public.contracting_agent_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Storage bucket (private)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracting-documents', 'contracting-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "contracting_docs_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'contracting-documents');
CREATE POLICY "contracting_docs_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'contracting-documents');
CREATE POLICY "contracting_docs_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'contracting-documents');

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracting_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracting_agent_steps;

-- ============================================================
-- Seed default steps
-- ============================================================
INSERT INTO public.contracting_steps (title, description, stage, step_order, is_required, requires_upload) VALUES
  ('Submit Application', 'Complete and submit the agent application form', 'application', 1, true, false),
  ('Sign Agent Agreement', 'Review and sign the independent agent agreement', 'application', 2, true, true),
  ('Submit W-9 Form', 'Provide completed W-9 tax form', 'application', 3, true, true),
  ('Initiate Background Check', 'Authorize and begin background check process', 'background_check', 1, true, false),
  ('Background Check Cleared', 'Background check has been reviewed and approved', 'background_check', 2, true, false),
  ('Obtain Life Insurance License', 'State life insurance license must be active', 'licensing', 1, true, true),
  ('Obtain Health Insurance License', 'State health insurance license (if applicable)', 'licensing', 2, false, true),
  ('Complete E&O Insurance', 'Errors & Omissions insurance policy in place', 'licensing', 3, true, true),
  ('Submit to Primary Carrier', 'Appointment paperwork submitted to primary carrier', 'carrier_appointments', 1, true, true),
  ('Primary Carrier Approved', 'Primary carrier appointment confirmed', 'carrier_appointments', 2, true, false),
  ('Submit to Secondary Carriers', 'Additional carrier appointment submissions', 'carrier_appointments', 3, false, true),
  ('Complete Product Training', 'Mandatory product knowledge training modules', 'training', 1, true, false),
  ('Complete Compliance Training', 'Regulatory compliance and ethics training', 'training', 2, true, false),
  ('Complete CRM Training', 'Portal and CRM system training', 'training', 3, true, false),
  ('Final Review & Activation', 'Final review by management before full activation', 'active', 1, true, false);
