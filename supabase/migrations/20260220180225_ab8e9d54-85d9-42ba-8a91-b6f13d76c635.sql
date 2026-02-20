CREATE POLICY "Clients can view own CNAs"
  ON public.client_needs_analysis FOR SELECT
  USING (client_id = get_portal_user_id(auth.uid()));