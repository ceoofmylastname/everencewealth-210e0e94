
## Update Citation Injection for Financial Planning Content

### Problem
Citations ARE being stored in the database correctly (the Discover + Apply flow works), but they are NOT appearing in the rendered blog articles because:

1. **`src/lib/linkInjection.ts`** has hardcoded entity patterns for airlines, airports, and travel entities (Ryanair, easyJet, Malaga Airport, etc.)
2. **`addCitationMarkers()`** uses travel-specific claim indicators ("flights", "airlines", "routes", etc.)
3. None of these match financial planning content, so zero citations get injected into the HTML

### Solution

**File: `src/lib/linkInjection.ts`** - Complete overhaul for financial planning domain:

1. **Replace entity patterns** with financial planning entities:
   - Regulatory bodies: SEC, FINRA, IRS, CFP Board, NAPFA
   - Financial terms: 401(k), Roth IRA, S&P 500, FDIC, Medicare, Social Security
   - Institutions: Vanguard, Fidelity, Schwab, Federal Reserve

2. **Replace claim indicators** with financial planning keywords:
   - "returns", "interest rate", "inflation", "tax", "retirement", "portfolio"
   - "investment", "fiduciary", "estate planning", "wealth", "fees", "risk"
   - "compound", "diversification", "annuity", "capital gains"

3. **Improve citation matching logic**:
   - Instead of only matching by source name, also match by URL domain (e.g., if citation URL contains "irs.gov", link IRS mentions to it)
   - Add a generic fallback: for citations with a `text` field, try to find that exact text in the article and hyperlink it

4. **Update `addCitationMarkers()`**:
   - Use the new financial claim indicators so superscript markers appear on sentences containing financial facts/claims

### Additional Improvement

**File: `src/components/blog-article/ArticleContent.tsx`** (minor):
- Add a "Sources" or "References" section at the bottom of articles that lists all external citations with numbered references matching the superscript markers

### How to Use (Workflow)

1. Go to **Admin > Clusters** and select a cluster
2. Open the **Articles** tab
3. Click **"Discover Citations"** on any article
4. Review the AI-suggested citations and select the good ones
5. Click **Apply** -- they save to the database
6. The blog article will now render with:
   - Inline hyperlinks on matching entity names
   - Superscript citation markers `[1]`, `[2]` on factual claims
   - A references section at the bottom

### Technical Details

Changes to `injectExternalLinks()`:
- Replace the hardcoded `entityPatterns` array with financial planning patterns
- Add domain-based matching: extract domain from citation URL and match against content mentions
- Add text-based matching: use citation `text` field as anchor text search

Changes to `addCitationMarkers()`:
- Replace `claimIndicators` array with financial planning terms
- Keep the same sentence-splitting and superscript injection logic

New addition to `ArticleContent.tsx`:
- Render a numbered references/sources list below the article content when `externalCitations.length > 0`
