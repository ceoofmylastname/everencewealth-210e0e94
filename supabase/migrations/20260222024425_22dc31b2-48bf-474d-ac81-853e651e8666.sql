
-- Create contracting_agreements table
CREATE TABLE public.contracting_agreements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.contracting_agents(id) ON DELETE CASCADE,
  agent_signature text,
  agent_initials text,
  agent_signed_at timestamptz,
  company_signature text,
  company_initials text,
  company_signed_by uuid,
  company_signed_at timestamptz,
  consultant_name text NOT NULL,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending_agent',
  pdf_storage_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contracting_agreements ENABLE ROW LEVEL SECURITY;

-- Agents can view their own agreements
CREATE POLICY "Agents can view own agreements"
ON public.contracting_agreements FOR SELECT
USING (agent_id = public.get_contracting_agent_id(auth.uid()));

-- Agents can insert their own agreements
CREATE POLICY "Agents can insert own agreements"
ON public.contracting_agreements FOR INSERT
WITH CHECK (agent_id = public.get_contracting_agent_id(auth.uid()));

-- Agents can update their own pending_agent agreements (to add signature)
CREATE POLICY "Agents can update own pending agreements"
ON public.contracting_agreements FOR UPDATE
USING (agent_id = public.get_contracting_agent_id(auth.uid()) AND status = 'pending_agent');

-- Admins/managers can view all agreements
CREATE POLICY "Admins can view all agreements"
ON public.contracting_agreements FOR SELECT
USING (public.get_contracting_role(auth.uid()) IN ('admin', 'manager', 'contracting'));

-- Admins/contracting can update agreements (to add company signature)
CREATE POLICY "Admins can update agreements"
ON public.contracting_agreements FOR UPDATE
USING (public.get_contracting_role(auth.uid()) IN ('admin', 'contracting'));

-- Trigger for updated_at
CREATE TRIGGER update_contracting_agreements_updated_at
BEFORE UPDATE ON public.contracting_agreements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
