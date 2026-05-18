
CREATE TYPE public.profile_key_status AS ENUM ('response', 'associate', 'client');

CREATE TABLE public.advisor_contact_profile_key (
  contact_id uuid PRIMARY KEY REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  trait_age_25_plus boolean NOT NULL DEFAULT false,
  trait_married boolean NOT NULL DEFAULT false,
  trait_children boolean NOT NULL DEFAULT false,
  trait_homeowner boolean NOT NULL DEFAULT false,
  trait_income boolean NOT NULL DEFAULT false,
  trait_ambitious boolean NOT NULL DEFAULT false,
  trait_dissatisfied boolean NOT NULL DEFAULT false,
  trait_entrepreneur boolean NOT NULL DEFAULT false,
  status_code public.profile_key_status,
  score int GENERATED ALWAYS AS (
    (trait_age_25_plus)::int + (trait_married)::int + (trait_children)::int +
    (trait_homeowner)::int + (trait_income)::int + (trait_ambitious)::int +
    (trait_dissatisfied)::int + (trait_entrepreneur)::int
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_key_advisor_score
  ON public.advisor_contact_profile_key (advisor_id, score DESC);

ALTER TABLE public.advisor_contact_profile_key ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advisor_select_own_profile_key"
  ON public.advisor_contact_profile_key FOR SELECT
  USING (advisor_id = get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "advisor_insert_own_profile_key"
  ON public.advisor_contact_profile_key FOR INSERT
  WITH CHECK (advisor_id = get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "advisor_update_own_profile_key"
  ON public.advisor_contact_profile_key FOR UPDATE
  USING (advisor_id = get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "advisor_delete_own_profile_key"
  ON public.advisor_contact_profile_key FOR DELETE
  USING (advisor_id = get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "manager_select_managed_profile_key"
  ON public.advisor_contact_profile_key FOR SELECT
  USING (can_manage_advisor(auth.uid(), advisor_id));

CREATE TRIGGER trg_profile_key_updated
  BEFORE UPDATE ON public.advisor_contact_profile_key
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
