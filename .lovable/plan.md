

# Contracting Analytics Dashboard

## Overview
Create a new analytics page at `/portal/advisor/contracting/analytics` that provides visual insights into the onboarding pipeline. Accessible only to admin/contracting/manager roles.

## Metrics and Visualizations

### 1. KPI Summary Cards (top row)
- **Average Onboarding Time** -- mean days from `created_at` to `completed_at` for completed agents
- **Completion Rate** -- percentage of agents who reached "completed" stage vs total
- **Active Reminders** -- count of `contracting_reminders` where `is_active = true`
- **Total Activity Logs** -- count of `contracting_activity_logs` entries (last 30 days)

### 2. Drop-Off Funnel (horizontal bar chart)
Query `contracting_agents` grouped by `pipeline_stage`, ordered by pipeline sequence. Shows how many agents are currently at each stage, making it immediately clear where drop-off occurs. Uses Recharts `BarChart` horizontal layout.

### 3. Average Time Per Stage (bar chart)
For completed agents, calculate time spent in each stage by looking at `contracting_agent_steps` completion timestamps and the stage sequence. Displays average days per stage using a vertical `BarChart`.

### 4. Reminder Distribution (pie chart)
Query `contracting_reminders` grouped by `phase` (daily / every_3_days / weekly) to show how many active reminders are in each escalation phase. Uses Recharts `PieChart`.

### 5. Activity Frequency (area chart)
Query `contracting_activity_logs` for the last 30 days, group by day, chart the volume of actions over time. Uses Recharts `AreaChart`.

### 6. Top Drop-Off Steps (table)
Query `contracting_agent_steps` where `status != 'completed'` joined with `contracting_steps` to show which specific steps agents are stuck on most frequently.

## Technical Details

### New Files
| File | Purpose |
|---|---|
| `src/hooks/useContractingAnalytics.ts` | React Query hook that fetches all data from the four tables and computes metrics client-side |
| `src/pages/portal/advisor/contracting/ContractingAnalytics.tsx` | Full page component with charts and cards |

### Route Addition
In `src/App.tsx`, add:
```
contracting/analytics -> ContractingAnalytics
```

### Data Fetching Strategy
A single `useQuery` hook makes parallel queries to:
- `contracting_agents` (all rows, select relevant columns)
- `contracting_agent_steps` with joined `contracting_steps`
- `contracting_activity_logs` (last 30 days)
- `contracting_reminders` (active only)

All aggregation is done client-side to avoid needing new database functions.

### Chart Library
Uses the existing `recharts` dependency (already installed) with direct imports (`BarChart`, `PieChart`, `AreaChart`, `ResponsiveContainer`) -- matching the pattern used in calculator pages.

### Access Control
Uses the existing `useContractingAuth` hook. Only renders for users where `canManage === true`.

### Navigation
Add an "Analytics" link/button to the existing contracting navigation (in `ContractingDashboard.tsx` manager/admin view header area).
