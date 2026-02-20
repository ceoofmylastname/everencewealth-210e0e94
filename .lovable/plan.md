

# Performance Tracker -- Full Financial Command Center Upgrade

## What You Have Now
- Sales logging (carrier, product, premium)
- Income summary cards (Weekly, Monthly, YTD)
- Goals with progress bars
- Global Leaderboard with real-time updates
- Activity log with conversion funnel and CSV export

## What Is Missing (based on your reference screenshots)

### 1. Transactions System (Income and Expense Tracking)
- Add Transaction form: Type (Income/Expense), Amount, Date, Account, Category, Memo
- Recent Transactions list with search, filter (All/Income/Expense), and delete
- Color-coded badges: green "income" / red "expense"
- New database table: `advisor_transactions`

### 2. Financial Dashboard Cards
Currently you only show premium totals. The reference shows 9 summary cards:
- **Net Income (7d)** -- income minus expenses last 7 days
- **Net Income (MTD)** -- income minus expenses this month
- **Net Income (YTD)** -- income minus expenses this year
- **Income (7d)** -- income-only last 7 days
- **Income (MTD)** -- income-only this month
- **Expenses (MTD)** -- expenses-only this month
- **Net Worth** -- total assets minus total debts
- **Tax Set-Aside (YTD)** -- auto-calculated at 20% of YTD income
- **Total Debt** -- sum of all active debts

### 3. Debt Management
- Add Debt form: Debt Name, Current Balance, APR (%), Minimum Payment, Target Payoff Date
- Debt list with running totals
- Snowball vs Avalanche strategy toggle with explanation text
- Summary cards: Total Debt, Min Payments/Mo, Number of Debts
- New database table: `advisor_debts`

### 4. Accounts Management
- Add Account form: Account Name, Type (Checking/Savings/Investment/Other), Balance
- Account list with total balance
- New database table: `advisor_accounts`

### 5. Charts and Visualizations (using Recharts)
- **Weekly Net Income Trend** -- line chart showing net income by week (W1-W8)
- **Income vs Expenses (MTD)** -- bar chart comparing income and expenses
- **Commission Status** -- donut/pie chart showing premium by carrier

### 6. Commissions Tab
- Table of all sales grouped by carrier
- Donut chart of premium distribution by carrier
- Pending vs Paid status tracking (optional -- could add a `commission_status` column to `advisor_sales`)

### 7. Restructured Tab Layout
Current: Sales | Goals | Leaderboard | Activity

Proposed (matching the reference):
- **Dashboard** -- All summary cards, charts, goals progress, debt payoff strategy
- **Data Management** -- Sub-tabs: Transactions | Goals | Debts | Accounts
- **Commissions** -- Carrier breakdown, donut chart
- **Leaderboard** -- (keep as-is)
- **Activity** -- (keep as-is)

---

## Technical Details

### New Database Tables

**`advisor_transactions`**
- `id` (uuid), `advisor_id` (uuid FK), `type` (text: "income" or "expense"), `amount` (numeric), `category` (text), `account_name` (text), `memo` (text), `transaction_date` (date), `created_at` (timestamptz)
- RLS: advisors manage their own rows only

**`advisor_debts`**
- `id` (uuid), `advisor_id` (uuid FK), `name` (text), `current_balance` (numeric), `apr` (numeric), `minimum_payment` (numeric), `target_payoff_date` (date), `is_paid_off` (boolean default false), `created_at` (timestamptz)
- RLS: advisors manage their own rows only

**`advisor_accounts`**
- `id` (uuid), `advisor_id` (uuid FK), `account_name` (text), `account_type` (text), `balance` (numeric), `created_at` (timestamptz), `updated_at` (timestamptz)
- RLS: advisors manage their own rows only

All three tables will use the existing `get_advisor_id_for_auth()` function for RLS.

### Calculated Metrics (all computed client-side from fetched data)
- Net Income = SUM(income transactions) - SUM(expense transactions) for period
- Net Worth = SUM(account balances) - SUM(debt balances)
- Tax Set-Aside = 0.20 x YTD income
- Commission by Carrier = GROUP BY carrier from advisor_sales

### Charts (Recharts -- already installed)
- `LineChart` for Weekly Net Income Trend
- `BarChart` for Income vs Expenses
- `PieChart` (donut) for Commission Status by carrier

### Files to Create/Modify
- Database migration: 3 new tables with RLS
- `src/pages/portal/advisor/PerformanceTracker.tsx` -- full restructure with new tab layout, all new sections, charts, and forms

