
-- Fix 1: UPDATE policy on portal_conversations
CREATE POLICY "Participants can update conversations"
ON public.portal_conversations FOR UPDATE
TO authenticated
USING (
  advisor_id = get_portal_user_id(auth.uid())
  OR client_id = get_portal_user_id(auth.uid())
)
WITH CHECK (
  advisor_id = get_portal_user_id(auth.uid())
  OR client_id = get_portal_user_id(auth.uid())
);

-- Fix 3: Enable Realtime on policies and portal_documents
ALTER PUBLICATION supabase_realtime ADD TABLE public.policies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_documents;

-- Fix 4: Client self-update RLS policy
CREATE POLICY "Users can update own portal record"
ON public.portal_users FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Fix 5: Auto-create notification on new policy
CREATE OR REPLACE FUNCTION public.notify_client_new_policy()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO portal_notifications (user_id, title, message, notification_type, link)
  VALUES (
    NEW.client_id,
    'New Policy Added',
    'A new ' || REPLACE(COALESCE(NEW.product_type, ''), '_', ' ') || ' policy from ' || COALESCE(NEW.carrier_name, 'your advisor') || ' has been added to your account.',
    'policy',
    '/portal/client/policies/' || NEW.id
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_notify_client_new_policy
AFTER INSERT ON public.policies
FOR EACH ROW EXECUTE FUNCTION public.notify_client_new_policy();
