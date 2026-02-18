
# Admin Portal Redesign — Match Agent Dashboard Style

## What's Changing

The admin portal (sidebar + all pages) is currently on a **dark green sidebar** (`bg-[#0F2922]`) with a mixed light/dark layout. The agent portal was just redesigned to a clean white professional theme. This plan brings the admin portal into exact parity.

## Current vs Target

| Element | Current Admin | Target (matching agent) |
|---|---|---|
| Sidebar bg | `bg-[#0F2922]` dark green | `bg-white border-r border-gray-200` |
| Sidebar active | `bg-white/10 text-white` | `bg-[#F0F5F3] text-[#1A4D3E]` + left green border |
| Sidebar inactive | `text-white/70` | `text-gray-500 hover:text-gray-900` |
| User footer | Dark glass style | White card with brand-green avatar |
| Page bg | `#F0F2F1` | `bg-gray-50` |
| Cards | Default shadcn `Card` | `bg-white rounded-xl border border-gray-100 shadow-sm` |
| Table headers | Default | `bg-gray-50 text-xs uppercase text-gray-500` |
| Table rows | Default | Clean rows with `border-b border-gray-100` separator |
| Inputs | Default | `border-gray-200 bg-white` with green focus ring |
| Buttons primary | Default primary | `bg-[#1A4D3E] text-white` |
| Status badges | `bg-green-100 text-green-800` (correct but needs cleanup) | `bg-emerald-50 text-emerald-700 border border-emerald-200` |
| Page headings | `text-[#1A4D3E]` inline style | `text-gray-900 font-bold` (clean) |
| Admin badge | Amber bg pill in sidebar | Gold pill matching brand |

## Files to Edit

### 1. `src/components/portal/AdminPortalLayout.tsx`

**Sidebar:**
- Change `bg-[#0F2922]` → `bg-white` with `border-r border-gray-200`
- Brand area: white bg, dark "Everence" text, gold "Wealth" label (matching PortalLayout exactly)
- `ADMIN` badge: style with `bg-[hsla(51,78%,65%,0.15)] text-[#8B6914] border border-[hsla(51,78%,65%,0.4)]` (gold tint, not amber)
- Nav items active: `bg-[#F0F5F3] text-[#1A4D3E]` + `borderLeft: 3px solid #1A4D3E` (identical to PortalLayout NavItem)
- Nav items inactive: `text-gray-500 hover:text-gray-900 hover:bg-gray-50`
- Active chevron: `text-[#1A4D3E]`
- User footer: white card (`bg-gray-50 border border-gray-100 rounded-xl`), brand-green avatar bg, dark name text, gray role text
- Sign out button: `text-gray-500 hover:text-red-600 hover:bg-red-50`

**Mobile header:**
- Change from dark border/bg to `bg-white border-b border-gray-200`

**Main content area:**
- Change from `#F0F2F1` to `bg-gray-50`

---

### 2. `src/pages/portal/admin/AdminAgents.tsx`

**Page header:**
- Remove inline `color: "#1A4D3E"` style from h1
- Use `text-2xl font-bold text-gray-900` + subtitle `text-sm text-gray-500`
- "Add New Agent" button: `bg-[#1A4D3E] hover:bg-[#143d30] text-white rounded-lg` with `Plus` icon

**Tabs:**
- `TabsList`: `bg-gray-100 p-1 rounded-lg`
- Active `TabsTrigger`: `bg-white text-[#1A4D3E] shadow-sm`
- Pending badge: brand-green bg pill

**Table card:**
- Replace `Card` with clean white `div` → `bg-white rounded-xl border border-gray-100 shadow-sm`
- Search input: `border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1A4D3E]`
- `Select` trigger: same border-gray-200 style
- `TableHeader` row: `bg-gray-50`
- `TableHead`: `text-xs font-semibold uppercase tracking-wide text-gray-500`
- `TableBody` rows: `border-b border-gray-100 hover:bg-gray-50/50`
- `TableCell` names: `font-medium text-gray-900`
- `TableCell` emails: `text-gray-500`
- Status badge Active: `bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs px-2.5 py-0.5`
- Status badge Inactive: `bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs px-2.5 py-0.5`
- View button: `text-[#1A4D3E] hover:bg-[#F0F5F3]` ghost with eye icon

**Pending Invitations tab:**
- Same table treatment
- "Set Password" button: `border-[#1A4D3E] text-[#1A4D3E] hover:bg-[#F0F5F3]` outline
- "Resend" button: ghost with gray text

---

### 3. `src/pages/portal/admin/AdminClients.tsx`

Same treatment as AdminAgents:
- Page heading: `text-gray-900 font-bold`
- Card → clean white div
- Search input: dark-style removed → clean white
- Table: `bg-gray-50` header, clean rows
- Status badges: emerald/gray pill system
- "Reassign" button: outline with brand-green border

---

### 4. `src/pages/portal/admin/AdminAgentDetail.tsx`

- Back button: `text-gray-500 hover:text-gray-900`
- Heading: `text-gray-900 font-bold` (remove inline color)
- Email: `text-gray-500`
- Status badge: emerald/gray pill
- Toggle button: `border-gray-200 text-gray-700 hover:border-[#1A4D3E] hover:text-[#1A4D3E]`
- 2 stat cards: clean white with brand-green number, gray label
- Edit form card: white, clean labels `text-gray-700`, inputs `border-gray-200`
- "Save Changes" button: `bg-[#1A4D3E] text-white`
- Assigned clients table: same clean treatment

---

### 5. `src/pages/portal/admin/AdminAgentNew.tsx`

- Back button: gray
- Form card: white, clean
- Labels: `text-gray-700`
- Inputs/selects: `border-gray-200`
- Checkbox label: `text-gray-700`
- "Cancel" button: outline gray
- "Create Agent" button: `bg-[#1A4D3E] text-white`

---

## No Logic or Data Changes

All Supabase queries, state management, navigation, and business logic remain 100% unchanged. Only className strings and inline styles are changed.

## Visual Consistency

After this change, the admin portal sidebar will look identical to the agent/advisor portal sidebar — same brand logo treatment, same nav item style, same user footer, same page background. The only difference will be the gold `ADMIN` badge on the logo and the 3 simplified nav items (Agents, Clients, Advisor Dashboard).
