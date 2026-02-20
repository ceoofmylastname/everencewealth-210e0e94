

# Compliance Tab Overhaul

## Summary
Rebuild the advisor Compliance Center page to match the new structure with license management, compliance records display, and real resource links. Also create 3 new database tables and add admin management capabilities for the new data.

---

## Database Changes (3 new tables + columns on advisors)

### 1. Add resident license fields to `advisors` table
New columns: `resident_state`, `resident_license_number`, `resident_license_exp`, `npn_number`, `ce_due_date`

### 2. Create `non_resident_licenses` table
Columns: `id`, `advisor_id` (FK to advisors), `state`, `license_number`, `expiration_date`, `status` (text), `notes`, `created_at`, `updated_at`

RLS: Advisors see own rows, admins full access.

### 3. Create `compliance_records` table
Columns: `id`, `advisor_id` (FK to advisors, unique), `eo_insurance_exp` (date), `aml_training_date` (date), `background_check_date` (date), `ce_hours_completed` (boolean), `ce_hours_required` (int), `ce_hours_earned` (int), `created_at`, `updated_at`

RLS: Advisors see own record, admins full access.

---

## Advisor Compliance Page (`ComplianceCenter.tsx`) -- Full Rewrite

The page will be restructured top-to-bottom as:

### A. Page Header
- Shield icon, "Compliance" title, "Manage licenses and stay compliant" subtitle
- "Add License" button (opens dialog to add non-resident license)

### B. Alert Banner
- Conditional red alert if any license is expired or expiring within 90 days

### C. License Overview Stats (3 cards)
- Total Licenses (resident + non-resident count)
- Active Licenses (status = active)
- Expiring Soon (within 90 days)

### D. License Details Table
- Merges the single resident license from `advisors` with all `non_resident_licenses`
- Columns: State (with "Resident" badge), NPN Number, Expires, Status (color badge), Days Left, Actions
- Status calculated client-side: expired if past, expiring_soon if within 90 days, active otherwise
- "Edit" and "Delete" buttons for non-resident licenses
- "Renew" button that opens the NIPR renewal link in a new tab

### E. Add/Edit License Dialog
- State dropdown with all 50 US states
- NPN Number text input
- Expiration Date picker
- Saves to `non_resident_licenses`

### F. Compliance Records Section (NEW)
- Displays E&O Insurance Expiration, AML Training Date, Background Check Date, CE Hours progress
- Read-only for advisors (admin manages these)

### G. Compliance Resources
- FastrackCE partner card with 20% discount code BB25HOF and copy button
- ExamFX partner card with 55% discount and contact info
- State CE Requirements link to naic.org
- NAIC Producer Database link to pdb.nipr.com

---

## Admin Compliance Page (`AdminCompliance.tsx`) -- Enhancement

Add two new management sections alongside existing document/contract management:

### 1. Non-Resident Licenses Management
- Filter by advisor
- View all licenses across agents, add/edit/delete

### 2. Compliance Records Management
- Per-advisor form to set E&O expiration, AML training date, background check date, CE hours
- Admin can create/update compliance records for any advisor

### 3. Resident License Fields
- Admin can update resident license info (state, license number, expiration, NPN, CE due date) on the advisors table

---

## Files Changed

| File | Action |
|---|---|
| Database migration | Create `non_resident_licenses`, `compliance_records` tables + add columns to `advisors` + RLS policies |
| `src/pages/portal/advisor/ComplianceCenter.tsx` | Full rewrite with new structure |
| `src/pages/portal/admin/AdminCompliance.tsx` | Add non-resident licenses, compliance records, and resident license management sections |

