

# Emergency Crawlability Fix: Add Client-Side Meta Tags to Q&A Pages

## Problem
All 9,600 Q&A pages have substantial content (666-3,458 chars) in the database, but Google Search Console flags them as "thin content." The root cause: `QAPage.tsx` is the **only** major content page without client-side `<Helmet>` meta tags. Every other content page (BlogArticle, Glossary, LocationHub, ComparisonPage, BuyersGuide, Contact) already uses `react-helmet` for SEO metadata. The comment on line 211 ("SEO tags are handled by server/edge") is misleading -- even if SSR exists, a client-side fallback is essential.

## What Changes

**Single file modification: `src/pages/QAPage.tsx`**

Replace the comment on line 211 with a full `<Helmet>` block that includes:

1. **Title tag** -- uses `meta_title` with fallback to `question_main`
2. **Meta description** -- uses `meta_description` with fallback to first 160 chars of `speakable_answer`
3. **Open Graph tags** -- title, description, type ("article"), image (featured image)
4. **Canonical URL** -- `https://www.delsolprimehomes.com/{language}/qa/{slug}`
5. **Hreflang tags** -- generated from the `translations` JSONB column, plus x-default pointing to the English version
6. **Robots meta** -- standard "index, follow" (no noindex needed since all content is substantial)

## Technical Details

- Import `Helmet` from `react-helmet` (already installed and used across the project)
- Place the `<Helmet>` block inside the successful render path (after line 209, replacing the comment on line 211)
- Follow the exact same pattern used in `BlogArticle.tsx` and `ComparisonPage.tsx` for consistency
- Use `BASE_URL` constant (already defined on line 18) for canonical and hreflang URLs
- The translations object is already available as `qaPage.translations` (Record of lang to slug)

## What Does NOT Change

- No database changes
- No new dependencies
- No edge function changes
- No sitemap changes
- Loading and error states remain unchanged (Helmet only renders when content is available)

