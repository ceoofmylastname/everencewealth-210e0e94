# Buyers Guide Multilingual Implementation - Component Wiring

## Status: READY FOR IMPLEMENTATION

The plan was approved and the following 9 components need to be updated to use the `useBuyersGuideTranslation` hook.

## Implementation Summary

All translation files are already in place at `src/i18n/translations/buyersGuide/`. Each component needs to:
1. Import the `useBuyersGuideTranslation` hook
2. Call `const { t } = useBuyersGuideTranslation()` at the start
3. Replace hardcoded English strings with `t.section.key` references

## Files to Update

### 1. BuyersGuideHero.tsx
- Import hook
- Replace badge "Complete 2024 Guide" → `t.hero.badge`
- Replace headline → `t.hero.headline`, `t.hero.headlineHighlight`
- Replace subheadline → `t.hero.subheadline`
- Replace stats array with translated values from `t.hero.stats`
- Replace "Scroll to explore" → `t.hero.scrollText`

### 2. SpeakableIntro.tsx  
- Import hook
- Replace "Quick Answer" → `t.speakable.badge`
- Replace "AI-Ready Summary" → `t.speakable.title`
- Replace "Extra Costs", "Months", "Visa Income" labels
- Replace paragraphs with `t.speakable.paragraph1/2`

### 3. ProcessTimeline.tsx
- Import hook
- Replace `defaultBuyingSteps` import with `t.process.steps`
- Replace badge, headline, subheadline
- Replace "Required Documents" → `t.process.requiredDocuments`

### 4. CostBreakdown.tsx
- Import hook
- Replace `defaultCosts` import with `t.costs.items`
- Replace all calculator labels from `t.costs.calculator`
- Replace breakdown labels from `t.costs.breakdownLabels`

### 5. LocationShowcase.tsx
- Import hook
- Replace badge → `t.locations.badge`
- Replace headline → `t.locations.headline`
- Replace location names/descriptions from `t.locations.areas`
- Replace "View all locations" → `t.locations.viewAll`

### 6. LegalChecklist.tsx
- Import hook
- Replace `checklistItems` array with `t.legal.items`
- Replace `dueDiligenceChecks` with `t.legal.dueDiligence.checks`
- Replace all labels (essential, optional, Timeline, Pro Tips, etc.)

### 7. DigitalNomadVisa.tsx
- Import hook
- Replace `benefits` array with `t.digitalNomad.benefits.items`
- Replace `requirements` array with `t.digitalNomad.requirements.items`
- Replace all headline, subtitle, labels

### 8. BuyersGuideFAQ.tsx
- Import hook
- Replace `defaultFAQs` import with `t.faq.items`
- Replace badge, headline, search placeholder
- Replace "Still have questions?" section

### 9. BuyersGuideCTA.tsx
- Import hook
- Replace `trustSignals` labels with `t.cta.trustSignals`
- Replace badge, headline, subheadline
- Replace phone/email labels, testimonial
- Replace form section text

## Expected Outcome
After implementation:
- Language selector will trigger full page translation
- Zero hardcoded English strings remain
- All 10 languages fully functional
