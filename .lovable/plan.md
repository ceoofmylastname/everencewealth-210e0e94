

# Phase 7: Agent Portal Dashboard System

## Overview
Build a comprehensive Agent Portal Dashboard for Everence Wealth with carrier management, performance tracking, quoting tools, calculators, training center, marketing resources, scheduling, and AI assistance. This extends the existing portal structure (advisor routes under `/portal/advisor/`).

## Scope Breakdown

### Step 1: Database Migration
Create all 13 new tables with RLS policies, triggers, indexes, and seed data:

| Table | Purpose |
|---|---|
| `carrier_news` | Carrier-specific news/updates |
| `lead_products` | Lead generation product offerings |
| `schedule_events` | Calendar events for advisors |
| `advisor_rank_config` | Rank tiers and compensation levels |
| `advisor_performance` | Daily performance tracking entries |
| `trainings` | Training video/content library |
| `training_progress` | Per-advisor training completion tracking |
| `marketing_resources` | Downloadable marketing assets |
| `quoting_tools` | External quoting tool links per carrier |
| `calculators` | Financial calculator configurations |
| `rag_documents` | Knowledge base documents for AI assistant |
| `agency_hierarchy` | Agency tree structure |
| `zone_config` | Advisor zone classifications |

Also adds `agency_id`, `agency_code`, and `current_zone` columns to the existing `advisors` table.

**RLS Policies:** All tables get RLS enabled. Advisors/admins can read published content. Performance data is scoped to the owning advisor. Admins get full CRUD.

**Seed Data:** Rank config (5 tiers), zone config (7 zones), agency hierarchy (5 agencies), sample calculators (8), trainings (4), lead products (4), and a sample carrier news article.

### Step 2: New Pages (10 pages)

| Route | Page | Description |
|---|---|---|
| `/portal/advisor/dashboard` | **Enhanced Dashboard** | Rebuild with rank banner, YTD stats, carrier news feed, upcoming events, quick actions grid |
| `/portal/advisor/carriers` | **Carrier Directory** | Grid of carriers with search, AM Best ratings, products offered |
| `/portal/advisor/carriers/:id` | **Carrier Detail** | Full carrier info, quoting tools, news for that carrier |
| `/portal/advisor/news` | **Carrier News** | Filterable news feed with priority badges |
| `/portal/advisor/performance` | **Performance Tracker** | Data entry form + summary table with calculated fields (expected issue pay, deferred pay) |
| `/portal/advisor/tools` | **Tools Hub** | Split view: Quoting Tools (by carrier) and Calculators (by category) |
| `/portal/advisor/training` | **Training Center** | Card grid with category filters, progress bars |
| `/portal/advisor/training/:id` | **Training Detail** | Video player, transcript, completion tracking |
| `/portal/advisor/marketing` | **Marketing Resources** | Filterable resource library with download tracking |
| `/portal/advisor/schedule` | **Schedule/Calendar** | Event list view with date filtering and type badges |

### Step 3: Update Portal Layout
Add new navigation items to `PortalLayout.tsx` for advisors:
- Carriers, News, Performance, Tools, Training, Marketing, Schedule

### Step 4: Update App.tsx Routing
Register all new lazy-loaded page components and routes under the existing `/portal/advisor` route group.

---

## Technical Details

### Database Migration SQL
- Uses `gen_random_uuid()` for all PKs (consistent with existing schema)
- References existing `carriers` and `advisors` tables via FK
- `advisor_performance.expected_issue_pay` and `expected_deferred_pay` are `GENERATED ALWAYS AS ... STORED` computed columns
- `training_progress` has a UNIQUE constraint on `(advisor_id, training_id)`
- All `updated_at` columns get the existing `update_updated_at_column()` trigger
- CHECK constraints used for enum-like text fields (article_type, priority, status, etc.)

### RLS Policy Strategy
- Published/active content readable by portal advisors and admins via `is_portal_advisor()` / `is_portal_admin()` helper functions
- `advisor_performance` scoped to advisor's own records via `advisors.auth_user_id = auth.uid()`
- `training_progress` scoped to advisor's own records
- `schedule_events`, `trainings`, `marketing_resources`, `quoting_tools`, `calculators` are read-only for advisors
- Admins get full management policies on all tables

### Page Architecture
- Each page follows the existing pattern: React functional component, `usePortalAuth()` for user context, Supabase client queries
- Performance page uses `useQuery` + `useMutation` pattern from TanStack Query
- Training progress tracked via upsert on `training_progress` table
- Dashboard enhanced with rank determination logic (compare YTD revenue against `advisor_rank_config`)

### Component Patterns
- Reuse existing UI components: `Card`, `Button`, `Badge`, `Input`, `Select`, `Tabs`
- Follow existing styling: Playfair Display for headings, consistent spacing with `space-y-6`
- Loading states with skeleton/spinner patterns already used in the portal

