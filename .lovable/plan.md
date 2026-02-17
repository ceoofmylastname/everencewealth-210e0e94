
## Update All Cities to US Locations with State Abbreviations

The site still has Spanish cities (Marbella, Estepona, etc.) hardcoded in several places, and the location generator defaults to `region = 'Andalusia'` and `country = 'Spain'`. This plan fixes all of that.

---

### Changes Required

#### 1. Location Generator -- Add State Mapping and Pass US Region/Country
**File: `src/pages/admin/LocationGenerator.tsx`**

- Update `cityOptions` array to include state abbreviations:
  ```
  'Los Angeles, CA'
  'Austin, TX'
  'Phoenix, AZ'
  'New York, NY'
  'Chicago, IL'
  'Houston, TX'
  'San Diego, CA'
  'Dallas, TX'
  'Miami, FL'
  'San Francisco, CA'
  'Denver, CO'
  'Seattle, WA'
  ```
- When calling the edge function, parse the city and state from the selection and pass `region` (state name) and `country: 'United States'` instead of relying on the Spain defaults

#### 2. Edge Function -- Change Defaults from Spain to US
**File: `supabase/functions/generate-location-page/index.ts`**

- Change default values from `region = 'Andalusia'` and `country = 'Spain'` to sensible US defaults (or make them required)

#### 3. QA Generator -- Replace Spanish Cities with US Cities
**File: `src/pages/admin/QAGenerator.tsx`**

- Replace `CITY_OPTIONS` (Marbella, Estepona, Sotogrande, etc.) with US cities matching the location generator list

#### 4. Featured Cities Section -- Remove ", Spain" Display
**File: `src/components/location-hub/FeaturedCitiesSection.tsx`**

- Line 273: Change `{city.region}, Spain` to display the region from the data (which should now be a US state) and country dynamically, or just show `{city.region}`

#### 5. Navbar Image Generator -- Replace Spanish Cities
**File: `src/pages/admin/NavbarImageGenerator.tsx`**

- Replace Marbella/Estepona/etc. city entries with US city equivalents and update prompts to remove "Andalusian architecture", "Costa del Sol" references

#### 6. Buyers Guide Location Showcase -- Replace Spanish Cities  
**File: `src/components/buyers-guide/LocationShowcase.tsx`**

- Replace Marbella/Estepona/Puerto Banus location cards with US city equivalents

#### 7. Entity Extractor -- Replace Spanish City List
**File: `src/lib/entityExtractor.ts`**

- Replace `COSTA_DEL_SOL_CITIES` array with US cities

#### 8. Edge Function Health Monitor -- Update Test Paths
**File: `src/components/admin/seo-monitor/EdgeFunctionHealth.tsx`**

- Update test path URLs from Spanish city slugs to US city slugs

#### 9. Brochure Schema Generator -- Update Address
**File: `src/lib/brochureSchemaGenerator.ts`**

- Change `addressRegion: 'Andalucia'` and `addressCountry: 'ES'` to US values

#### 10. Static Scripts and Sitemaps
**Files: `scripts/generateStaticLocationPages.ts`, `scripts/generateStaticPages.ts`, `scripts/generateStaticLocationHub.ts`, `scripts/generateSitemap.ts`**

- Replace Spanish city arrays with US cities
- Update address country logic from Spain to US

#### 11. Remaining Spain References
**Files: `src/pages/TermsOfService.tsx`, `src/i18n/translations/buyersGuide/en.ts`, `src/lib/buyersGuideSchemaGenerator.ts`**

- Remove references to Spanish law, NIE numbers, ITP tax, and Spanish jurisdiction
- Update to US-appropriate legal/financial content

---

### Summary

| Category | Files | Key Change |
|---|---|---|
| Location Generator UI | 1 | City list with state abbreviations, pass region/country to API |
| Edge function defaults | 1 | Default region/country to US instead of Spain |
| QA Generator | 1 | Replace Spanish city list with US cities |
| Frontend components | 4 | Remove ", Spain" displays, update city lists |
| Schema/SEO generators | 1 | Update address to US |
| Static scripts | 4 | Replace city arrays |
| Legal/content pages | 3 | Remove Spanish legal references |
| **Total** | **~15 files** | |
