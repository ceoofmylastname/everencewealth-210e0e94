

## Move Brochures and State Pages to /admin under Content

The Brochures and State Pages management currently live under the Portal Admin sidebar (`/portal/admin/brochures`, `/portal/admin/state-pages`). You want them moved to the main admin site (`/admin/...`) under the **Content** navigation group, alongside Articles, Authors, and Location Pages.

---

### 1. Add New Routes Under /admin

Add these routes to the main admin section in `src/App.tsx`:

- `/admin/brochures/new` -- AdminBrochureForm (create)
- `/admin/brochures/:id/edit` -- AdminBrochureForm (edit)
- `/admin/state-pages` -- AdminStatePages

The existing `/admin/brochures` route already points to `BrochureManager`. We will **replace** it with the newer `AdminBrochures` component (which has the bulk state guide generator and better UI), and add the sub-routes for create/edit.

### 2. Update AdminLayout Sidebar Navigation

In `src/components/AdminLayout.tsx`, update the "Content" nav group (lines 74-84) to add:

- "State Pages" with MapPin icon at `/admin/state-pages`

"Brochures" is already listed there (line 81), but currently points to the old `BrochureManager`. The route swap handles this automatically.

### 3. Update Internal Links in AdminBrochures and AdminBrochureForm

Update all `/portal/admin/brochures/...` links inside:
- `src/pages/portal/admin/AdminBrochures.tsx` -- change links to `/admin/brochures/...`
- `src/pages/portal/admin/AdminBrochureForm.tsx` -- change navigation to `/admin/brochures`
- `src/pages/portal/admin/AdminStatePages.tsx` -- no portal-specific links to change (uses edge functions directly)

### 4. Remove from Portal Admin

In `src/components/portal/AdminPortalLayout.tsx`, remove the "Brochures" and "State Pages" entries from the `adminNav` array (lines 15-16).

In `src/App.tsx`, remove the portal admin routes for brochures and state-pages (lines 376-379).

### 5. Wrap Pages in AdminLayout

The portal admin pages render inside `AdminPortalLayout` (dark sidebar). The main admin uses `AdminLayout`. The `AdminBrochures`, `AdminBrochureForm`, and `AdminStatePages` components don't wrap themselves in a layout (they rely on the parent `Outlet`), so they will work inside the main admin layout. However, the `/admin/...` routes use `AdminLayout` as a wrapper at the page level (each page wraps itself). We need to wrap these components in `AdminLayout` at the route level or inside the component.

Looking at the pattern: `Articles` wraps itself in `<AdminLayout>`. So `AdminBrochures`, `AdminBrochureForm`, and `AdminStatePages` need to be wrapped similarly. We will create thin wrapper components or wrap them inline at the route level.

---

### Summary of Changes

| File | Change |
|---|---|
| `src/App.tsx` | Replace `/admin/brochures` route with `AdminBrochures`, add `/admin/brochures/new`, `/admin/brochures/:id/edit`, `/admin/state-pages`. Remove portal admin brochure/state-page routes. |
| `src/components/AdminLayout.tsx` | Add "State Pages" to Content nav group |
| `src/components/portal/AdminPortalLayout.tsx` | Remove Brochures and State Pages from sidebar |
| `src/pages/portal/admin/AdminBrochures.tsx` | Update all internal links from `/portal/admin/brochures/...` to `/admin/brochures/...`. Wrap content in `AdminLayout`. |
| `src/pages/portal/admin/AdminBrochureForm.tsx` | Update navigation paths. Wrap in `AdminLayout`. |
| `src/pages/portal/admin/AdminStatePages.tsx` | Wrap in `AdminLayout`. |
