

# Complete Author & E-E-A-T Rebrand: Hans Beeckman/Michael Reynolds to Steven Rosenberg

## Problem

The system has **three conflicting author identities** that all need to become **Steven Rosenberg**:

1. **Hans Beeckman** - Hardcoded in frontend components (`PersonSchema.tsx`, `AuthorByline.tsx`) and 35+ files including all i18n translations. References "Del Sol Prime Homes" and links to delsolprimehomes.com images.
2. **Michael Reynolds, CFP** - Hardcoded in the **master content prompt** (stored in `content_settings` database table), which is the single source of truth for all article generation. Every new article gets "By Michael Reynolds, CFP" in the byline and schema.
3. **Database `authors` table** - Currently empty. The EEATSection component in the article editor references it but there are no author records.

## What Controls Article Content

The **master content prompt** in the `content_settings` table is the single source of truth. Every article generation function (`generate-cluster-chunk`, `generate-missing-articles`, `regenerate-article`, `resume-cluster`) pulls this prompt and feeds it to the AI. Currently it instructs:
- Byline: "By Michael Reynolds, CFP | Senior Wealth Strategist at Everence Wealth"
- Schema author: "Michael Reynolds, CFP" with jobTitle "Senior Wealth Strategist"
- E-E-A-T section: generic "Why Trust Everence Wealth?" without Steven's specific story

## Changes

### 1. Update Master Content Prompt (Database)

Update the `content_settings` record for `master_content_prompt` to replace all "Michael Reynolds, CFP" references with "Steven Rosenberg":

- Schema author: `"name": "Steven Rosenberg"`, `"jobTitle": "Founder & Chief Wealth Strategist"`
- Byline: `By Steven Rosenberg | Founder & Chief Wealth Strategist, Everence Wealth`
- E-E-A-T section template: Replace generic trust section with Steven's specific 25+ year background, 1,200+ families, fiduciary obligation, 75+ carrier partnerships, Three Tax Buckets framework origin story

### 2. Update Frontend Components

**`src/components/schema/PersonSchema.tsx`**
- Replace "Hans Beeckman" with "Steven Rosenberg"
- Replace "Senior Real Estate Advisor" with "Founder & Chief Wealth Strategist"
- Replace delsolprimehomes.com image URLs with everencewealth.com URLs
- Replace "Del Sol Prime Homes" org with "Everence Wealth"
- Replace knowsAbout from real estate topics to financial planning topics (Indexed Universal Life, Tax-Free Retirement, Three Tax Buckets, Fiduciary Planning, Retirement Gap Analysis)

**`src/components/blog-article/AuthorByline.tsx`**
- Replace "Hans Beeckman" with "Steven Rosenberg"
- Replace "Senior Real Estate Advisor" with "Founder & Chief Wealth Strategist, Everence Wealth"
- Add subtitle line: "Independent Fiduciary Advisor | Licensed in 50 States"
- Update image paths from hans-blog/hans-qa to steven-blog/steven-qa (or a generic Everence Wealth author image)

**`src/lib/schemaGenerator.ts`**
- Verify `generatePersonSchema` pulls from the `Author` object dynamically (it does -- no hardcoded names here, so this is fine)

### 3. Create Author Record in Database

Insert Steven Rosenberg into the `authors` table so the article editor's E-E-A-T dropdown works:

```
id: 'steven-rosenberg'
name: 'Steven Rosenberg'
job_title: 'Founder & Chief Wealth Strategist'
bio: 'Steven Rosenberg founded Everence Wealth in 1998...' (full E-E-A-T bio)
credentials: ['Independent Fiduciary Advisor', 'Licensed in 50 States', 'Insurance Professional']
years_experience: 27
is_expert_verified: true
is_licensed_professional: true
```

### 4. Update Existing Articles

Bulk update all articles that reference old author IDs:

```sql
UPDATE blog_articles 
SET author_id = 'steven-rosenberg' 
WHERE author_id = 'hans-beeckman' OR author_id IS NULL;
```

### 5. Edge Functions with Hardcoded Author References

**`supabase/functions/serve-seo-page/index.ts`** (line ~1110)
- Replace "Hans' E-E-A-T requirements" comment with neutral reference

**`supabase/functions/regenerate-article/index.ts`**
- Already pulls master prompt dynamically -- no hardcoded author names

### 6. Agency Hierarchy Fix

**Database migration**: Update the `agency_hierarchy` record that references "Michael Reynolds" as a manager name to "Steven Rosenberg".

---

## What This Does NOT Cover (Phase 4+)

- The 35+ i18n translation files with Hans Beeckman / Del Sol Prime Homes content (these are for the real estate site frontend, which appears to be legacy)
- About page schemas in `aboutSchemaGenerator.ts` (references founders of Del Sol Prime Homes)
- Location page schemas

These are part of the larger Phase 4 cleanup of 100+ frontend files.

## Files Changed

- `src/components/schema/PersonSchema.tsx` -- Steven Rosenberg identity
- `src/components/blog-article/AuthorByline.tsx` -- Steven Rosenberg byline
- `supabase/functions/serve-seo-page/index.ts` -- Remove Hans comment
- Database: Update `content_settings.master_content_prompt`
- Database: Insert author record for Steven Rosenberg
- Database: Bulk update `blog_articles.author_id`
- Database: Update `agency_hierarchy` manager name

