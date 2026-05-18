
ALTER TABLE public.quoting_tools
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS allow_download boolean NOT NULL DEFAULT true;

ALTER TABLE public.quoting_tools ALTER COLUMN tool_url DROP NOT NULL;

ALTER TABLE public.quoting_tools DROP CONSTRAINT IF EXISTS quoting_tools_tool_type_check;
ALTER TABLE public.quoting_tools ADD CONSTRAINT quoting_tools_tool_type_check
  CHECK (tool_type = ANY (ARRAY['quick_quote','agent_portal','microsite','illustration_system','application_portal','pdf_document']));

INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-documents', 'tool-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read tool documents" ON storage.objects;
CREATE POLICY "Public read tool documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'tool-documents');

DROP POLICY IF EXISTS "Admins upload tool documents" ON storage.objects;
CREATE POLICY "Admins upload tool documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tool-documents' AND public.is_portal_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update tool documents" ON storage.objects;
CREATE POLICY "Admins update tool documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'tool-documents' AND public.is_portal_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete tool documents" ON storage.objects;
CREATE POLICY "Admins delete tool documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'tool-documents' AND public.is_portal_admin(auth.uid()));
