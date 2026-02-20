
# Unified Card UI Across All Portal Pages

## Summary
Apply the same enhanced card styling from the Dashboard home pages to every portal page -- advisor, client, and admin. This is a find-and-replace operation across 23 files, swapping the old card classes for the modern 3D-shadow design.

## What Changes

### Style Swap (applied to all 23 files)

**Old style** (inconsistent across pages):
`bg-white rounded-xl border border-gray-100 shadow-sm`

**New style** (matching dashboard home):
`bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]`

For interactive/hoverable cards, the old hover patterns like `hover:shadow-md hover:border-gray-200` get upgraded to:
`hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px]`

### Files to Update

**Advisor pages (14 files):**
- AdvisorClients.tsx -- stat cards, client cards, empty states
- AdvisorDocuments.tsx -- document list, upload section
- AdvisorMessages.tsx -- conversation list, message panel
- AdvisorPolicies.tsx -- policy cards, empty state
- CarrierDirectory.tsx -- carrier cards, filter panel
- CarrierDetail.tsx -- detail sections
- CarrierNews.tsx -- news cards
- ComplianceCenter.tsx -- license table, compliance records, resource cards
- MarketingResources.tsx -- stat cards, resource cards, filter panel
- PerformanceTracker.tsx -- StatCard component, all section panels
- SchedulePage.tsx -- event cards
- ToolsHub.tsx -- tool cards
- TrainingCenter.tsx -- training cards
- CNADashboard.tsx / CNAForm.tsx -- CNA cards

**Client pages (5 files):**
- ClientPolicies.tsx -- policy cards
- ClientDocuments.tsx -- document cards
- ClientMessages.tsx -- message panel
- ClientNotifications.tsx -- notification cards
- ClientPolicyDetail.tsx -- detail sections
- ClientCNAView.tsx -- CNA sections

**Admin pages (4 files):**
- AdminAgents.tsx -- agent table wrappers
- AdminMarketing.tsx -- stat cards, resource cards
- AdminCompliance.tsx -- management panels
- AdminSchedule.tsx -- event cards (if present)

## Technical Details

The change is purely CSS class string replacement. No logic, data, or component structure changes. Each file gets:

1. All instances of `rounded-xl border border-gray-100 shadow-sm` replaced with `rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]`
2. Hover states upgraded from `hover:shadow-md` to `hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px]`
3. Internal borders (like `border-b border-gray-100` dividers inside cards) stay as-is -- only the outer card container gets upgraded
4. Where a `StatCard` component exists (e.g., PerformanceTracker.tsx), update the component's className so all instances inherit the new look

No database changes needed. Pure className updates across all portal files.
