

## Add Bulk Publish and Status Change to Articles Page

### Current State
The `/admin/articles` page has checkbox selection and a bulk actions bar, but only supports **Bulk Delete**. There is no way to publish, archive, or change the status of multiple articles at once.

### What Will Change
Add bulk status change actions (Publish, Archive, Revert to Draft) to the existing bulk actions bar so you can select articles and change their status in one click.

### Implementation Details

**File: `src/pages/admin/Articles.tsx`**

1. Add a new `bulkStatusMutation` (similar to the existing `bulkDeleteMutation`) that updates the `status` column for all selected article IDs in a single database call.

2. Expand the bulk actions bar (the amber card that appears when articles are selected) to include three new buttons:
   - **Publish Selected** -- sets status to `published`
   - **Set as Draft** -- sets status to `draft`  
   - **Archive Selected** -- sets status to `archived`

3. Add a confirmation dialog for the Publish action (similar to the existing delete confirmation) to prevent accidental bulk publishing.

4. After a successful bulk status update, invalidate the article queries so the list refreshes, clear the selection, and show a success toast.

### Technical Details

- New mutation calls `supabase.from("blog_articles").update({ status, updated_at: new Date().toISOString() }).in("id", selectedArticleIds)`
- Reuses existing selection state (`selectedArticles`) and checkbox UI
- Buttons will be disabled while any mutation is pending
- The `updated_at` timestamp will also be refreshed on status change

