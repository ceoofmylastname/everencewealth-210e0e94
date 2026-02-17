

# Domain Consolidation: Switch All URLs to everencewealth.com

## Overview
There are ~94 files containing "delsolprimehomes" references that need to be updated to "everencewealth.com". This is a comprehensive find-and-replace across the entire project.

## Scope of Changes

### Category 1: Source Code (28 .ts/.tsx files)
Key files with `BASE_URL` or hardcoded domain references:

- `src/lib/schemaGenerator.ts` -- structured data schema with old domain, org name, email, phone
- `src/lib/glossarySchemaGenerator.ts` -- BASE_URL constant
- `src/hooks/useCanonicalBackfill.ts` -- BASE_URL constant
- `src/pages/admin/RedirectChecker.tsx` -- BASE_URL constant
- `src/pages/admin/BrochureManager.tsx` -- preview URL display
- `src/pages/admin/AEOGuide.tsx` -- example canonical URL
- `src/components/dev/WebhookPayloadPreview.tsx` -- sample webhook payloads
- `src/components/cluster-review/GooglePreview.tsx` -- Google SERP preview
- `src/types/hreflang.ts` -- JSDoc examples
- `scripts/generateSitemap.ts` -- BASE_URL constant
- `scripts/generateStaticComparisonPages.ts` -- BASE_URL constant
- `scripts/testAllLanguagesQA.ts` -- BASE_URL constant
- Plus ~16 more files (edge functions, other components)

### Category 2: Public Static Files (30+ XML/TXT files)
- `public/robots.txt` -- Sitemap URL and domain references
- `public/sitemap.xml` -- already uses everencewealth.com (correct)
- `public/sitemap-index.xml` -- already uses everencewealth.com (correct)
- `public/sitemap-core.xml` -- all URLs use delsolprimehomes
- `public/ai.txt` -- attribution references
- `public/sitemaps/brochures.xml` -- all URLs
- `public/sitemaps/glossary.xml` -- all URLs
- `public/sitemaps/{da,de,en,fi,fr,hu,nl,no,pl,sv}/` -- all language-specific sitemaps (index.xml, blog.xml, qa.xml, locations.xml, comparisons.xml)

### Category 3: Documentation (2 .md files)
- `docs/CRM_GMAIL_FILTER_SETUP_AGENTS.md` -- email sender domain
- `docs/CRM_GMAIL_FILTER_SETUP_ADMINS.md` -- email sender domain

### Category 4: Edge Functions (~10 files in supabase/functions/)
- Various edge functions with hardcoded domain references

## Approach
A global find-and-replace of all variations:
- `https://www.delsolprimehomes.com` -> `https://www.everencewealth.com`
- `www.delsolprimehomes.com` -> `www.everencewealth.com`
- `delsolprimehomes.com` -> `everencewealth.com`
- `info@delsolprimehomes.com` -> `info@everencewealth.com`
- `crm@notifications.delsolprimehomes.com` -> `crm@notifications.everencewealth.com`
- `"Del Sol Prime Homes"` -> `"Everence Wealth"` (in schema/structured data)

Also update the brand identity in `src/lib/schemaGenerator.ts` (org name, description, address, phone number) to match the Everence Wealth identity already established in `src/constants/home.ts`.

## Technical Details

### Files already correct (no changes needed)
- `public/sitemap.xml` -- already everencewealth.com
- `public/sitemap-index.xml` -- already everencewealth.com
- `src/hooks/useSitemapGeneration.ts` -- already everencewealth.com

### Database consideration
Past migrations contain old domain references but those are historical records and should NOT be modified.

### Estimated file count
~94 files will be touched. This will be done methodically file-by-file or in batches by category.

