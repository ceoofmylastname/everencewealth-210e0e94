ALTER TABLE public.policies
  ADD COLUMN IF NOT EXISTS contact_id uuid NULL REFERENCES public.advisor_contacts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_policies_contact ON public.policies(contact_id);

ALTER TABLE public.client_needs_analysis
  ADD COLUMN IF NOT EXISTS contact_id uuid NULL REFERENCES public.advisor_contacts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cna_contact ON public.client_needs_analysis(contact_id);