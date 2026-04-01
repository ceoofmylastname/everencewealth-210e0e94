

## Fix Mobile Agent Dropdown — Replace Native Select with Custom Scrollable List

### Problem
The native `<select>` element on mobile browsers (especially iOS) can clip or limit the visible options, making it hard to scroll through all agents. Users report only seeing ~7 names even when more exist.

### Solution
Replace the native `<select>` with a custom in-page expandable dropdown using the HTML `<details>/<summary>` pattern. This renders all options directly in the page with a scrollable container, bypassing mobile browser limitations entirely.

### File modified
`src/pages/ResponseCard.tsx` — Step 0 (case 0, lines 274-286)

### Implementation
Replace the `<select>` block with:
- A `<details>` element styled as a dropdown trigger
- `<summary>` shows "Select your agent..." or the selected name
- Expanding reveals a `max-h-72 overflow-y-auto` scrollable list of all advisors as `<button>` elements
- Tapping an advisor selects them and closes the dropdown (programmatic `removeAttribute('open')`)
- Each button has `min-h-[48px]` for mobile touch targets
- Smooth iOS scrolling via `-webkit-overflow-scrolling: touch`
- Supports any number of agents (10, 50, 100+)

The selected-agent confirmation badge and validation below remain unchanged.

