
# Fix: Show "Approved" After Clicking Approve

## Problem
After an admin or manager clicks "Approve," the button either stays as "Approve" or changes to a dash ("—"). It should clearly show "Approved" with a green checkmark so the user gets visual confirmation.

## Solution
In both the Dashboard and Agents pages, replace the dash ("—") shown after approval with an "Approved" label (green text + checkmark icon). This applies to:

1. **ContractingDashboard.tsx** — In the Actions column, when `portal_is_active` is `true` and there's no next step to complete, show "Approved" with a green CheckCircle icon instead of "—".

2. **ContractingAgents.tsx** — In the Action column, when `portal_is_active` is `true`, show "Approved" with a green CheckCircle icon instead of "—".

## Technical Details

| File | Change |
|---|---|
| `src/pages/portal/advisor/contracting/ContractingDashboard.tsx` (around line 972-981) | When `portal_is_active === true` and there is no actionable next step, render a green "Approved" badge with CheckCircle icon instead of the current dash |
| `src/pages/portal/advisor/contracting/ContractingAgents.tsx` (lines 273-274) | Replace `<span className="text-xs text-muted-foreground">—</span>` with a green "Approved" label with CheckCircle icon |

The approved state markup will look like:
```tsx
<span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
  <CheckCircle className="h-3.5 w-3.5" /> Approved
</span>
```

Both files already import `CheckCircle` from lucide-react, so no new dependencies are needed.
