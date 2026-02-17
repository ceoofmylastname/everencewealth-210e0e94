

## Phase 1: State-Specific Retirement Planning Pages

Build the new `/retirement-planning/:stateSlug` route with a dedicated `state_pages` table, 7 frontend components, JSON-LD schema generator, and updated routing.

---

### 1. Database: New `state_pages` Table

Create a new table (not reuse `location_pages`) to cleanly separate the US state content model:

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | auto-generated |
| state_code | TEXT NOT NULL | 'CA', 'TX', etc. |
| state_name | TEXT NOT NULL | 'California' |
| slug | TEXT NOT NULL UNIQUE | 'california' |
| meta_title | TEXT | SEO title |
| meta_description | TEXT | SEO description |
| canonical_url | TEXT | Full canonical |
| hero_headline | TEXT | H1 content |
| hero_subheadline | TEXT | Sub-H1 |
| speakable_answer | TEXT | 40-60 word AI-ready answer |
| overview_content | TEXT | Rich HTML body |
| state_income_tax_rate | DECIMAL | e.g. 13.3 |
| has_state_income_tax | BOOLEAN DEFAULT true | |
| estate_tax_exemption | DECIMAL | Dollar amount |
| creditor_protection_level | TEXT | 'strong'/'moderate'/'weak' |
| recommended_strategies | JSONB | Array of strategy objects |
| case_study_title | TEXT | |
| case_study_content | TEXT | HTML |
| state_statistics | JSONB | Key metrics object |
| hero_image_url | TEXT | |
| hero_image_alt | TEXT | |
| hero_image_caption | TEXT | |
| state_map_image_url | TEXT | |
| json_ld_schema | JSONB | Pre-built schema |
| qa_entities | JSONB | FAQ array |
| language | TEXT DEFAULT 'en' | 'en' or 'es' |
| hreflang_group_id | UUID | For EN/ES linking |
| status | TEXT DEFAULT 'draft' | 'draft' or 'published' |
| date_published | TIMESTAMPTZ | |
| date_modified | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | |
| author_id | UUID | FK to authors |

Indexes on `slug`, `status`, `language`, `state_code`.
RLS: public SELECT for published, admin-only INSERT/UPDATE/DELETE.

---

### 2. Routing

Add new routes in `App.tsx`:

```text
/:lang/retirement-planning/:stateSlug  -->  StateRetirementPage
/retirement-planning/:stateSlug        -->  redirect to /en/retirement-planning/:stateSlug
```

---

### 3. Frontend Components (new folder: `src/components/state-retirement/`)

**StateRetirementHero** -- Full-width hero with state image, Evergreen overlay at 85% opacity, H1, subheadline, CTA button. Sharp edges (0px radius) per request. Image with alt, caption, lazy loading.

**StateSpeakableBox** -- Reuse existing `SpeakableBox` component (already generic enough).

**StateTaxEnvironmentCard** -- Card showing `state_income_tax_rate`, comparison to national average (currently ~4.6%), visual bar chart. Uses `has_state_income_tax` flag.

**StateStrategiesSection** -- Grid of strategy cards from `recommended_strategies` JSONB. Each card: icon, title, description, link to strategy page.

**StateStatisticsSection** -- Interactive cards using Recharts for `state_statistics` JSONB data: retirement gap, cost of living index, median home price, average retirement age, retiree poverty rate.

**StateCaseStudySection** -- Storytelling format: client profile, challenge, solution, results with before/after comparison table.

**StateCTASection** -- "Schedule Your [State] Retirement Strategy Session" with form link to `/contact?state=[code]`.

---

### 4. Main Page: `src/pages/StateRetirementPage.tsx`

- Fetches from `state_pages` by slug + language + status='published'
- Renders: Header, Hero, SpeakableBox, Overview, Tax Environment Card, Strategies, Statistics, Case Study, FAQs, CTA, Footer
- Injects JSON-LD from `json_ld_schema` field
- Sets canonical URL and hreflang tags

---

### 5. JSON-LD Schema Generator: `src/lib/stateSchemaGenerator.ts`

Generates WebPage, FAQPage, BreadcrumbList, SpeakableSpecification, and FinancialService schemas with proper language prefixes (`/es/retirement-planning/...` for Spanish).

---

### 6. Design Tokens

Per the request, these pages use a different aesthetic from the main site:
- Sharp edges (0px border radius) instead of rounded
- Colors: #1A4D3E (Evergreen), #4A5565 (Slate text), #F0F2F1 (Cream bg), #FFFFFF (cards)
- GeistSans typography (falls back to system sans-serif)
- 8px spacing system
- Mobile-first responsive at 640/768/1024/1280px breakpoints

---

### 7. Files to Create/Modify

| Action | File |
|---|---|
| CREATE | `src/pages/StateRetirementPage.tsx` |
| CREATE | `src/components/state-retirement/StateRetirementHero.tsx` |
| CREATE | `src/components/state-retirement/StateTaxEnvironmentCard.tsx` |
| CREATE | `src/components/state-retirement/StateStrategiesSection.tsx` |
| CREATE | `src/components/state-retirement/StateStatisticsSection.tsx` |
| CREATE | `src/components/state-retirement/StateCaseStudySection.tsx` |
| CREATE | `src/components/state-retirement/StateCTASection.tsx` |
| CREATE | `src/lib/stateSchemaGenerator.ts` |
| MODIFY | `src/App.tsx` (add routes) |
| DB MIGRATION | Create `state_pages` table with RLS |

### What's Deferred to Phase 2

- Admin state page generator (AI content creation)
- Batch state generation (all 50 states)
- Educational brochures library
- Tax calculator widget
- State map SVG rendering
- Translation edge function for state pages

