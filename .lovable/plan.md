

## Fix: All Agents Not Showing — RLS Policy Missing for Response Card

### Root Cause
The `advisors` table has Row-Level Security enabled. Unauthenticated users (response card visitors) can only see advisors that have an active entry in the `advisor_slugs` table — currently only **7 out of 24** active advisors have slugs. This is why the same 7 names appear regardless of dropdown vs inline list.

### Fix
Add a new RLS policy on the `advisors` table that allows **anonymous/public SELECT** for all active advisors. This is safe because the response card only reads `id`, `first_name`, and `last_name`.

**Database migration:**
```sql
CREATE POLICY "Public can view active advisors for response card"
ON public.advisors
FOR SELECT
TO anon, public
USING (is_active = true);
```

### Visual Refresh (Step 1 of 8)
While fixing the data issue, also make step 1 more modern and creative:
- Add a search/filter input at the top so users can type to find their agent
- Style each agent card with avatar initials circle (green bg, white text), name in bold
- Selected state: gold left border + gold tinted background
- Smooth fade-in animation for the list items
- "X agents available" count badge at top

### Files
- **Database migration** — 1 new RLS policy (the actual fix)
- **`src/pages/ResponseCard.tsx`** — add search filter input, styled agent cards with initials avatars, staggered animations

### Why This Is Safe
The policy only exposes `is_active = true` advisors for SELECT. No write access. The response card already only selects `id, first_name, last_name` columns.

