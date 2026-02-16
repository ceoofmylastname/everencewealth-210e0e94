CREATE POLICY "Users delete own notifications"
ON public.portal_notifications
FOR DELETE
TO authenticated
USING (user_id = get_portal_user_id(auth.uid()));