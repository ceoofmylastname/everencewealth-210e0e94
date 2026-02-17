

## Phase 1: Database Tables, Storage, and Build Fix

This is a massive multi-phase project. Given the scope (50+ state pages, brochure library, admin CMS, translation workflows, public listing pages, calculators, PDF generation, email gates), we will implement it incrementally across multiple phases. This plan covers **Phase 1 only** -- the foundation.

---

### 0. Fix Build Error (Immediate)

**File: `src/components/buyers-guide/CostBreakdown.tsx`** (line 237)

The code references `cost.amount` which doesn't exist in the translation data (only `name`, `percentage`, `description`). Fix: remove `|| cost.amount` fallback, keeping only `cost.percentage`.

---

### 1. Create Database Tables

**New table: `brochures`**
- Educational guide content with sections (JSONB), SEO metadata, lead magnet settings (gated boolean), interactive features (calculator type, worksheet fields), cover images, PDF URL, tags, language support, and publishing status
- Matches the schema from the spec with all fields

**New table: `brochure_downloads`**
- Tracks email captures for gated brochure downloads
- Links to brochures table with cascade delete
- Stores user email, name, source page, download timestamp

**New storage bucket: `brochure-pdfs`**
- Public bucket for storing generated PDF files

**Indexes:**
- `brochures(slug)`, `brochures(category)`, `brochures(status)`
- `brochure_downloads(user_email)`, `brochure_downloads(brochure_id)`

**RLS Policies:**
- Public read access for published brochures
- Admin-only write access for brochures
- Insert-only for brochure_downloads (anonymous users can submit downloads)
- Admin read access for brochure_downloads

Note: The `state_pages` table and location pages infrastructure already exist via the `location_pages` table which has `state_code`, `tax_advantages`, etc. We will use that existing table rather than creating a duplicate.

---

### 2. Admin CMS: Brochure Manager (New)

**Route: `/portal/admin/brochures`**

Create a new admin page under the Portal Admin layout with:

- Table/card view of all brochures with filters (category, status, featured, gated)
- Search by title
- Download count display
- Create/Edit/Delete actions

**Route: `/portal/admin/brochures/new` and `/portal/admin/brochures/:id/edit`**

Form with sections:
1. Basic Info: title, slug (auto-generated), category selector, meta title/description, hero headline, subtitle, speakable intro
2. Cover: image upload with alt text
3. Content Sections: dynamic section builder with add/remove/reorder, each section has title, rich text, optional image
4. Interactive Features: calculator toggle + type selector, worksheet toggle
5. Lead Magnet: gated checkbox, PDF upload, featured checkbox
6. Tags: multi-select tag input
7. Publishing: status draft/published

---

### 3. Admin CMS: State/Location Pages (Enhancement)

The existing `/admin/location-pages` and `/admin/location-generator` already manage location pages. We will add a new **State Pages** view under Portal Admin:

**Route: `/portal/admin/location-pages`**

- List all location pages filtered by state
- Show state name, tax rate, status, language
- "Add New State" button linking to the location generator
- Edit/Delete/Translate actions

---

### 4. Public Routes (Scaffolding)

Add route scaffolding for:
- `/:lang/guides` -- Brochure library listing page
- `/:lang/guides/:slug` -- Individual brochure page
- `/:lang/retirement-planning/states` -- All states listing (already partially exists via locations)

These will be placeholder pages in Phase 1, fully built out in Phase 2.

---

### 5. Portal Admin Navigation Update

Add "Brochures" and "Location Pages" nav items to the AdminPortalLayout sidebar.

---

### Summary of Changes

| Item | Action |
|---|---|
| Fix `CostBreakdown.tsx` build error | Edit 1 line |
| Create `brochures` table + RLS | Database migration |
| Create `brochure_downloads` table + RLS | Database migration |
| Create `brochure-pdfs` storage bucket | Database migration |
| Build Brochure CMS list page | New file: `src/pages/portal/admin/AdminBrochures.tsx` |
| Build Brochure CMS form page | New file: `src/pages/portal/admin/AdminBrochureForm.tsx` |
| Build Brochure public page (scaffold) | New file: `src/pages/GuidePage.tsx` |
| Build Guides library page (scaffold) | New file: `src/pages/GuidesLibrary.tsx` |
| Update App.tsx routes | Add new routes |
| Update AdminPortalLayout nav | Add nav items |

Phase 2 (next) will cover: full brochure page template with email gate modal, PDF generation, translation workflow, state listing page with interactive map, calculators, and Resend email integration for downloads.

