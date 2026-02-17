

## Rebrand Cleanup: Remove All "Del Sol Prime Homes", "Costa del Sol", and Real Estate References

This is a systematic cleanup of **173 files** that still contain legacy branding from the old "Del Sol Prime Homes" real estate identity. The project has been rebranded to **Everence Wealth** (fiduciary wealth management), but many files were missed.

---

### Root Cause of "Los Angeles, Spain"

The `generate-location-image` edge function hardcodes "Costa del Sol, Spain" in its default prompt, alt text, and caption. When you generate a page for "Los Angeles", it produces "Aerial view of Los Angeles, Costa del Sol" -- nonsensical for a US city.

---

### Cleanup Categories

The work is organized from highest-impact to lowest:

#### 1. Edge Functions (backend -- affects generated content)
These produce the "Spain" text users see:

| File | What to fix |
|---|---|
| `supabase/functions/generate-location-image/index.ts` | Default prompt says "Costa del Sol, Spain", alt/caption mention Mediterranean real estate |
| `supabase/functions/generate-brochure-content/index.ts` | References "Mediterranean appeal", "Costa del Sol golf courses" |
| `supabase/functions/generate-missing-captions/index.ts` | Prompt says "Costa del Sol real estate article image" |
| `supabase/functions/generate-comparison/index.ts` | Mentions "Spain/Marbella/Costa del Sol" in headline instructions |
| `supabase/functions/generate-qa-pages/index.ts` | Fallback text "Real estate in Costa del Sol, Spain" |
| `supabase/functions/find-citations-gemini/index.ts` | Competitor list full of Marbella real estate agencies |
| `supabase/functions/create-crm-agent/index.ts` | HTML email says "Del Sol Prime Homes CRM" |
| `supabase/functions/shared/aeoRules.ts` | Example text about "buying property in Costa del Sol" |

**Replacement approach**: Remove geographic defaults entirely. Image prompts will use only `{city_name}` without assuming Spain. Alt/caption text will reference financial planning, not real estate.

#### 2. Schema/SEO Generators (affects structured data)

| File | What to fix |
|---|---|
| `src/lib/locationSchemaGenerator.ts` | Organization schema says "Del Sol Prime Homes", "RealEstateAgent" |
| `src/lib/locationHubSchemaGenerator.ts` | All hub labels reference "Costa del Sol", "Del Sol Prime Homes" |
| `src/lib/aboutSchemaGenerator.ts` | Team bios mention Costa del Sol real estate, old team members |
| `src/lib/generateCostaDelSolImages.ts` | Entire file is Costa del Sol image prompts |
| `src/lib/domainAnalyzer.ts` | Real estate competitor keywords |

**Replacement**: Organization type changes from `RealEstateAgent` to `FinancialService`. All schema references update to "Everence Wealth" with `everencewealth.com` URLs.

#### 3. Frontend Components (~37 files)

| File group | What to fix |
|---|---|
| `src/components/AdminLayout.tsx` | Alt text "Del Sol Prime Homes" |
| `src/components/ApartmentsEditorLayout.tsx` | Same alt text issue |
| `src/components/about/WhyChooseUs.tsx` | "40+ years on the Costa del Sol" |
| `src/components/blog-article/FunnelCTA.tsx` | "dream property in Costa del Sol" |
| `src/components/blog-article/ExpertInsight.tsx` | "Costa del Sol Property Specialist" |
| `src/components/brochures/BrochureDescription.tsx` | "Costa del Sol" badge |
| `src/components/contact/OfficeInfo.tsx` | Map title "Del Sol Prime Homes" |
| `src/components/LanguageMismatchNotFound.tsx` | Title suffix "Del Sol Prime Homes" |
| `src/components/dev/WebhookPayloadPreview.tsx` | Test data with delsolprimehomes URLs |
| `src/components/PropertyHreflangTags.tsx` | BASE_URL = delsolprimehomes.com |

**Replacement**: All brand references become "Everence Wealth", URLs become `everencewealth.com`, descriptions reference financial planning.

#### 4. Translation Files (~20+ files)

| File group | What to fix |
|---|---|
| `src/translations/landing/*.json` | All landing page translations reference Costa del Sol, DelSolPrimeHomes |
| `src/i18n/translations/*.ts` | Property finder, navigation, etc. |
| `src/constants/home.ts` | City descriptions mention "Costa del Sol" |

**Replacement**: Update all translated strings. Since the platform now only supports EN/ES, many of these translation files (Italian, Finnish, Polish, etc.) may be dead code and can be removed entirely.

#### 5. Public/Config Files

| File | What to fix |
|---|---|
| `public/.well-known/ai-plugin.json` | Entire file is Del Sol Prime Homes |
| `public/facts.json` | Source and URL reference old brand |

---

### Implementation Approach

Due to the massive scope (173 files, ~6000 matches), this will be done in systematic batches:

1. **Batch 1**: Edge functions (8 files) -- fixes the "Los Angeles, Spain" issue immediately
2. **Batch 2**: Schema generators and SEO libs (5 files)
3. **Batch 3**: Frontend components (37 files)
4. **Batch 4**: Translation/i18n files and constants (20+ files)
5. **Batch 5**: Public config files (2 files)

### Global Find-and-Replace Rules

| Old | New |
|---|---|
| "Del Sol Prime Homes" | "Everence Wealth" |
| "DSPH" | "Everence" |
| "delsolprimehomes.com" | "everencewealth.com" |
| "Costa del Sol" | Remove or replace with contextual US location |
| "RealEstateAgent" (schema type) | "FinancialService" |
| "real estate" (in descriptions) | "wealth management" / "financial planning" |
| "Mediterranean" (in prompts) | Remove or replace with financial imagery |
| "luxury villas/properties" | "financial advisory" / "retirement planning" |
| "info@delsolprimehomes.com" | "info@everencewealth.com" |

### Dead Code Candidates for Removal

These files appear to be entirely legacy and could be deleted:
- `src/lib/generateCostaDelSolImages.ts` -- Costa del Sol image generation
- Translation files for unsupported languages (IT, FI, PL, DA, etc.) if confirmed unused
- `public/.well-known/ai-plugin.json` -- old ChatGPT plugin config

