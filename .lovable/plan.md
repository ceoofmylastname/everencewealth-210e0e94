

# Redesign Clients Page: Admin View with Advisor Assignment

## What Changes

The Clients page will be upgraded so admins can see **all clients grouped by their assigned advisor/agent**, with a modern, professional design. Advisors will continue to see only their own clients.

## Design

### Admin View
- **Summary stats bar** at the top showing total clients, total advisors, and active policies count
- **Advisor filter tabs/dropdown** to filter by a specific advisor or view all
- Each client card displays a small **advisor badge** showing which advisor manages them (e.g., "Advisor: John Mel")
- Search also filters by advisor name
- Clean table/list toggle option for when there are many clients

### Client Cards (Redesigned)
- Larger, more polished cards with subtle hover animations
- Avatar initials with a gradient background
- Advisor name displayed as a colored pill/tag below the client name
- Contact info (email, phone) with copy-to-clipboard icons
- Quick-action buttons for Policies, Documents, and Messages
- "Last active" or "Joined" date shown subtly

### Advisor View (unchanged behavior)
- Advisors still see only their own clients
- No advisor badge shown (redundant for them)

## Technical Details

### File: `src/pages/portal/advisor/AdvisorClients.tsx`

1. **Fetch advisor names** alongside clients:
   - After loading clients, extract unique `advisor_id` values
   - Fetch those advisor records from `portal_users` to get their names
   - Build a lookup map: `advisorId -> advisorName`

2. **Add advisor filter** (admin only):
   - State for `selectedAdvisor` (default: "all")
   - Dropdown populated from the advisor lookup map
   - Filter `filtered` array by selected advisor

3. **Stats bar** (admin only):
   - Count unique advisors from the clients list
   - Display total clients and advisor count

4. **Redesigned card layout**:
   - Modern card with proper spacing, subtle border, smooth shadow on hover
   - Advisor pill badge (only shown for admin users)
   - Better typography hierarchy
   - Action buttons styled with brand green accents

### No database or RLS changes needed
The admin RLS policy already allows full SELECT on `portal_users`.

## Files Changed

- `src/pages/portal/advisor/AdvisorClients.tsx` -- complete redesign with advisor info, filtering, and modern UI

