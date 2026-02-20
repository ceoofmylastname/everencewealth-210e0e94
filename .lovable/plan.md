
# Enhanced Client Needs Analysis (CNA) Form System

## Summary

Build a comprehensive, multi-step financial needs analysis wizard accessible from the advisor portal at `/portal/advisor/cna`. This includes a new database table (60+ columns), an 8-step animated form with real-time calculations and charts, an AI-powered financial analysis edge function via Lovable AI, a CNA management dashboard, and a digital signature capture. PDF export will be deferred to a follow-up since `@react-pdf/renderer` is not installed and adds significant bundle size.

## Phase 1: Database Schema

Create the `client_needs_analysis` table with all fields organized by section:

- **Relationships**: `advisor_id` and optional `client_id` referencing `portal_users`
- **Goals** (10 boolean fields + target values)
- **Risk Tolerance** (enum text)
- **Demographics** (name, email, phone, address, DOB, smoking status for applicant + spouse)
- **Income** (gross, net, other)
- **Expenses** (13 expense fields across non-discretionary and discretionary)
- **Assets** (7 asset fields)
- **Liabilities** (6 liability fields)
- **Budget** (3 preset booleans + custom amount)
- **Calculated fields** (total expenses, assets, liabilities, net worth, surplus/deficit, debt-to-income)
- **AI analysis** (4 JSONB columns for recommendations, insurance gap, retirement projection, risk assessment)
- **Collaboration** (advisor notes, follow-up tasks JSONB, next review date)
- **Signature** (base64 text + timestamp)
- **Metadata** (status enum, version, previous_version_id self-reference, timestamps)

RLS policies:
- Advisors SELECT/INSERT/UPDATE their own CNAs (via `get_portal_user_id(auth.uid())`)
- Admins SELECT all CNAs (via `is_portal_admin(auth.uid())`)

Indexes on advisor_id, client_id, status, and created_at.

## Phase 2: AI Edge Function

Create `supabase/functions/financial-analysis/index.ts` using the Lovable AI gateway (not direct OpenAI calls):

- Accepts client financial data (age, income, expenses, net worth, goals, risk tolerance)
- Sends structured prompt to `google/gemini-3-flash-preview` via the Lovable AI gateway
- Uses tool calling to extract structured JSON output (retirement score, insurance gaps, recommendations, action steps)
- Returns the structured analysis
- Handles 429/402 rate limit errors gracefully
- Includes CORS headers and JWT validation

## Phase 3: Multi-Step CNA Form Component

Create `src/pages/portal/advisor/CNAForm.tsx` -- a self-contained 8-step wizard:

### Step 1: Goals and Risk Tolerance
- Animated goal cards with icons (Framer Motion stagger)
- Checkbox-style selection with expandable target inputs for retirement age and monthly amount
- Visual risk tolerance slider with 5 levels and color gradient

### Step 2: Applicant and Spouse Information
- Two-column layout (single column on mobile)
- Text inputs for name, email, phone, address, city, state, zip
- Date picker for DOB with auto-calculated age display
- Radio group for smoking status
- Spouse section is collapsible/optional

### Step 3: Income Analysis
- Currency-formatted inputs for gross income, net income, other income
- Optional description field for other income sources
- Real-time income summary card showing monthly and annualized totals

### Step 4: Expense Tracking
- Two categories: Non-Discretionary (6 items) and Discretionary (7 items)
- Recharts PieChart showing expense breakdown in real-time
- Live surplus/deficit calculation against net income
- Warning badge when expenses exceed income

### Step 5: Assets and Liabilities
- Side-by-side green (assets) and red (liabilities) columns
- Animated count-up totals
- Net worth hero card with large animated number
- Debt-to-income ratio display with color coding (green < 36%, yellow < 43%, red >= 43%)

### Step 6: Budget for Goals
- Quick-select buttons ($400, $800, $1,600, custom)
- Shows available monthly surplus from previous calculations
- Additional notes textarea

### Step 7: AI Analysis
- Loading state with rotating status messages
- Calls the financial-analysis edge function
- Displays: retirement readiness score (circular progress), insurance gap cards, risk profile with recommended allocation (Recharts PieChart), prioritized action steps
- All AI results stored in form state for saving

### Step 8: Review and Sign
- Accordion sections summarizing all data
- HTML Canvas-based signature pad (no external library needed -- use native canvas API with mouse/touch events)
- Submit button saves everything to database

### Shared Form Features
- Progress bar showing current step (1-8)
- Next/Back navigation buttons
- Auto-save draft on step change
- Mobile-first responsive layout (all grids collapse to single column)
- Brand green (#1A4D3E) accent color throughout

## Phase 4: CNA Management Dashboard

Create `src/pages/portal/advisor/CNADashboard.tsx`:

- Stats row: Total CNAs, Completed This Month, Pending Follow-ups, Average Net Worth
- Search bar with status filter (All, Draft, Completed, Reviewed, Archived)
- Card-based list of CNAs showing client name, date, status badge, net worth, retirement score
- Click to view completed CNA (read-only mode of the form)
- "New Analysis" button linking to the form
- Mobile-optimized with card layout

## Phase 5: Navigation and Routing

### Add routes in `src/App.tsx`:
- `/portal/advisor/cna` -- CNA Dashboard
- `/portal/advisor/cna/new` -- New CNA Form  
- `/portal/advisor/cna/:id` -- View/Edit existing CNA

### Add nav item in `src/components/portal/PortalLayout.tsx`:
- Add "CNA" entry under the "Portal" nav group with `FileText` or `ClipboardList` icon
- Link to `/portal/advisor/cna`

### Add Quick Action on Advisor Dashboard:
- Add "Client Analysis" quick action card linking to `/portal/advisor/cna`

## Phase 6: Signature Pad Component

Create `src/components/portal/SignaturePad.tsx`:
- Pure canvas-based implementation (no external library)
- Supports mouse and touch events
- Returns base64 PNG string via onChange callback
- Clear button to reset
- Responsive width (fills container)

## Files to Create
- `supabase/functions/financial-analysis/index.ts` -- AI analysis edge function
- `src/pages/portal/advisor/CNAForm.tsx` -- 8-step wizard form (~800 lines)
- `src/pages/portal/advisor/CNADashboard.tsx` -- Management dashboard (~300 lines)
- `src/components/portal/SignaturePad.tsx` -- Canvas signature component (~100 lines)

## Files to Edit
- `src/App.tsx` -- Add 3 new routes and import statements
- `src/components/portal/PortalLayout.tsx` -- Add CNA nav item
- `src/pages/portal/advisor/AdvisorDashboard.tsx` -- Add CNA quick action
- `supabase/config.toml` -- Add financial-analysis function config

## Technical Notes

- The AI analysis uses Lovable AI gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) with `LOVABLE_API_KEY`, not direct OpenAI. This avoids requiring any additional API keys.
- PDF export is excluded from this initial build since `@react-pdf/renderer` is not installed. It can be added as a follow-up.
- The signature pad uses native Canvas API to avoid adding a dependency.
- All currency inputs use a reusable pattern: `type="number"` with step="0.01" and formatting display.
- Calculated fields (totals, net worth, ratios) are computed client-side in real-time via `useMemo` and also stored in the database on save.
- Version history works via the `previous_version_id` self-reference -- creating a new version inserts a new row pointing to the old one.
- Follow-up tasks stored as JSONB array: `[{task: string, dueDate: string, completed: boolean}]`.
