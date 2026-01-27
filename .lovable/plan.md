

# Fix All Broken CTA Buttons Across the Site

## Overview

This plan addresses all 8 critical issues and 7 warning-level issues found in the CTA button audit. The goal is to ensure every button on the site has a defined, working action.

## Phase 1: Homepage Hero Section (Critical)

**File:** `src/components/home/sections/Hero.tsx`

### Changes:
1. **"Start Your Property Search" button (Line ~118)**
   - Add onClick handler to navigate to property finder
   - Use React Router's `useNavigate` hook
   - Navigate to `/{currentLanguage}/properties`

2. **"Chat with Emma" button (Line ~125)**
   - Add onClick handler to trigger Emma chatbot
   - Dispatch custom event: `window.dispatchEvent(new CustomEvent('openEmmaChat'))`

### Code Pattern:
```typescript
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../i18n';

// Inside component:
const navigate = useNavigate();
const { currentLanguage } = useTranslation();

const openEmmaChat = () => {
  window.dispatchEvent(new CustomEvent('openEmmaChat'));
};

const goToPropertyFinder = () => {
  navigate(`/${currentLanguage}/properties`);
};
```

## Phase 2: Homepage Final CTA Section (Critical)

**File:** `src/pages/Home.tsx` (Lines ~85-92)

### Changes:
1. **"Chat with Emma" button**
   - Add onClick to dispatch `openEmmaChat` event

2. **"Tell Us What You're Looking For" button**
   - Add onClick to scroll to Quick Search section OR open Emma with a pre-filled context
   - Recommendation: Open Emma chat (since Emma guides users through their requirements)

### Implementation:
- Convert inline Button components to use onClick handlers
- Both buttons will trigger Emma chat (the secondary one could scroll to quick search as alternative)

## Phase 3: Property Contact Buttons (Critical)

**Files:** 
- `src/components/property/PropertyContact.tsx`
- `src/components/property/PropertyContactMobile.tsx`

### Changes for each button:

| Button | Action | Implementation |
|--------|--------|----------------|
| **Call Now** | Open phone dialer | `href="tel:+34630039090"` (company phone) |
| **WhatsApp** | Open WhatsApp chat | `href="https://wa.me/34630039090"` with property context |
| **Schedule** | Open Emma chat | `onClick` → dispatch `openEmmaChat` event |
| **Inquire** | Open inquiry form/Emma | `onClick` → dispatch `openEmmaChat` event |

### WhatsApp with Context:
```typescript
const whatsappMessage = encodeURIComponent(
  `Hi, I'm interested in property: ${propertyTitle}`
);
const whatsappUrl = `https://wa.me/34630039090?text=${whatsappMessage}`;
```

## Phase 4: Buyers Guide CTA (Warning)

**File:** `src/components/buyers-guide/BuyersGuideCTA.tsx`

### Changes:
1. **Update "Schedule a Call" text**
   - Change translation key from `t.cta.form.schedule` to use "Chat with Emma"
   - Or use inline text with localized version

2. **Add onClick handler**
   - Dispatch `openEmmaChat` event

3. **Fix "Download PDF Guide" button**
   - Add proper download functionality
   - Link to actual PDF file or generate on-demand

### Buyers Guide Translation Updates:
**Files to update (10 files in `src/i18n/translations/buyersGuide/`):**
- en.ts, de.ts, nl.ts, fr.ts, sv.ts, no.ts, da.ts, fi.ts, pl.ts, hu.ts

Change `schedule` and `title` keys in the `form` section.

## Phase 5: Footer Social & Legal Links (Warning)

**File:** `src/components/home/Footer.tsx`

### Changes:

**Social Media Links (Lines ~35-45):**
| Platform | Current | New URL |
|----------|---------|---------|
| Facebook | `href="#"` | `href="https://facebook.com/delsolprimehomes"` (or actual URL) |
| Instagram | `href="#"` | `href="https://instagram.com/delsolprimehomes"` |
| LinkedIn | `href="#"` | `href="https://linkedin.com/company/delsolprimehomes"` |

**Legal Links (Lines ~75-85):**
| Link | Current | Action |
|------|---------|--------|
| Cookies Policy | `href="#"` | Link to `/{lang}/cookies` or modal |
| Legal Notice | `href="#"` | Link to `/{lang}/legal-notice` |
| GDPR | `href="#"` | Link to `/{lang}/gdpr` or combine with privacy |

**Note:** If legal pages don't exist yet, we can either:
- Create placeholder pages
- Link to the privacy policy page for now
- Keep as modal triggers

## Phase 6: Brochure Chatbot Text (Minor)

**File:** `src/components/brochure/BrochureChatbot.tsx`

### Change:
- Find hardcoded "schedule a consultation call" text
- Replace with "chat with our team" or "speak with Emma"

## Files to Modify Summary

| Priority | File | Changes |
|----------|------|---------|
| Critical | `src/components/home/sections/Hero.tsx` | Add 2 onClick handlers |
| Critical | `src/pages/Home.tsx` | Add 2 onClick handlers |
| Critical | `src/components/property/PropertyContact.tsx` | Add 4 button actions |
| Critical | `src/components/property/PropertyContactMobile.tsx` | Add 4 button actions |
| Warning | `src/components/buyers-guide/BuyersGuideCTA.tsx` | Update text + add onClick |
| Warning | `src/i18n/translations/buyersGuide/*.ts` (10 files) | Update translation strings |
| Warning | `src/components/home/Footer.tsx` | Add real URLs to 6+ links |
| Minor | `src/components/brochure/BrochureChatbot.tsx` | Update 1 text string |

## Implementation Order

1. **Homepage Hero** - Most visible, highest traffic
2. **Homepage Final CTA** - Completes homepage functionality
3. **Property Contact** - Critical for conversions
4. **Buyers Guide CTA** - Important lead capture point
5. **Buyers Guide Translations** - Consistency across languages
6. **Footer Links** - Lower priority but needed for completeness
7. **Brochure Chatbot** - Minor text fix

## Testing Checklist

After implementation, verify:
- [ ] Homepage: Both Hero buttons work
- [ ] Homepage: Both Final CTA buttons work
- [ ] Property pages: All 4 contact buttons work
- [ ] Buyers Guide: CTA button opens Emma
- [ ] Footer: Social links open correct profiles
- [ ] Footer: Legal links navigate to pages
- [ ] All buttons work on mobile
- [ ] Emma chat opens correctly from all triggers
- [ ] No console errors on button clicks

## Questions Before Proceeding

1. **Social Media URLs:** Do you have the actual Facebook, Instagram, and LinkedIn profile URLs? If not, I'll use placeholder patterns.

2. **Legal Pages:** Should legal links (Cookies, GDPR, Legal Notice) go to:
   - Existing pages (do they exist?)
   - The privacy policy page temporarily
   - Modal dialogs

3. **"Tell Us What You're Looking For" button:** Should this:
   - Open Emma chat (recommended - Emma guides requirements)
   - Scroll to Quick Search section
   - Open a separate form modal

