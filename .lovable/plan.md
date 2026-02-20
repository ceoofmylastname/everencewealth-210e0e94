
# Push CNA to Client Dashboard

## Summary
When an advisor completes a CNA, they can assign it to one of their clients via a dropdown and "push" it to the client's dashboard. The client can then view and optionally download the completed CNA as a read-only report.

## Changes

### 1. Database: Add RLS policy for clients
Add a SELECT policy so clients can read CNAs assigned to them:
```sql
CREATE POLICY "Clients can view own CNAs"
  ON client_needs_analysis FOR SELECT
  USING (client_id = get_portal_user_id(auth.uid()));
```

### 2. CNA Form -- Add "Assign to Client" dropdown (Step 8: Review and Sign)
In `src/pages/portal/advisor/CNAForm.tsx`:
- Fetch the advisor's clients from `portal_users` where `advisor_id = portalUser.id` and `role = 'client'`
- Add a Select dropdown above the signature section labeled "Assign to Client"
- When a client is selected, set `form.client_id` to that client's `portal_users.id`
- On submit, the `client_id` is saved to the database, making the CNA visible to that client

### 3. CNA Dashboard -- Show assigned client name
In `src/pages/portal/advisor/CNADashboard.tsx`:
- Update the query to join or show the client name when `client_id` is set
- Show a "Shared" badge on CNAs that have a `client_id`

### 4. Client Dashboard -- Add "Financial Analyses" section
In `src/pages/portal/client/ClientDashboard.tsx`:
- Add a stat card for CNA count
- Add a "Financial Analyses" section below policies showing completed CNAs assigned to this client
- Each CNA card shows: applicant name, date, retirement score, net worth
- Clicking opens a read-only view

### 5. Client CNA View page (new file)
Create `src/pages/portal/client/ClientCNAView.tsx`:
- Read-only display of the completed CNA
- Sections: Goals, Demographics, Income/Expenses, Assets/Liabilities, AI Analysis results
- Download button that generates a printable HTML view (using `window.print()` with print-specific CSS) -- no PDF library needed

### 6. Routing
In `src/App.tsx`:
- Add route `/portal/client/cna/:id` pointing to `ClientCNAView`
- Add lazy import for the new component

## Technical Details

**Client dropdown query:**
```sql
SELECT id, first_name, last_name, email
FROM portal_users
WHERE advisor_id = :advisorId AND role = 'client' AND is_active = true
ORDER BY last_name, first_name
```

**Download approach:** Use `window.print()` with a print-friendly layout styled via `@media print` CSS. This avoids adding a PDF library dependency.

**Files to create:**
- `src/pages/portal/client/ClientCNAView.tsx` -- read-only CNA report with print/download

**Files to edit:**
- `src/pages/portal/advisor/CNAForm.tsx` -- add client dropdown in Step 8
- `src/pages/portal/advisor/CNADashboard.tsx` -- show shared badge
- `src/pages/portal/client/ClientDashboard.tsx` -- add CNA section and stat card
- `src/App.tsx` -- add client CNA route
