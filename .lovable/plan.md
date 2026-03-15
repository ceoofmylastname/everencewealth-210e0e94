

## Move Presentation to Portal & Add Per-Agent Access Control

### What's changing

1. **Remove** the "Workshop Presentation" link from the `/admin` sidebar (AdminLayout.tsx) — it doesn't belong in the blog/SEO admin.

2. **Add** a "Workshop Presentation" link to the **Admin Portal sidebar** (`AdminPortalLayout.tsx`) under the "Resources" group, pointing to `/portal/admin/presentation`.

3. **Add a new route** `/portal/admin/presentation` inside the admin portal route group in `App.tsx`, rendering the existing `PresentationViewer` component (with `onExit` navigating back to `/portal/admin/agents`).

4. **Database: Add `presentation_access` column** to `portal_users` table — a boolean (default `false`) that flags whether an advisor can see the presentation link on their dashboard.

5. **Admin Agent Detail page** (`AdminAgentDetail.tsx`) — Add a toggle switch labeled "Workshop Presentation Access" so admins can grant/revoke access with one click. This updates `portal_users.presentation_access` for that agent.

6. **Advisor Portal nav** (`PortalLayout.tsx`) — Conditionally show a "Workshop Presentation" link under the "Portal" group when the logged-in advisor has `presentation_access = true`.

7. **Add advisor presentation route** `/portal/advisor/presentation` in `App.tsx` — renders `PresentationViewer` with `onExit` back to advisor dashboard.

### Files to modify
- `src/components/AdminLayout.tsx` — remove Workshop Presentation nav item
- `src/components/portal/AdminPortalLayout.tsx` — add Presentation link to Resources group
- `src/App.tsx` — add two new routes (admin + advisor presentation)
- `src/pages/portal/admin/AdminAgentDetail.tsx` — add toggle for `presentation_access`
- `src/components/portal/PortalLayout.tsx` — conditionally show Presentation link
- **Migration** — `ALTER TABLE portal_users ADD COLUMN presentation_access boolean DEFAULT false`

### Database migration
```sql
ALTER TABLE public.portal_users 
ADD COLUMN IF NOT EXISTS presentation_access boolean NOT NULL DEFAULT false;
```

No new RLS needed — existing portal_users policies already cover admin read/write and advisor self-read.

