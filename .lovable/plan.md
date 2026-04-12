

## Phase 0.5: Deep Purge

Complete removal of all Del Sol Prime Homes / real estate contamination. No database changes. Immutable migration files untouched.

---

### GROUP A: Delete files entirely (~30+ files)

**Retargeting system:**
- `src/components/retargeting/` — entire directory (16 files)
- `src/pages/RetargetingLanding.tsx`
- `src/lib/retargetingTranslations.ts`
- `src/lib/retargetingRoutes.ts`
- `src/config/retargetingWelcomeBackVideos.ts`
- `src/hooks/useRetargetingForm.ts`

**Property system:**
- `src/pages/AddProperty.tsx`, `src/pages/PropertyFinder.tsx`, `src/pages/PropertyDetail.tsx`
- `src/pages/AdminProperties.tsx`, `src/pages/admin/PropertyForm.tsx`
- `src/types/property.ts`, `src/hooks/usePropertyTypes.ts`

**Brochure system:**
- `src/pages/CityBrochure.tsx`
- `src/components/brochures/` — entire directory (9 files)
- `src/constants/brochures.ts`, `src/lib/brochureSchemaGenerator.ts`

**Home sections (legacy):**
- `src/components/home/sections/FeaturedAreas.tsx`
- `src/components/home/sections/QuickSearch.tsx`

**Edge functions (legacy real estate):**
- `generate-retargeting-visual/`, `generate-city-qa-pages/`, `fetch-property-types/`, `fetch-locations/`, `search-properties/`, `get-property-details/`, `translate-property-description/`, `generate-brochure-content/`, `generate-brochure-images/`, `generate-location-image/`

---

### GROUP B: Update `src/App.tsx`

Remove lazy imports and routes for all deleted pages: `RetargetingLanding`, `CityBrochure`, `AddProperty`, `PropertyFinder`, `PropertyDetail`, `AdminProperties`, `PropertyForm`. Remove `PropertyRedirect` component. Remove routes for `/en/welcome-back`, `/es/bienvenido`, `/brochure/*`, `/add-property`, `/:lang/properties`, `/:lang/property/*`, `/admin/properties/*`, property legacy redirects.

---

### GROUP C: Update edge functions (persona swap)

| Function | Change |
|----------|--------|
| `serve-seo-page` | Hans Beeckman → Steven Rosenberg, Senior Wealth Strategist |
| `resume-cluster` | System prompt → "expert independent financial advisor specializing in tax-free retirement strategies, IUL, and wealth protection." Image prompts → professional financial imagery |
| `generate-missing-articles` | Same persona swap + remove Costa del Sol expansion instructions |
| `generate-10lang-qa` | Prompt → wealth management context, category → "Wealth Management" |
| `translate-glossary` | Remove Spanish city terms, update domain from "real estate" to "financial planning" |
| `regenerate-sitemap` | Remove PropertyData interface + property sitemap generation |
| `discover-cluster-citations` | Update prompt context from real estate to wealth management |
| `auto-enhance-citations` | Update competitor domain list |
| `find-citations-gemini` + `find-citations-perplexity` | Update blocking keywords |

---

### GROUP D: Update build scripts (8 files)

- `generateStaticPages.ts` — Replace org description, remove WIKIDATA city entities, remove cities array
- `generateStaticQAPages.ts` — Replace all "property in Costa del Sol" copy
- `generateStaticHomePage.ts` — Replace keywords meta
- `generateStaticComparisonPages.ts` — Replace descriptions, remove areaServed cities
- `generateStaticAboutPage.ts` — Remove Hans Beeckman bio, Spanish address
- `generateStaticLocationPages.ts` — Remove Spain/Costa del Sol region references
- `generate-hero-images.ts` — Replace all 9 villa prompts with financial imagery
- `generateSitemap.ts` — Remove LOCATION_CITIES array

---

### GROUP E: Update admin UI placeholders (9 files)

Replace real estate placeholders/examples with wealth management equivalents in: `ClusterGenerator`, `ArticleEditor`, `AEOGuide`, `BOFUPageGenerator`, `QAGenerator`, `ComparisonGenerator`, `QASection`, `AIImageGenerator`, `WebhookPayloadPreview`.

---

### GROUP F: Update documentation (20 files)

- `docs/AUTHORITY_POLICY.md` — Steven Rosenberg, everencewealth.com entity
- All `docs/crm/` files (12) — "Del Sol Prime Homes CRM" → "Everence Wealth CRM"
- CRM Gmail filter docs (4) — Update sender domain
- `ADMIN_GUIDE.md`, `LINK_VALIDATION_GUIDE.md`, `DEPLOYMENT_SSG_CHECKLIST.md`, `SCHEMA_DOCUMENTATION.md` — Replace all real estate examples

---

### GROUP G: Clean remaining source files

- `src/constants/home.ts` — Remove brochure hero image imports and city data
- `src/i18n/translations/en.ts` + `es.ts` — Remove `featuredAreas` block
- `src/pages/crm/admin/CrmSettings.tsx` — Remove Marbella/Puerto Banús examples
- `src/components/landing/TestimonialSection.tsx` — Update if real estate focused

---

### Verification

After all changes, run grep for: `delsolprimehomes`, `del sol`, `Costa del Sol`, `Hans Beeckman`, `Marbella`, `real estate`, `Mediterranean`, `NIE`, `Spain`, `property`. Every result must be zero or limited to immutable `supabase/migrations/` files.

### What is NOT touched
- No database tables dropped or modified
- `supabase/migrations/` files (immutable)
- `src/integrations/supabase/client.ts` and `types.ts`

