
-- Add new columns to carriers table
ALTER TABLE public.carriers
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS founded_year integer,
  ADD COLUMN IF NOT EXISTS employees text,
  ADD COLUMN IF NOT EXISTS headquarters text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS quotes_url text,
  ADD COLUMN IF NOT EXISTS illustration_url text,
  ADD COLUMN IF NOT EXISTS turnaround text,
  ADD COLUMN IF NOT EXISTS special_products text[],
  ADD COLUMN IF NOT EXISTS underwriting_strengths text,
  ADD COLUMN IF NOT EXISTS reparenting_info jsonb;

-- Create carrier_documents table
CREATE TABLE IF NOT EXISTS public.carrier_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES public.carriers(id) ON DELETE CASCADE NOT NULL,
  document_name text NOT NULL,
  document_url text NOT NULL,
  document_type text NOT NULL DEFAULT 'guide',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.carrier_documents ENABLE ROW LEVEL SECURITY;

-- Advisors can read
CREATE POLICY "Advisors can view carrier documents"
  ON public.carrier_documents FOR SELECT
  TO authenticated
  USING (
    public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid())
  );

-- Admins can manage
CREATE POLICY "Admins can insert carrier documents"
  ON public.carrier_documents FOR INSERT
  TO authenticated
  WITH CHECK (public.is_portal_admin(auth.uid()));

CREATE POLICY "Admins can update carrier documents"
  ON public.carrier_documents FOR UPDATE
  TO authenticated
  USING (public.is_portal_admin(auth.uid()));

CREATE POLICY "Admins can delete carrier documents"
  ON public.carrier_documents FOR DELETE
  TO authenticated
  USING (public.is_portal_admin(auth.uid()));
