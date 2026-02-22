

# Fix: Upload Button and Activity Tracking Bugs

## Two bugs found and fixes needed:

### Bug 1: Activity Log Trigger References Wrong Column
The database trigger `create_contracting_notification_from_activity` references `NEW.activity_type`, but the actual column in `contracting_activity_logs` is called `action`. This causes every insert to fail with `"record 'new' has no field 'activity_type'"`.

**Fix:** Update the trigger function to use `NEW.action` instead of `NEW.activity_type`.

```sql
CREATE OR REPLACE FUNCTION create_contracting_notification_from_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.contracting_notifications (agent_id, title, message, notification_type, link)
  VALUES (
    NEW.agent_id,
    CASE NEW.action
      WHEN 'step_completed' THEN 'Step Completed'
      WHEN 'stage_changed' THEN 'Stage Updated'
      WHEN 'document_uploaded' THEN 'Document Uploaded'
      WHEN 'message_sent' THEN 'New Message'
      ELSE 'Activity Update'
    END,
    COALESCE(NEW.description, 'Activity recorded on your contracting profile.'),
    COALESCE(NEW.action, 'message'),
    '/portal/advisor/contracting'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Bug 2: File Upload Fails Due to Spaces in Filename
The storage upload path includes the raw filename which can have spaces (e.g., `Screenshot 2026-02-13 at 12.46.36 AM.jpeg`). Supabase Storage rejects keys with spaces.

**Fix:** Sanitize the filename in `SureLCSetup.tsx` by replacing spaces and special characters with underscores.

Change the upload path construction (line 147) from:
```ts
const filePath = `${agentId}/surelc/${Date.now()}_${file.name}`;
```
to:
```ts
const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
const filePath = `${agentId}/surelc/${Date.now()}_${safeName}`;
```

## Files Changed

| File | Action |
|---|---|
| Database migration | Fix trigger function to use `action` instead of `activity_type` |
| `src/pages/portal/advisor/contracting/SureLCSetup.tsx` | Sanitize filename to remove spaces before upload |

