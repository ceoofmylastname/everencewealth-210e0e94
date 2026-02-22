

# Welcome Page for New Agents

## Overview
When a newly approved agent logs in and lands on the Contracting tab, they currently see the generic onboarding checklist immediately. Instead, they should first see a branded welcome page with instructions, and a button to review/sign the Agent Agreement before proceeding.

## What Changes

### 1. New Component: `AgentWelcome`
Create a new welcome component inside `ContractingDashboard.tsx` (or as a separate file) that displays:

- **Welcome header**: "Hello {firstName}, Welcome to Everence Wealth!"
- **Welcome body**: The full welcome letter text (mission statement, IMO description, etc.)
- **Step indicator**: "Next Steps to Getting Started: 1 of 2"
- **Call-to-action**: "Please review and sign the Agent Agreement" with a prominent button
- **Post-signing note**: Explains that Step 2 of 2 (carrier contracting) follows after signing
- **Footer**: "Everence Wealth - 1 - Copyright (c) {currentYear} Everence Wealth, All rights reserved."

### 2. Routing Logic Update
In `ContractingDashboard.tsx` (the main router at line 1056-1086), add a condition:

- If `contractingRole === "agent"` AND `pipeline_stage` is `"intake_submitted"` or `"agreement_pending"`, show the `AgentWelcome` page instead of the regular `AgentDashboard`
- The welcome page has a "Review Agent Agreement" button that will open the agreement (placeholder for now until you provide the agreement content)
- Once the agreement step is marked complete, the agent progresses to the next stage and sees the regular checklist

### 3. Agent Agreement Button
The button on the welcome page will be wired up to open the Agent Agreement. For now it will be a placeholder dialog/modal saying "Agent Agreement - Content Coming Soon" until you provide the actual agreement document. Once you share the agreement, it will be replaced with the real form including signature fields and required info fields.

## Design
- Clean, branded layout matching the existing Everence Wealth portal style (white cards, green brand color #1A4D3E, gold accent #C9A84C)
- Professional letter format with proper spacing
- Prominent green CTA button for the agreement
- Step progress indicator (1 of 2 / 2 of 2)

## Technical Details

| Item | Detail |
|---|---|
| File modified | `src/pages/portal/advisor/contracting/ContractingDashboard.tsx` |
| New component | `AgentWelcome` function component added above `AgentDashboard` |
| Logic change | Main router checks `pipeline_stage` to show welcome vs checklist |
| Agreement button | Placeholder for now, ready for real agreement content |
| No new dependencies | Uses existing UI components (Button, Dialog) |

