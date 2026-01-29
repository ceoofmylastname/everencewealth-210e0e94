

# Fix City Brochures Pages - Complete Translations and Functionality

## Executive Summary

This plan addresses hardcoded English text in brochure components, missing translation keys, inconsistent CTA behavior, and ensures Emma chatbot and WhatsApp functionality work on all brochure pages.

---

## Current State Analysis

### What's Working Well
| Component | Status |
|-----------|--------|
| Database content (city_brochures) | ✅ All 10 cities have i18n content for descriptions and headlines |
| Translation files | ✅ All 10 languages have brochures.{city} content for 7 cities |
| Lead capture form (BrochureOptInForm) | ✅ Saves to database, sends to GHL/CRM |
| Language routing (/{lang}/brochure/{city}) | ✅ Works correctly |
| CrossCityDiscovery | ✅ Uses language from context |

### Issues Identified

| Issue | Location | Severity |
|-------|----------|----------|
| **Hardcoded "Download Brochure"** | `BrochureHero.tsx` line 185 | 🔴 High |
| **Hardcoded "Speak With Expert"** | `BrochureHero.tsx` line 195 | 🔴 High |
| **Hardcoded trust signals (English)** | `BrochureHero.tsx` lines 22-25 | 🔴 High |
| **Hardcoded breadcrumb "Home"/"Locations"** | `BrochureHero.tsx` lines 106-108 | 🔴 High |
| **Hardcoded "Explore" scroll indicator** | `BrochureHero.tsx` line 206 | 🟡 Medium |
| **Hardcoded "Costa del Sol, Spain" badge** | `BrochureHero.tsx` line 121 | 🟡 Medium |
| **BrochureOptInForm all text hardcoded** | `BrochureOptInForm.tsx` entire file | 🔴 High |
| **InvestmentHighlights hardcoded** | `InvestmentHighlights.tsx` lines 17-21, 119-127 | 🔴 High |
| **LifestyleFeatures hardcoded** | `LifestyleFeatures.tsx` lines 19-26, 56-64 | 🔴 High |
| **CrossCityDiscovery hardcoded** | `CrossCityDiscovery.tsx` lines 36-41, 112-113, 126 | 🔴 High |
| **BrochureChatbot hardcoded** | `BrochureChatbot.tsx` lines 33-34, 61-62, 99-103, 111 | 🟡 Medium |
| **"Speak With Expert" opens chatbot not WhatsApp** | `BrochureHero.tsx` line 189 | 🟡 Medium |
| **Form doesn't trigger Emma after submission** | `BrochureOptInForm.tsx` line 125 | 🟡 Medium |

---

## Implementation Plan

### Phase 1: Add Brochure-Specific Translation Keys

**Files to modify:** All 10 translation files in `src/i18n/translations/`

Add a new `brochures.ui` section with all UI strings:

