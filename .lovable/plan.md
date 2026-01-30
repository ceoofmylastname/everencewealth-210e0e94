
# Full Localization of Brochure Opt-In Form

## Problem Identified

The `BrochureOptInForm.tsx` component displays hardcoded English text on non-English brochure pages (e.g., `/fi/brochure/marbella`). This includes:

| Section | Current (Hardcoded English) | Finnish Translation Available |
|---------|---------------------------|------------------------------|
| Badge | "Exclusive Guide" | `exclusiveGuide: "Eksklusiivinen Opas"` |
| Heading | "Get Your Free" / "{city} Brochure" | `getYourFree`, `brochure` |
| Description | "Discover exclusive property insights..." | `discoverExclusive` |
| Brochure Preview | "{city} Property Guide 2026" | `propertyGuide` |
| Features | "Instant PDF Download", "40+ Pages of Insights" | `instantPdfDownload`, `pagesOfInsights` |
| Testimonial | "The brochure gave us incredible insights..." | `testimonialQuote`, `testimonialAuthor` |
| Form Labels | "First Name", "Last Name", etc. | All available in `brochures.ui` |
| Consents | Privacy and marketing consent text | `privacyConsent`, `marketingConsent` |
| Submit Button | "Download Free Brochure", "Processing..." | `downloadFreeBrochure`, `processing` |
| Footer | "Instant access • No spam • Unsubscribe anytime" | `instantAccess` |
| Success State | "Thank You!", "Your {city} brochure is on its way!" | `thankYou`, `brochureOnWay`, `meanwhileExplore` |

The translations already exist in all 10 language files under `brochures.ui` - they're just not being used by the component.

---

## Solution

Update `BrochureOptInForm.tsx` to consume the `useTranslation()` hook and replace all hardcoded English strings with localized versions from `t.brochures.ui`.

---

## Technical Implementation

### File: `src/components/brochures/BrochureOptInForm.tsx`

#### Step 1: Import and Initialize Translation Hook

Add the translation hook at the component level:

```tsx
import { useTranslation } from '@/i18n';

// Inside the component:
const { t } = useTranslation();
const ui = (t.brochures as any)?.ui || {};
```

#### Step 2: Replace All Hardcoded Strings

**Left Column - Section Header & Brochure Preview:**
| Line | Current | Replacement |
|------|---------|-------------|
| ~200 | `"Exclusive Guide"` | `ui.exclusiveGuide \|\| 'Exclusive Guide'` |
| ~203 | `"Get Your Free"` | `ui.getYourFree \|\| 'Get Your Free'` |
| ~205 | `"{cityName} Brochure"` | `(ui.brochure \|\| '{city} Brochure').replace('{city}', cityName)` |
| ~208 | `"Discover exclusive property insights..."` | `(ui.discoverExclusive \|\| '...').replace('{city}', cityName)` |
| ~219 | `"{cityName} Property Guide 2026"` | `(ui.propertyGuide \|\| '...').replace('{city}', cityName)` |
| ~222 | `"Instant PDF Download"` | `ui.instantPdfDownload \|\| 'Instant PDF Download'` |
| ~225 | `"40+ Pages of Insights"` | `ui.pagesOfInsights \|\| '40+ Pages of Insights'` |
| ~240-243 | Testimonial quote and author | `ui.testimonialQuote`, `ui.testimonialAuthor` |

**Right Column - Form Labels:**
| Line | Current | Replacement |
|------|---------|-------------|
| ~252 | `"First Name *"` | `(ui.firstName \|\| 'First Name') + ' *'` |
| ~263 | `"Last Name *"` | `(ui.lastName \|\| 'Last Name') + ' *'` |
| ~276 | `"Email Address *"` | `(ui.emailAddress \|\| 'Email Address') + ' *'` |
| ~289 | `"Phone Number *"` | `(ui.phoneNumber \|\| 'Phone Number') + ' *'` |
| ~319 | `"Tell us about your requirements (Optional)"` | `ui.tellUsRequirements \|\| '...'` |
| ~324 | Placeholder text | `ui.requirementsPlaceholder \|\| 'Budget, property type, timeline...'` |

**Consent Checkboxes:**
| Line | Current | Replacement |
|------|---------|-------------|
| ~341 | Privacy consent text | `ui.privacyConsent \|\| '...'` |
| ~355 | Marketing consent text | `ui.marketingConsent \|\| '...'` |

**Submit Button & Footer:**
| Line | Current | Replacement |
|------|---------|-------------|
| ~365-375 | "Processing..." / "Download Free Brochure" | `ui.processing`, `ui.downloadFreeBrochure` |
| ~379 | "Instant access • No spam..." | `ui.instantAccess \|\| '...'` |

**Success State (lines 147-176):**
| Element | Current | Replacement |
|---------|---------|-------------|
| Title | "Thank You!" | `ui.thankYou \|\| 'Thank You!'` |
| Message | "Your {city} brochure is on its way!..." | `(ui.brochureOnWay \|\| '...').replace('{city}', cityName)` |
| Footer | "Meanwhile, explore our latest listings..." | `(ui.meanwhileExplore \|\| '...').replace('{city}', cityName)` |

---

## Toast Messages

The toast notifications also need localization. Add these keys to all 10 language files:

**New keys to add to `brochures.ui` in each language file:**
- `privacyRequired: "Privacy consent required"`
- `privacyRequiredDesc: "Please agree to the privacy policy to continue."`
- `somethingWentWrong: "Something went wrong"`
- `tryAgainLater: "Please try again later."`

For Finnish (`fi.ts`):
```ts
privacyRequired: "Tietosuojasuostumus vaaditaan",
privacyRequiredDesc: "Hyväksy tietosuojakäytäntö jatkaaksesi.",
somethingWentWrong: "Jokin meni pieleen",
tryAgainLater: "Yritä myöhemmin uudelleen.",
```

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/brochures/BrochureOptInForm.tsx` | Add translation hook; replace ~30 hardcoded strings with localized versions |
| `src/i18n/translations/en.ts` | Add 4 new toast message keys to `brochures.ui` |
| `src/i18n/translations/fi.ts` | Add 4 new toast message keys |
| `src/i18n/translations/nl.ts` | Add 4 new toast message keys |
| `src/i18n/translations/fr.ts` | Add 4 new toast message keys |
| `src/i18n/translations/de.ts` | Add 4 new toast message keys |
| `src/i18n/translations/pl.ts` | Add 4 new toast message keys |
| `src/i18n/translations/sv.ts` | Add 4 new toast message keys |
| `src/i18n/translations/da.ts` | Add 4 new toast message keys |
| `src/i18n/translations/hu.ts` | Add 4 new toast message keys |
| `src/i18n/translations/no.ts` | Add 4 new toast message keys |

---

## Result

After this change:
- `/fi/brochure/marbella` will show "Eksklusiivinen Opas", "Hanki Ilmainen Marbella Esite", etc.
- All 10 language versions will display fully localized content
- The existing translations in `brochures.ui` will finally be utilized
