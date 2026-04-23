

## Purge remaining Del Sol / Costa del Sol / Real Estate / Hans Beeckman legacy references

### What I found

The prior "Deep Purge" left significant residue. A full audit surfaced legacy references in these buckets:

**1. Spanish/European city names used as wealth-strategy keys** (~23 files)
`marbella`, `estepona`, `fuengirola`, `benalmadena`, `sotogrande`, `malaga`, `mijas`, `casares`, `manilva` are used as object keys in `src/i18n/translations/en.ts`, `es.ts`, `src/constants/home.ts`, `scripts/generateStaticLocationHub.ts`, `scripts/generateStaticComparisonPages.ts`, edge functions, and admin tools. Many have US display names (e.g. `{ id: 'marbella', name: 'El Paso' }`), but the internal slugs still read as Costa del Sol cities.

**2. Apartments / Property / Villas / Penthouses system** (17+ files)
`src/pages/ApartmentsAuth.tsx`, `src/pages/apartments/**`, `src/components/apartments/*` (Hero, Lightbox, MasonryGrid, PropertyTile, LeadFormModal, PropertiesSection), `src/pages/landing/*` (mentions "Apartments & Penthouses", "Townhouses & Villas"), `src/translations/landing/en.json` header menu, `src/hooks/usePropertyGallery.ts`, admin apartments editor routes. This is the old real-estate listings/gallery system.

**3. Explicit "Costa del Sol" / "Spain" / "€" / "Mediterranean" copy**
- `src/i18n/translations/en.ts` line 353 `costaDelSolSpain: "United States"` (key name is a fossil)
- `src/i18n/translations/es.ts` line 326 same key
- `functions/_middleware.js` 404 block regex for `/blog/costadelsol/`
- `src/pages/admin/BOFUPageGenerator.tsx` — whole page generates "Property Buying Costs in Spain", "NIE Number Spain", "Spanish Mortgage", "Digital Nomad Visa Spain"
- `src/pages/admin/AITools.tsx` — demo prompts about buying property in Spain
- `src/pages/admin/AEOGuide.tsx` — Estepona / El Paso East rental yields copy
- `SCHEMA_DOCUMENTATION.md`, `TESTING_CHECKLIST.md` — El Paso/Estepona/Fuengirola example docs
- `src/pages/crm/admin/CrmSettings.tsx` — Villa property_type example, El Paso lead example
- `src/components/crm/AddAgentModal.tsx` — default timezone `Europe/Madrid`
- `src/lib/glossarySchemaGenerator.ts` — Fuengirola, Málaga, 29640 postal code in PostalAddress schema
- `src/components/crm/admin/CreateRoutingRuleDialog.tsx` — placeholder "marbella, malaga, estepona"
- `src/hooks/useSystemVerification.ts` — test data "El Paso, Estepona"
- `src/pages/admin/SEOStatusChecker.tsx` — example `/de/locations/marbella/buying-guide`
- `scripts/generateThankYouImages.ts` — `marbella-lifestyle.jpg`
- `propagate_translations.py` — hardcoded path `DEL SOL Prime Homes 2.0`

**4. Competitor/Block domain lists referencing real estate**
- `src/lib/competitorDetection.ts` — 45+ real-estate domains + keywords `realtor`, `realestate`, `property`, `homes`, `villa`
- `src/lib/domainLanguageValidator.ts` — `realestate`, `realtor`, `inmobiliaria`, `vastgoed`, `makelaar` patterns
- `supabase/functions/find-external-links/index.ts`, `discover-cluster-citations/index.ts`, `regenerate-cluster-links/index.ts` — same competitor lists and geographic heuristics

**5. JSON-LD Schema types leaking real-estate**
- `scripts/generateStaticComparisonPages.ts` — `"@type": "RealEstateAgent"`
- `src/lib/testUtils.ts` — tests still accept `RealEstateAgent` schema as valid Organization

**6. Brochure hero image assets**
- `src/assets/brochures/marbella-hero.jpg`, `estepona-hero.jpg`, `sotogrande-hero.jpg`, `malaga-hero.jpg` — imported in `src/constants/home.ts`

**7. No direct person-name hits** — `Hans Beeckman`, `Cédric Van Hecke`, `Steven Roberts`, `delsolprimehomes` return **zero** matches in `src/`, `scripts/`, `functions/`, `index.html`. Residue is only in `supabase/migrations/*.sql` (historical files — not executed on rebuild).

**8. DB migrations** — 14 historical SQL migration files contain Del Sol / Hans Beeckman / Marbella seed data. These are **historical records already applied** and should NOT be edited (editing past migrations breaks the migration graph). Instead, any lingering DB rows they seeded need a new cleanup migration.

### Plan

I'll split this into five focused phases. Approve and I'll execute them in sequence.

---