```typescript
brochures: {
  ui: {
    // Hero Section
    downloadBrochure: "Download Brochure",
    speakWithExpert: "Speak With Expert",
    explore: "Explore",
    costaDelSolSpain: "Costa del Sol, Spain",
    
    // Breadcrumbs
    home: "Home",
    locations: "Locations",
    
    // Trust Signals
    apiRegistered: "API Registered",
    yearsExperience: "{years}+ Years Experience",
    happyBuyers: "{count}+ Happy Buyers",
    
    // Investment Section
    investmentPotential: "Investment Potential",
    whyInvestIn: "Why Invest in {city}?",
    investmentDescription: "Discover the compelling numbers behind one of Europe's most sought-after property markets.",
    rentalYield: "Rental Yield",
    daysOfSunshine: "Days of Sunshine",
    averagePrice: "Average Price",
    valueGrowth: "Value Growth 2024",
    
    // Lifestyle Section
    theLifestyle: "The Lifestyle",
    liveTheDream: "Live The {city} Dream",
    lifestyleDescription: "Experience a lifestyle where every day feels like a vacation...",
    
    // Default Lifestyle Features
    worldClassGolf: "World-Class Golf",
    golfDescription: "Over 70 championship courses within 30 minutes",
    mediterraneanBeaches: "Mediterranean Beaches",
    beachesDescription: "Crystal-clear waters and golden sand coastlines",
    michelinDining: "Michelin Dining",
    diningDescription: "Award-winning restaurants and vibrant culinary scene",
    luxuryMarinas: "Luxury Marinas",
    marinasDescription: "Premier yacht clubs and nautical lifestyle",
    wellnessSpa: "Wellness & Spa",
    wellnessDescription: "World-renowned wellness retreats and thermal spas",
    designerShopping: "Designer Shopping",
    shoppingDescription: "Boutiques, galleries, and luxury retail experiences",
    
    // Form Section
    exclusiveGuide: "Exclusive Guide",
    getYourFree: "Get Your Free",
    brochure: "{city} Brochure",
    discoverExclusive: "Discover exclusive property insights, investment opportunities, and lifestyle guides for {city}.",
    propertyGuide: "{city} Property Guide 2024",
    instantPdfDownload: "Instant PDF Download",
    pagesOfInsights: "40+ Pages of Insights",
    testimonialQuote: "The brochure gave us incredible insights into {city}. Within weeks of our inquiry, we found our dream villa!",
    testimonialAuthor: "— James & Sarah, UK",
    firstName: "First Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    tellUsRequirements: "Tell us about your requirements (Optional)",
    requirementsPlaceholder: "Budget, property type, timeline...",
    privacyConsent: "I agree to the Privacy Policy and consent to Del Sol Prime Homes processing my data.",
    marketingConsent: "I'd like to receive exclusive property alerts and market insights.",
    downloadFreebrochure: "Download Free Brochure",
    processing: "Processing...",
    instantAccess: "Instant access • No spam • Unsubscribe anytime",
    thankYou: "Thank You!",
    brochureOnWay: "Your {city} brochure is on its way! Our property specialists will be in touch within 24 hours.",
    meanwhileExplore: "Meanwhile, explore our latest listings in {city}",
    
    // Cross City Discovery
    exploreMore: "Explore More",
    otherPrimeLocations: "Other Prime Locations",
    swipeToExplore: "Swipe to explore more →",
    explore: "Explore {city}",
    
    // Chatbot
    chatAbout: "Chat About {city}",
    askUsAnything: "Ask us anything about properties in {city}",
    clickToStart: "Click send to start the conversation",
    typeMessage: "Type your message...",
    interestedIn: "Hi, I'm interested in properties in {city}",
    thanksForInterest: "Thank you for your interest in {city}! Our team of local experts can help you find the perfect property. Would you like to chat with Emma for personalized guidance, or would you prefer to receive our detailed brochure first?",
  },
  common: { /* existing common keys */ },
  marbella: { /* existing city content */ },
  // ... other cities
}
```

### Phase 2: Update BrochureHero Component

**File:** `src/components/brochures/BrochureHero.tsx`

Changes:
1. Add `language` prop and import `useTranslation`
2. Replace hardcoded text with translation keys
3. Change "Speak With Expert" to open WhatsApp instead of chatbot

```typescript
// Before (line 185):
<span>Download Brochure</span>

// After:
<span>{t.brochures.ui.downloadBrochure}</span>
```

```typescript
// Before (line 189-196):
<Button onClick={onChat} variant="outline">
  <span>Speak With Expert</span>
</Button>

// After - WhatsApp link:
<a 
  href={COMPANY_CONTACT.whatsappWithMessage(`Hi, I'm interested in properties in ${city.name}. Can you help?`)}
  target="_blank"
  rel="noopener noreferrer"
>
  <Button variant="outline">
    <span>{t.brochures.ui.speakWithExpert}</span>
  </Button>
</a>
```

### Phase 3: Update BrochureOptInForm Component

**File:** `src/components/brochures/BrochureOptInForm.tsx`

Changes:
1. Add `language` prop to interface
2. Import `useTranslation` hook
3. Replace all hardcoded strings (~30 instances)
4. Add Emma chat trigger after successful form submission:

```typescript
// After setIsSubmitted(true) - line 125:
setIsSubmitted(true);

