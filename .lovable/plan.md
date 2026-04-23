

## Remove "fiduciary" everywhere and fix social share card to show "Everence Wealth — Bridge the Retirement Gap"

### What's wrong

The screenshot you shared is the **social share preview card** (LinkedIn/iMessage/Facebook). It shows only the gold mountain — no "Everence Wealth" brand text — and the description reads "Independent Fiduciary Wealth Architects". Two problems:

1. **OG image** (`/public/og-image.png`) is logo-only. On mobile social cards there's no wordmark, so the brand never reads as "Everence Wealth".
2. **"Fiduciary" still lives in dozens of places** — SEO meta, Spanish translations, English footer, landing layout, static SSG pages, glossary term tiles, company constants, buyer guide, recruit audit, location hub, blog article footer, author byline, and the Cloudflare/SSG rendered home HTML.

### Fix

**A. Social share card → shows Everence Wealth brand + "Bridge the Retirement Gap"**

Replace `public/og-image.png` with a new 1200×630 card that:
- Keeps the existing gold mountain mark on the left
- Adds the wordmark **"Everence Wealth"** in the brand gold next to it
- Adds tagline **"Bridge the Retirement Gap"** in white below
- Keeps the evergreen (#0c231c) background

Update all `og:image` and `twitter:image` references to a cache-busted filename (`og-image-v2.png`) so LinkedIn/Meta/iMessage re-scrape instead of showing the cached logo-only version.

**B. Purge the word "fiduciary" from all user-visible copy and metadata**

Replace every occurrence with equivalent "independent" / "client-first" / "independent advisor" phrasing. Files to update:

SEO / metadata / SSG:
- `src/config/business.ts` — `description`
- `src/constants/company.ts` — `tagline: 'Independent Wealth Architects'`
- `scripts/generateStaticHomePage.ts` — title, description, heroDescription, speakableSummary, "Fiduciary Approach" USP card, WebSite schema description (both `en` and `es`)
- `scripts/generateStaticPhilosophyPage.ts` — description
- `src/components/landing/LandingLayout.tsx` — JSON-LD description fallback
- `supabase/functions/generate-cluster/index.ts` — remove "fiduciary" from cluster-generation prompt
- `supabase/functions/regenerate-sitemap/index.ts` — remove `'fiduciary'` glossary slug from sitemap list
- `src/lib/linkInjection.ts` — remove `'fiduciary'` from keyword list

English UI copy:
- `src/components/blog-article/ArticleFooter.tsx` — tagline
- `src/components/blog-article/AuthorByline.tsx` — "Independent Advisor | Licensed in 50 States"
- `src/pages/public/WorkshopLanding.tsx` — "Independent Broker" label
- `src/components/home/sections/ReviewsAndBlog.tsx` — swap "Fiduciary" tile for another glossary term (e.g. "Roth IRA" or "IUL Floor")
- `src/components/recruit/ProducerAudit.tsx` — "True client-first education"
- `src/i18n/translations/buyersGuide/en.ts` — `api: "Licensed Advisors"`
- `src/components/homepage/HomepageAbout.tsx` — remove stale comment mention

Spanish UI copy (`src/i18n/translations/es.ts`, ~35 occurrences):
- Replace every `fiduciario/fiduciaria/fiduciarios/fiduciarias` with `independiente` / `asesor independiente` / `Estándar de Interés del Cliente` depending on context
- Spanish OG/SSG: `"Arquitectos Fiduciarios Independientes"` → `"Arquitectos Independientes de Patrimonio"`

Spanish location-hub:
- `src/components/location-hub/HubFAQSection.tsx` — rewrite the Spanish "¿Qué es un asesor fiduciario?" FAQ to "¿Qué significa ser un asesor independiente?"
- `src/components/location-hub/WhatToExpectSection.tsx` — "estándares fiduciarios" → "estándares de conducta del asesor"

Glossary data:
- `public/glossary/en.json` — keep the term entry (it's a defined industry concept users search for) but confirm it stays only inside the glossary index (factual definition). Not removed from the glossary, since that's reference content, not marketing copy. *(Confirming this exception is OK with you — see question below.)*

Rendered home HTML:
- `index.html` already has the correct title/description. After SSG regeneration the home route output will pick up the new meta automatically.

**C. Component rename (internal only)**

Rename `src/components/homepage/FiduciaryDifference.tsx` → `IndependentDifference.tsx` and update the import in `src/pages/Home.tsx`. This is the component rendering "The Independent Difference" section. Pure internal rename — no visible change, just removes the word from the filename.

### Quick clarifying question

The glossary page at `/en/glossary/fiduciary` is a searchable educational term (people search "what is a fiduciary"). Two options:

1. **Keep the glossary term** (factual reference content, no marketing language) — strong SEO for search intent, word appears only inside a neutral definition.
2. **Delete it entirely** — word vanishes from the site 100%, but you lose the SEO term page.

I'll default to **#1 (keep the term page only)** unless you say otherwise — all marketing copy, taglines, and OG metadata are still purged.

### Out of scope

- Blog article *body* content already published in the database is not rewritten (that's historical editorial content). Only the site chrome, templates, meta, and translations are changed.
- No schema or DB changes.
- No changes to the mobile site's in-page logo — `src/components/home/Header.tsx` already renders the full Everence Wealth logo image on mobile. The "mobile logo" issue is strictly the social share card, fixed in step A.

### Verification

- `grep -riE "fiduciar" src/ scripts/ public/ --exclude-dir=node_modules` returns zero matches outside `public/glossary/en.json` (the single defined-term exception) and the `es.json` counterpart.
- Sharing the site to LinkedIn/iMessage shows the new card with "Everence Wealth" wordmark and "Bridge the Retirement Gap" tagline.
- Home OG title reads "Everence Wealth - Bridge the Retirement Gap".
- Home OG description no longer contains "fiduciary".
- Spanish homepage loads with no "fiduciario/fiduciaria" anywhere.

