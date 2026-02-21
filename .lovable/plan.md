

# Contracting Section Navigation Update

## Overview
Restructure the contracting sidebar navigation to show seven clear items: Dashboard, Pipeline, Agents, Messages, Files, Analytics, and Settings. This requires updating the PortalLayout nav, creating two new pages (Agents and Settings), and adding their routes.

## Current State
The sidebar "Contracting" group currently has:
- Dashboard (`/portal/advisor/contracting`)
- Pipeline (`/portal/advisor/contracting/pipeline`)
- Messages (`/portal/advisor/contracting/messages`)
- Documents (`/portal/advisor/contracting/documents`)
- Admin (admin-only, `/portal/advisor/contracting/admin`)

Analytics exists as a route but is not in the sidebar nav.

## Changes

### 1. Update PortalLayout sidebar nav
In `src/components/portal/PortalLayout.tsx`, replace the Contracting group items with:

| Nav Item | Icon | Route |
|---|---|---|
| Dashboard | Briefcase | `/portal/advisor/contracting` |
| Pipeline | GitBranch | `/portal/advisor/contracting/pipeline` |
| Agents | Users | `/portal/advisor/contracting/agents` |
| Messages | MessageSquare | `/portal/advisor/contracting/messages` |
| Files | FolderOpen | `/portal/advisor/contracting/documents` |
| Analytics | TrendingUp | `/portal/advisor/contracting/analytics` |
| Settings | Settings | `/portal/advisor/contracting/settings` |

Remove the conditional admin-only "Admin" entry -- the Admin functionality will be accessible from the Settings page instead.

### 2. Create Agents page
**New file:** `src/pages/portal/advisor/contracting/ContractingAgents.tsx`

A dedicated agent directory/list page showing all contracting agents in a searchable, filterable table. Features:
- Search by name or email
- Filter by status (in_progress, completed, on_hold, rejected)
- Filter by pipeline stage
- Table columns: Name, Email, Stage, Status, Manager, Days in Pipeline, Progress
- Each row links to the agent detail page (`/portal/advisor/contracting/agent/:id`)
- Access controlled by `useContractingAuth` -- managers see only their assigned agents, admins/contracting see all

### 3. Create Settings page
**New file:** `src/pages/portal/advisor/contracting/ContractingSettings.tsx`

A settings hub for contracting configuration, accessible to admin/contracting roles. Sections:
- **Pipeline Stages** -- read-only reference of the pipeline stage order
- **Bundle Management** -- moved from the Admin page (create/edit bundles)
- **Admin Panel link** -- button linking to the existing Admin page for full agent management
- Access controlled to `canManage` users only

### 4. Add routes in App.tsx
Add two new lazy-loaded routes:
- `contracting/agents` pointing to `ContractingAgents`
- `contracting/settings` pointing to `ContractingSettings`

## Technical Details

### Files Modified
| File | Change |
|---|---|
| `src/components/portal/PortalLayout.tsx` | Update Contracting nav group items to the 7-item list; remove conditional admin entry |
| `src/App.tsx` | Add lazy imports and routes for `ContractingAgents` and `ContractingSettings` |

### Files Created
| File | Purpose |
|---|---|
| `src/pages/portal/advisor/contracting/ContractingAgents.tsx` | Agent directory with search, filters, and table |
| `src/pages/portal/advisor/contracting/ContractingSettings.tsx` | Settings hub with bundle management and admin link |

### Data Sources
- **Agents page**: queries `contracting_agents` (with optional join to `portal_users` for manager name) and `contracting_agent_steps` for progress calculation
- **Settings page**: queries `contracting_bundles` for bundle management (reuses logic from ContractingAdmin)

### Access Control
Both new pages use the existing `useContractingAuth` hook:
- Agents: visible to all contracting roles (agent sees only self, manager sees assigned, admin/contracting sees all) -- enforced by RLS
- Settings: restricted to `canManage === true` users

