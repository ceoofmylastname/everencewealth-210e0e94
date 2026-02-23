

# Advisor Landing Page Profile Editor

## Problem
Currently, advisors have no way to edit the information that appears on their public workshop landing page. Their name, photo, email, and phone come from the `advisors` table, but only admins can edit that data. Advisors also create workshops (with date/time) separately on a different page, but there's no unified "manage your landing page" experience.

## Solution
Expand the Workshop Slug Setup page (`/portal/advisor/workshops/slug-setup`) to include a **Landing Page Profile** section where advisors can:

1. **Upload/change their headshot photo** (displayed on the landing page)
2. **Edit their display email and phone number** (shown on the landing page)
3. **See their name** (read-only, set by admin)
4. **Quick-link to create/manage workshops** (date and time are already set during workshop creation)

## Implementation Details

### 1. Storage Bucket for Advisor Photos
- Create a `advisor-photos` storage bucket via migration
- Add RLS policies so advisors can upload/update their own photos
- Photos will be stored as `{advisor_id}/headshot.{ext}`

### 2. Database: No schema changes needed
The `advisors` table already has `photo_url`, `email`, `phone`, `first_name`, `last_name` columns. We just need to allow advisors to update their own records.

### 3. RLS Policy for Advisor Self-Edit
Add an UPDATE policy on the `advisors` table so authenticated users can update their own row (limited to `photo_url`, `email`, `phone` columns). This will be done via a database function to restrict which columns can be modified.

### 4. UI Changes to WorkshopSlugSetup.tsx
Expand the "management view" (when slug already exists) to include:

- **Profile Card Section** below the URL display:
  - Circular photo with upload/change button (click to upload)
  - Display name (read-only)
  - Editable email field
  - Editable phone field
  - "Save Changes" button
- **Workshops Quick Section**:
  - Link to create new workshop
  - Link to workshops dashboard
  - Show next upcoming workshop date/time if one exists

### 5. File Changes

| File | Change |
|------|--------|
| `src/pages/portal/advisor/WorkshopSlugSetup.tsx` | Add profile editing UI with photo upload, email/phone fields |
| New migration SQL | Create storage bucket, add RLS policies for advisor self-update and photo storage |

### 6. Photo Upload Flow
1. Advisor clicks the photo area or "Upload Photo" button
2. File picker opens (accept: image/png, image/jpeg, image/webp)
3. File uploads to `advisor-photos/{advisor_id}/headshot.{ext}` bucket
4. Public URL is saved to `advisors.photo_url`
5. Landing page immediately reflects the new photo

### 7. Workshop Date/Time
Date and time are already managed through the **Create Workshop** form at `/portal/advisor/workshops/create`. The slug setup page will include a clear link to that form so advisors understand the workflow:
- Set up landing page (slug + profile) here
- Create/manage workshops (with dates) via the workshop creation form

