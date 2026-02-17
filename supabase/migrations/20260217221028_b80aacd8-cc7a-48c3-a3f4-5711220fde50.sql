ALTER TABLE portal_documents DROP CONSTRAINT IF EXISTS portal_documents_document_type_check;
ALTER TABLE portal_documents ADD CONSTRAINT portal_documents_document_type_check 
  CHECK (document_type = ANY (ARRAY[
    'general', 'policy', 'policy_document', 'application', 
    'illustration', 'statement', 'id_verification',
    'amendment', 'beneficiary-form', 'correspondence', 'other'
  ]));