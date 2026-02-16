

## Rebrand Blog Footer and Other Footers to Everence Wealth

### Problem
The blog footer (`ArticleFooter.tsx`) still displays the old "Del Sol Prime Homes" real estate branding -- Spanish address, Costa del Sol service areas, and real estate tagline. Two other footers also reference the old logo alt text.

### Changes

**1. `src/components/blog-article/ArticleFooter.tsx`** -- Complete rebrand of the `COMPANY_INFO` object:
- **name**: "Del Sol Prime Homes" -> "Everence Wealth"
- **tagline**: Real estate tagline -> "Independent fiduciary wealth architects specializing in tax-efficient retirement strategies."
- **phone**: "+34 630 03 90 90" -> "+1-415-555-0100" (from existing schema in constants/home.ts)
- **email**: "info@delsolprimehomes.com" -> "info@everencewealth.com"
- **website**: "https://www.delsolprimehomes.com" -> "https://www.everencewealth.com"
- **address**: Spanish office -> "One Embarcadero Center, Suite 500, San Francisco, CA 94111" (from existing en.ts translations)
- **serviceAreas**: Remove the Costa del Sol cities section entirely. Replace with "Specialties" listing: Retirement Planning, Tax-Efficient Strategies, Estate Planning, Indexed Universal Life, Annuities, Asset Protection
- **languages**: Keep English and Spanish only (the two supported languages per project memory)

**2. `src/components/landing/Footer.tsx`** (line 20)
- Change logo alt text from "DelSolPrimeHomes" to "Everence Wealth"

**3. `src/components/retargeting/RetargetingFooter.tsx`** (line 27)
- Change logo alt text from "DelSolPrimeHomes" to "Everence Wealth"

### Result
All three footer components will reflect the Everence Wealth brand with correct contact info, specialties instead of service areas, and no remaining real estate references.

