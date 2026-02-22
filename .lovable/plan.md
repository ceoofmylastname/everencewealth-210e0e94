

# Post-Agreement Confirmation Page

## Overview
After an agent signs the Agent Agreement, instead of immediately reloading to the Step 2 checklist, show a branded confirmation page acknowledging receipt of the agreement and introducing the next phase (carrier contracting via SureLC).

## What Changes

### Modified: `AgentWelcome.tsx`
Add a third state (`showConfirmation`) that displays after the agent successfully signs. The flow becomes:

1. Welcome page (Step 1 intro) -- current behavior, unchanged
2. Agreement form (sign and submit) -- current behavior, unchanged
3. **NEW: Confirmation page** -- shown after signing, before proceeding to Step 2

The confirmation page will contain:
- Branded header card (same style as welcome page)
- A letter-style body with:
  - "Dear {firstName}, I wanted to confirm that we have received your Agent Agreement. Thank you for submitting it promptly."
  - "{firstName}, you will now be able to get appointed with the Insurance Carriers -- Steps 2 of 2."
  - "Please, watch both SureLC videos to ensure you complete your onboarding process."
  - "Please let us know if you have any questions or need further assistance."
  - "Best regards, Contracting"
- A "Continue to Step 2" button that triggers `window.location.reload()` to load the AgentDashboard checklist

### Flow Change
- Currently: Sign agreement --> `window.location.reload()` --> AgentDashboard
- New: Sign agreement --> Confirmation page --> User clicks "Continue" --> `window.location.reload()` --> AgentDashboard

## Technical Details

| Item | Detail |
|---|---|
| File modified | `src/pages/portal/advisor/contracting/AgentWelcome.tsx` |
| Change type | Add `showConfirmation` state and confirmation UI |
| No new files | Confirmation is a view state within AgentWelcome |
| No DB changes | None required |

