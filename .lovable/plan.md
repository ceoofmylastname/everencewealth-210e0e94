

# Fix Document Upload Constraint and Add Realtime

## Problem
The `portal_documents` table has a CHECK constraint (`portal_documents_document_type_check`) that only allows: `policy`, `illustration`, `amendment`, `beneficiary-form`, `statement`, `correspondence`, `other`.

The upload form sends: `general`, `policy_document`, `application`, `illustration`, `statement`, `id_verification` -- causing the constraint violation error.

## Solution

### 1. Database Migration
Drop the old constraint and add one that accepts all form values plus existing ones:

```sql
ALTER TABLE portal_documents DROP CONSTRAINT portal_documents_document_type_check;
ALTER TABLE portal_documents ADD CONSTRAINT portal_documents_document_type_check 
  CHECK (document_type = ANY (ARRAY[
    'general', 'policy', 'policy_document', 'application', 
    'illustration', 'statement', 'id_verification',
    'amendment', 'beneficiary-form', 'correspondence', 'other'
  ]));
```

### 2. Enable Realtime on portal_documents
So uploaded documents appear instantly on the client dashboard:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_documents;
```

### 3. Add Realtime Subscription in Client Documents Page
Update `src/pages/portal/client/ClientDocuments.tsx` to subscribe to `portal_documents` changes filtered by the client's ID. When an INSERT event arrives with `is_client_visible = true`, append it to the list. When a DELETE event arrives, remove it. When an UPDATE event changes visibility, add or remove accordingly.

### Files Changed
- **Database migration** -- constraint fix + realtime publication
- `src/pages/portal/client/ClientDocuments.tsx` -- add realtime subscription for live updates
