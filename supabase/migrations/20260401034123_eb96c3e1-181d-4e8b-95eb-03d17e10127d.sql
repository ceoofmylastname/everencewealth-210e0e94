CREATE POLICY "Public can view active advisors for response card"
ON public.advisors
FOR SELECT
TO anon, public
USING (is_active = true);