
# Complete Buyers Guide Multilingual Implementation

## Problem Summary
The Buyers Guide has translation files created for 10 languages, but all 9 section components are still hardcoded in English. Only the page-level meta tags are working because they use the `useBuyersGuideTranslation` hook.

## Solution: Wire Translations to All Components

### Architecture Change
Each component will import and use the `useBuyersGuideTranslation` hook to access the `t` translation object, replacing all hardcoded English strings.

### Components to Update (9 total)

#### 1. BuyersGuideHero.tsx
Replace hardcoded strings with translations:
- Badge: `"Complete 2024 Guide"` -> `{t.hero.badge}`
- Headline: `"The Complete Guide to Buying Property on the"` -> `{t.hero.headline}`
- Highlight: `"Costa del Sol"` -> `{t.hero.headlineHighlight}`
- Subheadline: Full paragraph -> `{t.hero.subheadline}`
- Scroll text: `"Scroll to explore"` -> `{t.hero.scrollText}`
- Stats array: Build from `t.hero.stats` object

#### 2. SpeakableIntro.tsx
Replace hardcoded strings:
- Badge: `"Quick Answer"` -> `{t.speakable.badge}`
- Title: `"AI-Ready Summary"` -> `{t.speakable.title}`
- Labels: `"Extra Costs"`, `"Months"`, `"Visa Income"` -> `{t.speakable.extraCosts}`, etc.
- Paragraphs: Full content -> `{t.speakable.paragraph1}`, `{t.speakable.paragraph2}`

#### 3. ProcessTimeline.tsx
Replace hardcoded strings:
- Badge: `"Step-by-Step Process"` -> `{t.process.badge}`
- Headline: `"Your Journey to Ownership"` -> `{t.process.headline}`
- Subheadline -> `{t.process.subheadline}`
- Steps array: Replace `defaultBuyingSteps` with `t.process.steps`
- Labels: `"Required Documents"` -> `{t.process.requiredDocuments}`

#### 4. CostBreakdown.tsx
Replace hardcoded strings:
- Badge: `"Transparent Pricing"` -> `{t.costs.badge}`
- Headlines and all labels -> Use `t.costs.calculator` object
- Cost items: Replace `defaultCosts` with `t.costs.items`
- Breakdown labels -> Use `t.costs.breakdownLabels`

#### 5. LocationShowcase.tsx
Replace hardcoded strings:
- Badge -> `{t.locations.badge}`
- Headline -> `{t.locations.headline}`
- Location names/descriptions -> `{t.locations.areas}`

#### 6. LegalChecklist.tsx
Replace hardcoded strings:
- Badge -> `{t.legal.badge}`
- Headlines and labels -> `{t.legal.*}`
- Checklist items -> `{t.legal.items}`
- Due diligence section -> `{t.legal.dueDiligence}`

#### 7. DigitalNomadVisa.tsx
Replace all hardcoded content with `t.digitalNomad.*` translations

#### 8. BuyersGuideFAQ.tsx
Replace hardcoded strings:
- Badge: `"Common Questions"` -> `{t.faq.badge}`
- Headline -> `{t.faq.headline}`
- Search placeholder -> `{t.faq.searchPlaceholder}`
- FAQ items: Replace `defaultFAQs` import with `t.faq.items`
- "Still have questions?" section -> `{t.faq.stillQuestions}`, etc.

#### 9. BuyersGuideCTA.tsx
Replace hardcoded strings:
- Badge: `"Ready to Start?"` -> `{t.cta.badge}`
- Headline -> `{t.cta.headline}` + `{t.cta.headlineHighlight}`
- Trust signals -> `{t.cta.trustSignals}`
- Contact labels -> `{t.cta.phone}`, `{t.cta.email}`
- Form section -> `{t.cta.form}`

## Implementation Pattern
Each component will follow this pattern:

```typescript
import { useBuyersGuideTranslation } from '@/hooks/useBuyersGuideTranslation';

export const ComponentName: React.FC = () => {
  const { t } = useBuyersGuideTranslation();
  
  // Replace all hardcoded strings with t.section.key
  return (
    <section>
      <h2>{t.section.headline}</h2>
      {/* ... */}
    </section>
  );
};
```

## Technical Details

### Translation File Structure (Already Complete)
All 10 language files follow identical structure with complete translations for:
- EN, NL, DE, FR, SV (fully translated)
- NO, DA, FI, PL, HU (UI strings translated, some inherit English content)

### No Schema Generator Changes
The `buyersGuideSchemaGenerator.ts` will continue to generate English-only JSON-LD schemas (which is correct for SEO - Google recommends consistent schema language).

### Quality Assurance
After implementation:
- Each language version will display 100% translated content
- The language selector will trigger re-render with new translations
- URL structure remains: `/{lang}/buyers-guide`
- No hardcoded English strings will remain

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/buyers-guide/BuyersGuideHero.tsx` | Add hook, replace hardcoded strings |
| `src/components/buyers-guide/SpeakableIntro.tsx` | Add hook, replace hardcoded strings |
| `src/components/buyers-guide/ProcessTimeline.tsx` | Add hook, replace `defaultBuyingSteps` |
| `src/components/buyers-guide/CostBreakdown.tsx` | Add hook, replace `defaultCosts` |
| `src/components/buyers-guide/LocationShowcase.tsx` | Add hook, replace hardcoded strings |
| `src/components/buyers-guide/LegalChecklist.tsx` | Add hook, replace hardcoded strings |
| `src/components/buyers-guide/DigitalNomadVisa.tsx` | Add hook, replace hardcoded strings |
| `src/components/buyers-guide/BuyersGuideFAQ.tsx` | Add hook, replace `defaultFAQs` |
| `src/components/buyers-guide/BuyersGuideCTA.tsx` | Add hook, replace hardcoded strings |

## Expected Outcome
After implementation, switching to Dutch (or any other language) will translate:
- Hero headline and stats
- AI-Ready Summary section
- All 8 process steps with descriptions
- Cost calculator labels and explanations
- Location names and descriptions
- Legal checklist items
- Digital Nomad Visa requirements
- All FAQ questions and answers
- CTA section with testimonial
