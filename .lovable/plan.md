

# Fix Document Type Constraint (Take 3) -- HIGH PRIORITY

## Problem
The database CHECK constraint `portal_documents_document_type_check` still only allows the old values: `policy`, `illustration`, `amendment`, `beneficiary-form`, `statement`, `correspondence`, `other`.

The upload form sends these values: `general`, `policy_document`, `application`, `illustration`, `statement`, `id_verification` -- four of which (`general`, `policy_document`, `application`, `id_verification`) are rejected by the constraint, causing the error shown in the screenshot.

Previous migration attempts did not apply successfully.

## Solution

### Database Migration (single SQL statement)
Drop the existing constraint and recreate it to accept ALL values used by both the form and any existing data:

```sql
ALTER TABLE portal_documents DROP CONSTRAINT IF EXISTS portal_documents_document_type_check;
ALTER TABLE portal_documents ADD CONSTRAINT portal_documents_document_type_check 
  CHECK (document_type = ANY (ARRAY[
    'general', 'policy', 'policy_document', 'application', 
    'illustration', 'statement', 'id_verification',
    'amendment', 'beneficiary-form', 'correspondence', 'other'
  ]));
```

### No Code Changes Needed
The frontend form values and upload logic are already correct. This is purely a database constraint fix.

### Verification
After migration, I will query the constraint again to confirm it was applied before declaring success.

