

# Lock Portal Access Until Contracting Is Complete

## What This Does

Agents who haven't finished the licensed contracting path (specifically, haven't uploaded their SureLC screenshot) will be blocked from accessing any portal tabs outside of the Contracting section. They'll still **see** all the nav items in the sidebar, but locked items will appear grayed out with a lock icon, and clicking them will show a toast message saying they need to complete contracting first.

Once the agent's SureLC step is marked as completed, the full dashboard unlocks automatically.

## How It Works

### 1. New Hook: `useContractingGate`

A lightweight hook (`src/hooks/useContractingGate.ts`) that checks whether the current user is a contracting agent with incomplete onboarding:

- Queries `contracting_agents` for the logged-in user
- If found with `contracting_role = 'agent'` and `pipeline_stage` is still in an early stage (before `bundle_selected`), checks `contracting_agent_steps` for the SureLC step (`1e83a6c7-...`) completion status
- Returns `{ isGated: boolean, loading: boolean }` -- `isGated = true` means lock non-contracting tabs
- Managers, admins, and contracting staff are never gated
- Agents with no `contracting_agents` row are not gated (they're regular advisors)

### 2. Update `PortalLayout.tsx`

- Import and call `useContractingGate`
- Pass `isGated` to the `NavItem` component
- For non-contracting nav groups when `isGated = true`:
  - Render items with reduced opacity (40%) and a small lock icon
  - Replace the `Link` with a `div` that shows a toast: "Complete your contracting onboarding to unlock this section"
  - Contracting nav group items remain fully clickable
- Add a small banner at the top of the sidebar (below the brand) when gated: "Complete contracting to unlock all features"

### 3. Route-Level Guard

- In `PortalLayout`, if `isGated` is true and the current route is NOT under `/portal/advisor/contracting`, automatically redirect to `/portal/advisor/contracting`
- This prevents direct URL navigation to locked sections

## Visual Behavior

```text
Sidebar when GATED:
+---------------------------+
| Everence Wealth           |
|---------------------------|
| [!] Complete contracting  |
|     to unlock all tools   |
|---------------------------|
| PORTAL                    |
|   Dashboard        [lock] |  <- grayed, locked
|   Clients          [lock] |  <- grayed, locked
|   ...              [lock] |  <- grayed, locked
|---------------------------|
| CONTRACTING               |
|   Dashboard        [>]    |  <- active, clickable
|   Pipeline         [>]    |  <- clickable
|   Agents           [>]    |  <- clickable
|   Messages         [>]    |  <- clickable
|   ...                     |
|---------------------------|
| COMPLIANCE                |
|   Compliance       [lock] |  <- grayed, locked
|   ...              [lock] |  <- grayed, locked
+---------------------------+
```

## Technical Details

### Files to Create
- `src/hooks/useContractingGate.ts` -- hook that returns `isGated` by checking SureLC step completion

### Files to Modify
- `src/components/portal/PortalLayout.tsx` -- add gating logic to NavItem, add redirect guard, add banner

### No Database Changes Needed
The `contracting_agent_steps` table already tracks SureLC step completion with step ID `1e83a6c7-2d4f-4d09-b04f-4ee86fc47ac5`. We just need to read it.

### Gate Logic (in `useContractingGate`)
```text
1. No contracting_agents row? -> not gated (regular advisor)
2. Role is manager/admin/contracting? -> not gated
3. is_licensed === false? -> gated (unlicensed, on ExamFX path)
4. pipeline_stage past surelc_setup (bundle_selected or later)? -> not gated
5. SureLC step completed in contracting_agent_steps? -> not gated
6. Otherwise -> gated
```
