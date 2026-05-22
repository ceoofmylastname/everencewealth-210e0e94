
-- Restrict public read on client_invitations. Replace permissive SELECT with a token-scoped RPC.
DROP POLICY IF EXISTS "Anyone can validate invitation by token" ON public.client_invitations;

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token text)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  advisor_id uuid,
  status text,
  expires_at timestamptz,
  advisor_first_name text,
  advisor_last_name text,
  advisor_title text,
  advisor_photo_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ci.id, ci.first_name, ci.last_name, ci.email, ci.phone,
    ci.advisor_id, ci.status, ci.expires_at,
    a.first_name, a.last_name, a.title, a.photo_url
  FROM public.client_invitations ci
  LEFT JOIN public.advisors a ON a.id = ci.advisor_id
  WHERE ci.invitation_token = _token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO anon, authenticated;
