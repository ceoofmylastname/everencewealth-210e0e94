
# Full Portal Advisor Redesign — Hero Dark Aesthetic

## Scope

Every page in the advisor portal (and the sidebar/topbar) will be unified under the same dark premium aesthetic already established on the `AdvisorDashboard`. The dashboard is already done — the remaining 14 pages and the layout shell need to be brought into alignment.

---

## Design System Reference

From the Hero section and the existing dashboard:

| Token | Value |
|---|---|
| Page background | `#020806` (dark-bg) |
| Card surface | `glass-card` class — `backdrop-filter: blur(16px)`, `hsla(160,48%,21%,0.08)` fill, `hsla(0,0%,100%,0.08)` border |
| Gold accent | `hsla(51, 78%, 65%, 1)` |
| Gold glow | `0 0 24px hsla(51,78%,65%,0.45), 0 0 48px hsla(51,78%,65%,0.15)` |
| Heading font | `font-black` + hero/serif |
| Secondary text | `text-white/60` |
| Meta text | gold at 60–70% opacity |
| Active nav | Gold background pill, dark text |
| Input fields | `bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-gold/50` |
| Badges (status) | Dark pill with gold border, gold text — replacing all light-colored `bg-green-100` etc |
| Buttons (primary) | Dark glass with gold border + glow |
| Buttons (ghost) | `text-white/60 hover:text-white hover:bg-white/5` |

---

## Files to Edit

### 1. `src/components/portal/PortalLayout.tsx` — Sidebar + Topbar

**Sidebar changes:**
- Background: `bg-[#020806]` (currently uses `bg-card` which is light)
- Border: `border-white/[0.06]`
- Brand area: white "Everence" text, gold "Wealth" label — already looks good on dark; just needs dark bg
- Active nav item: Replace `bg-primary text-primary-foreground` with a gold-tinted pill: `bg-[hsla(51,78%,65%,0.15)] text-[hsla(51,78%,65%,1)] border border-[hsla(51,78%,65%,0.3)]`
- Inactive items: `text-white/50 hover:text-white hover:bg-white/[0.05]`
- Active chevron: gold colored
- User footer: dark glass card style, gold initials avatar ring, sign-out button in muted white

**Topbar changes:**
- `bg-[#020806] border-white/[0.06]`
- Avatar: gold ring/bg
- NotificationBell: will render with white icon naturally on dark bg

### 2. All 14 Advisor Inner Pages

Each page gets the same structural wrapper applied:

```
<div className="relative min-h-screen -m-6 p-6" style={{ background: "#020806" }}>
  {/* Mesh orbs */}
  ...
  <div className="relative z-10 space-y-6">
    {/* Page content */}
  </div>
</div>
```

Then within each page, all `Card`, `CardContent`, `CardHeader` components are replaced with `glass-card rounded-2xl` div wrappers. All text colors are migrated from `text-foreground / text-muted-foreground` to `text-white / text-white/60`. Inputs, selects, labels get dark-themed styling. Badges get the dark gold-outlined treatment.

---

## Page-by-Page Plan

### Page 1: Clients (`AdvisorClients.tsx`)
- Page wrapper: dark bg + mesh orbs
- Page title: white bold with gold badge pill "CLIENT ROSTER"
- Search input: dark glass input (`bg-white/5 border-white/10 text-white`)
- "Invite Client" button: gold glow border style
- Client cards: `glass-card rounded-2xl` — gold avatar initials (`hsla(51,78%,65%,0.15)` bg), white name, gold email/phone icons, dark glass action buttons

### Page 2: Policies (`AdvisorPolicies.tsx`)
- Page wrapper: dark + mesh
- Title: white + gold badge "POLICY LEDGER"
- Search: dark glass input
- "New Policy" button: gold glow
- Status badge recolor: swap `bg-green-100 text-green-800` → `bg-[hsla(160,48%,21%,0.3)] text-[hsla(160,60%,65%,1)] border border-[hsla(160,48%,21%,0.5)]` for active; similar dark-themed equivalents for pending/lapsed/cancelled
- Policy cards: `glass-card rounded-2xl` — carrier name in white bold, gold status pill, muted-white meta info, dark ghost action icon buttons (eye, pencil, trash)

