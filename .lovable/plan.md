
# Update Founder LinkedIn URLs

## Changes Required

The LinkedIn URLs for the three founders need to be updated across **5 locations**:

| Founder | New LinkedIn URL |
|---------|------------------|
| Steven Roberts | `https://www.linkedin.com/company/delsolprimehomes/` |
| Cédric Van Hecke | `https://www.linkedin.com/company/delsolprimehomes/` |
| Hans Beeckman | `https://www.linkedin.com/in/hansbeeckman/` |

## Files to Modify

### 1. Database Update
Update the `team_members` table for all three founders:
- Steven Roberts: company page URL
- Cédric Van Hecke: company page URL  
- Hans Beeckman: personal profile URL

### 2. `supabase/functions/serve-seo-page/index.ts`
Update the `sameAs` URLs in the SEO structured data (around lines 1060, 1068, 1076)

### 3. `scripts/generateStaticAboutPage.ts`
Update the `linkedin_url` fields in the static founder data (around lines 98, 109, 120)

### 4. `src/lib/aboutSchemaGenerator.ts`
Update the `linkedin_url` fields in the fallback founder data (around lines 54, 65, 76)

### 5. `src/components/schema/PersonSchema.tsx`
Update the `sameAs` array URL (around line 21)

## Summary of Changes

| File | Steven | Cédric | Hans |
|------|--------|--------|------|
| Database | Company URL | Company URL | Personal URL |
| serve-seo-page | Company URL | Company URL | Personal URL |
| generateStaticAboutPage.ts | Company URL | Company URL | Personal URL |
| aboutSchemaGenerator.ts | Company URL | Company URL | Personal URL |
| PersonSchema.tsx | - | - | Personal URL |

This ensures all locations displaying or referencing founder LinkedIn profiles point to the correct URLs.
