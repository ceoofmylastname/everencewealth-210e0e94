

## Fix: Add Visible Scrollbar Inside Agent Popup

### Problem
The agent bottom-sheet popup scrolls, but the scrollbar thumb is not visible inside it on mobile. The global webkit scrollbar styles are thin (6px) and may not render visibly on iOS Safari. The user needs a clear, always-visible scrollbar **inside** the popup to indicate more agents are available.

### Fix
In `src/pages/ResponseCard.tsx`, add a CSS class to the scrollable agent list container that forces a visible scrollbar:

1. In `src/index.css`, add a new utility class `.agent-picker-scroll` that:
   - Sets `scrollbar-width: thin` (Firefox)
   - Uses `::-webkit-scrollbar` with `width: 8px`, visible track (`bg-gray-100`), and visible thumb (`bg-[#1A4D3E]/30` with border-radius)
   - Forces the scrollbar to always display via `overflow-y: scroll` (not auto)

2. In `src/pages/ResponseCard.tsx`, add the `agent-picker-scroll` class to the scrollable div (line ~312) alongside the existing `overflow-y-scroll` class.

### Files
- `src/index.css` — add `.agent-picker-scroll` scrollbar styles (~8 lines)
- `src/pages/ResponseCard.tsx` — add class name to scroll container (1 word change)

