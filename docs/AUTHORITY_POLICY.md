# Authority & Trust Policy

## Person Entity
- **Name:** Steven Rosenberg (fixed, never changes)
- **Entity ID:** https://www.everencewealth.com/#steven-rosenberg
- **Job Title:** Founder & Chief Wealth Strategist
- **Photo Context:**
  - Blog posts: `/images/steven-blog.jpg`
  - Q&A pages: `/images/steven-qa.jpg`
- **Person.sameAs:** `[]` — TODO: pending verified personal LinkedIn / official bio URL.
  Do NOT substitute the company LinkedIn page; per schema.org, Person.sameAs must
  point to pages ABOUT THAT PERSON.

## TODO: Pending Assets
- /public/images/steven-blog.jpg — verified headshot of Steven Rosenberg
- /public/images/steven-qa.jpg — verified headshot of Steven Rosenberg

These files must be uploaded BEFORE the `Person.image` field can be re-added
to `PersonSchema.tsx`, `generateStaticTeamPage.ts`, or any other schema.
Do NOT substitute the legacy `hans-*.jpg` files — those are photos of a
different person and substituting them violates schema.org E-E-A-T rules.

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
