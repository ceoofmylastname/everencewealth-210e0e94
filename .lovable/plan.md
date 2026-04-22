

## Single source of truth for business data — `BUSINESS` config + 16-file refactor

### LinkedIn decision (default — unconfirmed)

You haven't confirmed `linkedin.com/in/stevenrosenberg/` is Steven's real profile, so it gets stripped under the Person.sameAs rule. Empty array + TODO flag in the post-deploy report. One-prompt follow-up to add it later if confirmed.

### Confirmed values (locked in)

```ts
foundingDate: '1990'
founders: [{ name: 'Steven Rosenberg', jobTitle: 'Founder & Chief Wealth Strategist' }]
slogan: 'Architecting Your Financial Legacy'
openingHours: Mon–Fri 09:00–18:00 only
priceRange: '$$$'
Organization.sameAs: ['https://www.linkedin.com/company/everencewealth/']
Person.sameAs: [] // pending verified personal URL
```

### Step 1 — Create `src/config/business.ts`

Single frozen `BUSINESS` const with all confirmed values. Address: 455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105, US. Phone: +1-925-433-7724. Email: info@everencewealth.com. Geo: 37.7897, -122.4014. Languages: en, es. Logo: existing storage.googleapis.com URL already used in Footer.

### Step 2 — Urgent SSR fix: `supabase/functions/serve-seo-page/index.ts`

Line 1195 — remove `linkedin.com/in/hansbeeckman` URL entirely. Set Person.sameAs to `[]` (or delete property). Author still rendered as Steven Rosenberg, just without wrong personal link. Ships in same deploy because crawlers hit this SSR path today.

### Step 3 — Rewrite SSG generators to import `BUSINESS`

Replace inline org/address/phone/email constants with `BUSINESS.*` reads:
- `scripts/generateStaticHomePage.ts` — Organization, LocalBusiness, WebSite, WebPage; also fix visible static-footer `tel:+14155550100` href on line ~629
- `scripts/generateStaticTeamPage.ts` — Organization + employee Person (no sameAs)
- `scripts/generateStaticPhilosophyPage.ts` — Organization + author Person
- `scripts/generateStaticStrategyPages.ts` — Organization in 6-schema graph
- `scripts/generateStaticGlossary.ts` — Organization in 3-schema graph
- `scripts/generateStaticAboutPage.ts` — pull from `BUSINESS`

### Step 4 — Reconcile runtime schema generators

- `src/lib/aboutSchemaGenerator.ts` — replace `San Diego, CA` placeholder, `priceRange '$$'`, alt slogan with `BUSINESS` reads; remove hardcoded `FOUNDERS_DATA`
- `src/lib/schemaGenerator.ts` — replace `+1-415-555-0100` with `BUSINESS.telephone`
- `src/components/schema/PersonSchema.tsx` — strip `sameAs: ['linkedin.com/in/stevenrosenberg/']`; flag in report

### Step 5 — Reconcile visible UI with `BUSINESS`

- `src/constants/home.ts` — re-export from `BUSINESS`
- `src/constants/company.ts` — keep display layer, but `COMPANY_CONTACT` and `COMPANY_ADDRESS` re-export from `BUSINESS` so the two layers cannot drift
- `src/components/blog-article/ArticleFooter.tsx` — replace local `COMPANY_INFO` with `BUSINESS` import
- `src/components/homepage/CTA.tsx` — replace `tel:+14155551234` with `BUSINESS.telephone`
- `src/i18n/translations/en.ts` line 290 — footer address → `455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105`
- `src/i18n/translations/es.ts` line 263 — same Spanish translation

### Step 6 — Docs

- `docs/AUTHORITY_POLICY.md` — change `@id` from `#hans-beeckman` to `#steven-rosenberg`; set `sameAs: []` with TODO comment; update photo paths from `/images/hans-blog.jpg` → `/images/steven-blog.jpg` and `/images/steven-qa.jpg` to match live `PersonSchema.tsx`. Verify both files exist in `/public/images/`; flag in report if not.

### Step 7 — Build + verify

```bash
# Negative grep — must be empty
grep -rE "415-555-0100|14155550100|14155551234|One Embarcadero|94111|San Diego, CA|hans.?beeckman|hansbeeckman" dist/

# Positive grep — must show many
grep -rE "925-433-7724|9254337724|455 Market St|94105|Steven Rosenberg" dist/
```

### Post-deploy report

1. Negative grep count (expect 0)
2. Positive grep count broken down by pattern
3. First 200 chars of JSON-LD `@graph` from `dist/index.html`
4. Confirmation `serve-seo-page/index.ts` no longer references `hansbeeckman`
5. Confirmation `/public/images/steven-blog.jpg` and `/public/images/steven-qa.jpg` exist (or flag if missing)
6. Follow-up flagged: *Steven Rosenberg `Person.sameAs` requires verified personal LinkedIn or official bio URL — currently omitted across all schemas. Same for `docs/AUTHORITY_POLICY.md` sameAs array.*

### Files to change (16 code + 1 doc)

**New:** `src/config/business.ts`

**Urgent SSR fix:** `supabase/functions/serve-seo-page/index.ts`

**Generators (6):** `scripts/generateStaticHomePage.ts`, `generateStaticTeamPage.ts`, `generateStaticPhilosophyPage.ts`, `generateStaticStrategyPages.ts`, `generateStaticGlossary.ts`, `generateStaticAboutPage.ts`

**Runtime (3):** `src/lib/aboutSchemaGenerator.ts`, `src/lib/schemaGenerator.ts`, `src/components/schema/PersonSchema.tsx`

**Constants & UI (6):** `src/constants/home.ts`, `src/constants/company.ts`, `src/components/blog-article/ArticleFooter.tsx`, `src/components/homepage/CTA.tsx`, `src/i18n/translations/en.ts`, `src/i18n/translations/es.ts`

**Doc:** `docs/AUTHORITY_POLICY.md`

**Explicitly NOT changed:** `src/integrations/supabase/types.ts`, applied SQL migrations, `.env`, `src/integrations/supabase/client.ts`.

