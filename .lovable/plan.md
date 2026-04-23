

## Phase 1 — Diagnostic Inventory

### Why the brand-leak still happens
The earlier fix only updated `index.html` and a couple of text fields. The real leak comes from **rendered HTML the SSG pipeline writes into every static page**, plus Del-Sol-owned image files still sitting in the repo.

### Image URLs in pre-hydration HTML

**`index.html`** (root template — Everence ✅)
- `og:image`, `og:image:alt`, `twitter:image` → `https://www.everencewealth.com/og-image.png` (Everence — but file underneath is the Everence one only because we just replaced it; not the canonical 1200x630 brand asset)
- favicon / apple-touch-icon → `/favicon.png`, `/apple-touch-icon.png` (Everence ✅)

**SSG-generated pages — the actual leak source**

| File | Reference | Origin |
|---|---|---|
| `scripts/generateStaticHomePage.ts` line 453 | `og:image` → `/assets/logo-new.png` | **Del Sol** ❌ |
| `scripts/generateStaticHomePage.ts` line 465 | `twitter:image` → `/assets/logo-new.png` | **Del Sol** ❌ |
| `scripts/generateStaticHomePage.ts` line 494 | inline `<img src="/assets/logo-new.png">` in `.static-header` | **Del Sol** ❌ — this is the **visible flash** |
| `scripts/generateStaticLocationHub.ts` line 332/341 | `og:image` / `twitter:image` → `/assets/costa-del-sol-locations.jpg` | **Del Sol** ❌ |
| `scripts/generateStaticLocationHub.ts` line 226 | JSON-LD logo → `/assets/logo-new.png` | **Del Sol** ❌ |
| `scripts/generateStaticBuyersGuide.ts` lines 218/324/333 | `og:image` / `twitter:image` / Recipe.image → `/assets/costa-del-sol-bg.jpg` | **Del Sol** ❌ |
| `scripts/generateStaticBuyersGuide.ts` line 260 | JSON-LD logo → `/assets/logo-new.png` | **Del Sol** ❌ |
| `scripts/generateStaticComparisonPages.ts` line 120 | JSON-LD logo → `/assets/logo-new.png` | **Del Sol** ❌ |
| `scripts/generateStaticPages.ts` line 168 | JSON-LD logo → `/assets/logo-new.png` | **Del Sol** ❌ |
| `scripts/generateStaticPages.ts` line 851–860 | `ensureLogoInPublicAssets()` actively copies Del Sol logo into `dist/assets/logo-new.png` on every build | **Del Sol** ❌ |
| `src/lib/glossarySchemaGenerator.ts` lines 77, 287 | JSON-LD logo → `/assets/logo-new.png` | **Del Sol** ❌ |
| `src/lib/buyersGuideSchemaGenerator.ts` line 4 | LOGO_URL constant → `/assets/logo-new.png` | **Del Sol** ❌ |

**Hardcoded `storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/...` (Del Sol GHL bucket)**

| File | Context |
|---|---|
| `src/config/business.ts` line 60 | `BUSINESS.logo.url` — feeds **all** JSON-LD Organization schemas |
| `src/lib/schemaGenerator.ts` line 36 | Organization logo |
| `supabase/functions/serve-seo-page/index.ts` lines 989, 996, 1156, 1975, 1985 | Edge-function-rendered SEO pages: `og:image`, `twitter:image`, JSON-LD logo, fallback `og:image`, fallback `twitter:image` |
| `supabase/functions/notify-portal-message/index.ts` line 10 | Email logo |
| `supabase/functions/notify-contracting-message/index.ts` line 10 | Email logo |
| `supabase/functions/upgrade-license/index.ts` line 138 | Email logo |
| `src/components/ApartmentsEditorLayout.tsx` line 8 | Editor sidebar logo |
| `src/pages/ContractingIntake.tsx` line 438 | Header logo |
| `src/pages/portal/PortalLogin.tsx` line 9 | Login screen logo |
| `src/pages/TrainingEvent.tsx` lines 169, 272, 656 | Training event logos |

> The bucket ID `TLhrYb7SRrWrly615tCI` is the Del Sol Prime Homes GHL subaccount. Every URL that contains it must be replaced.

### Image files physically in the repo

`public/assets/`
- `logo-new.png` (713813 B) — **Del Sol** ❌ — gets re-copied from `src/assets/logo-new.png`
- `.gitkeep`

`src/assets/`
- `logo-new.png` (713813 B) — **Del Sol** ❌ (copy source)
- `logo.png` (713813 B) — **Del Sol** ❌
- `logo.jpeg` (14900 B) — **Del Sol** ❌
- `costa-del-sol-bg.jpg` (314594 B) — **Del Sol** ❌
- `hero-landing-costa-del-sol.jpg` (187511 B) — **Del Sol artwork** ❌

`public/` root — `og-image.png`, `favicon.png`, `apple-touch-icon.png` (Everence ✅, set in prior turn)

`hans-*.jpg` files: confirmed gone ✅

---

## Phase 2 — Fix Plan

### Single source of truth
```
EVERENCE_LOGO_URL = "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png"
```

### 2.1 Replace the Del Sol image file at the source
- Download the Everence logo from filesafe.space and write it to **both**:
  - `src/assets/logo-new.png`
  - `public/assets/logo-new.png`
- This kills the flash because the static homepage `<img src="/assets/logo-new.png">` will now render the Everence mark.
- Delete `src/assets/logo.png`, `src/assets/logo.jpeg`, `src/assets/costa-del-sol-bg.jpg`, `src/assets/hero-landing-costa-del-sol.jpg`. Also delete `public/assets/costa-del-sol-bg.jpg` if present in dist source.

