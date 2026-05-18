# Profile Key — Contact Rating System

A visually rich rating overlay that lets advisors flag each contact across 8 lifestyle traits (1–8) plus a Response/Associate/Client status (R/A/C). The total score (0–8) drives a color heat-map so high-potential contacts pop instantly.

## The traits

Numeric (count toward 0–8 score):
1. 25+ years old
2. Married
3. Children
4. Homeowner
5. Income
6. Ambitious
7. Dissatisfied (with job)
8. Entrepreneur mindset

Status (separate badge, single-select): **R** Response · **A** Associate · **C** Client

## Color heat-map (score → color)

```text
0  slate     (cold)
1  zinc
2  sky
3  teal
4  amber       ← "watch list" threshold
5  orange
6  rose
7  fuchsia
8  emerald     (hot / urgent priority)
```

Score ≥ 4 = elevated priority. Score ≥ 6 = urgent. Colors are HSL tokens added to the design system, not hard-coded.

## What gets built

### 1. Database
New `advisor_contact_profile_key` table (1:1 with contact):
- 8 boolean trait columns
- `status_code` enum: `response | associate | client | null`
- generated `score` int (0–8)
- RLS mirrors `advisor_contacts` (owner read/write, manager read-only)

### 2. Profile Key editor (on Contact Detail page)
A new card placed above the tabs on `/portal/advisor/contacts/:id`:

```text
┌────────────────────────────────────────────────┐
│  PROFILE KEY                       SCORE 6 / 8 │
│  ●●●●●●○○  (animated dot meter, heat color)    │
│                                                │
│  [1 25+]  [2 Married]  [3 Children] [4 Home]   │ ← toggle chips
│  [5 Income][6 Ambitious][7 Dissat] [8 Entrep]  │
│                                                │
│  Status:  ( R )  ( A )  ( C )                  │ ← segmented pill
└────────────────────────────────────────────────┘
```

- Each trait = large rounded toggle chip; lit chips glow in the score's heat color
- Animated radial/dot meter shows score; framer-motion spring on toggle
- Status row is a segmented control (R / A / C)
- Auto-saves on toggle (optimistic, toast on error)
- Read-only for managers viewing team contacts

### 3. Contact List enhancements
On `/portal/advisor/contacts`:
- Each row gets a **heat dot** + score badge (`6/8`) and status letter (`R`/`A`/`C`)
- Header gets a horizontal **Profile Key legend** strip (matches your screenshot)
- New filters:
  - Score buckets: `All · 2+ · 4+ · 6+ · 8`
  - Status: `R / A / C`
  - Individual trait filter (multi-select dropdown: "Has children", "Dissatisfied", etc.)
- Sort by score (desc) option

### 4. Dashboard alert widget
On the advisor dashboard, alongside Reminders / Appointments:
- New **Hot Profiles** card listing contacts scored ≥ 4 (configurable threshold)
- Color-coded rows by score, click → contact detail
- Counts: e.g. "3 urgent (7+) · 8 watch (4-6)"

### 5. Design tokens
Add to `index.css` / `tailwind.config.ts`:
- `--profile-key-0` … `--profile-key-8` HSL tokens
- `--profile-key-gradient` (multi-stop heat gradient for meter)
- Glassmorphic card style matching the Modern Premium aesthetic (rounded-2xl, subtle gold accent on active chips)

## Technical notes

- New migration: `advisor_contact_profile_key` table + RLS + generated `score` column + index on `(advisor_id, score desc)` for the dashboard alert query
- New hook `useContactProfileKey(contactId)` with optimistic toggle
- New hook `useHotProfiles(advisorId, threshold=4)` for dashboard
- New components:
  - `components/portal/contacts/ProfileKeyCard.tsx` (editor)
  - `components/portal/contacts/ProfileKeyBadge.tsx` (list row badge)
  - `components/portal/contacts/ProfileKeyLegend.tsx` (header strip)
  - `components/portal/dashboard/HotProfilesAlert.tsx`
- Filter state lives in `?score=4&trait=children,income&status=R` query params (shareable)
- Score is generated in SQL so filtering/sorting stays fast

## Out of scope (ask if you want these)
- Historical score timeline / changelog
- Bulk-edit profile keys from the list
- Auto-suggest profile traits from notes (AI)

---

**Questions before I build:**
1. Color scale above looks ok, or do you want me to design directions first (visual mockup) so you can pick the chip/meter style?
2. Dashboard alert threshold default: **4+** sound right, or stricter (6+)?
3. Should the Profile Key card sit **above** the tab strip (always visible) or live inside an "Overview" tab section?
