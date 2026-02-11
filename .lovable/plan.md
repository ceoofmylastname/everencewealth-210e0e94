

# Apartments Admin Dashboard

## Problem
There are no admin pages for managing apartment content. Navigating to `/apartments_page_content` or `/apartments_properties` shows 404 because those are database table names, not routes.

## Solution
Build two admin pages under the existing protected admin system, plus add navigation links in the sidebar.

---

## New Files

### 1. `src/pages/admin/ApartmentsPageContent.tsx`
Admin page at `/admin/apartments-content` to manage the `apartments_page_content` table.

- Uses `AdminLayout` wrapper (same as all other admin pages)
- Language tabs across the top (en, nl, fr, de, fi, pl, da, hu, sv, no)
- Form fields for the selected language:
  - **Hero Section**: headline (text input), subheadline (textarea), cta_text (input), hero_image_url (input + preview), hero_image_alt (input)
  - **Video Section**: video_enabled (switch), video_url (input), video_thumbnail_url (input)
  - **Reviews Section**: reviews_enabled (switch), elfsight_widget_id (input)
  - **SEO Section**: meta_title (input), meta_description (textarea)
  - **Publish Toggle**: is_published (switch)
- On load: fetches row for selected language from `apartments_page_content`
- Save button: upserts the row (insert if new language, update if exists)
- Success/error toasts

### 2. `src/pages/admin/ApartmentsProperties.tsx`
Admin page at `/admin/apartments-properties` to manage the `apartments_properties` table.

- Uses `AdminLayout` wrapper
- Language filter dropdown at top
- Data table listing all properties for the selected language:
  - Columns: Title, Location, Price, Bedrooms, Type, Status, Visible, Views, Inquiries, Actions
  - Inline toggle for `visible`
  - Edit/Delete action buttons
- "Add Property" button opens a dialog/form with fields:
  - title, slug, location, price, bedrooms, bathrooms, sqm, property_type, status, description, short_description, featured_image_url, featured_image_alt, display_order, visible, featured
- Edit mode: pre-fills the form with existing data
- Delete: confirmation dialog, then removes the row
- Stats row at top: total properties, total views, total inquiries

---

## Modified Files

### 3. `src/App.tsx`
Add two new lazy-loaded routes in the admin section (around line 210):
```
const ApartmentsPageContent = lazy(() => import("./pages/admin/ApartmentsPageContent"));
const ApartmentsProperties = lazy(() => import("./pages/admin/ApartmentsProperties"));

<Route path="/admin/apartments-content" element={<ProtectedRoute><ApartmentsPageContent /></ProtectedRoute>} />
<Route path="/admin/apartments-properties" element={<ProtectedRoute><ApartmentsProperties /></ProtectedRoute>} />
```

### 4. `src/components/AdminLayout.tsx`
Add a new nav group "Apartments" (after "Properties") in the `navGroups` array:
```
{
  label: "Apartments",
  items: [
    { name: "Page Content", href: "/admin/apartments-content", icon: FileText },
    { name: "Properties", href: "/admin/apartments-properties", icon: Building2 },
  ],
}
```
Import `Building2` from lucide-react (already imported: `FileText`).

---

## Technical Details

- Both pages use `supabase` client from `@/integrations/supabase/client`
- RLS policies already allow admin users full CRUD on both tables (verified: policies use `is_admin(auth.uid())`)
- No database migrations needed -- tables and policies already exist
- Uses existing UI components: Card, Button, Input, Textarea, Label, Switch, Select, Dialog, Table
- Follows the same patterns as `PropertyForm.tsx` and other admin pages

