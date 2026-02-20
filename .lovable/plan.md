
# Admin Content Management -- Full CRUD Access to All Portal Modules

## Summary

The admin needs to manage all content that agents/brokers see: carriers, news, tools, training, marketing, schedule, compliance, and downloadable documents. The database RLS policies already grant admins full CRUD access on all these tables. The work is purely frontend: adding navigation links and adding admin-only create/edit/delete UI to each existing page.

## Current State

- **Database**: Already has `ALL` (full CRUD) RLS policies for admins on `carriers`, `carrier_news`, `quoting_tools`, `trainings`, `marketing_resources`, `schedule_events`, `compliance_documents`, and `carrier_contracts`. No database changes needed.
- **Routing**: `AdvisorRoute` already allows admins through (checks `role === "advisor" || role === "admin"`), so admins can already visit `/portal/advisor/*` pages.
- **Admin Sidebar**: Only has links for Agents, Clients, Policies, Documents, Messages, and Dashboard. Missing links for Carriers, News, Tools, Training, Marketing, Schedule, and Compliance.
- **Page UI**: These pages are read-only views for advisors. None have add/edit/delete forms. The admin needs CRUD forms added (visible only when user is admin).

## Plan

### 1. Update Admin Sidebar Navigation (AdminPortalLayout.tsx)

Add all missing links organized into groups similar to the advisor layout:

- **Management**: Agents, Clients, Policies, Documents, Messages
- **Market**: Carriers, News
- **Resources**: Tools, Training, Marketing, Schedule
- **Compliance**: Compliance

### 2. Add Admin CRUD to Each Page

For each page, detect if the user is an admin (via `usePortalAuth`) and show admin-only add/edit/delete UI. All pages follow a similar pattern:

**CarrierDirectory.tsx** -- Add "Add Carrier" button + dialog form (carrier name, logo URL, AM Best rating, products offered, niches, short code, portal URL, notes). Add edit/delete buttons on each carrier card.

**CarrierNews.tsx** -- Add "Add News" button + dialog form (title, content, carrier, article type, priority, status). Add edit/delete buttons on each news card.

**ToolsHub.tsx** -- Add "Add Tool" button + dialog form (tool name, URL, type, carrier, description, requires login, login instructions, featured). Add edit/delete on each tool card. (Note: built-in calculators remain unchanged.)

**TrainingCenter.tsx** -- Add "Add Training" button + dialog form (title, description, category, level, duration, video URL, thumbnail URL, status). Add edit/delete on each training card.

**MarketingResources.tsx** -- Add "Add Resource" button + dialog form (title, category, resource type, file URL, thumbnail URL, description, tags). Add edit/delete on each resource card.

**SchedulePage.tsx** -- Already has an "Add Event" button. Add edit/delete capabilities on events for admin (currently any advisor can add, but admin should be able to manage all events).

**ComplianceCenter.tsx** -- Add ability for admin to manage compliance documents for any advisor and manage carrier contracts. Add "Add Document" and "Add Contract" forms.

### 3. File Changes

- `src/components/portal/AdminPortalLayout.tsx` -- Add navigation links with grouped sections
- `src/pages/portal/advisor/CarrierDirectory.tsx` -- Add admin CRUD UI
- `src/pages/portal/advisor/CarrierNews.tsx` -- Add admin CRUD UI
- `src/pages/portal/advisor/ToolsHub.tsx` -- Add admin CRUD UI for quoting tools
- `src/pages/portal/advisor/TrainingCenter.tsx` -- Add admin CRUD UI
- `src/pages/portal/advisor/MarketingResources.tsx` -- Add admin CRUD UI
- `src/pages/portal/advisor/SchedulePage.tsx` -- Add admin edit/delete for all events
- `src/pages/portal/advisor/ComplianceCenter.tsx` -- Add admin CRUD UI for documents and contracts

No database migrations needed -- all RLS policies are already in place.

## Technical Details

### Admin Detection Pattern

Each page will use the existing `usePortalAuth` hook:

```typescript
const { portalUser } = usePortalAuth();
const isAdmin = portalUser?.role === "admin";
```

Admin-only UI elements (add/edit/delete buttons and dialog forms) will be conditionally rendered with `{isAdmin && (...)}`.

### CRUD Pattern for Each Page

Each page will follow the same pattern:
1. Add a Dialog with a form for creating new records
2. Add edit/delete action buttons on each card (admin only)
3. Edit reuses the same dialog form pre-filled with existing data
4. Delete uses a confirmation dialog before removing

### Navigation Update

The admin sidebar will be restructured from a flat list to grouped sections matching the advisor layout pattern, using the same Lucide icons (Building2, Newspaper, Wrench, GraduationCap, Megaphone, Calendar, Shield).
