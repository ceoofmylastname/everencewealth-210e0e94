ALTER TABLE public.advisor_contact_profile_key
  ADD COLUMN IF NOT EXISTS pinned_top boolean NOT NULL DEFAULT false;

ALTER TABLE public.advisors
  ADD COLUMN IF NOT EXISTS profile_key_automation_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.advisor_contact_profile_key_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  score int NOT NULL,
  status_code public.profile_key_status,
  changed_trait text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.advisor_contact_profile_key_history TO authenticated;
GRANT ALL ON public.advisor_contact_profile_key_history TO service_role;

ALTER TABLE public.advisor_contact_profile_key_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pk_history_contact_created
  ON public.advisor_contact_profile_key_history (contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pk_history_advisor_created
  ON public.advisor_contact_profile_key_history (advisor_id, created_at DESC);

CREATE POLICY "advisor_select_own_pk_history"
  ON public.advisor_contact_profile_key_history FOR SELECT
  TO authenticated
  USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "advisor_insert_own_pk_history"
  ON public.advisor_contact_profile_key_history FOR INSERT
  TO authenticated
  WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "manager_select_managed_pk_history"
  ON public.advisor_contact_profile_key_history FOR SELECT
  TO authenticated
  USING (public.can_manage_advisor(auth.uid(), advisor_id));

CREATE OR REPLACE FUNCTION public.log_profile_key_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changed_trait text := NULL;
  v_automation boolean := true;
  v_contact_name text;
  v_title text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.trait_age_25_plus IS DISTINCT FROM OLD.trait_age_25_plus THEN v_changed_trait := 'trait_age_25_plus';
    ELSIF NEW.trait_married IS DISTINCT FROM OLD.trait_married THEN v_changed_trait := 'trait_married';
    ELSIF NEW.trait_children IS DISTINCT FROM OLD.trait_children THEN v_changed_trait := 'trait_children';
    ELSIF NEW.trait_homeowner IS DISTINCT FROM OLD.trait_homeowner THEN v_changed_trait := 'trait_homeowner';
    ELSIF NEW.trait_income IS DISTINCT FROM OLD.trait_income THEN v_changed_trait := 'trait_income';
    ELSIF NEW.trait_ambitious IS DISTINCT FROM OLD.trait_ambitious THEN v_changed_trait := 'trait_ambitious';
    ELSIF NEW.trait_dissatisfied IS DISTINCT FROM OLD.trait_dissatisfied THEN v_changed_trait := 'trait_dissatisfied';
    ELSIF NEW.trait_entrepreneur IS DISTINCT FROM OLD.trait_entrepreneur THEN v_changed_trait := 'trait_entrepreneur';
    ELSIF NEW.status_code IS DISTINCT FROM OLD.status_code THEN v_changed_trait := 'status_code';
    END IF;

    IF v_changed_trait IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.advisor_contact_profile_key_history
    (contact_id, advisor_id, score, status_code, changed_trait)
  VALUES (NEW.contact_id, NEW.advisor_id, COALESCE(NEW.score, 0), NEW.status_code, v_changed_trait);

  SELECT COALESCE(a.profile_key_automation_enabled, true)
    INTO v_automation
    FROM public.advisors a
   WHERE a.id = NEW.advisor_id;

  IF NOT COALESCE(v_automation, true) THEN
    RETURN NEW;
  END IF;

  SELECT NULLIF(TRIM(CONCAT_WS(' ', c.first_name, c.last_name)), '')
    INTO v_contact_name
    FROM public.advisor_contacts c
   WHERE c.id = NEW.contact_id;

  -- Auto follow-up reminder when the score first reaches Urgent (7+)
  IF COALESCE(NEW.score, 0) >= 7
     AND (TG_OP = 'INSERT' OR COALESCE(OLD.score, 0) < 7) THEN
    v_title := 'Urgent follow-up: ' || COALESCE(v_contact_name, 'contact') || ' hit Profile Key 7+';
    IF NOT EXISTS (
      SELECT 1 FROM public.advisor_contact_reminders r
       WHERE r.contact_id = NEW.contact_id
         AND r.title = v_title
         AND r.completed_at IS NULL
         AND r.dismissed_at IS NULL
    ) THEN
      INSERT INTO public.advisor_contact_reminders (contact_id, advisor_id, title, body, remind_at)
      VALUES (
        NEW.contact_id,
        NEW.advisor_id,
        v_title,
        'Auto-created because this contact reached a Profile Key score of ' || COALESCE(NEW.score, 0) || '/8.',
        now() + interval '1 day'
      );
    END IF;
  END IF;

  -- Audit note on status progression
  IF v_changed_trait = 'status_code' AND NEW.status_code IS NOT NULL THEN
    INSERT INTO public.advisor_contact_notes (contact_id, advisor_id, body)
    VALUES (
      NEW.contact_id,
      NEW.advisor_id,
      'Profile Key status changed from '
        || COALESCE(OLD.status_code::text, 'none')
        || ' to ' || NEW.status_code::text
        || ' (score ' || COALESCE(NEW.score, 0) || '/8).'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_key_history ON public.advisor_contact_profile_key;
CREATE TRIGGER trg_profile_key_history
  AFTER INSERT OR UPDATE ON public.advisor_contact_profile_key
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_key_change();