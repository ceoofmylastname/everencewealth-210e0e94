

## Three Changes: Route, Sidebar Nav, and Config

### Current State
- **Routing**: The app uses `src/App.tsx` with lazy-loaded routes. Advisor routes live under `/portal/advisor/*` inside an `<AdvisorRoute>` + `<PortalLayout>` wrapper (lines 406-448).
- **Sidebar**: The advisor sidebar is defined in `src/components/portal/PortalLayout.tsx` via `advisorNavGroups` (lines 22-75). There is no "AI Assist" entry — the closest group is "Resources" (line 42).
- **Config**: `supabase/config.toml` already has both `[functions.underwriting-process]` and `[functions.underwriting-chat]` entries (lines 51-55). No change needed here.
- **UnderwritingAI page**: Already exists at `src/pages/UnderwritingAI.tsx` with a default export.

### Changes

**1. `src/App.tsx` — Add lazy import and route**
- Add after line 139: `const UnderwritingAI = lazy(() => import("./pages/UnderwritingAI"));`
- Add a new route inside the advisor `<PortalLayout>` block (after line 447, the `presentation` route):
  ```tsx
  <Route path="underwriting" element={<UnderwritingAI />} />
  ```

**2. `src/components/portal/PortalLayout.tsx` — Add nav item**
- Add `FileSearch` to the lucide-react import (line 11).
- Add a new item to the "Resources" group (after "Schedule" or "Socorro Workshop", around line 52):
  ```ts
  { label: "Underwriting AI", icon: FileSearch, href: "/portal/advisor/underwriting" },
  ```

**3. `supabase/config.toml` — No change needed**
The entries already exist.

