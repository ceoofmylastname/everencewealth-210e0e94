

# Fix Document Type Constraint (Take 2)

## Problem
The database constraint `portal_documents_document_type_check` still only allows: `policy`, `illustration`, `amendment`, `beneficiary-form`, `statement`, `correspondence`, `other`. The previous migration did not apply successfully. The upload form sends `general`, `policy_document`, `application`, `id_verification` which are rejected.

## Solution

### Database Migration
Drop and recreate the constraint to accept all values used by the upload form:

```sql
ALTER TABLE portal_documents DROP CONSTRAINT portal_documents_document_type_check;
ALTER TABLE portal_documents ADD CONSTRAINT portal_documents_document_type_check 
  CHECK (document_type = ANY (ARRAY[
    'general', 'policy', 'policy_document', 'application', 
    'illustration', 'statement', 'id_verification',
    'amendment', 'beneficiary-form', 'correspondence', 'other'
  ]));
```

No code changes needed -- the frontend is already correct. This is purely a database constraint fix.