### Page 3: Carriers (`CarrierDirectory.tsx`)
- Page wrapper: dark + mesh
- Title/subtitle: white + gold
- Filter chips (Products, Specialties): replace `Badge variant="outline"` with dark glass chips — inactive: `border-white/10 text-white/50`, active: `border-[gold/40] bg-[gold/10] text-[gold]`
- Carrier cards: `glass-card rounded-2xl` — carrier logo on dark bg, white name, gold AM Best badge, dark product chips, dark glass action buttons
- Rating badge: instead of `bg-green-100`, use `bg-[hsla(160,48%,21%,0.3)] text-[hsla(160,60%,65%,1)]`

### Page 4: News (`CarrierNews.tsx`)
- Priority filter badges: dark glass chips (urgent = red-tinted, high = orange-tinted, normal = gold-tinted)
- Article cards: `glass-card rounded-2xl` — gold dot before carrier name, white title, white/60 content, gold meta
- View count: gold/50

### Page 5: Performance (`PerformanceTracker.tsx`)
- Stat cards (Revenue, Clients, ROI etc): dark glassmorphic tiles with gold numbers — matches dashboard stat card style exactly
- "Add Entry" button: gold glow
- Dialog (`showAddDialog`): dark glassmorphic dialog with dark inputs
- Table: dark glass container — `text-white` headers, `text-white/60` rows, alternating `bg-white/[0.02]` rows

### Page 6: Tools Hub (`ToolsHub.tsx`)
- Tab bar (`TabsList`): dark glass pill container, active tab = gold
- Tool type filter chips: same dark glass chip system
- Calculator category buttons: dark glass with gold icon on active
- Tool cards: `glass-card rounded-2xl` — carrier logo on dark, white tool name, gold "Open" button with glow

### Page 7: Training Center (`TrainingCenter.tsx`)
- Stats bar (watch time, completions): dark glass row with gold numbers
- Category/level filter chips: dark glass system
- Course cards: `glass-card rounded-2xl` — gold progress bar, white title, gold/60 meta, play button with gold glow
- Progress: `Progress` component styled with gold fill (`bg-[hsla(51,78%,65%,1)]`)

### Page 8: Marketing Resources (`MarketingResources.tsx`)
- Category and type chips: dark glass system
- Resource cards: `glass-card rounded-2xl` — type icon in gold, white title, dark action buttons (download, copy, preview)

### Page 9: Schedule (`SchedulePage.tsx`)
- "Add Event" button: gold glow
- Date group headers: gold uppercase tracking-wide labels
- Event cards: `glass-card rounded-2xl` — gold calendar icon bg, white title/time, gold event-type pill
- Dialog: dark glass add-event form

### Page 10: Compliance Center (`ComplianceCenter.tsx`)
- Progress ring / score: gold
- Status badges: replace light-colored badges → dark glass equivalents (active = green-tinted dark, pending = gold-tinted dark, expired = red-tinted dark)
- Document and contract cards: `glass-card rounded-2xl`

### Page 11: Documents (`AdvisorDocuments.tsx`)
- Upload card: `glass-card rounded-2xl` — dark selects/inputs, gold "Upload" button with glow
- Select dropdowns: `bg-white/5 border-white/10 text-white`
- Document list rows: `glass-card rounded-2xl` — file icon in gold, white filename, gold/60 meta, dark action icons

### Page 12: Invite Client (`ClientInvite.tsx`)
- Form card: `glass-card rounded-2xl` — dark inputs with gold focus ring, gold "Send Invitation" button
- Invitations list: dark glass rows — status badges (pending = gold, accepted = green-dark, expired = red-dark)
- "Set Password" button: gold glow ghost

