

# Unlicensed Agent Route: ExamFX Onboarding Page

## Overview

Agents who selected "No" for licensed on the intake form will see a different onboarding experience focused on getting their license through ExamFX, instead of the standard Agent Agreement flow.

## Routing Logic Change

In `ContractingDashboard.tsx`, the main router (line 1092+) will check `is_licensed` on the `contracting_agents` record before deciding which flow to show:

- **Licensed agents** (`is_licensed = true` or `null`): Current flow (AgentWelcome -> SureLCSetup -> Dashboard)
- **Unlicensed agents** (`is_licensed = false`): New flow starting with ExamFX page

## New Component: ExamFXWelcome

A branded page matching the existing AgentWelcome style (same BRAND green header, white card body, gold accent step indicators) that displays:

- Header card: "Hello {firstName}, Welcome to Everence Wealth!"
- Branded letter body with 6 clearly formatted steps:
  1. Create an ExamFX Account (with link to examfx.com)
  2. Access the Course
  3. Register for the Live Class
  4. Complete the Course and Practice Exams
  5. Schedule the State Exam
  6. Take and Pass the Licensing Exam
- Each step has sub-bullets matching the provided data
- Promo code / email callout styled with the gold accent border
- Footer with "Best regards, Everence Wealth" and copyright

## Technical Details

### Files

1. **New file: `src/pages/portal/advisor/contracting/ExamFXWelcome.tsx`**
   - Props: `firstName`, `agentId`
   - Branded layout matching AgentWelcome (same BRAND/ACCENT colors, card structure)
   - 6 collapsible or scrollable step sections with sub-items
   - Link to examfx.com opens in new tab

2. **Modified: `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`**
   - Import `ExamFXWelcome`
   - In the main router, before the current licensed flow, check `contractingAgent.is_licensed === false`
   - If false and in early stages, render `ExamFXWelcome` instead of `AgentWelcome`

3. **Modified: `src/hooks/useContractingAuth.ts`**
   - Add `is_licensed` to the `ContractingAgent` interface and the select query so it's available in the dashboard router

### Routing Flow

```text
Agent Login
    |
    v
is_licensed === false?
    |           |
   YES/null     NO
    |           |
    v           v
AgentWelcome   ExamFXWelcome (new)
    |           |
    v           v
SureLCSetup    (future pages TBD)
    |
    v
Dashboard
```

### No database changes needed
The `is_licensed` boolean column already exists on `contracting_agents`.

