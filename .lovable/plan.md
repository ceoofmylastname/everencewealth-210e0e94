

# CRM-Style Agents Tab (Airtable Look & Feel)

## Overview
Rebuild the existing Contracting Agents page (`/portal/advisor/contracting/agents`) into a rich, Airtable-inspired CRM dashboard that tracks every applicant's name, contact info, manager, licensing status, and contracting progress -- including backfilling data for all current applicants.

## What You'll See

A polished, full-width table with:
- Search bar + filters (by status, stage, licensed/unlicensed)
- Colored row accents for stuck agents (7+ days inactive)
- Each row showing:
  - Agent name + avatar initials
  - Email and phone
  - State
  - Manager name (resolved from manager_id)
  - Licensed status (green/red badge)
  - Referral source
  - Pipeline stage (color-coded pill)
  - Progress bar with percentage
  - Days in pipeline
  - Last activity date
  - Status badge
  - Link to detailed agent view
- Summary stat cards at top (Total, Licensed, Unlicensed, Completed, Stuck)
- Real-time updates (using the subscriptions already enabled)

## Data Already Available

All needed fields already exist in `contracting_agents`:
- `first_name`, `last_name`, `email`, `phone`
- `state`, `is_licensed`
- `manager_id` (resolved to name via `portal_users`)
- `referral_source`, `referring_director`
- `pipeline_stage`, `progress_pct`, `status`
- `created_at`, `updated_at`

No database changes needed -- just a UI rebuild.

## Technical Details

### File Modified
`src/pages/portal/advisor/contracting/ContractingAgents.tsx` -- complete rewrite

### Key Changes

1. **Stat Cards Row**: Total Agents, Licensed, Unlicensed, Completed, Stuck (7+ days no update)

2. **Filters Bar**: 
   - Search by name/email/phone
   - Filter by status (All, In Progress, Completed, On Hold)
   - Filter by stage (All + 8 pipeline stages)
   - Filter by licensed (All, Licensed, Unlicensed)

3. **Airtable-Style Table Columns**:
   | Column | Source |
   |--------|--------|
   | Agent (initials + name) | first_name, last_name |
   | Email | email |
   | Phone | phone |
   | State | state |
   | Manager | manager_id -> portal_users lookup |
   | Licensed | is_licensed (green/red badge) |
   | Referral | referral_source |
   | Stage | pipeline_stage (color pill) |
   | Progress | progress_pct (bar + %) |
   | Status | status (badge) |
   | Days | differenceInDays from created_at |
   | Last Activity | from contracting_activity_logs |
   | Action | Link to agent detail page |

4. **Real-Time Updates**: Subscribe to `contracting_agents` changes so when agents complete steps, the table updates live.

5. **Airtable Styling**: 
   - Compact rows with hover highlight
   - Alternating subtle row backgrounds
   - Sticky header
   - Clean sans-serif typography
   - Colored badges and pills
   - Rounded card container with shadow

6. **Backfill**: All current applicants are already in the `contracting_agents` table, so this view automatically shows everyone. Bobby's fixed data (bundle_selected, 33%) will display correctly.

