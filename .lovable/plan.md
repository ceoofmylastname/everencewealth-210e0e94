

## Rebrand Cleanup -- Phase 2: Remaining ~100 Files

Continuing the systematic removal of all "Costa del Sol", "Del Sol Prime Homes", and real estate references from the remaining files not yet cleaned up.

---

### Batch 1: Edge Functions (3 remaining)

| File | Changes |
|---|---|
| `supabase/functions/generate-comparison-batch/index.ts` | Remove "Location: Costa del Sol, Spain" from prompt template, update "real estate photography" image prompt to "professional financial advisory" style, remove Spain/Marbella references from meta_title instructions |
| `supabase/functions/generate-brochure-images/index.ts` | Replace all 4 image prompts -- remove "Costa del Sol, Spain", "Mediterranean coastal cityscape", "luxury villa", "luxury marina" references. Replace with generic `{cityName}` professional cityscape prompts |
| `supabase/functions/find-citations-gemini/index.ts` | Replace competitor list (Marbella real estate agencies) with financial services competitors. Update comment "Marbella/Costa del Sol agencies" |

---

### Batch 2: Frontend Components (31 files)

**High-impact visible components:**

| File | Change |
|---|---|
| `src/pages/crm/CrmLogin.tsx` | Line 257: placeholder `"agent@delsolprimehomes.com"` to `"agent@everencewealth.com"`. Line 368: `"COSTA DEL SOL LUXURY REAL ESTATE"` to `"EVERENCE WEALTH MANAGEMENT"` |
| `src/components/about/AboutCTA.tsx` | Line 33: fallback `"Costa del Sol journey"` to `"wealth planning journey"`. Line 72: `"info@delsolprimehomes.com"` to `"info@everencewealth.com"`. Line 30: fallback `"Dream Property"` to `"Financial Freedom"` |
| `src/components/location/LocationHero.tsx` | Lines 73, 79, 164, 179: Remove "Costa del Sol" from alt text fallbacks, subtitle, and badge. Replace with just `{cityName}` |
| `src/components/brochures/CrossCityDiscovery.tsx` | Line 98: `"Costa del Sol"` badge text to location name |
| `src/components/landing/PropertiesShowcase.tsx` | Line 267: `"Costa del Sol"` to empty or remove location property |
| `src/components/landing/Features.tsx` | Line 58: `"Costa del Sol property"` to `"retirement strategy"` |
| `src/components/AIImageGenerator.tsx` | Lines 209, 217: Remove Costa del Sol from example prompts |
| `src/components/location-hub/HubFAQSection.tsx` | Replace entire hardcoded FAQ content (EN/NL/DE/FR etc.) with financial planning FAQs for EN/ES only |
| `src/components/article-editor/BasicInfoSection.tsx` | Line 62: placeholder to financial planning example |
| `src/components/admin/not-found-resolver/LanguageMismatchTab.tsx` | Line 198: `delsolprimehomes.com` to `everencewealth.com` |
| `src/components/team/TeamMemberModal.tsx` | Line 57: `"Costa del Sol properties"` to `"wealth strategies"` |
| `src/components/buyers-guide/BuyersGuideCTA.tsx` | Line 93: `"info@delsolprimehomes.com"` to `"info@everencewealth.com"` |
| `src/components/crm/AddAgentModal.tsx` | Line 133: placeholder to `"agent@everencewealth.com"` |
| `src/components/apartments/ApartmentsPropertiesSection.tsx` | Line 172: `"Handpicked residences on the Costa del Sol"` to remove |

All other component files with matches will follow the same pattern: replace brand/location references with Everence Wealth equivalents.

---

### Batch 3: Translation Files -- Delete Dead Code

Since only EN and ES are supported, these files are dead code and will be deleted:

**Delete entirely (property finder -- not imported in index.ts):**
- `src/i18n/translations/propertyFinder/da.ts`
- `src/i18n/translations/propertyFinder/de.ts`
- `src/i18n/translations/propertyFinder/fi.ts`
- `src/i18n/translations/propertyFinder/fr.ts`
- `src/i18n/translations/propertyFinder/hu.ts`
- `src/i18n/translations/propertyFinder/nl.ts`
- `src/i18n/translations/propertyFinder/no.ts`
- `src/i18n/translations/propertyFinder/pl.ts`
- `src/i18n/translations/propertyFinder/sv.ts`

**Delete entirely (buyers guide -- not imported in index.ts):**
- `src/i18n/translations/buyersGuide/da.ts`
- `src/i18n/translations/buyersGuide/de.ts`
- `src/i18n/translations/buyersGuide/fi.ts`
- `src/i18n/translations/buyersGuide/fr.ts`
- `src/i18n/translations/buyersGuide/hu.ts`
- `src/i18n/translations/buyersGuide/nl.ts`
- `src/i18n/translations/buyersGuide/no.ts`
- `src/i18n/translations/buyersGuide/pl.ts`
- `src/i18n/translations/buyersGuide/sv.ts`

**Delete entirely (main translations -- not imported in index.ts):**
- `src/i18n/translations/da.ts`
- `src/i18n/translations/de.ts`
- `src/i18n/translations/fi.ts`
- `src/i18n/translations/fr.ts`
- `src/i18n/translations/hu.ts`
- `src/i18n/translations/it.ts`
- `src/i18n/translations/nl.ts`
- `src/i18n/translations/no.ts`
- `src/i18n/translations/pl.ts`
- `src/i18n/translations/ru.ts`
- `src/i18n/translations/sv.ts`
- `src/i18n/translations/tr.ts`

**Delete entirely (landing translations -- legacy JSON files):**
- `src/translations/landing/da.json`
- `src/translations/landing/de.json`
- `src/translations/landing/fi.json`
- `src/translations/landing/fr.json`
- `src/translations/landing/hu.json`
- `src/translations/landing/nl.json`
- `src/translations/landing/no.json`
- `src/translations/landing/pl.json`
- `src/translations/landing/sv.json`

**Update imports in files that reference deleted translations:**
- `src/components/landing/TestimonialsSection.tsx` -- remove imports of nl/de/fr/fi/pl/da/hu/sv/no
- `src/pages/OptIn.tsx` -- remove imports of nl/fr/de/da/fi/pl/hu/sv/no

---

### Batch 4: Update EN/ES Translation Files

- `src/i18n/translations/propertyFinder/en.ts` -- Replace "Costa del Sol Real Estate" with "Everence Wealth", remove property/real estate language
- `src/i18n/translations/en.ts` -- Update all Costa del Sol and real estate references to wealth management
- `src/translations/landing/en.json` -- Update brand references

---

### Batch 5: Constants and Config

| File | Change |
|---|---|
| `src/constants/home.ts` | Lines 59, 65: Remove "Costa del Sol" from city descriptions |
| `src/constants/brochures.ts` | Line 2: Remove "Costa del Sol" comment, update image descriptions |
| `public/cloudflare-worker.js` | Update all `delsolprimehomes` references to `everencewealth`, update comments |
| `public/facts.json` | Update brand references |

---

### Batch 6: Sitemaps (informational)

The `public/sitemaps/` directory contains static XML sitemaps with hundreds of `delsolprimehomes.com` URLs. These will need regeneration when the domain changes but can be addressed separately since they point to the old domain anyway.

---

### Summary

| Category | Files affected | Action |
|---|---|---|
| Edge functions | 3 | Update prompts |
| Frontend components | ~15 | Replace strings |
| Dead translation files | ~30 | Delete |
| Translation imports | 2 | Clean up imports |
| EN/ES translations | ~3 | Update content |
| Constants/config | ~4 | Update strings |
| **Total** | **~57 files** | |

