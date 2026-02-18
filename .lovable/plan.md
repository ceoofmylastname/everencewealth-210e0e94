
# Rebrand Glossary Page for Everence Wealth

## Problem
The glossary page still references "Costa del Sol Real Estate" and contains Spanish property/visa/location terms from the old brand. It needs to be fully updated to match Everence Wealth's identity: wealth management, insurance, retirement planning, and tax-efficient strategies.

## Changes

### 1. Update English translations (`src/i18n/translations/glossary.ts`)

Replace the `en` block with Everence Wealth financial content:
- **headline**: "Wealth Management" (highlight: "Glossary")
- **description**: "Your comprehensive guide to financial planning, insurance, retirement, and tax-efficient wealth terminology. Essential knowledge for building and protecting your legacy."
- **searchPlaceholder**: "Search terms (e.g., IUL, Annuity, Roth IRA...)"
- **compiledBy / licensedExperts**: "Licensed Fiduciary Advisors"
- **ctaHeadline**: "Ready to Build Your" / **ctaHighlight**: "Wealth Strategy?"
- **ctaDescription**: "Our fiduciary team can guide you through retirement planning, tax optimization, and asset protection. Get personalized advice tailored to your financial goals."
- **ctaButton1**: "Explore Our Services" (link to /en/services or blog)
- **ctaButton2**: "Schedule a Consultation"
- **categories**: Replace with financial categories:
  - `retirement`: "Retirement Planning"
  - `insurance`: "Insurance & Protection"
  - `tax`: "Tax Strategy"
  - `investment`: "Investment Terms"
  - `estate`: "Estate Planning"
  - `general`: "General Finance"
- **meta.title**: "Wealth Management Glossary | Financial Terms Explained | Everence Wealth"
- **meta.description**: Updated for financial SEO

Also update the `es` (Spanish) block with equivalent Spanish translations. Remove or keep other languages minimal (they can be regenerated later).

### 2. Replace glossary data (`public/glossary/en.json`)

Replace the entire JSON with financial/insurance/retirement terms organized into new categories:
- **retirement**: 401(k), IRA, Roth IRA, Required Minimum Distribution (RMD), Social Security, Pension, Defined Benefit Plan, Defined Contribution Plan, Annuity, COLA
- **insurance**: Indexed Universal Life (IUL), Term Life, Whole Life, Cash Value, Death Benefit, Living Benefits, Long-Term Care, Disability Insurance, Premium, Underwriting
- **tax**: Tax-Deferred, Tax-Exempt, Tax-Loss Harvesting, Capital Gains, Marginal Tax Rate, Estate Tax, Gift Tax, 1031 Exchange, Qualified Dividend, AMT
- **investment**: Asset Allocation, Diversification, Dollar-Cost Averaging, Fiduciary, Index Fund, Compound Interest, Risk Tolerance, Rebalancing, Yield, Liquidity
- **estate**: Trust, Will, Beneficiary, Power of Attorney, Probate, Irrevocable Trust, Revocable Trust, Estate Plan, Successor Trustee, Charitable Remainder Trust
- **general**: Net Worth, Cash Flow, Emergency Fund, Debt-to-Income Ratio, Credit Score, Inflation, APR/APY, Amortization, Equity, Human Life Value

Each term will include: `term`, `full_name`, `definition`, `related_terms`, `see_also` (linking to relevant blog/service pages).

### 3. Update category icons (`src/pages/Glossary.tsx`)

Replace the old `categoryIcons` map:
```
retirement: "shield" icon area
insurance: "shield" 
tax: "receipt"
investment: "trending-up"
estate: "landmark"
general: "wallet"
```

### 4. Update SEO keywords (`src/pages/Glossary.tsx`)

Line 199 -- replace the keywords meta tag with financial terms:
`"financial glossary, IUL definition, annuity terms, retirement planning terms, wealth management glossary, tax-efficient investing, fiduciary advisor, estate planning terms, Roth IRA, 401k, indexed universal life"`

### 5. Update sitemap (`public/sitemaps/glossary.xml`)

Update the `lastmod` date to today's date.

## Files Modified
1. `src/i18n/translations/glossary.ts` -- EN and ES translations rebranded
2. `public/glossary/en.json` -- Complete replacement with 60+ financial terms
3. `src/pages/Glossary.tsx` -- Category icons, SEO keywords
4. `public/sitemaps/glossary.xml` -- Updated date

## What Stays the Same
- Page layout, hero design, alphabet navigation, card structure, dark CTA section
- All premium styling (glassmorphism, prime-gold accents, animations)
- Multi-language infrastructure (translation loading, hreflang tags)
- Schema.org structured data generation
