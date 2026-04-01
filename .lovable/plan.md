

## Replace Agent List with Dropdown Select

### What changes
Replace the current scrollable card list of agents (step 0) with a proper dropdown select on both mobile and desktop. The data source stays the same — it already queries `advisors` where `is_active = true`, so when agents are added/deleted via contracting (which syncs to `advisors` via the existing `sync_contracting_agent_to_advisor` trigger), the dropdown automatically reflects current agents.

### File modified
`src/pages/ResponseCard.tsx` — Step 0 (case 0) only

### Current behavior
- All agents displayed as a scrollable list of cards (~lines 270-301)
- On mobile with many agents, this takes up the whole screen

### New behavior
- Replace the card list with a styled `<select>` dropdown (native HTML select for best mobile UX)
- Styled to match the existing form design (rounded-xl, gray-50 bg, border-gray-200, gold focus ring)
- Shows "Select your agent..." as placeholder
- Options show "First Last" for each active advisor
- Selected agent displays a confirmation badge below the dropdown showing the selected name with initials avatar
- Same validation — must select an agent before continuing

### Why native select
Native `<select>` gives the best mobile experience (95% mobile users) — iOS/Android show their native picker wheels, which are much easier to use than custom dropdowns on touch devices.

### Auto-sync confirmation
The dropdown already queries `advisors` where `is_active = true` on page load. The existing `sync_contracting_agent_to_advisor` database trigger automatically creates advisor records when contracting agents are added. When agents are deactivated/deleted from the admin dashboard, their `is_active` flag is set to false, removing them from this query. No additional work needed for auto-sync.

