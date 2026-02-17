
# Rebrand Privacy Policy for Everence Wealth

## Overview
Completely rewrite `src/pages/PrivacyPolicy.tsx` to eliminate all Del Sol Prime Homes / real estate / Costa del Sol / GDPR-EU references and replace with a modern, visually stunning privacy policy branded for **Everence Wealth** -- a US-based independent fiduciary wealth management firm headquartered in San Francisco, CA.

## Visual Design
- Keep the existing dark glassmorphic aesthetic (matches the site's tactical institutional style)
- Use the brand colors: Evergreen (#1A4D3E) accents alongside Gold (#C5A059)
- Retain the animated parallax background, floating particles, scroll-tracking navigation dots, and alternating section layout -- these are visually impressive
- Update the header to show the Everence Wealth logo image (same URL used in Header.tsx and Footer.tsx) instead of "DEL SOL PRIME HOMES" text
- Adjust gradient tones from navy-blue to deep evergreen to align with brand palette

## Content Overhaul (all 6 sections rewritten)

1. **Information We Collect** -- Financial profile data, contact details, risk tolerance assessments, retirement planning inputs, and data from the AI wealth assistant interactions
2. **How We Use Your Data** -- Personalized wealth strategies, retirement projections, tax-efficient planning, improving advisory services; never sold to third parties
3. **Data Protection** -- Industry-standard encryption, SOC 2 compliance practices, SEC/FINRA regulatory alignment, secure cloud infrastructure
4. **Cookies and Tracking** -- Essential, analytics, and preference cookies; browser management options
5. **Your Rights** -- CCPA rights (California-focused, US law), right to access/delete/opt-out, contact info for exercising rights
6. **Contact Us** -- info@everencewealth.com, San Francisco CA address, 30-day response commitment

## Footer/CTA Updates
- Email link updated to info@everencewealth.com
- Copyright line: "Everence Wealth. All rights reserved."
- Footer links to /privacy, /terms, and /disclosures

## Technical Details

**File changed:** `src/pages/PrivacyPolicy.tsx`
- Replace all section content strings with Everence Wealth financial advisory content
- Swap header brand text for the logo `<img>` element
- Update gradient colors from navy (#1a365d) to evergreen (#1A4D3E) tones
- Change all email references from delsolprimehomes to everencewealth
- Replace GDPR references with CCPA (California Consumer Privacy Act)
- Remove all mentions of: property, Spanish, Emma, NIE, Fuengirola, Hans, real estate
- Add /disclosures link to the bottom bar alongside Privacy Policy and Terms
