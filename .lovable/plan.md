

# Phase 9.4 -- Footer Update

## Overview
Rewrite the existing `src/components/home/Footer.tsx` to replace all real-estate-oriented columns and links with the Everence Wealth footer structure: Company, Strategies, Resources, Connect, plus an updated bottom bar.

## Changes

### File: `src/components/home/Footer.tsx` (rewrite)

**Remove:**
- Brand column with logo and description paragraph
- Contact column (address/phone/email with icons)
- Quick Links column (property finder, locations, buyer's guide, glossary, comparisons, dashboard)
- Legal column (privacy, terms, cookies, legal notice, GDPR)
- Facebook and Instagram social icons
- All `t.footer.*` translation references (hardcode English strings, matching the convention established in 9.2/9.3)

**New Four-Column Grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12`):**

**Column 1: Company**
- About Us -> `/{lang}/about`
- Our Philosophy -> `/{lang}/philosophy`
- Our Team -> `/{lang}/team`
- Careers -> `/{lang}/careers`

**Column 2: Strategies**
- Indexed Universal Life -> `/{lang}/strategies/iul`
- Whole Life -> `/{lang}/strategies/whole-life`
- Tax-Free Retirement -> `/{lang}/strategies/tax-free-retirement`
- Asset Protection -> `/{lang}/strategies/asset-protection`

**Column 3: Resources**
- Blog -> `/{lang}/blog`
- Q&A -> `/{lang}/qa`
- Financial Terms -> `/{lang}/glossary`
- Tax Bucket Guide -> `/{lang}/tax-bucket-guide`
- Retirement Gap Calculator -> `/{lang}/calculator`

**Column 4: Connect**
- Schedule Assessment -> `/{lang}/contact` (with `Calendar` icon)
- Contact Us -> `/{lang}/contact` (with `Mail` icon)
- Client Portal Login -> `/portal/login` (with `LogIn` icon)
- Phone: (415) 555-0100 (with `Phone` icon)
- Email: info@everencewealth.com (with `Mail` icon)

**Above the grid:** Logo image (keep existing URL) with tagline "Independent fiduciary serving families since 1998." below it.

**Bottom Bar (below border-t):**
- Left: "Copyright 2025 Everence Wealth. Independent fiduciary serving families since 1998."
- Center: Privacy Policy | Terms | Disclosures (links to `/privacy`, `/terms`, `/disclosures`)
- Right: Social icons -- LinkedIn, Twitter (`X` icon not in lucide, use `Twitter`), YouTube
- Below center: Address "455 Market St Ste 1940, San Francisco, CA 94105"

**Updated imports:**
- Keep: `Link`, `Linkedin`, `Mail`, `Phone`, `MapPin`
- Add: `Calendar`, `LogIn`, `Twitter`, `Youtube`
- Remove: `Facebook`, `Instagram`
- Remove: `useTranslation` import (use `useParams` or `window.location` for lang, matching Header pattern)

**Styling:** Keep existing dark background (`bg-prime-900`), `border-t-4 border-prime-gold` top accent, and hover color (`hover:text-prime-gold`). Column headings remain serif bold white.

### No other files modified. No database or edge function changes.

