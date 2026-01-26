
# Complete Buyers Guide Translations - Missing Sections

## Problem
The Buyers Guide components are correctly wired to the translation hook, but the translation files for all 9 non-English languages are incomplete. They only contain translations for `hero`, `meta`, `faq`, `cta`, and `speakable` sections, while the following sections fall back to English:

- `legal` (Legal Checklist section - what you see in the screenshot)
- `process` (Process Timeline section)
- `costs` (Cost Breakdown section)
- `locations` (Location Showcase section)
- `digitalNomad` (Digital Nomad Visa section)

## Solution
Add complete translations for all 5 missing sections to each of the 9 non-English language files.

## Files to Update

| File | Status |
|------|--------|
| `src/i18n/translations/buyersGuide/nl.ts` | Add legal, process, costs, locations, digitalNomad |
| `src/i18n/translations/buyersGuide/de.ts` | Add legal, process, costs, locations, digitalNomad |
| `src/i18n/translations/buyersGuide/fr.ts` | Add legal, process, costs, locations, digitalNomad |
| `src/i18n/translations/buyersGuide/sv.ts` | Add legal, process, costs, locations, digitalNomad |
| `src/i18n/translations/buyersGuide/no.ts` | Add legal, process, costs, locations, digitalNomad |
| `src/i18n/translations/buyersGuide/da.ts` | Add legal, process, costs, locations, digitalNomad |
| `src/i18n/translations/buyersGuide/fi.ts` | Add legal, process, costs, locations, digitalNomad |
| `src/i18n/translations/buyersGuide/pl.ts` | Add legal, process, costs, locations, digitalNomad |
| `src/i18n/translations/buyersGuide/hu.ts` | Add legal, process, costs, locations, digitalNomad |

## Content to Translate Per Section

### Legal Section (~25 strings)
- badge, headline, subheadline
- essential, optional, timeline, proTips labels
- 5 items (title, description, status, timeline, tips[])
- dueDiligence: title, description, 10 checks[], helpText, ctaText

### Process Section (~35 strings)
- badge, headline, subheadline, requiredDocuments
- 8 steps (title, description, documents[])

### Costs Section (~30 strings)
- badge, headline, subheadline
- calculator labels (7 strings)
- understanding label
- 8 cost items (name, percentage/amount, description)
- breakdownLabels (7 strings)

### Locations Section (~15 strings)
- badge, headline, viewAll
- 6 areas (name, description)

### Digital Nomad Section (~40 strings)
- badge, headline, subheadline
- lifestyle labels
- benefits (4 items with title + description)
- income labels
- requirements (6 items)
- timeline (4 items)
- learnMore

## Implementation Approach
Each language file will be updated to include professional, culturally-appropriate translations for all sections. The structure will match the English file exactly to ensure type safety.

## Expected Outcome
After implementation:
- Switching to Danish will show "Din Juridiske Tjekliste" instead of "Your Legal Checklist"
- All 10 languages will have 100% translated Buyers Guide content
- No English text will appear when viewing non-English versions
