

## Phase 0: Del Sol Purge

Remove all Del Sol Prime Homes contamination from the codebase. No database changes.

---

### 1. Regenerate static sitemaps from Supabase

**`public/sitemaps/en/blog.xml`** — Currently 440 entries all pointing to `delsolprimehomes.com`. Delete and regenerate by querying `blog_articles` table (status=published, language=en), using `everencewealth.com` as the domain.

**`public/sitemaps/en/qa.xml`** — Currently 12 entries all pointing to `delsolprimehomes.com`. Delete and regenerate by querying `qa_pages` table (status=published, language=en), using `everencewealth.com` as the domain.

Both files will be generated via a one-time script that queries the database and writes the XML.

### 2. Fix QAIndex.tsx

- **Line 144**: Replace subtitle with: *"Expert answers to your most pressing retirement planning, tax strategy, and wealth protection questions — answered by licensed financial advisors."*
- **Lines 23-30**: Replace `CATEGORY_CONFIG` real estate categories with:
  - Retirement Planning (BookOpen, blue)
  - Tax Strategy (Scale, purple)
  - Index Strategies (TrendingUp, green)
  - Living Benefits (HelpCircle, orange)
  - Legacy Planning (Building, cyan)
  - General Finance (BarChart3, rose)

### 3. Fix BlogArticle.tsx error page titles

- **Line 169**: `"Del Sol Prime Homes"` → `"Everence Wealth"`
- **Line 198**: `"Del Sol Prime Homes"` → `"Everence Wealth"`

### 4. Fix Glossary og:image:alt and twitter:image:alt

- **`src/lib/glossarySchemaGenerator.ts` line 28**: Change `GLOSSARY_NAMES.en` from `"Costa del Sol Real Estate Glossary"` to `"Wealth Management Glossary | Everence Wealth"`
- Update all other language entries in `GLOSSARY_NAMES` to remove "Costa del Sol" / "Vastgoed" references and use wealth management terminology

### 5. Fix `src/pages/Sitemap.tsx`

- **Line 14**: Change `BASE_URL` from `"https://www.delsolprimehomes.com"` to `"https://www.everencewealth.com"`
- **Lines 16-21**: Update `SUPPORTED_LANGUAGES` to `['en', 'es']` and `langToHreflang` to `{ en: 'en-US', es: 'es-US' }`

### 6. Fix scripts with hardcoded Del Sol references

These scripts are build-time utilities. Update the `BASE_URL` and all hardcoded references in:

- **`scripts/generateStaticPages.ts`** — Replace `delsolprimehomes.com` with `everencewealth.com`, update org schema from "RealEstateAgent" / "Del Sol Prime Homes" to "FinancialService" / "Everence Wealth"
- **`scripts/generateStaticQAPages.ts`** — Replace domain, org name, descriptions (remove "Costa del Sol real estate" copy)
- **`scripts/validateAEOImplementation.ts`** — Update `BASE_URL`
- **`scripts/generateStaticBuyersGuide.ts`** — Update `BASE_URL` and contact info
- **`scripts/generateStaticAboutPage.ts`** — Update `BASE_URL` and org references
- **`scripts/generateStaticLocationPages.ts`** — Update `BASE_URL` and org name
- **`scripts/generateStaticComparisonPages.ts`** — Update `BASE_URL` if present
- **`scripts/generateStaticLocationHub.ts`** — Update `BASE_URL` if present
- **`scripts/generateStaticHomePage.ts`** — Update `BASE_URL` if present
- **`src/components/cluster-review/ArticleReviewCard.tsx` line 235** — Update preview URL domain

### 7. Fix `src/hooks/useSitemapGeneration.ts`

- **Line 4**: Change `BASE_URL` to `"https://www.everencewealth.com"`
- **Lines 6-12**: Update `SUPPORTED_LANGUAGES` and `langToHreflang` for en/es US

---

### Files modified (summary)
- `public/sitemaps/en/blog.xml` — regenerated from database
- `public/sitemaps/en/qa.xml` — regenerated from database
- `src/pages/QAIndex.tsx` — subtitle + categories
- `src/pages/BlogArticle.tsx` — 2 error title strings
- `src/lib/glossarySchemaGenerator.ts` — GLOSSARY_NAMES
- `src/pages/Sitemap.tsx` — BASE_URL + languages
- `src/hooks/useSitemapGeneration.ts` — BASE_URL + languages
- `src/components/cluster-review/ArticleReviewCard.tsx` — preview URL
- 8 scripts in `scripts/` — domain + org references

### What is NOT touched
- No database tables dropped or modified
- No edge functions changed
- No blog article content changed

