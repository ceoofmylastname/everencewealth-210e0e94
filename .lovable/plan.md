

## Fix Training and Compliance Tables - Assessment and Plan

### Current State: No Missing Tables

After investigating the database schema and codebase, here's what I found:

**Training Center -- Already Working**
- The `trainings` table exists with 4 published records and proper columns (title, category, level, duration, video_url, etc.)
- The `training_progress` table exists with advisor tracking (progress_percent, completed, last_viewed_at)
- RLS policies are correctly configured for both tables
- The Training Center page queries these tables and works correctly

**Compliance Center -- Static by Design**
- The page uses hardcoded demo data (not database tables)
- No code anywhere references `compliance_items` or `compliance_status` tables
- This was intentionally built as a structural placeholder

### Recommended Plan: Make Compliance Center Data-Driven

Since no tables are actually missing or broken, the useful work here is to replace the Compliance Center's static demo data with real database tables.

### Database Changes

**1. Create `compliance_documents` table**
Replaces the hardcoded `requiredDocuments` array.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| advisor_id | UUID | FK to advisors |
| name | TEXT | Document name (e.g. "E&O Insurance Certificate") |
| status | TEXT | current, expired, pending, not_required |
| expiry_date | DATE | Optional expiration date |
| file_url | TEXT | Link to uploaded document |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-set |

**2. Create `carrier_contracts` table**
Replaces the hardcoded `contractingStatus` array.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| advisor_id | UUID | FK to advisors |
| carrier_name | TEXT | Carrier name |
| status | TEXT | active, pending, terminated |
| contracted_date | DATE | When contracted |
| created_at | TIMESTAMPTZ | Auto-set |

**3. RLS Policies**
- Advisors can view their own compliance documents and carrier contracts
- Admins can manage all records (using existing `is_portal_admin` function)

### Code Changes

**`src/pages/portal/advisor/ComplianceCenter.tsx`**
- Remove hardcoded `complianceData`, `requiredDocuments`, and `contractingStatus` constants
- Fetch data from the new `compliance_documents` and `carrier_contracts` tables filtered by the advisor's ID
- Compute the compliance score dynamically from real data
- Keep the same UI layout and styling -- just swap the data source
- Keep the "Compliance Resources" section as static links (these are reference materials, not per-advisor data)

### What Stays the Same
- No changes to Training Center (already working)
- No changes to routing or navigation
- Same visual design and layout for Compliance Center

### Technical Notes
- License status and E&O expiry will come from the `compliance_documents` table (filtered by document name/type)
- The compliance score calculation will use the same formula but with real counts from the database
- The "Required Trainings" stat will continue to pull from the existing `training_progress` table

