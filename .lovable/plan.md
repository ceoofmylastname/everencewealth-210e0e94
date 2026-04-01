

## Response Card Page — Full Implementation Plan

### Table Verification

The prompt says to reference `advisors(id)` for the agent dropdown. The `advisors` table exists with `id`, `first_name`, `last_name`, `is_active`, `auth_user_id`, and `portal_user_id`. However, the prompt's RLS rule "assigned_advisor_id = auth.uid()" won't work because `advisors.id` is NOT the same as `auth.uid()` — it's a separate UUID. The correct RLS check for advisor SELECT is: `assigned_advisor_id = (SELECT id FROM advisors WHERE auth_user_id = auth.uid())`, or use the existing `get_advisor_id_for_auth(auth.uid())` function.

The `contracting_agents` table (which powers `/portal/advisor/contracting/agents`) has a `status` column, but the prompt says to pull from the "agents table" with `status = 'active'`. The `advisors` table uses `is_active` (boolean), not a text status. I'll use `advisors` with `is_active = true` since that's the canonical advisor table and the FK target.

### Database Migration

Create `response_card_submissions` table:

```sql
CREATE TABLE public.response_card_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_advisor_id UUID NOT NULL REFERENCES public.advisors(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  income_range TEXT NOT NULL,
  wants_free_consultation BOOLEAN NOT NULL DEFAULT false,
  meeting_topics TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT,
  comments TEXT,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.response_card_submissions ENABLE ROW LEVEL SECURITY;

-- Public insert (unauthenticated form)
CREATE POLICY "Anyone can insert submissions"
  ON public.response_card_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Advisors see only their own
CREATE POLICY "Advisors see own submissions"
  ON public.response_card_submissions FOR SELECT
  TO authenticated
  USING (
    assigned_advisor_id = public.get_advisor_id_for_auth(auth.uid())
  );

-- Admins see all
CREATE POLICY "Admins see all submissions"
  ON public.response_card_submissions FOR SELECT
  TO authenticated
  USING (public.is_portal_admin(auth.uid()));

-- Advisors can mark reviewed
CREATE POLICY "Advisors update own submissions"
  ON public.response_card_submissions FOR UPDATE
  TO authenticated
  USING (assigned_advisor_id = public.get_advisor_id_for_auth(auth.uid()))
  WITH CHECK (assigned_advisor_id = public.get_advisor_id_for_auth(auth.uid()));

-- Admins can delete
CREATE POLICY "Admins can delete submissions"
  ON public.response_card_submissions FOR DELETE
  TO authenticated
  USING (public.is_portal_admin(auth.uid()));
```

### New Files

**1. `src/pages/ResponseCard.tsx`** — Public form page
- Agent dropdown queries `advisors` where `is_active = true`, displays `first_name + last_name`
- All form fields as specified, with zod validation
- Phone mask `(000) 000-0000`
- Branded Everence Wealth colors (#1A4D3E, #C8A96E, #4A5565)
- On submit: insert into `response_card_submissions` using anon supabase client
- Success state replaces form with confirmation message (no redirect)

**2. `src/pages/portal/advisor/ResponseCardSubmissions.tsx`** — Advisor view
- Queries `response_card_submissions` where RLS filters to their records
- Card/table layout showing name, email, phone, income, topics, availability, date
- Expandable detail view for full submission
- Badge counter for unreviewed submissions (`reviewed = false`)
- Mark as reviewed toggle

**3. `src/pages/portal/admin/AdminResponseCards.tsx`** — Admin view
- Shows all submissions across all agents
- Filter by agent, date range, income range, meeting topic
- Total count + per-agent breakdown stats
- Full detail view

### Route Changes (`src/App.tsx`)

- Add `/response-card` as a public route → `ResponseCard`
- Add `response-cards` under `/portal/advisor` → `ResponseCardSubmissions`
- Add `response-cards` under `/portal/admin` → `AdminResponseCards`

### Dashboard Integration

- **AdvisorDashboard.tsx**: Add a "Response Card Submissions" quick-action card with unreviewed count badge, linking to `/portal/advisor/response-cards`
- **Sidebar/nav**: Add "Response Cards" link in advisor and admin navigation

### Files Modified
- `src/App.tsx` — 3 new routes
- `src/pages/portal/advisor/AdvisorDashboard.tsx` — Add response card stats card
- Advisor sidebar component — Add nav link
- Admin sidebar component — Add nav link

### Files Created
- `src/pages/ResponseCard.tsx`
- `src/pages/portal/advisor/ResponseCardSubmissions.tsx`
- `src/pages/portal/admin/AdminResponseCards.tsx`

