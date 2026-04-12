

## Phase 1: Critical Bug Fixes

### 1. Replace `public/robots.txt`
Overwrite with the exact content provided — explicit Allow rules for all AI crawlers, Disallow for `/admin/`, `/api/`, `/portal/`, `/_next/`, `/preview/`, and sitemap reference.

### 2. Add Helmet to `src/pages/BlogArticle.tsx` for published articles
Insert a `<Helmet>` block after the schema markup (line 226) with:
- `<title>{article.meta_title || article.headline} | Everence Wealth</title>`
- `<meta name="description" content={article.meta_description} />`
- `<link rel="canonical" href={article.canonical_url || \`https://www.everencewealth.com/${article.language}/blog/${article.slug}\`} />`
- `og:title`, `og:description`, `og:type="article"`, `og:image` (using article.featured_image_url)
- `og:url` matching canonical
- Hreflang links generated from `article.translations` object (iterate keys to build `<link rel="alternate">` tags)
- Remove the comment "SEO tags are handled by server/edge"

### 3. Add canonical tags globally via individual Helmet blocks
Pages missing Helmet/canonical — add `<Helmet>` with `<title>`, `<meta name="description">`, `<link rel="canonical">`, and basic OG tags to:
- **Home.tsx** — canonical `https://www.everencewealth.com/`
- **BlogIndex.tsx** — canonical `https://www.everencewealth.com/{lang}/blog`
- **QAIndex.tsx** — canonical `https://www.everencewealth.com/{lang}/qa`
- **ComparisonIndex.tsx** — canonical `https://www.everencewealth.com/{lang}/compare`
- **Team.tsx** — canonical `https://www.everencewealth.com/{lang}/team`
- **About.tsx** — already has canonical_url in data but no `<Helmet>` rendering it; add Helmet

No shared `useCanonical` hook needed — each page already has its own lang/slug context. A simple pattern of adding Helmet to each page is cleaner than an abstraction for ~8 pages.

### 4. Fix duplicate meta tags on Glossary
The root `index.html` (lines 54, 74-77) has hardcoded `og:title`, `og:description`, `og:image`, and `twitter:*` tags. These duplicate with any page-level Helmet tags. Fix by removing these OG/Twitter tags from `index.html` — react-helmet on each page will provide the correct values. Keep only the basic `<title>` and `<meta name="description">` in index.html as fallbacks (Helmet overrides these correctly).

### 5. Seed Steven Rosenberg into `team_members` table
Insert one row using the database insert tool:
- **name**: Steven Rosenberg
- **role**: Founder & Chief Wealth Strategist
- **bio**: Brief professional bio referencing 30+ years experience, independent broker philosophy
- **is_founder**: true
- **active**: true
- **display_order**: 1
- **credentials**: `['Licensed Insurance Broker', 'Wealth Strategist']`
- **specializations**: `['Tax-Free Retirement', 'Index Strategies', 'Asset Protection']`
- **languages_spoken**: `['en', 'es']`
- **years_experience**: 30

---

### Files to modify
- `public/robots.txt` — full replace
- `index.html` — remove duplicate OG/Twitter meta tags
- `src/pages/BlogArticle.tsx` — add Helmet block
- `src/pages/Home.tsx` — add Helmet
- `src/pages/BlogIndex.tsx` — add Helmet
- `src/pages/QAIndex.tsx` — add Helmet (canonical + OG)
- `src/pages/ComparisonIndex.tsx` — add Helmet
- `src/pages/Team.tsx` — add Helmet
- `src/pages/About.tsx` — add Helmet
- Database: insert 1 row into `team_members`