// Trigger Emma chat with context
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('openEmmaChat'));
}, 2000);
```

### Phase 4: Update InvestmentHighlights Component

**File:** `src/components/brochures/InvestmentHighlights.tsx`

Changes:
1. Add `language` prop and translation hook
2. Replace section header text
3. Replace stat labels with translated versions

### Phase 5: Update LifestyleFeatures Component

**File:** `src/components/brochures/LifestyleFeatures.tsx`

Changes:
1. Add `language` prop and translation hook
2. Replace section header and feature descriptions
3. Use translations for default features array

### Phase 6: Update CrossCityDiscovery Component

**File:** `src/components/brochures/CrossCityDiscovery.tsx`

Changes:
1. Already uses `useTranslation` for `currentLanguage`
2. Replace "Explore More" and "Other Prime Locations" headers
3. Replace "Swipe to explore more →" hint
4. Replace "Explore {city}" CTA text

### Phase 7: Update BrochureChatbot Component

**File:** `src/components/brochures/BrochureChatbot.tsx`

Changes:
1. Add `language` prop and translation hook
2. Replace all UI text with translation keys
3. Pre-filled message should be translated

### Phase 8: Update CityBrochure Page

**File:** `src/pages/CityBrochure.tsx`

Changes:
1. Pass `language={lang}` prop to all child components
2. Ensure Emma chat widget is always accessible

---

## Translation Examples (All 10 Languages)

### "Download Brochure"
| Language | Translation |
|----------|-------------|
| EN | Download Brochure |
| NL | Download Brochure |
| DE | Broschüre Herunterladen |
| FR | Télécharger la Brochure |
| SV | Ladda ner Broschyr |
| NO | Last ned Brosjyre |
| DA | Download Brochure |
| FI | Lataa Esite |
| PL | Pobierz Broszurę |
| HU | Brosúra Letöltése |

### "Speak With Expert"
| Language | Translation |
|----------|-------------|
| EN | Speak With Expert |
| NL | Spreek met Expert |
| DE | Mit Experten Sprechen |
| FR | Parler à un Expert |
| SV | Tala med Expert |
| NO | Snakk med Ekspert |
| DA | Tal med Ekspert |
| FI | Puhu Asiantuntijan Kanssa |
| PL | Porozmawiaj z Ekspertem |
| HU | Beszéljen Szakértővel |

### Trust Signals - "{years}+ Years Experience"
| Language | Translation |
|----------|-------------|
| EN | {years}+ Years Experience |
| NL | {years}+ Jaar Ervaring |
| DE | {years}+ Jahre Erfahrung |
| FR | {years}+ Ans d'Expérience |
| SV | {years}+ Års Erfarenhet |
| NO | {years}+ Års Erfaring |
| DA | {years}+ Års Erfaring |
| FI | {years}+ Vuoden Kokemus |
| PL | {years}+ Lat Doświadczenia |
| HU | {years}+ Év Tapasztalat |

---

## Files to Modify Summary

| File | Change Type | Priority |
|------|-------------|----------|
| `src/i18n/translations/en.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/nl.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/de.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/fr.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/sv.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/no.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/da.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/fi.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/pl.ts` | Add `brochures.ui` section | 🔴 High |
| `src/i18n/translations/hu.ts` | Add `brochures.ui` section | 🔴 High |
| `src/components/brochures/BrochureHero.tsx` | Add translations + WhatsApp CTA | 🔴 High |
| `src/components/brochures/BrochureOptInForm.tsx` | Add translations + Emma trigger | 🔴 High |
| `src/components/brochures/InvestmentHighlights.tsx` | Add translations | 🟡 Medium |
| `src/components/brochures/LifestyleFeatures.tsx` | Add translations | 🟡 Medium |
| `src/components/brochures/CrossCityDiscovery.tsx` | Add translations | 🟡 Medium |
| `src/components/brochures/BrochureChatbot.tsx` | Add translations | 🟡 Medium |
| `src/pages/CityBrochure.tsx` | Pass language prop | 🟡 Medium |

---

## Testing Checklist

After implementation:
- [ ] Visit `/en/brochure/marbella` - all English text displays
- [ ] Visit `/nl/brochure/marbella` - all Dutch text displays  
- [ ] Visit `/de/brochure/marbella` - all German text displays
- [ ] Repeat for all 10 languages
- [ ] "Download Brochure" button scrolls to form
- [ ] "Speak With Expert" opens WhatsApp with pre-filled city message
- [ ] Form submission triggers Emma chat after 2 seconds
- [ ] Cross-city discovery links use correct language prefix
- [ ] Mobile view: All elements properly sized and translated
- [ ] Trust signals show correct language text with company constants

---

## Technical Notes

1. **No Database Changes Required** - All UI translations go into translation files, not database
2. **Company Constants Reused** - Trust signals use `COMPANY_FACTS` from `src/constants/company.ts`
3. **WhatsApp Integration** - Uses existing `COMPANY_CONTACT.whatsappWithMessage()` utility
4. **Emma Integration** - Uses existing `openEmmaChat` custom event pattern

