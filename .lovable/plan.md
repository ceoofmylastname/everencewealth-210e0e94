
## Portal Dashboard Visual Redesign — Hero Aesthetic

### What's Changing

Both the **Advisor Dashboard** (`/portal/advisor/dashboard`) and the **Client Dashboard** (`/portal/client/dashboard`) will be redesigned to match the home hero's visual language: deep dark-bg (`#020806`) background, gold (`hsla(51, 78%, 65%)`) accents, glassmorphism cards, mesh gradient orbs, scan-line atmosphere, and the same `font-hero`/`font-serif` typography system. All existing data elements, links, and functionality are preserved — only the visual treatment changes.

---

### Design System Being Applied

From the hero page:
- **Background**: `bg-dark-bg` (`#020806`) with floating radial gradient mesh orbs
- **Cards**: `glass-card` class — `backdrop-filter: blur(16px)`, `hsla(160,48%,21%,0.08)` fill, `hsla(0,0%,100%,0.08)` border
- **Primary accent**: Gold `hsla(51, 78%, 65%)` — used for numbers, icons, active labels, borders
- **Text**: White for headings, `text-primary/70` (gold-tinted) for secondary copy
- **Buttons/CTAs**: Gold-glowed pill buttons matching the `BEGIN ASSESSMENT` style
- **Stat cards**: Glassmorphic tiles with gold top-border shimmer and number reveals
- **Welcome banner**: Replaces current gradient banner with the dark hero aesthetic + scan-line badge
- **Quick actions** (advisor): Dark glass tiles with gold icons, matching the HUD panel
- **Sidebar**: Already dark — stays untouched (only the `<main>` content area changes)

---

### Advisor Dashboard — Element-by-Element Plan

| Current Element | New Treatment |
|---|---|
| White welcome heading | Large `font-hero font-black` white heading with gold sub-label badge (matching hero badge style) |
| Rank banner (colored border) | Dark glass card with gold left-accent bar + rank badge pill |
| 4 stat cards (light tints) | Dark glassmorphic tiles, gold top-border glow, large gold number, white label |
| Quick Actions (muted/50 bg) | Dark glass tiles with gold icon + label, hover: gold border glow |
| Latest Carrier News section | Dark card with glass-card class, gold dot indicators, white title, gold/50 meta |
| Upcoming Events section | Same dark glass treatment, gold calendar icon bg, event type badge → gold outlined pill |
| Recent Clients sidebar | Dark glass card, gold avatar initials bg, white names, gold email text |
| Overall page bg | `bg-dark-bg` (overrides the portal layout's `bg-background`) |

---

### Client Dashboard — Element-by-Element Plan

| Current Element | New Treatment |
|---|---|
| Welcome banner (primary blue) | Dark hero-style banner with gold "WELCOME BACK" label badge + white serif name |
| 3 stat cards | Dark glassmorphic, gold number + icon glow |
| Recent Policies (2/3 col) | Dark glass card, gold FileText icon, white carrier name, gold status dot |
| Advisor sidebar (1/3 col) | Dark glass card, gold avatar ring, gold email/phone icons, hero-style "Send Message" button |
| Page background | `bg-dark-bg` |

---

### Technical Approach

**1. Scoped dark background**
Each dashboard page wraps its content in a full-page dark container that overrides the portal layout's `bg-background`. The sidebar and topbar are left untouched since they already work on their own layering.

**2. No new dependencies**
Uses only existing Framer Motion (already installed), `glass-card` CSS class (already in `src/index.css`), and Tailwind tokens (`dark-bg`, `primary`, `evergreen`).

**3. Mesh orb decorations**
Two or three absolute-positioned blurred radial gradient divs (pointer-events-none) placed behind the content — matching the hero's `animate-mesh-shift` orbs for atmosphere. These are `position: absolute` inside a `relative` wrapper so they don't escape the main scroll area.

**4. Stat card gold glow on hover**
Inline `boxShadow` with `onMouseEnter`/`onMouseLeave` pattern (same as Footer and HUD button) for GPU-composited glow without CSS animation overhead.

**5. Skeleton loaders**
Updated to dark glass skeleton (`bg-white/5 animate-pulse`) to match the new background.

---

### Files to Edit

- **`src/pages/portal/advisor/AdvisorDashboard.tsx`** — Full visual redesign (all JSX styling, no logic changes)
- **`src/pages/portal/client/ClientDashboard.tsx`** — Full visual redesign (all JSX styling, no logic changes)

No CSS, no new components, no database changes needed.

---

### Visual Preview

```text
┌─────────────────────────────────────────────────────────┐
│  [sidebar unchanged]  │  bg-dark-bg (#020806)           │
│                       │  ┌─ mesh orb (top-left) ──┐    │
│                       │  │ blurred green radial    │    │
│                       │  └────────────────────────┘    │
│                       │                                  │
│                       │  ● ADVISOR PORTAL  [gold badge] │
│                       │  Welcome back, Marcus            │
│                       │                                  │
│                       │  ┌glass──┐ ┌glass──┐ ┌glass──┐ │
│                       │  │  12   │ │ $48K  │ │  34   │ │
│                       │  │Active │ │ YTD   │ │Policy │ │
│                       │  └───────┘ └───────┘ └───────┘ │
│                       │                                  │
│                       │  [Quick Actions — gold icons]   │
│                       │                                  │
│                       │  ┌ News ──────────┐ ┌ Clients ┐ │
│                       │  │ glass card     │ │glass    │ │
│                       │  └────────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────┘
```
