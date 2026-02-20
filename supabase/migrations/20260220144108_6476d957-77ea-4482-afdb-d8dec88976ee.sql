
-- Admin can view all conversations
CREATE POLICY "Admins can view all conversations"
ON public.portal_conversations FOR SELECT
TO authenticated
USING (public.is_portal_admin(auth.uid()));

-- Admin can view all messages
CREATE POLICY "Admins can view all messages"
ON public.portal_messages FOR SELECT
TO authenticated
USING (public.is_portal_admin(auth.uid()));
