# Del Sol Residue Cleanup + Phone Source-of-Truth Consolidation

Three high-severity fixes (one is a P0 click-to-call bug calling a Spanish number), plus middleware dead-code removal and an audit of 6 edge functions for Costa del Sol entity dictionaries. Everything routes through `BUSINESS` from `src/config/business.ts` — no new constants, no independent judgments about what `BUSINESS` should contain.

---

## HIGH SEVERITY

### 1. `src/components/buyers-guide/BuyersGuideCTA.tsx` (P0)

- Add `import { BUSINESS } from '@/config/business';`
- Line 79: change `href="tel:+34630039090"` → `href={\`tel:${BUSINESS.telephoneE164}\`}`
- Visible label at line 87 reads from `t.cta.phone.number` translation file — out of scope here.

### 2. `scripts/generateStaticPages.ts` — `generateOrganizationSchema()` (lines 157–188)

Affects ~132 published blog articles every build.

- Add: `import { BUSINESS, businessPostalAddress, businessAreaServed, businessContactPoint } from '../src/config/business';`
- Replace hardcoded fields with `BUSINESS` reads:
  - `name` → `BUSINESS.name`
  - `legalName` → `BUSINESS.legalName`
  - `url` → `BUSINESS.url + '/'`
  - `logo.url/width/height` → `BUSINESS.logo.*`
  - `areaServed` → `[businessAreaServed()]`
  - `contactPoint` → `businessContactPoint()` (this fixes the `+34 630 03 90 90` bug)
  - **`sameAs` → `[...BUSINESS.sameAs]` verbatim.** No independent judgment about which entries are valid. `src/config/business.ts` is the single source of truth — whatever's in it ships. If FB/IG handles need to be added/removed, that's a separate ticket against `business.ts`.
  - Add `address: businessPostalAddress()` (currently missing)
  - Add `email: BUSINESS.email`
- Keep `@id`, `@context`, `@type: "FinancialService"`, and `description` as-is.

### 3. Form placeholders + test fixture phones + `<PhoneInput>` default country

- **`src/components/crm/AddAgentModal.tsx`** — add `BUSINESS` import; line 145 `placeholder="+34 600 000 000"` → `placeholder={BUSINESS.telephone}`
- **`src/components/landing/LeadForm.tsx`** — add `BUSINESS` import:
  - Line 139 `placeholder="+34 600 123 456"` → `placeholder={BUSINESS.telephone}`
  - **Also flip `<PhoneInput defaultCountry="ES">` → `defaultCountry="US"`** (same file, same blast radius; avoids a confusing brief-window UX where the form auto-formats Spanish numbers as users type).
- **`src/pages/crm/admin/CrmSettings.tsx`** — add `BUSINESS` import; line 60 `phone: "+34 600 000 000"` → `phone: BUSINESS.telephone`
- **`scripts/generateStaticBuyersGuide.ts`** (surfaced by grep, not in original prompt) — line 272 `"telephone": "+34 630 03 90 90"` → `BUSINESS.telephone`. The surrounding hardcoded ES `address`/`areaServed`/`priceRange` fields in that `RealEstateAgent` block are flagged as a separate cleanup; not touched here.

---

## MEDIUM SEVERITY

### 4. `functions/_middleware.js` — remove dead `costadelsol` regex

Lines 431–435 contain a 4-clause `is404Blocked` OR-chain. Only line 432 (`/^\/(en|es)\/blog\/costadelsol\//`) is the dead Del Sol leftover. Remove that single line; keep the other three clauses untouched.

### 5. Edge function audit — 6 files

Surgical array-content changes only. No signature changes.

| File | Action |
|---|---|
| `auto-enhance-citations/index.ts` lines 19–33 | Delete entire `COMPETITOR_AGENCIES` Spanish-realestate array and any references to it |
| `find-citations-fast/index.ts` lines 14–47 | Strip Spanish portals + Marbella/Malaga agencies from `BLOCKED_DOMAINS`; keep generic global luxury brokerages |
| `find-citations-fast/index.ts` line 104 | Remove `'visitcostadelsol.com'` from `AUTHORITY_DOMAINS` |
| `find-citations-fast/index.ts` line 112 | Remove `'juntadeandalucia.es', 'malagaturismo.com'` from `GOVERNMENT_PATTERNS` |
| `find-citations-perplexity/index.ts` lines 956–969 | Delete entire `locationPropertyPatterns` block + any consumer |
| `find-external-links/index.ts` line 295 | Delete the marbella/estepona comment; logic untouched |
| `discover-cluster-citations/index.ts` lines 31–34 | Strip Marbella/Malaga agency entries from `BLOCKED_DOMAINS` |
| `regenerate-cluster-links/index.ts` line 143 | Replace Spanish cities with US/wealth terms: `['retirement', 'wealth management', 'tax', 'estate planning', 'iul', 'annuity', 'california']` — keeps the +15 overlap-scoring bonus working |

These edge functions are deployed; edits take effect on next Lovable redeploy. Diffs surfaced in the implementation message.

---

## OUT OF SCOPE (per prompt guard rails)

- All `supabase/migrations/*.sql`
- All `docs/`, `README*.md`, `DEPLOYMENT_*` markdown
- The comma-strip 301 redirect in middleware
- `injectSeoTags()` HTMLRewriter dedup
- PROMPT 17's catchall block
- The hardcoded `RealEstateAgent` ES address block in `generateStaticBuyersGuide.ts` (lines 264–279) — only the `telephone` line is fixed
- `BUSINESS.sameAs` contents — used verbatim; changes to it are a separate ticket

---

## VERIFICATION

1. `grep -rn "+34 630\|+34630\|+34 6" src/ scripts/ --include="*.ts" --include="*.tsx" --include="*.js"` → zero hits
2. `grep -i "costadelsol" functions/_middleware.js` → zero hits
3. `grep -i "costa del sol\|costadelsol\|delsolprimehomes\|kazggnufaoicopvmwhdl\|marbella\|estepona" supabase/functions/{auto-enhance-citations,find-citations-fast,find-citations-perplexity,find-external-links,discover-cluster-citations,regenerate-cluster-links}/index.ts` → zero or only cleanup-doc comments
4. TypeScript check passes
5. After deploy: `curl -sL https://www.everencewealth.com/en/blog/{slug}/ | grep -oE '"telephone"\s*:\s*"[^"]+"' | head -1` → `"telephone":"+1-925-433-7724"`. If still `+34`, blog static pages didn't regenerate — trigger a rebuild.

---

## FILES EDITED

- `src/components/buyers-guide/BuyersGuideCTA.tsx`
- `scripts/generateStaticPages.ts`
- `scripts/generateStaticBuyersGuide.ts` (telephone line only)
- `src/components/crm/AddAgentModal.tsx`
- `src/components/landing/LeadForm.tsx` (placeholder + defaultCountry)
- `src/pages/crm/admin/CrmSettings.tsx`
- `functions/_middleware.js`
- `supabase/functions/auto-enhance-citations/index.ts`
- `supabase/functions/find-citations-fast/index.ts`
- `supabase/functions/find-citations-perplexity/index.ts`
- `supabase/functions/find-external-links/index.ts`
- `supabase/functions/discover-cluster-citations/index.ts`
- `supabase/functions/regenerate-cluster-links/index.ts`
