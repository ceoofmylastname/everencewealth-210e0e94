

# Persist Agent Progress and Allow Viewing Signed Agreement

## Problem
Currently, the agent's progress through the onboarding steps is lost on page reload. If an agent has already signed the agreement, they should:
1. See the confirmation/next-step page (not the welcome page again)
2. Be able to view the agreement they signed

The pipeline stage auto-advances from `agreement_pending` to `surelc_setup` after signing (via the database trigger). When the agent returns, `ContractingDashboard` checks the stage -- if it's past `agreement_pending`, it shows `AgentDashboard` (the Step 2 checklist). So the routing already works correctly for returning agents.

The missing pieces are:
- **AgentWelcome** doesn't check for an existing signed agreement on load -- if the pipeline stage hasn't advanced yet (e.g., due to timing), the agent sees the welcome page again instead of the confirmation
- **AgentDashboard** has no way to view the signed agreement

## Changes

### 1. `AgentWelcome.tsx` -- Check for existing agreement on mount
- Add a `useEffect` that queries `contracting_agreements` for the current agent on load
- If an agreement with `agent_signed_at` exists, automatically show the confirmation page (`showConfirmation = true`) instead of the welcome page
- Add a "View My Agreement" button on the confirmation page that opens a read-only view of the signed agreement (shows signature, initials, date signed)

### 2. `AgentDashboard` (in `ContractingDashboard.tsx`) -- Add "View Agreement" capability
- In the AgentDashboard welcome header area, add a "View Signed Agreement" button
- When clicked, it opens a dialog/modal showing the agreement details: consultant name, effective date, signature image, initials image, and signed date -- all fetched from `contracting_agreements`

### 3. New Component: `ViewSignedAgreement.tsx`
- A reusable read-only component that displays the signed agreement
- Fetches the agreement from `contracting_agreements` by `agent_id`
- Shows the full agreement text (same sections as the form) with the agent's signature and initials rendered as images
- Used by both AgentWelcome (confirmation page) and AgentDashboard

## Flow After Changes

```text
Agent returns after signing:
  Pipeline = "surelc_setup" --> AgentDashboard (with "View Agreement" button)

Agent returns mid-signing (stage still agreement_pending):
  AgentWelcome loads --> checks DB --> agreement found --> shows confirmation page
  
Agent first visit (no agreement):
  AgentWelcome loads --> checks DB --> no agreement --> shows welcome + sign page
```

## Technical Details

| Item | Detail |
|---|---|
| Files modified | `AgentWelcome.tsx`, `ContractingDashboard.tsx` |
| Files created | `ViewSignedAgreement.tsx` |
| DB changes | None (uses existing `contracting_agreements` table) |
| RLS | Already allows agents to read their own agreements |

