ALTER TABLE public.location_pages_backup_20260424 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view comma cleanup backup"
ON public.location_pages_backup_20260424
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));