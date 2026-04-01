

## Revert to Dropdown: Premium Searchable Select

### What changes
Replace the card grid in step 0 with a **searchable dropdown** — a single trigger button that opens an inline scrollable list. Now that the RLS fix ensures all agents load, the dropdown will work correctly.

### Design
- **Trigger button**: shows "Select your agent…" or the selected agent's name + gradient avatar. Styled as a rounded-2xl input-like element with a chevron icon.
- **Dropdown panel**: opens below the trigger (not a popup/overlay — just a `div` that conditionally renders). Contains:
  - Search input at top (sticky)
  - Scrollable list of agents (`max-h-[40vh] overflow-y-auto overscroll-contain` with `agent-picker-scroll`)
  - Each agent row: gradient initials avatar + name + check icon if selected
  - `min-h-[48px]` per row for touch targets
- Clicking an agent selects them and closes the dropdown
- Clicking outside closes the dropdown (click-away listener)
- Keep the selected confirmation bar below
- Keep Framer Motion for open/close animation (`AnimatePresence` + `motion.div`)

### Implementation
- **`src/pages/ResponseCard.tsx`** — rewrite step 0 case (~lines 321-424):
  - Add `const [agentDropdownOpen, setAgentDropdownOpen] = useState(false)`
  - Add a `useRef` + `useEffect` click-outside listener
  - Trigger button toggles `agentDropdownOpen`
  - Conditionally render the searchable list panel below
  - Remove the grid layout, keep avatar gradients and search logic

### File
- `src/pages/ResponseCard.tsx` — ~80 lines rewritten in case 0

