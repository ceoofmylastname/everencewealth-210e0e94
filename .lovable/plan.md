
# Phase 7.12: Compliance Center

## Overview
Create a new Compliance Center page for advisors showing compliance score, licensing status, required documents, carrier contracting status, and compliance resources -- all using static/demo data initially (no new database tables needed).

## Changes

### 1. Create `src/pages/portal/advisor/ComplianceCenter.tsx`
New page with the following sections:

**Header**: "Compliance Center" title with subtitle, Playfair Display heading (matching existing pattern).

**Compliance Score Card**: A prominent card with a circular-style score display (percentage number) and a Progress bar. Shows an alert if score is below 100%.

**Stats Row** (3 cards):
- License Status: Shield icon, status text, expiry date
- Active Contracts: FileText icon, count of active contracts, pending count
- Required Trainings: CheckCircle icon, completed/total fraction with progress text

**Required Documents Section**: Card listing documents (E&O Insurance Certificate, State Insurance License, FINRA Registration, W-9 Form, Background Check) each with:
- FileText icon
- Document name and expiry date (if applicable)
- Status badge (Active/green, Pending/yellow, Expired/red, Not Required/gray)
- Download button

**Carrier Contracting Status Section**: Card listing carriers (Pacific Life, North American, Allianz, American Amicable) each with:
- Status dot indicator
- Carrier name and contracted date
- Status badge
- "Complete" button for pending items

**Compliance Resources Section**: Card with linked resource items (State Licensing Requirements Guide, Fiduciary Duty & Best Practices, E&O Insurance Requirements) each with FileText icon and ExternalLink arrow.

**Utility helpers**: `getStatusBadge()` for color-coded badges, `isExpiringWithin30Days()` and `isExpired()` date helpers, `complianceScore` calculation using contracts/trainings/documents ratios.

### 2. Update `src/App.tsx`
- Add lazy import: `const ComplianceCenter = lazy(() => import("./pages/portal/advisor/ComplianceCenter"))`
- Add route inside the advisor `PortalLayout` group: `<Route path="compliance" element={<ComplianceCenter />} />`

### 3. Update `src/components/portal/PortalLayout.tsx`
- Add `{ label: "Compliance", icon: Shield, href: "/portal/advisor/compliance" }` to the `advisorNav` array (after Schedule)

## Technical Details
- **No database migration** -- uses hardcoded demo data for compliance status, documents, and contracting (matching the reference code pattern)
- **Auth**: Uses `usePortalAuth` to get the logged-in advisor; fetches advisor record from `advisors` table via `supabase` client for future extensibility
- **Imports**: Shield, FileText, CheckCircle, AlertCircle, Clock, Download, ExternalLink from lucide-react; Progress component; Badge component; Card/CardContent; toast from sonner
- **Patterns**: Follows the existing page structure (Playfair Display heading, spinner loading state, Card-based sections, Badge status indicators)
