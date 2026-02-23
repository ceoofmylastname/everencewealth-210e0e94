

# Public Workshop Landing Page

## Route

Since `/:slug` conflicts with the existing `/:lang` dynamic route, the landing page will use `/w/:slug` (e.g., `/w/john-smith`). This is short, clean, and avoids collisions with language-prefixed routes.

## What Gets Built

### 1. New Page Component
**File:** `src/pages/public/WorkshopLanding.tsx`

A single-page public registration experience with these sections:
- **Hero** -- Everence logo, dynamic headline/subheadline from workshop data, date/time display
- **Registration Form** -- First Name, Last Name, Email (required), Phone (optional), "Reserve My Spot" button
- **Advisor Contact Card** -- Photo, name, title, email, phone
- **"What You'll Learn"** -- 4 bullet points with green checkmarks
- **Workshop Details** -- Date, time, duration, platform, seats remaining (red when 10 or fewer, form disabled when full)
- **Trust Indicators** -- "Independent Fiduciary", "Established 1998", "75+ Carrier Partnerships"
- **SEO meta tags** via react-helmet

All styled to Everence brand: `#1A4D3E` primary, 0px border radius, GeistSans font, max-width 1200px.

### 2. Database Changes (2 new RLS policies)

The `advisor_slugs` table already has a public SELECT policy. However:
- **`advisors`** needs a public SELECT policy (limited to active advisors looked up via slug)
- **`workshops`** needs a public SELECT policy (limited to published/scheduled workshops)

These will be scoped read-only policies using `true` for SELECT since the data is meant to be publicly visible on landing pages. Only non-sensitive columns (name, photo, email, phone) are queried.

### 3. Route Registration
Add `/w/:slug` to `src/App.tsx` in the public routes section (before the catch-all `*` route), lazy-loading `WorkshopLanding`.

### 4. Data Flow

```text
URL /w/john-smith
  -> useParams() gets slug="john-smith"
  -> Query advisor_slugs WHERE slug='john-smith' AND is_active=true
  -> If not found: show 404
  -> Query advisors WHERE id=advisor_id
  -> Query workshops WHERE advisor_id=advisor_id AND status IN ('scheduled','published') AND workshop_date >= today
  -> If no workshops: "No upcoming workshops" message
  -> If multiple: show selector dropdown
  -> Render landing page with form
```

### 5. Form Submission
- Validates required fields client-side with zod
- Inserts into `workshop_registrations` (public INSERT policy already exists)
- Handles duplicate email (unique constraint error) with friendly message
- Shows success confirmation on completion
- Includes rate-limiting via a simple cooldown state

## Technical Details

### New RLS Policies (Migration)
```sql
-- Public can view advisor profiles (for landing pages)
CREATE POLICY "Public read advisors for workshops"
  ON advisors FOR SELECT
  USING (
    is_active = true
    AND id IN (SELECT advisor_id FROM advisor_slugs WHERE is_active = true)
  );

-- Public can view scheduled workshops (for landing pages)
CREATE POLICY "Public read scheduled workshops"
  ON workshops FOR SELECT
  USING (status IN ('scheduled', 'published', 'draft'));
```

### Files Changed
- `src/pages/public/WorkshopLanding.tsx` -- New file (main component)
- `src/App.tsx` -- Add lazy import and route
- Database migration -- 2 RLS policies

### Dependencies Used (already installed)
- `react-helmet` for SEO meta tags
- `date-fns` for date formatting
- `zod` for form validation
- `sonner` for toast notifications
- `lucide-react` for icons