**Phase 1 — Rename city slugs to US-state concepts in translations & constants**

Rewrite all translation keys and constants so Spanish city names disappear from the code:

- `src/i18n/translations/en.ts` + `es.ts`:
  - `cities.{marbella|estepona|malaga|sotogrande}` → `strategies.{indexed|annuity|roth|estate}`
  - `areas.{marbella|estepona|fuengirola|benalmadena|mijas|sotogrande|malaga|casares|manilva}` → `strategies.{indexedLife|annuities|roth|estate|longTermCare|taxDiversification|socialSecurity|assetProtection|businessSuccession}`
  - Drop the fossil key `costaDelSolSpain` entirely (replace with `servingArea: "United States"`)
  - Update every consumer of those keys
- `src/constants/home.ts`:
  - `FEATURED_AREAS` items keyed by `marbella/estepona/...` → `indexed/annuity/roth/estate` with proper US strategy names; drop brochure hero image imports and use existing wealth-strategy imagery (or neutral placeholders)
  - Delete unused `src/assets/brochures/*-hero.jpg` imports (files themselves can stay until Phase 5 asset cleanup)

**Phase 2 — Remove/rename the Apartments/Property/Villas system**

The Apartments section is a leftover real-estate listings UI. Decision point needed:

- **Option A (recommended):** Fully remove. Delete `src/pages/ApartmentsAuth.tsx`, `src/pages/apartments/`, `src/components/apartments/`, `src/hooks/usePropertyGallery.ts`, landing-page apartments/villas sections (`src/components/landing/*` tiles), and related admin editor pages. Remove routes from the router. Remove `apartments_editor` role references. Remove the menu items "Apartments", "Penthouses", "Townhouses", "Villas" from `src/translations/landing/*.json` and all header components. Keep the DB tables but stop reading from them.
- **Option B:** Keep the scaffolding, rename to "Strategies Gallery" — significant refactor; still leaves legacy behavior.

I'll default to **Option A** unless you say otherwise in the next message. *(This is the only decision point; everything else below is automatic.)*

**Phase 3 — Purge "Spain / Costa del Sol / €" from admin tools, CRM, tests, docs**

