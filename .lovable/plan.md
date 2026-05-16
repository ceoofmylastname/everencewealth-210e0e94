## Goal
Relocate the existing **Tax History** page out of the Resources sidebar group and surface it as an entry inside the Tools hub at `/portal/advisor/tools`, with a clearer label.

## Current state
- Page file: `src/pages/portal/advisor/resources/TaxHistory.tsx`
- Route: `/portal/advisor/resources/tax-history` (in `src/App.tsx`)
- Sidebar link: under the "Resources" group in `src/components/portal/PortalLayout.tsx` (line 55)

## Changes

1. **Sidebar (`PortalLayout.tsx`)**
   - Remove the `Tax History` item from the Resources group. No new sidebar entry — it will live inside the Tools hub instead.

2. **Route (`src/App.tsx`)**
   - Move the route to `/portal/advisor/tools/tax-history` (keep the existing component import; just rename the path). Leave the file in place to avoid churn, or optionally move it to `pages/portal/advisor/tools/TaxHistory.tsx` in a follow-up.

3. **Tools Hub (`src/pages/portal/advisor/ToolsHub.tsx`)**
   - Add a new card titled **"US Tax History (1913–Today)"** with subtitle "See how top marginal tax rates have shifted over the last century."
   - Place it in the existing **Tax Planning** category (alongside Tax Bucket Optimizer / Estate Tax) so it shows under the "All" and "Tax Planning" tabs.
   - Card click navigates to `/portal/advisor/tools/tax-history` (full page, same as today — no modal rework).
   - Use an appropriate icon (e.g. `History` or `TrendingUp` from lucide-react) and the same card styling as neighboring tool cards.

## Label decision
Proposed display label: **"US Tax History (1913–Today)"**. If you prefer something shorter like "Tax Rate History" or "Historical Tax Rates", say the word and I'll use that instead.

## Out of scope
- No changes to the Tax History page contents itself.
- No data/model changes.