### Page 13: Messages (`AdvisorMessages.tsx`)
- Conversation list panel: `glass-card rounded-2xl` — dark bg, active convo = `bg-[gold/10] border-l-2 border-[gold]`
- New conversation select: dark styled `<select>` with gold focus
- Message bubbles: mine = `bg-[hsla(51,78%,65%,0.2)] text-white rounded-br-md`, theirs = `bg-white/[0.06] text-white rounded-bl-md`
- Send input + button: dark glass input, gold send button with glow

### Page 14: Settings (`AdvisorSettings.tsx`)
- Page wrapper: dark + mesh
- Card: `glass-card rounded-2xl` — dark inputs, gold "Update Password" button with glow

---

## Reusable Pattern: Page Shell

Every page uses this identical wrapper (extracted as a mental template, not a new component since they all already have their own logic):

```jsx
<div className="relative min-h-screen -m-6 p-6" style={{ background: "#020806" }}>
  {/* Mesh orbs — 2 per page, same as dashboard */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30"
      style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
    <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full opacity-20"
      style={{ background: "radial-gradient(circle, hsla(51,78%,65%,0.2) 0%, transparent 70%)", filter: "blur(80px)" }} />
  </div>
  <div className="relative z-10 space-y-6">
    {/* Page content */}
  </div>
</div>
```

---

## Reusable Pattern: Dark Input

```jsx
className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[hsla(51,78%,65%,0.5)] focus:ring-0 rounded-xl"
```

Applied to all `<Input>`, `<Textarea>`, `<select>` elements.

---

## Reusable Pattern: Status Badge (dark)

```jsx
// Active/Success
style={{ background: "hsla(160,48%,21%,0.3)", color: "hsla(160,60%,65%,1)", border: "1px solid hsla(160,48%,21%,0.5)" }}

// Pending/Warning  
style={{ background: "hsla(51,78%,65%,0.1)", color: "hsla(51,78%,65%,1)", border: "1px solid hsla(51,78%,65%,0.3)" }}

// Lapsed/Danger
style={{ background: "hsla(0,60%,30%,0.3)", color: "hsla(0,70%,70%,1)", border: "1px solid hsla(0,60%,30%,0.5)" }}

// Cancelled/Neutral
style={{ background: "hsla(0,0%,100%,0.06)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.1)" }}
```

---

## No Database Changes

This is a pure UI/styling change. No schema migrations, no new dependencies, no edge functions.

---

## Files to Edit (Complete List)

1. `src/components/portal/PortalLayout.tsx`
2. `src/pages/portal/advisor/AdvisorClients.tsx`
3. `src/pages/portal/advisor/AdvisorPolicies.tsx`
4. `src/pages/portal/advisor/CarrierDirectory.tsx`
5. `src/pages/portal/advisor/CarrierNews.tsx`
6. `src/pages/portal/advisor/PerformanceTracker.tsx`
7. `src/pages/portal/advisor/ToolsHub.tsx`
8. `src/pages/portal/advisor/TrainingCenter.tsx`
9. `src/pages/portal/advisor/MarketingResources.tsx`
10. `src/pages/portal/advisor/SchedulePage.tsx`
11. `src/pages/portal/advisor/ComplianceCenter.tsx`
12. `src/pages/portal/advisor/AdvisorDocuments.tsx`
13. `src/pages/portal/advisor/ClientInvite.tsx`
14. `src/pages/portal/advisor/AdvisorMessages.tsx`
15. `src/pages/portal/AdvisorSettings.tsx`
16. `src/pages/portal/advisor/PolicyForm.tsx` (new/edit policy)
17. `src/pages/portal/advisor/PolicyDetail.tsx` (policy view)

All logic, data fetching, and functionality is preserved. Only JSX structure, className strings, and inline styles are changed.
