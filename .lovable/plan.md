

# Seamless "Continue to Step 2" Transition

## Problem
The "Continue to Step 2" button currently triggers a full `window.location.reload()`, which causes a jarring flash. The user wants a smooth, modern transition directly to the SureLC Setup page.

## Solution

### Modified: `AgentWelcome.tsx`
Instead of reloading the page, the "Continue to Step 2" button will call an `onContinue` callback prop that tells the parent (`ContractingDashboard`) to switch the view.

- Remove `window.location.reload()` from the button
- Add an `onContinue` prop to `AgentWelcomeProps`
- When clicked, call `onContinue()` which the parent uses to switch to the SureLC view

### Modified: `ContractingDashboard.tsx`
Add local state management so the parent can switch between `AgentWelcome` and `SureLCSetup` without a full reload.

- Add a `forceStage` state variable (e.g., `useState<string | null>(null)`)
- When rendering the agent view, use `forceStage || contractingAgent.pipeline_stage` to determine which component to show
- Pass `onContinue={() => setForceStage("surelc_setup")}` to `AgentWelcome`
- This creates an instant, seamless transition from the confirmation page to the SureLC Setup page with no reload

## Visual Polish (SureLCSetup already looks modern)
The SureLCSetup component already has the branded gradient header, tracked action cards, and drag-and-drop upload -- no changes needed there.

## Technical Details

| Item | Detail |
|---|---|
| Files modified | `AgentWelcome.tsx`, `ContractingDashboard.tsx` |
| New files | None |
| DB changes | None |
| Behavior | Instant view switch instead of page reload |

