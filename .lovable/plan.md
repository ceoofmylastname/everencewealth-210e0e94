

## Update Comparison Generator for Everence Wealth

Rebrand the Comparison Generator page from real estate to insurance and wealth management, matching Everence Wealth's product lineup.

### Changes (single file: `src/pages/admin/ComparisonGenerator.tsx`)

**1. Update `SUGGESTED_COMPARISONS` (line 28-37)**
Replace real estate suggestions with insurance/wealth comparisons:
- Term Life vs Whole Life
- IUL vs Traditional 401(k)
- Fixed Annuity vs Variable Annuity
- ROP Term vs Standard Term
- Universal Life vs Indexed Universal Life
- Roth IRA vs Traditional IRA
- Whole Life vs IUL
- Fixed Index Annuity vs RILA

**2. Update `PHASE3_MOFU_COMPARISONS` (line 40-68)**
Replace real estate Phase 3 topics with insurance-focused comparisons:
- Term Life vs Whole Life Insurance
- IUL vs 401(k) for Retirement
- Fixed Annuity vs Variable Annuity

Update all associated fields: `aiHeadline`, `targetAudience`, `niche` (to `wealth-management`), `relatedKeywords`, and `description`.

**3. Update default form values**
- `niche` default: `"real-estate"` to `"wealth-management"` (line 84)
- `targetAudience` default: `"property buyers and investors"` to `"individuals planning for retirement and financial protection"` (line 85)

**4. Update placeholder text**
- Option A placeholder: `"e.g., Buying Off-Plan"` to `"e.g., Term Life Insurance"` (line 559)
- Option B placeholder: `"e.g., Resale Property"` to `"e.g., Whole Life Insurance"` (line 568)
- Target Audience placeholder: `"e.g., property buyers and investors"` to `"e.g., individuals planning for retirement"` (line 579)
- Suggested Headline placeholder: update to insurance example (line 590)
- Niche placeholder: `"e.g., real-estate"` to `"e.g., wealth-management"` (line 601)

**5. Update subtitle text**
- Line 520: `"all 10 languages"` to `"all 2 languages"` (since only EN/ES are configured)

No structural or logic changes -- only content/copy updates.