### 2.2 Replace every Del Sol GHL URL with the Everence filesafe.space URL
Files to edit (replace `https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png` with the new URL):
- `src/config/business.ts` (also update `width: 1200`, `height: 630`)
- `src/lib/schemaGenerator.ts`
- `supabase/functions/serve-seo-page/index.ts` (all 5 occurrences — including the unsplash fallback `og:image` at lines 989, 996)
- `supabase/functions/notify-portal-message/index.ts`
- `supabase/functions/notify-contracting-message/index.ts`
- `supabase/functions/upgrade-license/index.ts`
- `src/components/ApartmentsEditorLayout.tsx`
- `src/pages/ContractingIntake.tsx`
- `src/pages/portal/PortalLogin.tsx`
- `src/pages/TrainingEvent.tsx`

### 2.3 Fix SSG `og:image` / `twitter:image` references
For each, swap the relative `/assets/...` path for the filesafe.space URL:
- `scripts/generateStaticHomePage.ts` (og:image, twitter:image, AND keep the `<img src>` in static-header pointing at `/assets/logo-new.png` — that file is now Everence after step 2.1)
- `scripts/generateStaticLocationHub.ts` (og:image, twitter:image, JSON-LD logo)
- `scripts/generateStaticBuyersGuide.ts` (og:image, twitter:image, Recipe.image, JSON-LD logo)
- `scripts/generateStaticComparisonPages.ts` (JSON-LD logo)
- `scripts/generateStaticPages.ts` (JSON-LD logo)
- `src/lib/glossarySchemaGenerator.ts` (both occurrences)
- `src/lib/buyersGuideSchemaGenerator.ts` (LOGO_URL constant)

### 2.4 Edge-function deployment
Redeploy `serve-seo-page`, `notify-portal-message`, `notify-contracting-message`, `upgrade-license` so the live SEO pages and emails stop emitting Del Sol URLs.

### 2.5 Favicon / apple-touch-icon — flagged
The current `public/favicon.png`, `public/apple-touch-icon.png`, and `public/og-image.png` were set in the prior turn. Confirm they are the Everence mark and not a stale copy. The brand brief says use the filesafe.space PNG for OG; the favicon needs a square 192×192 (or 32×32) icon — the rectangular brand logo isn't ideal as a favicon but is acceptable temporarily.
- **TODO flagged for user**: provide a dedicated square 512×512 Everence icon PNG for `favicon.png` / `apple-touch-icon.png`. Until then, keep what's there (it's already Everence-derived) and do **not** swap it for the rectangular OG asset.

### 2.6 Final grep verification (zero matches expected)
```
grep -rE "del-sol|delsol|TLhrYb7SRrWrly615tCI|prime-homes|costa-del-sol-bg|costa-del-sol-locations|hans-" \
  src/ public/ scripts/ supabase/functions/ index.html
```
Acceptable remaining matches:
- `functions/_middleware.js` — 301 redirect rule for legacy `/blog/costadelsol/` paths (intentional, leave it)
- `supabase/migrations/*.sql` — historical seed data referencing legacy LinkedIn URLs (immutable migrations, leave them)

### 2.7 Build + spot-check
- `npm run build`
- Confirm `dist/` no longer contains `assets/costa-del-sol-bg.jpg` or any Del Sol image
- Confirm `dist/index.html` and `dist/en/index.html` have `og:image` pointing at the filesafe.space URL
- Confirm `dist/assets/logo-new.png` is the Everence mark (file size will change from 713813 B to whatever the new asset weighs)

---

## Files to change (Phase 2)

**Replaced binary assets**
- `src/assets/logo-new.png`
- `public/assets/logo-new.png`

**Deleted Del Sol files**
- `src/assets/logo.png`
- `src/assets/logo.jpeg`
- `src/assets/costa-del-sol-bg.jpg`
- `src/assets/hero-landing-costa-del-sol.jpg`

**URL swaps**
- `src/config/business.ts`
- `src/lib/schemaGenerator.ts`
- `src/lib/glossarySchemaGenerator.ts`
- `src/lib/buyersGuideSchemaGenerator.ts`
- `src/components/ApartmentsEditorLayout.tsx`
- `src/pages/ContractingIntake.tsx`
- `src/pages/portal/PortalLogin.tsx`
- `src/pages/TrainingEvent.tsx`
- `scripts/generateStaticHomePage.ts`
- `scripts/generateStaticLocationHub.ts`
- `scripts/generateStaticBuyersGuide.ts`
- `scripts/generateStaticComparisonPages.ts`
- `scripts/generateStaticPages.ts`
- `supabase/functions/serve-seo-page/index.ts`
- `supabase/functions/notify-portal-message/index.ts`
- `supabase/functions/notify-contracting-message/index.ts`
- `supabase/functions/upgrade-license/index.ts`

**Edge function redeploys**
- `serve-seo-page`
- `notify-portal-message`
- `notify-contracting-message`
- `upgrade-license`

---

## Outcome
- No flash of Del Sol logo on first paint (the file behind `/assets/logo-new.png` is now Everence)
- All `og:image` / `twitter:image` across every static page, SSR edge function, and email points at the canonical Everence brand asset
- All JSON-LD `Organization.logo` URLs point at the canonical Everence brand asset
- All Del Sol image files purged from the repo
- Social-platform caches will need a manual re-scrape (Facebook Debugger, LinkedIn Inspector, X Card Validator) — flagged in post-deploy report

