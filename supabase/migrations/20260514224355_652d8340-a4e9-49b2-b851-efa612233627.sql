
-- Advisor Contacts CRM module

CREATE TABLE public.advisor_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  first_name text,
  last_name text,
  company text,
  job_title text,
  primary_email text,
  primary_phone text,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  address_country text DEFAULT 'USA',
  date_of_birth date,
  source text,
  lifecycle_stage text DEFAULT 'lead',
  tags text[] DEFAULT '{}',
  notes_summary text,
  linked_client_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_advisor_contacts_advisor ON public.advisor_contacts(advisor_id);
CREATE INDEX idx_advisor_contacts_search ON public.advisor_contacts USING GIN (to_tsvector('simple', coalesce(first_name,'')||' '||coalesce(last_name,'')||' '||coalesce(primary_email,'')||' '||coalesce(company,'')));

CREATE TABLE public.advisor_contact_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  email text NOT NULL,
  label text DEFAULT 'work',
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_emails_contact ON public.advisor_contact_emails(contact_id);

CREATE TABLE public.advisor_contact_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  phone text NOT NULL,
  label text DEFAULT 'mobile',
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_phones_contact ON public.advisor_contact_phones(contact_id);

CREATE TABLE public.advisor_contact_custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  label text NOT NULL,
  field_key text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  options jsonb,
  display_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (advisor_id, field_key)
);

CREATE TABLE public.advisor_contact_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES public.advisor_contact_custom_fields(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, field_id)
);

CREATE TABLE public.advisor_contact_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  carrier_name text,
  product_type text,
  policy_number text,
  monthly_modal_premium numeric(12,2),
  face_amount numeric(14,2),
  cash_value numeric(14,2),
  issue_date date,
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_policies_contact ON public.advisor_contact_policies(contact_id);

CREATE TABLE public.advisor_contact_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  body text NOT NULL,
  pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_notes_contact ON public.advisor_contact_notes(contact_id);

CREATE TABLE public.advisor_contact_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_documents_contact ON public.advisor_contact_documents(contact_id);

CREATE TABLE public.advisor_contact_associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  contact_a_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  contact_b_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  relationship_label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_a_id, contact_b_id, relationship_label),
  CHECK (contact_a_id <> contact_b_id)
);
CREATE INDEX idx_contact_assoc_a ON public.advisor_contact_associations(contact_a_id);
CREATE INDEX idx_contact_assoc_b ON public.advisor_contact_associations(contact_b_id);

CREATE TABLE public.advisor_contact_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  status text DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_appts_advisor_time ON public.advisor_contact_appointments(advisor_id, starts_at);

CREATE TABLE public.advisor_contact_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.advisor_contacts(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  remind_at timestamptz NOT NULL,
  completed_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_reminders_advisor_time ON public.advisor_contact_reminders(advisor_id, remind_at) WHERE completed_at IS NULL AND dismissed_at IS NULL;

-- Reciprocal association trigger
CREATE OR REPLACE FUNCTION public.advisor_contact_reciprocate_association()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  reciprocal_label text;
BEGIN
  reciprocal_label := CASE NEW.relationship_label
    WHEN 'spouse' THEN 'spouse'
    WHEN 'parent' THEN 'child'
    WHEN 'child' THEN 'parent'
    WHEN 'sibling' THEN 'sibling'
    WHEN 'business_partner' THEN 'business_partner'
    WHEN 'referral' THEN 'referred_by'
    WHEN 'referred_by' THEN 'referral'
    ELSE NEW.relationship_label
  END;

  INSERT INTO public.advisor_contact_associations (advisor_id, contact_a_id, contact_b_id, relationship_label)
  VALUES (NEW.advisor_id, NEW.contact_b_id, NEW.contact_a_id, reciprocal_label)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_advisor_contact_reciprocate
AFTER INSERT ON public.advisor_contact_associations
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION public.advisor_contact_reciprocate_association();

-- updated_at triggers
CREATE TRIGGER trg_advisor_contacts_updated BEFORE UPDATE ON public.advisor_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_advisor_contact_policies_updated BEFORE UPDATE ON public.advisor_contact_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_advisor_contact_notes_updated BEFORE UPDATE ON public.advisor_contact_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_advisor_contact_appointments_updated BEFORE UPDATE ON public.advisor_contact_appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_advisor_contact_field_values_updated BEFORE UPDATE ON public.advisor_contact_field_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.advisor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contact_reminders ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'advisor_contacts','advisor_contact_emails','advisor_contact_phones',
    'advisor_contact_custom_fields','advisor_contact_field_values',
    'advisor_contact_policies','advisor_contact_notes','advisor_contact_documents',
    'advisor_contact_associations','advisor_contact_appointments','advisor_contact_reminders'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format($f$
      CREATE POLICY "advisor_select_own_%1$s" ON public.%1$I FOR SELECT
        USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()) OR public.is_admin(auth.uid()));
      CREATE POLICY "advisor_insert_own_%1$s" ON public.%1$I FOR INSERT
        WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));
      CREATE POLICY "advisor_update_own_%1$s" ON public.%1$I FOR UPDATE
        USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()))
        WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));
      CREATE POLICY "advisor_delete_own_%1$s" ON public.%1$I FOR DELETE
        USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));
    $f$, t);
  END LOOP;
END $$;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('advisor-contact-docs', 'advisor-contact-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "advisor read own contact docs" ON storage.objects FOR SELECT
  USING (bucket_id = 'advisor-contact-docs' AND (storage.foldername(name))[1] = public.get_advisor_id_for_auth(auth.uid())::text);
CREATE POLICY "advisor upload own contact docs" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'advisor-contact-docs' AND (storage.foldername(name))[1] = public.get_advisor_id_for_auth(auth.uid())::text);
CREATE POLICY "advisor update own contact docs" ON storage.objects FOR UPDATE
  USING (bucket_id = 'advisor-contact-docs' AND (storage.foldername(name))[1] = public.get_advisor_id_for_auth(auth.uid())::text);
CREATE POLICY "advisor delete own contact docs" ON storage.objects FOR DELETE
  USING (bucket_id = 'advisor-contact-docs' AND (storage.foldername(name))[1] = public.get_advisor_id_for_auth(auth.uid())::text);