- `src/pages/admin/BOFUPageGenerator.tsx` — replace the 4 Spain-themed generator presets with US wealth presets (e.g. "Roth Conversion Strategy", "Social Security Optimization", "IUL vs 401k", "Estate Planning Basics"). Remove `'costa-del-sol-property-buying-costs'` slug.
- `src/pages/admin/AITools.tsx` — rewrite demo prompts to wealth topics (no Spain, no property).
- `src/pages/admin/AEOGuide.tsx` — rewrite the 2 sample answer blocks (remove Estepona rental yield example, replace with IUL/annuity wealth example).
- `src/pages/admin/SEOStatusChecker.tsx` — change example URL from `/de/locations/marbella/buying-guide` to `/en/strategies/indexed-life`.
- `src/pages/crm/admin/CrmSettings.tsx` — change `property_type: "Villa"` / `areas_of_interest: ["El Paso", "downtown"]` to `strategy_interest: "IUL"` / `states_of_interest: ["CA", "TX"]`.
- `src/hooks/useSystemVerification.ts` — change test `locationPreference: ["El Paso", "Estepona"]` and `budgetRange: "€500K-€1M"` to US values (`["CA", "TX"]` and `"$500K-$1M"`).
- `src/components/crm/AddAgentModal.tsx` — default timezone `Europe/Madrid` → `America/Los_Angeles`.
- `src/components/crm/admin/CreateRoutingRuleDialog.tsx` — placeholder `marbella, malaga, estepona` → `california, texas, florida`.
- `src/lib/glossarySchemaGenerator.ts` — replace Fuengirola PostalAddress with `BUSINESS.address` from `src/config/business.ts` (San Francisco, CA 94105).
- `scripts/generateStaticLocationHub.ts` — `CITIES` array uses `slug: 'marbella'` while `name: 'El Paso'`; make slug match state (`slug: 'california'`, etc.), or delete the location hub entirely if it no longer makes sense. (I'll default to renaming slugs to US-state slugs.)
- `scripts/generateStaticComparisonPages.ts` — change `"@type": "RealEstateAgent"` → `"@type": "FinancialService"`; change `City` entries (Estepona, Fuengirola, Benalmádena) → US cities (San Francisco, Los Angeles, San Diego) or remove.
- `scripts/generateThankYouImages.ts` — rename `marbella-lifestyle.jpg` → `wealth-lifestyle.jpg` (asset rename deferred to Phase 5).
- `src/lib/testUtils.ts` — remove `RealEstateAgent` from accepted organization schema types.
- `functions/_middleware.js` — keep the 404 block regex for `/blog/costadelsol/` (it blocks legacy URLs, which is desired) but add a comment; no copy change needed.
- Delete `propagate_translations.py` (legacy script with hardcoded old project path).
- `SCHEMA_DOCUMENTATION.md`, `TESTING_CHECKLIST.md` — update El Paso/Estepona/Fuengirola examples to US states. (Lower priority; docs only.)

**Phase 4 — Competitor domain lists & real-estate keyword heuristics**

These lists exist so the citation/link-finder system doesn't cite real-estate competitors — they are correct in spirit. But they're bloated and signal the old domain. Clean up:

- `src/lib/competitorDetection.ts` — strip the 45 real-estate-specific domain entries and replace with wealth-management competitor domains (Fidelity, Vanguard, Schwab, Edward Jones, etc. — only if flagged as competitors; otherwise empty list). Keep generic "competitor keywords" list but swap `realtor/realestate/property/homes/villa` for wealth terms (`retirement-plan-seller`, `annuity-broker`, etc.) — or leave empty if no competitor blocking is actually needed for this domain.
- `src/lib/domainLanguageValidator.ts` — remove `realestate/realtor/property/inmobiliaria/immobilien/vastgoed/makelaar` from competitor patterns.
- `supabase/functions/find-external-links/index.ts`, `discover-cluster-citations/index.ts`, `regenerate-cluster-links/index.ts` — same cleanup: strip real-estate competitor domains and geographic Marbella/Malaga/Estepona heuristics; replace with wealth-management equivalents.

**Phase 5 — DB cleanup migration (new migration, no edits to historical ones)**

Historical migration files (`20251119...`, `20251117...`, `20251214...`, `20251221...`, `20251227...`) contain seed data like `blocked_domains`, `approved_domains`, `about_page_content` with Del Sol / Hans Beeckman / Marbella text. These files must NOT be edited. Instead, create **one new migration** that:

1. `DELETE FROM blocked_domains WHERE category IN ('competitor', 'real_estate', 'property_portal', 'listing_site') OR reason ILIKE '%real estate%' OR reason ILIKE '%costa del sol%'` — clears the seeded real-estate domain blocklist rows.
2. `DELETE FROM approved_domains WHERE category ILIKE '%Real Estate%'` — clears real-estate competitor blocklist rows.
3. `DELETE FROM about_page_content WHERE meta_title ILIKE '%Del Sol%' OR content ILIKE '%Hans Beeckman%' OR content ILIKE '%Costa del Sol%'` — clears the seeded Del Sol "About" content row.
4. `UPDATE locations SET ... WHERE slug IN ('marbella','estepona','fuengirola','benalmadena','sotogrande','malaga','mijas','casares','manilva')` — either delete or rename to US-state slugs, depending on whether the locations hub stays (Phase 3 decision).
5. Any remaining tables with Marbella/Spain text (I'll query first with `supabase--read_query` to confirm which tables still hold legacy content before adding DELETEs).

**Phase 6 — Asset cleanup**

Delete `src/assets/brochures/marbella-hero.jpg`, `estepona-hero.jpg`, `sotogrande-hero.jpg`, `malaga-hero.jpg` once Phase 1 has decoupled them.

---

### Question before I proceed

**Apartments/Property/Villas system** — confirm **Option A (fully remove)** vs **Option B (rename & keep)**? Default is A.

### Verification

After all phases:

```
grep -riE "(del ?sol|delsol|prime homes|hans ?beeckman|marbella|estepona|fuengirola|benalmadena|sotogrande|mijas|casares|manilva|costa del sol|costadelsol|real ?estate|realtor|inmobiliaria|€|mediterranean|spain|spanish)" \
  src/ scripts/ public/ index.html functions/ --exclude-dir=node_modules
```

must return **zero** matches except:
- `functions/_middleware.js` — intentional 404 redirect block for legacy URLs
- `supabase/migrations/` — historical, not edited
- `supabase/functions/*-cluster-*` competitor-domain arrays IF you choose to keep them as a defensive citation filter (I'll default to stripping them)
- `public/glossary/en.json` glossary definitions if any term genuinely references real estate (I'll check and exclude only if SEO-relevant; likely none)

A SQL spot-check:
```sql
SELECT COUNT(*) FROM blocked_domains WHERE reason ILIKE '%real estate%'; -- expect 0
SELECT COUNT(*) FROM about_page_content WHERE content ILIKE '%Hans Beeckman%'; -- expect 0
SELECT COUNT(*) FROM locations WHERE slug IN ('marbella','estepona','fuengirola'); -- expect 0
```

### Out of scope

- Historical `supabase/migrations/*.sql` files are NOT edited (would break migration graph).
- Published blog article *body* content in the database is not rewritten in bulk; however, I'll offer a follow-up SQL query to find and list any articles whose body still contains "Marbella"/"Costa del Sol" so you can decide per-article.
- No changes to the React framework, routing architecture, or auth.

