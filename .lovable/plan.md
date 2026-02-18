
# Full Portal Redesign — Clean White Professional Dashboard

## The Direction Change

The user wants to move **away** from the current dark glass (`#020806`) aesthetic entirely. The reference image (Flup dashboard) shows:

- **White/light grey background** (`#F8F9FA` / `#FFFFFF`) for page and card surfaces
- **Brand colors used as accents** — sidebar active states, icon fills, stat highlights, buttons
- **Clean card borders** — subtle `border border-gray-100` shadows, no glassmorphism
- **Typography** — dark (`#111827`) headings, `#6B7280` secondary text
- **Sidebar** — Light white sidebar with brand green active nav + colored icon backgrounds
- **Top bar** — Clean white with subtle border separator
- **Stat cards** — White cards with colored icon badges and bold black numbers
- **Data rows** — Clean alternating-light table/list rows

This is a complete reversal of the dark theme across every page.

---

## New Design Tokens (Light Theme)

| Token | Value | Usage |
|---|---|---|
| Page bg | `#F8F9FA` | Main content background |
| Card bg | `#FFFFFF` | All card surfaces |
| Card border | `1px solid #E5E7EB` | Subtle card outlines |
| Card shadow | `0 1px 3px rgba(0,0,0,0.08)` | Lift effect |
| Sidebar bg | `#FFFFFF` | Left nav |
| Sidebar border | `1px solid #E5E7EB` | Right divider |
| Heading | `#111827` | H1, H2 |
| Body | `#374151` | Main text |
| Muted | `#6B7280` | Secondary/meta |
| Brand green | `#1A4D3E` (evergreen) | Active nav, primary buttons |
| Brand gold | `hsla(51,78%,65%,1)` | Accent highlights, badges, icons |
| Active nav bg | `#F0F5F3` | Active item background (light evergreen tint) |
| Active nav text | `#1A4D3E` | Active item text |
| Status active | `#D1FAE5` bg / `#065F46` text | Green pill |
| Status pending | `#FEF3C7` bg / `#92400E` text | Amber pill |
| Status lapsed | `#FEE2E2` bg / `#991B1B` text | Red pill |
| Input | `border border-gray-200 bg-white rounded-lg` | Form fields |
| Primary button | `bg-[#1A4D3E] text-white hover:bg-[#143d30]` | CTAs |

---

## Layout Shell Changes — `PortalLayout.tsx`

### Sidebar (completely rewritten style)
- Background: `bg-white` with `border-r border-gray-200`
- Logo area: white bg, `border-b border-gray-100`
- Nav items (inactive): `text-gray-500 hover:text-gray-900 hover:bg-gray-50`
- Nav items (active): `bg-[#F0F5F3] text-[#1A4D3E] font-semibold` with a `3px solid #1A4D3E` left border
- Icon size: slightly larger `h-4 w-4`, colored brand green on active
- Section groupings: subtle `text-[10px] uppercase tracking-widest text-gray-400` group labels (PORTAL, RESOURCES, etc.)
- User footer: white card with avatar initials in brand-green bg, name in dark, role in muted
- Sign out: `text-gray-500 hover:text-red-600`

### Top Bar
- Background: `bg-white border-b border-gray-200`
- Page title injected from route (optional enhancement)
- Notification bell: gray icon, hover brand-green
- Avatar: brand-green bg with white initials

### Main content area
- Background: `bg-gray-50` (`#F8F9FA`)

---

## Dashboard Pages Redesign

### Advisor Dashboard (`AdvisorDashboard.tsx`)

**Remove**: All dark styles, mesh orbs, glass-card, gold glow shadows, dark text

**Header section**:
```
Page bg: bg-gray-50
Greeting: "Good morning, Marcus" — text-2xl font-bold text-gray-900
Sub: "Here's your performance overview" — text-sm text-gray-500
Role badge: bg-[#F0F5F3] text-[#1A4D3E] rounded-full px-3 py-1 text-xs font-semibold
```

**Rank banner** → Clean white card, left accent bar in brand green, rank name in gray-900, comp % in gold badge pill

**4 Stat cards** → White cards with `shadow-sm border border-gray-100`:
- Icon in colored rounded square (brand green bg, white icon)
- Large black number `text-3xl font-bold text-gray-900`
- Label in `text-sm text-gray-500`
- Subtle trend indicator in green/red

**Quick Actions** → White card, actions as `bg-gray-50 hover:bg-[#F0F5F3]` tiles with brand-green icons

**News section** → White card, clean list rows with `border-b border-gray-100`, gold dot indicators, gray text

**Events section** → White card, event rows with brand-green calendar icon squares, gray type badge

**Recent Clients** → White card sidebar, avatar in brand-green, dark name, muted email

---

### Client Dashboard (`ClientDashboard.tsx`)

**Welcome banner** → White card, "Welcome back" in gray-500 small, name in bold gray-900, no glow

**3 Stat cards** → Same white card system as advisor

**Recent Policies** → White card with clean list rows, status colored pills using light standard colors

