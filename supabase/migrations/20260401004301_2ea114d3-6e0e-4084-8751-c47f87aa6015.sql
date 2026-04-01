
CREATE TABLE public.response_card_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_advisor_id UUID NOT NULL REFERENCES public.advisors(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  income_range TEXT NOT NULL,
  wants_free_consultation BOOLEAN NOT NULL DEFAULT false,
  meeting_topics TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT,
  comments TEXT,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.response_card_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert response card submissions"
  ON public.response_card_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Advisors see own response card submissions"
  ON public.response_card_submissions FOR SELECT
  TO authenticated
  USING (
    assigned_advisor_id = public.get_advisor_id_for_auth(auth.uid())
  );

CREATE POLICY "Admins see all response card submissions"
  ON public.response_card_submissions FOR SELECT
  TO authenticated
  USING (public.is_portal_admin(auth.uid()));

CREATE POLICY "Advisors update own response card submissions"
  ON public.response_card_submissions FOR UPDATE
  TO authenticated
  USING (assigned_advisor_id = public.get_advisor_id_for_auth(auth.uid()))
  WITH CHECK (assigned_advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Admins can delete response card submissions"
  ON public.response_card_submissions FOR DELETE
  TO authenticated
  USING (public.is_portal_admin(auth.uid()));
