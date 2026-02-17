

# Portal Bug Fixes: 5 Critical and High Issues

## Overview
The audit found 5 actionable issues. This plan fixes them all in one pass.

## Fix 1: Add UPDATE Policy on `portal_conversations` (Critical)

**Problem:** Both client and advisor messaging pages call `.update({ last_message_at })` on `portal_conversations` after sending messages. There is no UPDATE RLS policy, so these calls silently fail. Conversation ordering breaks.

**Solution:** Add an UPDATE policy allowing conversation participants to update their conversations.

```sql
CREATE POLICY "Participants can update conversations"
ON public.portal_conversations FOR UPDATE
TO authenticated
USING (
  advisor_id = get_portal_user_id(auth.uid())
  OR client_id = get_portal_user_id(auth.uid())
)
WITH CHECK (
  advisor_id = get_portal_user_id(auth.uid())
  OR client_id = get_portal_user_id(auth.uid())
);
```

## Fix 2: Fix Document Downloads (Critical)

**Problem:** The `portal-documents` storage bucket is private, but `AdvisorDocuments.tsx` stores `getPublicUrl()` results in the database. These URLs return 403 for private buckets. Clients cannot download documents.

**Solution:** 
- In `AdvisorDocuments.tsx`: store only the **storage path** (not the full public URL) in the `file_url` column
- In `ClientDocuments.tsx` and `ClientPolicyDetail.tsx`: generate signed URLs on the fly when users click Download
- In `AdvisorDocuments.tsx` download button: also use signed URLs

## Fix 3: Enable Realtime on `policies` and `portal_documents` (High)

**Problem:** Only `portal_messages` and `portal_notifications` are in the Realtime publication. When an advisor creates a policy or uploads a document, the client's page does not update until they manually refresh.

**Solution:** SQL migration to add these tables to the realtime publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.policies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_documents;
```

Note: The client pages don't currently have realtime subscriptions for these tables, but enabling publication is the prerequisite. Adding subscriptions to the client components will follow.

## Fix 4: Add Client Self-Update RLS Policy (High)

**Problem:** `portal_users` has no UPDATE policy for regular users. Clients cannot update their own profile (name, phone, avatar).

**Solution:** Add a self-update policy:

```sql
CREATE POLICY "Users can update own portal record"
ON public.portal_users FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());
```

## Fix 5: Auto-Create Notifications for Policy/Document Actions (High)

**Problem:** When an advisor creates a policy or uploads a visible document, no notification is sent to the client. The notification system exists but is not triggered.

**Solution:** Add a database trigger on `policies` INSERT that creates a notification, and modify the document upload code in `AdvisorDocuments.tsx` to also insert a notification when `is_client_visible = true`.

Trigger for policies:
```sql
CREATE OR REPLACE FUNCTION public.notify_client_new_policy()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO portal_notifications (user_id, title, message, notification_type, link)
  VALUES (
    NEW.client_id,
    'New Policy Added',
    'A new ' || REPLACE(NEW.product_type, '_', ' ') || ' policy from ' || NEW.carrier_name || ' has been added to your account.',
    'policy',
    '/portal/client/policies/' || NEW.id
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_notify_client_new_policy
AFTER INSERT ON policies
FOR EACH ROW EXECUTE FUNCTION notify_client_new_policy();
```

For documents: Add a JS-side notification insert in `AdvisorDocuments.tsx` after successful upload when `is_client_visible = true`.

## Files Changed

- **Database migration**: 1 migration with all SQL fixes (UPDATE policy, Realtime, self-update policy, notification trigger)
- **Modified**: `src/pages/portal/advisor/AdvisorDocuments.tsx` -- fix storage path + add notification on upload
- **Modified**: `src/pages/portal/client/ClientDocuments.tsx` -- use signed URLs for downloads
- **Modified**: `src/pages/portal/client/ClientPolicyDetail.tsx` -- use signed URLs for document downloads

## Technical Notes

- The signed URL approach uses `supabase.storage.from('portal-documents').createSignedUrl(path, 3600)` which generates a 1-hour download link
- The storage path format changes from full URL to relative path: `{advisor_id}/{client_id}/{timestamp}.{ext}`
- Existing documents with full URLs in `file_url` need backward-compatible handling (check if URL contains the bucket domain or is a relative path)
