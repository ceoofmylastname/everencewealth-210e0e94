
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'advisor_contacts',
    'advisor_contact_appointments',
    'advisor_contact_associations',
    'advisor_contact_custom_fields',
    'advisor_contact_documents',
    'advisor_contact_emails',
    'advisor_contact_field_values',
    'advisor_contact_notes',
    'advisor_contact_phones',
    'advisor_contact_policies',
    'advisor_contact_reminders'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS advisor_select_own_%I ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY advisor_select_own_%I ON public.%I FOR SELECT USING (advisor_id = get_advisor_id_for_auth(auth.uid()))',
      t, t
    );
  END LOOP;
END $$;
