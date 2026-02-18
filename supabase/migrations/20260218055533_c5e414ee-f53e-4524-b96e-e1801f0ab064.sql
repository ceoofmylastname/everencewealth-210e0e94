
-- Allow advisors to insert schedule events
CREATE POLICY "Portal advisors can create schedule events"
ON public.schedule_events
FOR INSERT
TO public
WITH CHECK (is_portal_advisor(auth.uid()) OR is_portal_admin(auth.uid()));

-- Allow advisors to update/delete events they created
CREATE POLICY "Portal advisors can manage own schedule events"
ON public.schedule_events
FOR ALL
TO public
USING (
  (is_portal_advisor(auth.uid()) OR is_portal_admin(auth.uid()))
  AND created_by IN (
    SELECT id FROM public.portal_users WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  (is_portal_advisor(auth.uid()) OR is_portal_admin(auth.uid()))
  AND created_by IN (
    SELECT id FROM public.portal_users WHERE auth_user_id = auth.uid()
  )
);
