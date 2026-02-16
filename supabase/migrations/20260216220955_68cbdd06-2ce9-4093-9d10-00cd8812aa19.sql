-- Function to auto-create portal_users record for invited signups
CREATE OR REPLACE FUNCTION public.handle_new_portal_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Check if this user was invited via client_invitations
  SELECT * INTO invitation_record
  FROM public.client_invitations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Only create portal_users if an invitation exists
  IF FOUND THEN
    INSERT INTO public.portal_users (
      auth_user_id,
      role,
      first_name,
      last_name,
      email,
      advisor_id,
      is_active
    ) VALUES (
      NEW.id,
      'client',
      invitation_record.first_name,
      invitation_record.last_name,
      NEW.email,
      invitation_record.advisor_id,
      true
    )
    ON CONFLICT (auth_user_id) DO NOTHING;

    -- Mark invitation as accepted
    UPDATE public.client_invitations
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = invitation_record.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_portal ON auth.users;
CREATE TRIGGER on_auth_user_created_portal
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_portal_user();