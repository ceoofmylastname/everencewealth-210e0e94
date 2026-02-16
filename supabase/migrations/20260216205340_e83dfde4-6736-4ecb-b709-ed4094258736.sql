
-- Create compliance_documents table
CREATE TABLE public.compliance_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  expiry_date DATE,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create carrier_contracts table
CREATE TABLE public.carrier_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  carrier_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  contracted_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrier_contracts ENABLE ROW LEVEL SECURITY;

-- compliance_documents policies
CREATE POLICY "Advisors view own compliance documents"
  ON public.compliance_documents FOR SELECT
  USING (
    advisor_id IN (SELECT id FROM public.advisors WHERE portal_user_id = public.get_portal_user_id(auth.uid()))
    OR public.is_portal_admin(auth.uid())
  );

CREATE POLICY "Admins manage compliance documents"
  ON public.compliance_documents FOR ALL
  USING (public.is_portal_admin(auth.uid()));

-- carrier_contracts policies
CREATE POLICY "Advisors view own carrier contracts"
  ON public.carrier_contracts FOR SELECT
  USING (
    advisor_id IN (SELECT id FROM public.advisors WHERE portal_user_id = public.get_portal_user_id(auth.uid()))
    OR public.is_portal_admin(auth.uid())
  );

CREATE POLICY "Admins manage carrier contracts"
  ON public.carrier_contracts FOR ALL
  USING (public.is_portal_admin(auth.uid()));

-- Updated_at trigger for compliance_documents
CREATE TRIGGER update_compliance_documents_updated_at
  BEFORE UPDATE ON public.compliance_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
