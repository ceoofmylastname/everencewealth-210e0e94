

## Remove Dropdown — Show All Agents as Inline Scrollable List

### What changes
Replace the dropdown button + bottom-sheet popup with a simple scrollable list of agent cards always visible on step 0. No toggle, no overlay — all agents are shown immediately and the user taps to select.

### Implementation

**`src/pages/ResponseCard.tsx`** (step 0, lines ~271-347):

1. Remove the `agentOpen` toggle button (lines 277-291)
2. Remove the entire fixed-position bottom-sheet overlay (lines 293-347)
3. Replace with an inline scrollable container:
   - `max-h-[50vh] overflow-y-auto` with the `agent-picker-scroll` class for visible scrollbar
   - `touch-action: pan-y`, `-webkit-overflow-scrolling: touch`
   - Each agent rendered as a tappable card/button with `min-h-[48px]`
   - Selected agent highlighted with gold accent (`bg-[#C8A96E]/10`, `border-[#C8A96E]`)
   - Rounded corners, slight border, clean spacing
4. Keep the selected-agent confirmation badge below the list (lines 348-364) unchanged

### Result
All agents are visible immediately — user scrolls the in-page list and taps to select. No popup, no overlay, no iOS scroll issues.

### Files
- `src/pages/ResponseCard.tsx` — rewrite step 0 agent section (~30 lines replaced)

