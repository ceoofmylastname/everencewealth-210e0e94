

## Client Profile/Settings Page

### Overview
Create a new page at `/portal/client/profile` where clients can manage their personal information, change their password, upload an avatar, and set notification preferences.

### Database Changes

**New table: `portal_notification_preferences`**
- Stores per-user notification settings
- Columns: `id`, `portal_user_id` (FK to portal_users), `email_notifications` (bool, default true), `policy_updates` (bool, default true), `document_alerts` (bool, default true), `message_alerts` (bool, default true), `created_at`, `updated_at`
- RLS: users can only read/update their own row
- A row is auto-created when the profile page is first loaded (upsert pattern)

### Files to Create

**1. `src/pages/portal/client/ClientProfile.tsx`**

Four sections in a responsive layout:

**Personal Information**
- Form with first name, last name, phone fields (editable)
- Email shown as read-only (since it's tied to auth)
- Save button that updates the `portal_users` table
- Success/error toast feedback

**Change Password**
- Current password is not required by Supabase's `updateUser`
- New password + confirm password fields
- Calls `supabase.auth.updateUser({ password })` 
- Validation: min 8 chars, passwords must match

**Avatar**
- Display current avatar or initials fallback
- File upload button that uploads to the `portal-documents` storage bucket (subfolder `avatars/`)
- On upload: get public URL, update `portal_users.avatar_url`
- Accept image types only (jpg, png, webp), max 2MB

**Notification Preferences**
- Toggle switches for: Email Notifications, Policy Updates, Document Alerts, Message Alerts
- Auto-save on toggle (update `portal_notification_preferences`)
- Fetches current preferences on load, creates defaults if none exist

### Files to Modify

**2. `src/App.tsx`**
- Add lazy import for `ClientProfile`
- Add route: `<Route path="profile" element={<ClientProfile />} />` inside client routes

**3. `src/components/portal/PortalLayout.tsx`**
- Add a "Profile" nav item to `clientNav` array with the `User` icon, linking to `/portal/client/profile`

### Storage
- Uses the existing private `portal-documents` bucket
- Avatar files stored under path: `avatars/{portal_user_id}/{filename}`
- RLS on `storage.objects` will need a policy allowing authenticated users to upload/read their own avatar files in this path

### Technical Notes
- Password change uses `supabase.auth.updateUser()` which only requires the new password when the user is already authenticated
- Avatar upload uses `supabase.storage.from('portal-documents').upload()` with upsert
- The notification preferences table uses an upsert pattern: fetch on load, insert defaults if missing
- All styling follows existing portal patterns (Card components, muted foreground text, consistent spacing)
