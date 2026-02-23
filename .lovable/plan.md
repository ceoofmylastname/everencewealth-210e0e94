

# Workshop Slug Setup Page

## Overview

Create a new page at `/portal/advisor/workshops/slug-setup` where advisors can create or manage their custom workshop landing page URL. The page has two states: a creation form (if no slug exists) and a management view (if a slug already exists).

## What Changes

### 1. New Page: `src/pages/portal/advisor/WorkshopSlugSetup.tsx`

The main page component with two views:

**No Slug View (Creation Form):**
- Title: "Set Up Your Workshop Landing Page"
- Subtitle explaining purpose
- Input with `everencewealth.com/` prefix
- Real-time validation (regex, length, hyphen rules)
- Debounced availability check (500ms) against `advisor_slugs` table
- 3 auto-generated clickable slug suggestions based on advisor name (filtered to only available ones)
- "Create My Landing Page" button with loading/disabled states
- Inserts into `advisor_slugs` on submit

**Slug Exists View (Management):**
- Large prominent URL display (`everencewealth.com/{slug}`)
- Copy URL, Preview (opens new tab), and Edit buttons
- Success message

**Design:**
- Everence brand: `#1A4D3E` primary, 0px border radius, GeistSans font
- Large clean layout with white space
- URL preview at 48px+ font size

### 2. Route Registration in `src/App.tsx`

Add route: `workshops/slug-setup` under the existing advisor route group (around line 393).

### 3. Sidebar Navigation in `src/components/portal/PortalLayout.tsx`

Add "Workshops" item to the "Resources" nav group with the `Calendar` icon, pointing to `/portal/advisor/workshops/slug-setup`.

## Technical Details

### Data Flow
1. On mount: fetch advisor record via `portal_users.auth_user_id` -> `advisors.auth_user_id`
2. Then fetch `advisor_slugs` where `advisor_id` matches
3. If slug found -> show management view; otherwise -> show creation form
4. Availability check: `SELECT id FROM advisor_slugs WHERE slug = $input AND is_active = true`
5. Creation: `INSERT INTO advisor_slugs (advisor_id, slug, is_active) VALUES (...)`

### Validation Rules
- Regex: `/^[a-z0-9]+(-[a-z0-9]+)*$/` (lowercase alphanumeric, hyphens between words)
- Length: 3-50 characters
- No leading/trailing hyphens
- Must be available in `advisor_slugs`

### Suggested Slugs
Generated from advisor `first_name` + `last_name`:
- `firstname-lastname`
- `firstnamelastname`
- `firstname-l` (first initial of last name)

Each suggestion checked for availability on load, only available ones shown.

### Edge Cases
- Loading: skeleton loader
- DB error: error message with retry button
- Race condition on slug creation: catch unique constraint violation, show "just taken" message
- Double-submit prevention: disable button after click

### Files Modified
- `src/App.tsx` -- add route + lazy import
- `src/components/portal/PortalLayout.tsx` -- add Workshops nav item to Resources group

### Files Created
- `src/pages/portal/advisor/WorkshopSlugSetup.tsx` -- the full page component

### No database changes needed
The `advisor_slugs` table and RLS policies already exist.

