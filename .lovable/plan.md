

## Add Assessment Leads to Portal Admin

### Problem
The Assessment Leads page was only added to the CRM admin dashboard (`/crm/admin/assessment-leads`). The user is on the Portal admin (`/portal/admin/*`) which is a separate admin area with its own layout and navigation. It needs to be accessible there too.

### Changes

#### 1. Add route to Portal admin routes in `src/App.tsx`
- Import the existing `CrmAssessmentLeads` component (reuse it)
- Add route `assessment-leads` under `/portal/admin` routes (line ~453)

#### 2. Add nav link in `src/components/portal/AdminPortalLayout.tsx`
- Add `FileCheck` icon import
- Add "Assessment Leads" item to the "Management" nav group with href `/portal/admin/assessment-leads`

#### Files to change
- `src/App.tsx` — add route under portal admin
- `src/components/portal/AdminPortalLayout.tsx` — add sidebar nav item

