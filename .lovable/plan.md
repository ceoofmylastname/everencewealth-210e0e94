
# Separate Admin Panel from Agent Dashboard

## Problem

Currently, the admin panel sidebar links to the same pages agents use (e.g., `/portal/advisor/carriers`), and CRUD buttons are conditionally shown via `isAdmin` checks. This means:
- Admin and agent experiences are mixed in the same components
- An agent could theoretically see admin UI if role checks fail
- The admin navigates between `/portal/admin/*` and `/portal/advisor/*` routes, which is confusing

## Solution

Create dedicated admin-only pages for all content management under `/portal/admin/*` routes. Strip all CRUD UI from the agent-facing pages so agents see purely read-only views.

### What Changes

**1. Create 7 new admin pages** under `src/pages/portal/admin/`:

- `AdminCarriers.tsx` -- Full CRUD for carriers (add, edit, delete)
- `AdminNews.tsx` -- Full CRUD for carrier news
- `AdminTools.tsx` -- Full CRUD for quoting tools
- `AdminTraining.tsx` -- Full CRUD for training content
- `AdminMarketing.tsx` -- Full CRUD for marketing resources
- `AdminSchedule.tsx` -- Full CRUD for schedule events (manage all events, not just own)
- `AdminCompliance.tsx` -- Full CRUD for compliance documents and carrier contracts across all advisors

Each admin page will contain the same CRUD logic currently embedded in the advisor pages (the dialog forms, edit/delete buttons), but in their own dedicated components.

**2. Remove all admin CRUD from agent-facing pages:**

- `CarrierDirectory.tsx` -- Remove `isAdmin` checks, remove add/edit/delete buttons and dialog forms
- `CarrierNews.tsx` -- Same: remove all admin CRUD UI
- `ToolsHub.tsx` -- Same
- `TrainingCenter.tsx` -- Same
- `MarketingResources.tsx` -- Same
- `SchedulePage.tsx` -- Agents can still create their own events, but cannot edit/delete other agents' events
- `ComplianceCenter.tsx` -- Remove admin CRUD, keep advisor's own compliance view

**3. Update Admin Navigation** (`AdminPortalLayout.tsx`):

Change all links from `/portal/advisor/*` to `/portal/admin/*`:
- Carriers -> `/portal/admin/carriers`
- News -> `/portal/admin/news`
- Tools -> `/portal/admin/tools`
- Training -> `/portal/admin/training`
- Marketing -> `/portal/admin/marketing`
- Schedule -> `/portal/admin/schedule`
- Compliance -> `/portal/admin/compliance`

Keep Policies, Documents, Messages pointing to `/portal/advisor/*` since those are the admin's own book of business.

**4. Register new routes** in `App.tsx`:

Add 7 new routes under the existing `/portal/admin` route group inside `AdminPortalLayout`.

### Architecture After Changes

```text
/portal/advisor/*  (AdvisorRoute + PortalLayout)
  - READ-ONLY: carriers, news, tools, training, marketing
  - OWN DATA: clients, policies, documents, messages, schedule, compliance
  - No admin CRUD buttons anywhere

/portal/admin/*  (AdminRoute + AdminPortalLayout)
  - CRUD: carriers, news, tools, training, marketing, schedule, compliance
  - OVERSIGHT: agents, clients, policies, documents, messages
```

Content updated by the admin appears instantly for agents because both sides query the same database tables.

### Files to Create
- `src/pages/portal/admin/AdminCarriers.tsx`
- `src/pages/portal/admin/AdminNews.tsx`
- `src/pages/portal/admin/AdminTools.tsx`
- `src/pages/portal/admin/AdminTraining.tsx`
- `src/pages/portal/admin/AdminMarketing.tsx`
- `src/pages/portal/admin/AdminSchedule.tsx`
- `src/pages/portal/admin/AdminCompliance.tsx`

### Files to Edit
- `src/components/portal/AdminPortalLayout.tsx` -- Update nav links to `/portal/admin/*`
- `src/App.tsx` -- Register 7 new admin routes
- `src/pages/portal/advisor/CarrierDirectory.tsx` -- Remove all `isAdmin` CRUD UI
- `src/pages/portal/advisor/CarrierNews.tsx` -- Remove all `isAdmin` CRUD UI
- `src/pages/portal/advisor/ToolsHub.tsx` -- Remove all `isAdmin` CRUD UI
- `src/pages/portal/advisor/TrainingCenter.tsx` -- Remove all `isAdmin` CRUD UI
- `src/pages/portal/advisor/MarketingResources.tsx` -- Remove all `isAdmin` CRUD UI
- `src/pages/portal/advisor/SchedulePage.tsx` -- Remove admin override capabilities
- `src/pages/portal/advisor/ComplianceCenter.tsx` -- Remove admin CRUD and advisor filter

No database changes needed -- RLS policies already grant admins full access to all tables.
