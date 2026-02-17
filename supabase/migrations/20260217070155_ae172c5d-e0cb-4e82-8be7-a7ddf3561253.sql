
CREATE OR REPLACE FUNCTION public.handle_new_portal_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record RECORD;
  v_advisor_portal_user_id UUID;
BEGIN
  SELECT * INTO invitation_record
  FROM public.client_invitations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Look up the advisor's portal_user_id (correct FK for portal_users.advisor_id)
    SELECT portal_user_id INTO v_advisor_portal_user_id
    FROM public.advisors
    WHERE id = invitation_record.advisor_id;

    INSERT INTO public.portal_users (
      auth_user_id, role, first_name, last_name,
      email, advisor_id, is_active
    ) VALUES (
      NEW.id, 'client',
      invitation_record.first_name,
      invitation_record.last_name,
      NEW.email,
      v_advisor_portal_user_id,
      true
    )
    ON CONFLICT (auth_user_id) DO NOTHING;

    UPDATE public.client_invitations
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = invitation_record.id;
  END IF;

  RETURN NEW;
END;
$$;
