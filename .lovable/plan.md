

## Admin CNA Oversight

### Current State
- The CNA dashboard (`/portal/advisor/cna`) already queries all CNAs without an advisor filter.
- An RLS policy "Admins can view all CNAs" already exists using `is_portal_admin(auth.uid())`.
- Since admins use advisor routes (hybrid role), they already see all CNAs when visiting this page.
- **However**, the dashboard does not display which advisor created each CNA — so admins can't tell whose analysis is whose.

### What Needs to Change

**No database changes required.** RLS already permits admin access.

#### 1. Enhance CNA Dashboard for Admin Context
- Detect if the current user is an admin (`portalUser.role === 'admin'`).
- When admin, join the `advisor_id` to the `portal_users` table to fetch the advisor's name.
- Display an **advisor name badge** on each CNA card (e.g., "By: David Rosenberg").
- Add an **advisor filter dropdown** so admins can filter CNAs by advisor.
- Update the page subtitle to reflect agency-wide scope (e.g., "All advisor analyses" instead of just a count).

#### 2. CNA Card Changes
Each CNA card will show:
- Existing: applicant name, status, shared badge, reviewed badge, net worth, retirement score.
- **New for admins**: A small colored pill showing the advisor who created the CNA.

#### 3. Admin Filter Bar
- Add a dropdown next to the existing status filter: "All Advisors" / individual advisor names.
- Filter the CNA list by `advisor_id` when selected.

### Technical Details
- The `client_needs_analysis` table has an `advisor_id` column (FK to `portal_users.id`).
- Query will be updated to `.select("*, advisor:portal_users!advisor_id(first_name, last_name)")` to join advisor names.
- No new RLS policies needed — "Admins can view all CNAs" already covers SELECT.
- The UPDATE policy only allows advisors to update their own CNAs, which is correct (admins should view, not edit others' CNAs).

