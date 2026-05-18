
-- Returns true when the caller (auth.uid()) is the manager of the given advisor
CREATE OR REPLACE FUNCTION public.can_manage_advisor(_auth_uid uuid, _advisor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.advisors a
    JOIN public.contracting_agents ca ON ca.auth_user_id = a.auth_user_id
    JOIN public.portal_users mgr ON mgr.id = ca.manager_id
    WHERE a.id = _advisor_id
      AND mgr.auth_user_id = _auth_uid
      AND mgr.is_active = true
  );
$$;

-- Returns the list of advisor IDs managed by the caller
CREATE OR REPLACE FUNCTION public.get_managed_advisor_ids(_auth_uid uuid)
RETURNS TABLE(advisor_id uuid, first_name text, last_name text, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.first_name, a.last_name, a.email
  FROM public.advisors a
  JOIN public.contracting_agents ca ON ca.auth_user_id = a.auth_user_id
  JOIN public.portal_users mgr ON mgr.id = ca.manager_id
  WHERE mgr.auth_user_id = _auth_uid
    AND mgr.is_active = true
  ORDER BY a.first_name, a.last_name;
$$;

-- Add manager read-only SELECT policies on all contact tables
DO $$
DECLARE
  t text;
  contact_tables text[] := ARRAY[
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
  FOREACH t IN ARRAY contact_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS manager_select_managed_advisor_contacts ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY manager_select_managed_advisor_contacts ON public.%I FOR SELECT USING (public.can_manage_advisor(auth.uid(), advisor_id))',
      t
    );
  END LOOP;
END $$;
