## Update ExamFX Contact Email

The "ExamFX — Pre-Licensing Courses" card on the compliance page is sourced from the `compliance_resources` table. Currently it shows `kjenson@lifeconetwork.com`, which needs to be replaced with the new Everence/Agora contact.

### Change

Run a migration to update the single row:

- **Table:** `public.compliance_resources`
- **Row:** `id = 4c1371eb-40c9-4d48-a582-ab88e16ec95c` (title: "ExamFX — Pre-Licensing Courses")
- **Field:** `contact_email`
- **From:** `kjenson@lifeconetwork.com`
- **To:** `info@agoraassurancesolutions.com`

```sql
UPDATE public.compliance_resources
SET contact_email = 'info@agoraassurancesolutions.com',
    updated_at = now()
WHERE id = '4c1371eb-40c9-4d48-a582-ab88e16ec95c';
```

### Verification

After the migration runs, re-query the row to confirm and reload `/portal/advisor/compliance` (or wherever the ExamFX card renders) to verify the UI shows the new address.

No code changes required — the card reads directly from the database.