

# Enhanced Agent Dashboard with Chat Panel

## Current State
The `AgentDashboard` component in `ContractingDashboard.tsx` already implements 6 of 7 requested features:
- Welcome header with name and avatar
- Current stage badge
- Progress bar with step count
- Current stage checklist (read-only -- agents cannot edit)
- Upcoming stages collapsed/expandable
- Personal info card
- Recent activity feed

**Missing: Chat panel embedded in the dashboard.**

## Changes

### 1. Add Inline Chat Panel to AgentDashboard
Embed a compact messaging panel directly into the agent's personal dashboard (below the activity feed / personal info grid). This reuses the existing `contracting_messages` table and realtime subscription pattern from `ContractingMessages.tsx`.

The chat panel will:
- Show messages for the agent's thread (thread_id = agent's contracting_agents.id)
- Allow the agent to send messages to their manager/admin
- Auto-scroll to latest message
- Subscribe to realtime inserts for instant updates
- Use the same BRAND styling as the rest of the dashboard

### 2. Layout
The dashboard layout becomes:
1. Welcome header (name, avatar, stage badge, status badge)
2. Progress bar card
3. Current stage checklist (read-only icons, no toggles)
4. Upcoming stages (collapsed, expandable)
5. Two-column grid: Personal Info | Recent Activity
6. **Chat Panel (full-width card below the grid)**

### Technical Details

**File modified:** `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`

- Add chat state variables to `AgentDashboard`: messages array, newMessage input, sending flag, bottomRef
- Add `useEffect` to fetch messages from `contracting_messages` where `thread_id = agentId`
- Add realtime subscription on `contracting_messages` filtered by `thread_id`
- Add send handler that inserts into `contracting_messages` with `thread_id = agentId` and `sender_id = agentId`
- Render a chat card with scrollable message list, input field, and send button
- Messages from the agent appear on the right (branded background), messages from others on the left (gray background) with sender name
- Resolve sender names by querying `contracting_agents` for IDs found in messages

No database changes needed -- the `contracting_messages` table and realtime publication already exist.

