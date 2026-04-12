

## Phase 2: Schema & SEO Infrastructure

### 1. Homepage — Organization + FAQPage JSON-LD

**File: `src/pages/Home.tsx`**

Add a `<script type="application/ld+json">` block inside the existing `<Helmet>` with a JSON array containing:
- **FinancialService** schema (name, url, logo, description, address in San Francisco CA, telephone +1-925-433-7724, email info@everencewealth.com, areaServed US, serviceType)
- **FAQPage** schema pulling from the translation file's `t.homepage.faq.items` array (7 items currently in `src/i18n/translations/en.ts` lines 906-913), mapping each `{q, a}` to `{@type: Question, name: q, acceptedAnswer: {text: a}}`

The FAQ data is available at runtime via `useTranslation()` hook — import it and map.

### 2. Blog Article Pages — Full Schema Array

**File: `src/components/schema/ArticleSchema.tsx`**

Expand to accept additional props: `faqs` (array of `{question, answer}`), `authorName`, `authorUrl`, `language`, `slug`. Output a single `<script>` with a JSON array of 3 schemas:

1. **Article** — with full author Person (not just @id), publisher with logo ImageObject, speakable with cssSelector `["h1", ".speakable-summary"]`, datePublished, dateModified, mainEntityOfPage
2. **FAQPage** — from `article.qa_entities` (already rendered in BlogArticle.tsx line 314-320). Map each QA entity's question/answer to Question schema items. Only include if faqs array is non-empty.
3. **BreadcrumbList** — Home → Blog → Article headline

**File: `src/pages/BlogArticle.tsx`**

Update the `<ArticleSchema>` invocation to pass the new props (faqs from `article.qa_entities`, author name/url, language, slug).

### 3. Q&A Pages — Verify and Augment Schema

**File: `src/lib/qaPageSchemaGenerator.ts`**

Current state: outputs QAPage, WebPage, BreadcrumbList, Organization via `generateAllQASchemas`. Speakable is intentionally returning null (line 246-248).

**Fix:** Re-enable speakable in `generateQAPageSchema` by adding a `speakable` property with `cssSelector: [".speakable-answer"]`. The `.speakable-answer` class is already used in `src/pages/QAPage.tsx` line 309.

### 4. Strategy Pages — Add Service Schema

**Files:** `src/pages/strategies/IndexedUniversalLife.tsx`, `WholeLife.tsx`, `TaxFreeRetirement.tsx`, `AssetProtection.tsx`

Each already has WebPage, Article, Breadcrumb, and FinancialService schemas. Add a **Service** schema object to each:
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "[strategy name]",
  "provider": {"@type": "FinancialService", "name": "Everence Wealth", "url": "https://www.everencewealth.com"},
  "description": "[seoDesc variable already defined]",
  "areaServed": "United States"
}
```

Add it as a new `const serviceSchema` and render via existing `<script type="application/ld+json">` pattern.

### 5. Hreflang on Blog Articles — Verify

Already implemented in BlogArticle.tsx lines 239-245. The code iterates `article.translations` and generates `<link rel="alternate" hrefLang>` tags plus one for the current language. This is correct. No changes needed — just confirm during build.

### 6. Sitemap Index Expansion

**File: `public/sitemap.xml`**

Replace with the full sitemap index referencing all content types:
- `en/blog.xml`, `en/qa.xml`, `en/strategies.xml`, `en/glossary.xml`, `en/comparisons.xml`, `en/locations.xml`, `en/guides.xml`, `en/state-guides.xml`
- `es/blog.xml`, `es/qa.xml`
- `static.xml`

Also update `public/sitemap-index.xml` to match.

**Note:** The child sitemaps (strategies.xml, glossary.xml, guides.xml, state-guides.xml, static.xml) need to be generated. Create a one-time script to generate them from Supabase data and static page lists, then write them to `public/sitemaps/`. The static sitemap covers: homepage, about, team, philosophy, contact, glossary, compare, blog, qa, guides, retirement-planning, locations, assessment.

### 7. Build Verification

Run `npx tsc --noEmit` to confirm zero TypeScript errors.

---

### Files modified
- `src/pages/Home.tsx` — add Organization + FAQPage JSON-LD
- `src/components/schema/ArticleSchema.tsx` — expand to output Article + FAQPage + BreadcrumbList array
- `src/pages/BlogArticle.tsx` — pass new props to ArticleSchema
- `src/lib/qaPageSchemaGenerator.ts` — re-enable speakable with `.speakable-answer`
- `src/pages/strategies/IndexedUniversalLife.tsx` — add Service schema
- `src/pages/strategies/WholeLife.tsx` — add Service schema
- `src/pages/strategies/TaxFreeRetirement.tsx` — add Service schema
- `src/pages/strategies/AssetProtection.tsx` — add Service schema
- `public/sitemap.xml` — expand to full index
- `public/sitemap-index.xml` — sync with sitemap.xml
- New static sitemap files generated via script

