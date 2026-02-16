

# Phase 7.9: Enhanced Performance Tracking System

## Overview
Rebuild the Performance Tracker with expanded stats cards, a visual conversion funnel, a Dialog-based entry form (replacing inline form), CSV export, and an enhanced data table with ROI calculations.

## No Database Migration Needed
The `advisor_performance` table already has all required columns: `total_lead_cost`, `discount_percent`, `leads_purchased`, `leads_worked`, `dials_made`, `appointments_set`, `appointments_held`, `clients_closed`, `revenue`, `cost_per_lead`, `expected_issue_pay`, `expected_deferred_pay`.

## Changes

### Rebuild `src/pages/portal/advisor/PerformanceTracker.tsx`

**1. Header with Action Buttons:**
- Title and subtitle (Playfair Display heading)
- "Export CSV" button with Download icon
- "Add Entry" button that opens a Dialog (replaces inline toggle form)

**2. Stats Grid** (4 cards across):
- Total Revenue (with DollarSign icon, formatted as $XK)
- Clients Closed (with Users icon)
- Avg Close Rate (appointments_held to clients_closed percentage, with TrendingUp icon)
- Avg ROI (revenue vs total_lead_cost, color-coded green/red, with TrendingUp/TrendingDown icon)

**3. Conversion Funnel Card:**
- Visual funnel showing: Leads Worked -> Appointments Set -> Appointments Held -> Clients Closed
- Each step shows count and percentage of the initial leads worked
- Horizontal progress bars (using inline styles) to visualize drop-off at each stage

**4. Dialog-based Add Entry Form:**
- Uses the existing Dialog component instead of inline Card toggle
- Two-column grid layout with fields: Date, Lead Type, Leads Purchased, Leads Worked, Dials Made, Appointments Set, Appointments Held, Clients Closed, Revenue, Cost Per Lead, Discount Percent, Notes
- Calculates `total_lead_cost` on submit: `leads_purchased * cost_per_lead * (1 - discount_percent / 100)`
- Resets form and reloads data on success

**5. Recent Activity Table:**
- Uses the shadcn Table components (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
- Columns: Date, Lead Type, Leads, Worked, Dials, Appts Set, Appts Held, Closed, Revenue, ROI
- ROI column color-coded green/red
- Shows first 10 entries (data already ordered descending by date)

**6. CSV Export Function:**
- Generates CSV with headers: Date, Lead Type, Leads Purchased, Leads Worked, Dials Made, Appointments Set, Appointments Held, Clients Closed, Revenue, Lead Cost, ROI
- Creates downloadable blob with date-stamped filename

## Technical Details

- **State changes**: Replace `showForm` boolean with `showAddDialog` boolean for Dialog open state; rename `form` to `newEntry`; add `stats` object for calculated metrics
- **Stats calculation**: Dedicated `calculateStats` function computing totals and rates from entries array, called after data load
- **New imports**: Add `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger` from dialog component; add `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` from table component; add `DollarSign`, `Users`, `Phone`, `Calendar`, `Download`, `TrendingDown` from lucide-react
- **Auth pattern**: Continues using `usePortalAuth` and `portal_user_id` lookup for advisor record
- **Form submission**: Computes `total_lead_cost` before insert, includes `discount_percent` field
- **No changes** to database schema or RLS policies

