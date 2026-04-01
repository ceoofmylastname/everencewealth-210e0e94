

## Fix Mobile Agent Dropdown — Replace `<details>` with State-Controlled Dropdown

### Problem
The `<details>/<summary>` HTML pattern has known scroll issues on iOS Safari — the inner scrollable container clips or fails to render all items. The data is there (all agents load), but the scroll container doesn't work reliably on real mobile devices.

### Solution
Replace the `<details>` element with a simple React state-controlled dropdown (`useState` boolean toggle). This gives full control over rendering and avoids browser-specific `<details>` quirks.

### File modified
`src/pages/ResponseCard.tsx` — Step 0 (case 0, lines 270-313)

### Changes
1. Add `const [agentOpen, setAgentOpen] = useState(false)` to the component state
2. Replace `<details>/<summary>` with:
   - A `<button>` trigger that toggles `agentOpen`
   - A conditionally rendered `<div>` (when `agentOpen` is true) positioned with `absolute z-50`, styled with `max-h-72 overflow-y-auto overscroll-contain` and `touch-action: pan-y` for reliable iOS scrolling
   - Each advisor as a `<button>` that sets the value and closes the dropdown
3. Keep the selected-agent confirmation badge and validation unchanged

### Why this fixes it
- `overscroll-contain` prevents scroll chaining on mobile
- `touch-action: pan-y` explicitly allows vertical touch scrolling
- No reliance on browser `<details>` implementation quirks
- Absolute positioning with `z-50` ensures the list overlays content cleanly

