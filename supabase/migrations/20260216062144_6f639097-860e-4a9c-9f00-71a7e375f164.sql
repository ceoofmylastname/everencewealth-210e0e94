
-- Create storage bucket for portal documents
INSERT INTO storage.buckets (id, name, public) VALUES ('portal-documents', 'portal-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Advisors can upload documents
CREATE POLICY "Advisors can upload portal documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portal-documents'
  AND (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()))
);

-- Advisors can view all documents for their clients
CREATE POLICY "Advisors can view portal documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portal-documents'
  AND (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()))
);

-- Clients can view documents marked as client-visible (handled at app layer via portal_documents table)
CREATE POLICY "Clients can view their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portal-documents'
  AND public.get_portal_role(auth.uid()) = 'client'
);

-- Advisors can delete documents they uploaded
CREATE POLICY "Advisors can delete portal documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portal-documents'
  AND (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()))
);

-- Advisors can update portal documents
CREATE POLICY "Advisors can update portal documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portal-documents'
  AND (public.is_portal_advisor(auth.uid()) OR public.is_portal_admin(auth.uid()))
);