**Advisor sidebar** → White card, advisor photo/avatar with brand-green ring, clean contact info, brand-green "Send Message" button

---

## All Advisor Inner Pages — Common Pattern

Every page gets this wrapper instead of the dark wrapper:

```jsx
<div className="space-y-6"> {/* no background override needed — inherits gray-50 from layout */}
  {/* Page Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">[Page Title]</h1>
      <p className="text-sm text-gray-500 mt-0.5">[Subtitle]</p>
    </div>
    {/* Primary action button — brand green */}
  </div>
  
  {/* Content cards — white bg, gray-100 border, shadow-sm */}
</div>
```

### Card pattern (replaces glass-card):
```jsx
<div className="bg-white rounded-xl border border-gray-100 shadow-sm">
  <div className="p-5 border-b border-gray-100">
    <h2 className="text-base font-semibold text-gray-900">Title</h2>
  </div>
  <div className="p-5">
    {/* content */}
  </div>
</div>
```

### Input pattern (replaces dark inputs):
```jsx
className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1A4D3E] rounded-lg"
```

### Status badge pattern:
```jsx
// Active: bg-emerald-50 text-emerald-700 border border-emerald-200
// Pending: bg-amber-50 text-amber-700 border border-amber-200  
// Lapsed/Expired: bg-red-50 text-red-700 border border-red-200
// Cancelled: bg-gray-100 text-gray-600 border border-gray-200
```

### Primary Button pattern:
```jsx
className="bg-[#1A4D3E] hover:bg-[#143d30] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
```

### Gold accent usage (kept, but tastefully):
- Stat card values (bold numbers) — keep gold for YTD revenue, key metrics
- Active badge pills / rank badges
- "View All" links
- Icon backgrounds for stat cards (gold tint option for revenue card)

---

## Pages to Edit (Complete List)

1. **`src/components/portal/PortalLayout.tsx`** — Full sidebar + topbar light theme
2. **`src/pages/portal/advisor/AdvisorDashboard.tsx`** — Full light redesign
3. **`src/pages/portal/client/ClientDashboard.tsx`** — Full light redesign
4. **`src/pages/portal/advisor/AdvisorClients.tsx`** — Already partially done; switch to light
5. **`src/pages/portal/advisor/AdvisorPolicies.tsx`** — Already done; switch to light
6. **`src/pages/portal/advisor/CarrierDirectory.tsx`** — Switch to light
7. **`src/pages/portal/advisor/CarrierNews.tsx`** — Switch to light
8. **`src/pages/portal/advisor/PerformanceTracker.tsx`** — Switch to light (table is major element)
9. **`src/pages/portal/advisor/ToolsHub.tsx`** — Switch to light
10. **`src/pages/portal/advisor/TrainingCenter.tsx`** — Switch to light
11. **`src/pages/portal/advisor/MarketingResources.tsx`** — Switch to light
12. **`src/pages/portal/advisor/SchedulePage.tsx`** — Switch to light
13. **`src/pages/portal/advisor/ComplianceCenter.tsx`** — Uses old Card components; full switch to light
14. **`src/pages/portal/advisor/AdvisorDocuments.tsx`** — Switch to light
15. **`src/pages/portal/advisor/ClientInvite.tsx`** — Switch to light
16. **`src/pages/portal/advisor/AdvisorMessages.tsx`** — Uses old Card components; full switch to light (message bubbles: outgoing = brand-green bg white text, incoming = gray-100 bg)
17. **`src/pages/portal/AdvisorSettings.tsx`** — Remove old Card; switch to clean white card
18. **`src/pages/portal/client/ClientPolicies.tsx`** — Switch to light
19. **`src/pages/portal/client/ClientDocuments.tsx`** — Switch to light
20. **`src/pages/portal/client/ClientMessages.tsx`** — Switch to light

---

## Key Visual Differences at a Glance

| Element | Current (Dark) | New (Light) |
|---|---|---|
| Page bg | `#020806` black | `#F8F9FA` light gray |
| Cards | Glass + blur + dark | `bg-white border border-gray-100 shadow-sm` |
| Sidebar | Dark `#020806` | `bg-white border-r border-gray-200` |
| Active nav | Gold tinted dark | Brand green `#1A4D3E` with left accent bar |
| Headings | `text-white` | `text-gray-900` |
| Secondary text | `text-white/60` | `text-gray-500` |
| Stat numbers | Gold (`hsla(51,78%,65%)`) | `text-gray-900 font-bold` (gold kept for revenue) |
| Inputs | `bg-white/5 border-white/10` dark | `bg-white border-gray-200` clean |
| Status badges | Dark glass pills | Light colored pills (emerald/amber/red) |
| Buttons | Dark gold glow | `bg-[#1A4D3E] text-white` solid |
| Message bubbles | Dark glass | Green (outgoing) / Gray-100 (incoming) |

---

## No Database or Logic Changes

This is 100% a visual/styling change. All Supabase queries, state management, hooks, and routing logic remain untouched. Only JSX className strings and inline styles change.
