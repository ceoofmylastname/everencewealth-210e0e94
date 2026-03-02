
Goal: Make profile photo upload actually work on `/portal/advisor/settings` for this account.

What I found
- The upload flow never reaches storage right now (no upload request is fired).
- In `AdvisorSettings.tsx`, photo loading depends on:
  - `portal_users` filtered with `.eq("role", "advisor")`
- Your current logged-in user is `portal_users.role = "admin"` (not advisor), so:
  - `portalUser` resolves to null in this page
  - `advisorId` stays null
  - `handlePhotoUpload` exits early at `if (!file || !advisorId) return;`
- This is why nothing uploads and no photo preloads, even though an `advisors` row and existing `photo_url` do exist for your auth user.
- Storage access rules for `advisor-photos` are already correct and do not need backend policy changes.

Implementation plan
1. Fix advisor lookup in `src/pages/portal/AdvisorSettings.tsx`
- Replace role-specific lookup with advisor lookup by authenticated user:
  - Primary: query `advisors` by `auth_user_id = user.id` and select `id, photo_url`
  - Optional fallback: if needed, resolve via active `portal_users` record (without forcing role=advisor), then `advisors.portal_user_id`
- This makes settings work for both advisor-role and admin-role users who have advisor profiles.

2. Improve upload guard behavior
- Keep `if (!file || !advisorId)` guard, but return a visible toast when `advisorId` is missing:
  - “Could not load your advisor profile yet. Refresh and try again.”
- Prevent silent failure.

3. Keep current storage path/bucket logic (already correct)
- Bucket: `advisor-photos`
- Path: `${advisorId}/headshot-${Date.now()}.${ext}`
- `upsert: true` stays.

4. UX hardening (small but important)
- Disable upload control until advisor profile load completes.
- Add a short loading state text for profile initialization.
- Clear file input value after attempt to allow re-selecting same file.

5. Verification steps after change
- Open `/portal/advisor/settings` as current account.
- Confirm existing photo now appears from DB.
- Upload JPG/PNG under 5MB:
  - Storage request should be made to `advisor-photos/<advisor-id>/...`
  - `advisors.photo_url` updates successfully
  - Success toast appears and preview updates.
- Negative checks:
  - non-image file rejected with toast
  - >5MB file rejected with toast

Technical details
- Root cause is identity resolution in frontend, not storage permissions.
- Route allows both advisor/admin, but this page currently assumes advisor-only role while resolving `portal_users`.
- Backend policy uses advisor ID derived from auth user, so once advisor ID is correctly loaded, upload authorization aligns with policy.
