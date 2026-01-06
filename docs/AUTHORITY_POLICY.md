# Authority & Trust Policy

## Person Entity
- **Name:** Hans Beeckman (fixed, never changes)
- **Entity ID:** https://www.delsolprimehomes.com/#hans-beeckman
- **Job Title:** Senior Real Estate Advisor
- **Photo Context:**
  - Blog posts: `/images/hans-blog.jpg`
  - Q&A pages: `/images/hans-qa.jpg`

## Date Handling Rules

### datePublished
- Set ONCE when article is first published
- NEVER auto-update on build/deploy
- NEVER change unless content is completely rewritten

### dateModified
- Update ONLY when content meaningfully changes:
  - ✅ New Expert Insight added
  - ✅ New Decision Snapshot added
  - ✅ Substantial content rewrite (>30% changed)
  - ✅ Legal/procedural updates (Q&A only)
  - ❌ CSS/layout changes
  - ❌ Internal linking updates
  - ❌ Build/deploy events
  - ❌ Tracking script changes

### Update Frequency
- **Blog posts:** Max 1-2 updates per year
- **Q&A pages:** Max 2-4 updates per year (legal/process changes)

## Consistency Requirements
These MUST match exactly across:
1. Database fields
2. HTML meta tags
3. JSON-LD schema
4. Author byline display

Any mismatch = loss of AI trust.
