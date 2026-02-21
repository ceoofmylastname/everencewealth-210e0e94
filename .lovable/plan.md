
# Contracting & Onboarding Platform -- Expansion (Phase 2)

## Summary

Expand the existing contracting system with 3 new database tables, 4 new UI pages, and enhanced role-based access. The system already has 7 core tables, RLS policies, 3 pages (Dashboard, Pipeline, Agent Detail), and role detection via `useContractingAuth`. This phase adds the missing entities (bundles, carrier selections, notifications) and the remaining UI pages (Messages, Documents, Admin).

---

## What Already Exists (No Changes Needed)

- **Tables**: `contracting_agents`, `contracting_steps`, `contracting_agent_steps`, `contracting_documents`, `contracting_messages`, `contracting_activity_logs`, `contracting_reminders`
- **Carriers table**: `carriers` (shared with portal) -- already has carrier_name, products_offered, commission_structure, contracting_requirements, etc.
- **Auth/Roles**: `useContractingAuth` hook with `get_contracting_role()` and `get_contracting_agent_id()` security definer functions
- **RLS**: Full role-based policies (agent sees own, manager sees assigned, admin/contracting sees all)
- **Storage**: `contracting-documents` private bucket
- **Pages**: Dashboard (role-split), Pipeline (Kanban + table), Agent Detail (checklist + uploads)
- **Routing**: Already wired under `/portal/advisor/contracting/*`

---

## New Database Tables (3)

### 1. `contracting_bundles`
Groups of carriers/products offered as a package to agents during onboarding.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. "Standard IUL Bundle" |
| description | text nullable | |
| carrier_ids | uuid[] | Array of carrier IDs from `carriers` table |
| product_types | text[] | e.g. ['IUL', 'Whole Life'] |
| is_active | boolean default true | |
| created_at / updated_at | timestamptz | |

### 2. `contracting_carrier_selections`
Tracks which carriers each agent is being contracted with.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| agent_id | uuid FK | contracting_agents |
| carrier_id | uuid FK | carriers |
| bundle_id | uuid FK nullable | contracting_bundles |
| status | text | 'pending', 'submitted', 'approved', 'rejected' |
| submitted_at | timestamptz nullable | |
| approved_at | timestamptz nullable | |
| notes | text nullable | |
| created_at | timestamptz | |

### 3. `contracting_notifications`
In-app notifications for contracting events.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| agent_id | uuid FK | contracting_agents (recipient) |
| title | text | |
| message | text | |
| notification_type | text | 'step_completed', 'stage_changed', 'document_uploaded', 'message', 'reminder' |
| link | text nullable | In-app link |
| read | boolean default false | |
| read_at | timestamptz nullable | |
| created_at | timestamptz | |

### RLS for New Tables

All three tables follow the same pattern as existing contracting tables:
- Agents: see own rows only (via `get_contracting_agent_id`)
- Managers: see assigned agents
- Admin/Contracting: full access
- `contracting_bundles`: read access for all authenticated users, write access for admin/contracting only

---

## New UI Pages (4)

### 1. Contracting Messages Page (`ContractingMessages.tsx`)
Route: `/portal/advisor/contracting/messages`

- Thread list on left, message panel on right
- Threads grouped by agent (thread_id = agent_id)
- Real-time updates via Supabase Realtime (already enabled on `contracting_messages`)
- Agents see only their own thread; managers/admins see all threads
- Send new messages with sender auto-detected from `useContractingAuth`

### 2. Contracting Documents Page (`ContractingDocuments.tsx`)
Route: `/portal/advisor/contracting/documents`

- Filterable list of all documents from `contracting_documents`
- Filter by agent, step, date range
- Upload new documents with agent/step assignment
- Download via signed URLs (private bucket)
- Agents see only their own documents; managers/admins see scoped documents

### 3. Contracting Admin Page (`ContractingAdmin.tsx`)
Route: `/portal/advisor/contracting/admin`

- Spreadsheet-style table of all agents with inline editing
- Columns: Name, Email, Stage, Status, Progress %, Manager, Carrier Selections, Days Active
- Bulk actions: assign manager, change status, assign bundle
- Bundle management section (create/edit bundles)
- Carrier selection management per agent
- Export to CSV
- Only accessible by admin/contracting roles

### 4. Carrier Selections Page (embedded in Agent Detail)
- Enhance existing `ContractingAgentDetail.tsx` with a "Carrier Appointments" section
- Shows which carriers the agent is being contracted with
- Admin/contracting can add carriers from the existing `carriers` table or assign a bundle
- Status tracking per carrier (pending, submitted, approved, rejected)

---

## Navigation Updates

Update sidebar in `PortalLayout.tsx` Contracting group:

```
Contracting
  - Dashboard    /portal/advisor/contracting
  - Pipeline     /portal/advisor/contracting/pipeline
  - Messages     /portal/advisor/contracting/messages
  - Documents    /portal/advisor/contracting/documents
  - Admin        /portal/advisor/contracting/admin  (admin/contracting only)
```

---

## Technical Details

### Files to Create
| File | Purpose |
|---|---|
| `src/pages/portal/advisor/contracting/ContractingMessages.tsx` | Messages page with real-time chat |
| `src/pages/portal/advisor/contracting/ContractingDocuments.tsx` | Document browser with filters |
| `src/pages/portal/advisor/contracting/ContractingAdmin.tsx` | Admin spreadsheet + bundle management |

### Files to Modify
| File | Change |
|---|---|
| Database migration | 3 new tables + RLS policies |
| `src/components/portal/PortalLayout.tsx` | Add Messages, Documents, Admin nav items |
| `src/App.tsx` | Add 3 new routes |
| `src/pages/portal/advisor/contracting/ContractingAgentDetail.tsx` | Add carrier selections section |
| `src/hooks/useContractingAuth.ts` | No changes needed -- already complete |

### Notification Triggers
- Activity log entries will also create `contracting_notifications` via a database trigger when:
  - A step is completed
  - Pipeline stage changes
  - A document is uploaded
  - A new message is sent

### Design System
Follows existing portal patterns:
- White cards with `rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]`
- Primary #1A4D3E, accent #EBD975
- 3D hover lift effect on interactive cards
