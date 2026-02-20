

# Performance Tracker Upgrade: Sales Submissions, Financial Tracking, Goals, and Global Leaderboard

## Summary
Transform the advisor Performance Tracker into a comprehensive financial command center with policy sale submissions, income/goal tracking, and a real-time global leaderboard visible to all advisors.

---

## 1. New Database Table: `advisor_sales`

Stores each closed policy submission. Fields:
- `id`, `advisor_id` (FK to advisors)
- `carrier` (text) -- e.g. "Nationwide", "Athene"
- `product_type` (text) -- e.g. "IUL", "Annuity"
- `premium_mode` (text) -- "monthly" or "annual"
- `monthly_premium` (numeric) -- if monthly mode
- `annual_premium` (numeric) -- computed or entered (monthly x 12 or direct annual)
- `client_name` (text, optional)
- `notes` (text, optional)
- `submitted_at` (timestamptz, default now())
- `created_at` (timestamptz)

RLS:
- Advisors can INSERT and SELECT their own rows
- ALL advisors can SELECT all rows (needed for leaderboard -- only first_name + last_initial exposed in UI)
- Enable realtime on this table for live leaderboard updates

## 2. New Database Table: `advisor_goals`

Stores income goals per advisor. Fields:
- `id`, `advisor_id`
- `title` (text) -- e.g. "Q1 Income Target"
- `target_amount` (numeric)
- `target_date` (date, optional)
- `created_at`

RLS: Advisors manage their own goals only.

## 3. Updated Performance Tracker Page

Restructure `PerformanceTracker.tsx` with tabs:

**Tab 1: Sales Dashboard**
- Summary cards: Weekly income, Monthly income, YTD income (computed from `advisor_sales` using calendar boundaries: week = Sun-Sun, month = calendar month, year = calendar year)
- "Log a Sale" form: carrier, product type, monthly/annual toggle, premium amount (auto-calculates annual if monthly selected)
- Recent sales list below

**Tab 2: Goals**
- Create goal form (title, target amount, optional target date)
- Goal progress cards showing current YTD sales vs target with progress bar

**Tab 3: Activity Log**
- Keep existing performance entries table (leads worked, dials, appointments, etc.)

## 4. Global Leaderboard

Add a new section/tab or a dedicated card within the Performance page:

- Tabs: "This Week" | "This Month" | "Year to Date"
- Ranked list of all advisors by total annual premium submitted in the selected period
- Display format: "First Name + Last Initial" (e.g. "John D.")
- Columns: Rank, Name, Total Premium, Number of Policies
- Real-time updates via Supabase realtime subscription on `advisor_sales`
- Calendar week = Sunday to Sunday, month = calendar month, year = calendar year
- New submissions automatically add to existing totals (cumulative)

## 5. Realtime Updates

- Enable realtime on `advisor_sales` table
- Subscribe in the leaderboard component so all agents see new submissions instantly
- Toast notification when a new sale appears on the leaderboard

---

## Technical Details

**Calendar boundary SQL logic:**
```sql
-- Week (Sunday to Sunday)
date_trunc('week', submitted_at + interval '1 day') - interval '1 day'

-- In JS: get current Sunday start
const now = new Date();
const weekStart = new Date(now);
weekStart.setDate(now.getDate() - now.getDay()); // Sunday
weekStart.setHours(0,0,0,0);
```

**Leaderboard query pattern:**
```typescript
const { data } = await supabase
  .from("advisor_sales")
  .select("advisor_id, annual_premium, advisors!inner(first_name, last_name)")
  .gte("submitted_at", weekStart.toISOString());
// Group and sum client-side, display as "FirstName L."
```

**RLS for leaderboard (all advisors can read all sales):**
```sql
CREATE POLICY "All advisors can view sales for leaderboard"
ON advisor_sales FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM advisors WHERE auth_user_id = auth.uid()
  )
);
```

**Files to create/modify:**
- Database migration: create `advisor_sales` and `advisor_goals` tables with RLS + realtime
- `src/pages/portal/advisor/PerformanceTracker.tsx` -- restructure with tabs, add sales form, goals, and leaderboard

