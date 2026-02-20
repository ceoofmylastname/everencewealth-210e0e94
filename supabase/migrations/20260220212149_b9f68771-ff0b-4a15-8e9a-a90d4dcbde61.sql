
-- Add resident license fields to advisors table
ALTER TABLE public.advisors
  ADD COLUMN IF NOT EXISTS resident_state text,
  ADD COLUMN IF NOT EXISTS resident_license_number text,
  ADD COLUMN IF NOT EXISTS resident_license_exp date,
  ADD COLUMN IF NOT EXISTS npn_number text,
  ADD COLUMN IF NOT EXISTS ce_due_date date;

-- Create non_resident_licenses table
CREATE TABLE public.non_resident_licenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id uuid NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  state text NOT NULL,
  license_number text,
  expiration_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.non_resident_licenses ENABLE ROW LEVEL SECURITY;

-- Advisors see own rows
CREATE POLICY "Advisors can view own non_resident_licenses"
  ON public.non_resident_licenses FOR SELECT
  USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can insert own non_resident_licenses"
  ON public.non_resident_licenses FOR INSERT
  WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can update own non_resident_licenses"
  ON public.non_resident_licenses FOR UPDATE
  USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can delete own non_resident_licenses"
  ON public.non_resident_licenses FOR DELETE
  USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

-- Admins full access
CREATE POLICY "Admins full access non_resident_licenses"
  ON public.non_resident_licenses FOR ALL
  USING (public.is_portal_admin(auth.uid()));

-- Create compliance_records table
CREATE TABLE public.compliance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id uuid NOT NULL UNIQUE REFERENCES public.advisors(id) ON DELETE CASCADE,
  eo_insurance_exp date,
  aml_training_date date,
  background_check_date date,
  ce_hours_completed boolean DEFAULT false,
  ce_hours_required int DEFAULT 0,
  ce_hours_earned int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;

-- Advisors see own record
CREATE POLICY "Advisors can view own compliance_records"
  ON public.compliance_records FOR SELECT
  USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

-- Admins full access
CREATE POLICY "Admins full access compliance_records"
  ON public.compliance_records FOR ALL
  USING (public.is_portal_admin(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_non_resident_licenses_updated_at
  BEFORE UPDATE ON public.non_resident_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_records_updated_at
  BEFORE UPDATE ON public.compliance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
