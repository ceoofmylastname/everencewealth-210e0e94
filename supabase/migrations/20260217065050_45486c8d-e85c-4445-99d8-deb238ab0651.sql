CREATE POLICY "Anyone can validate invitation by token"
ON client_invitations FOR SELECT TO anon, authenticated
USING (true);