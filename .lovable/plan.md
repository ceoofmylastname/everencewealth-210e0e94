

## Phase 3: Content Templates & Seeding (Updated)

All database inserts use `status: 'published'` (confirmed from existing live rows in all three tables).

---

### Step 1: Glossary — Individual Term Pages + DefinedTerm Schema

- Create `src/pages/GlossaryTerm.tsx` — renders single term by slug from `en.json` glossary data, includes DefinedTerm JSON-LD schema
- Add route `/:lang/glossary/:termSlug` in `App.tsx`
- Add slug generation (term name → kebab-case) and link each term on the glossary index page
- Result: 60 new indexable pages with structured data

### Step 2: Comparisons — Seed 6 Published Pages

Insert 6 rows into `comparison_pages` with `status: 'published'`:
1. IUL vs Roth IRA
2. Whole Life vs IUL
3. Roth IRA vs Traditional IRA
4. Index Strategy vs Market Portfolio
5. 401k vs Roth 401k
6. Indexed Annuity vs Variable Annuity

### Step 3: State Guides — Seed 5 Missing States (Published)

Already have: CA, FL, GA, IL, MI. Insert 5 rows into `location_pages` with `status: 'published'` for: TX, NY, PA, OH, NC.

### Step 4: Locations — Seed 12 More Cities (Published)

Insert 12 rows into `location_pages` with `status: 'published'` for: New York, Houston, Phoenix, Philadelphia, San Antonio, Jacksonville, Columbus, Charlotte, Indianapolis, Denver, Washington DC, Boston.

### Step 5: Guides Library — Seed 5 Guides (Published)

Insert 5 rows into `brochures` with `status: 'published'`, `featured: true`:
1. The Complete Guide to Tax-Free Retirement Income
2. How to Eliminate RMDs
3. Index Strategy Explained
4. The 3 Tax Buckets
5. Living Benefits Explained

### Step 6: Footer — Add Missing Links

Update `src/components/home/Footer.tsx` to add: Comparisons, State Guides, Guides Library, Client Stories, Privacy Policy, Terms of Service.

### Step 7: Fix Speakable Mismatch

Update `src/components/schema/ArticleSchema.tsx` — change `.speakable-summary` to `.speakable-answer` to match the actual CSS class used in `SpeakableBox.tsx`.

### Step 8: Add Share Buttons

Create `src/components/blog-article/ShareButtons.tsx` using native Web Share API with fallback. Add to `BlogArticle.tsx`.

### Step 9: Verify Article FAQs and Q&A Links

Query database to confirm articles have FAQs and Q&A page links. Report findings.

### Step 10: Generate 3 New Topic Clusters

Runtime operation — invoke existing edge functions for:
1. Tax-Free Retirement Income
2. Living Benefits & Protection
3. Legacy Planning & Estate Strategy

This will be triggered after all code changes deploy. Will provide exact invocation instructions.

---

### Files created
- `src/pages/GlossaryTerm.tsx`
- `src/components/blog-article/ShareButtons.tsx`

### Files modified
- `src/App.tsx` — glossary term route
- `src/pages/Glossary.tsx` — term links
- `src/components/home/Footer.tsx` — new sections
- `src/components/schema/ArticleSchema.tsx` — speakable selector fix
- `src/pages/BlogArticle.tsx` — share buttons

### Database inserts (all `status: 'published'`)
- 6 rows → `comparison_pages`
- 5 rows → `location_pages` (states)
- 12 rows → `location_pages` (cities)
- 5 rows → `brochures`

