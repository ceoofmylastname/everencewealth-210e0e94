## Goal

Replace the four SPA-shell informational pages (`/about`, `/team`, `/contact`, `/philosophy` in EN + ES) with database-driven SSR'd HTML that bakes visible body content + JSON-LD into pre-hydration markup — identical pattern to `/en/team/steven-rosenberg/` (Fix 13 Phase 3). Bots that don't execute JS see a complete H1, 600-1200 word body, and ≥3 JSON-LD blocks.

## Slug verification (settled)

From `src/App.tsx`:
- `/:lang/about` and `/:lang/about-us` → `<About />`
- `/:lang/team` → `<Team />`
- `/:lang/contact` → `<Contact />`
- `/:lang/philosophy` → `<Philosophy />` (with `/es/filosofia` → `/es/philosophy` redirect)

**Decision:** Seed `static_pages.slug` with English-named slugs (`about`, `team`, `contact`, `philosophy`) for both languages. Prebuilt files land at `dist/{en|es}/{slug}/index.html`. Hreflang block reflects this.

## Step 0 — Read existing generators first (NEW)

Before writing the new prebuild script, read all three existing scripts in full:
- `scripts/generateStaticAboutPage.ts`
- `scripts/generateStaticTeamPage.ts`
- `scripts/generateStaticPhilosophyPage.ts`

Preserve any compliance-approved JSON-LD shapes, copy fragments, or edge-case logic. If anything in the existing scripts conflicts with the new spec (e.g., schema `@type` choice, breadcrumb structure, dateModified strategy), surface the conflict in chat before deciding which wins. Default precedence: existing script's compliance-approved shape > PROMPT 12 spec > my own draft.

## Step 1 — Database migration

Create `static_pages` table per spec (UUID PK, `(slug, language)` unique, `page_type` CHECK constraint, content columns NOT NULL, `hero_image_url` nullable, three timestamps).

Triggers:
1. `static_pages_set_updated_at` (`BEFORE UPDATE`, `WHEN` clause checks the four content columns) — backed by a new `public.set_static_pages_updated_at()` function that bumps `updated_at = NOW()`.
2. `static_pages_block_fiduciar` (`BEFORE INSERT OR UPDATE`) — extend the existing `public.enforce_fiduciary_term_block()` function to add a `static_pages` branch validating `title`, `meta_description`, `h1`, `body_markdown`. Do NOT create a parallel function.

RLS: enable; public `SELECT`; admin-only writes via `public.is_admin(auth.uid())`.

## Step 2 — Compliance pre-grep on seed copy (EXPANDED)

Before inserting any seed row, grep all 8 draft `body_markdown` blocks for the following regulated terms in addition to `\yfiduciar`:

- `\bRIA\b`
- `Registered Investment Advisor`
- `fee-only`
- `advice-not-product` / `advice not product`
- `wealth manager` (when used as self-title)
- `financial planner` (when used as self-title without CFP qualifier)

Rule: if any appear in **self-claim context** (not third-party citation, not protective disclaimer), rewrite to neutral framing such as "independent insurance and tax-advantaged retirement strategist" or "licensed life insurance professional specializing in tax-free retirement income". Surface the grep output in chat before seeding so you can spot-check.

The DB trigger only enforces `\yfiduciar`; the rest is enforced at draft time by the agent.

## Step 3 — Seed 8 rows (insert tool)

4 page_types × 2 languages. Each row:
- 600-1200 word `body_markdown`, compliance-clean
- Real H1, title, meta description
- `hero_image_url` where available

Sources for draft copy: project memory (`mem://project/identity`, `mem://features/strategic-frameworks`, `mem://features/philosophy-interactive-architecture`, `mem://project/contact-details`) + visible copy in current React pages. ES rows are faithful translations.

Per-page focus:
- **about** — Mission, Three Silent Killers, Steven's authority positioning, what makes Everence independent
- **team** — Team intro; bio data fetched live from `authors` at prebuild (not duplicated in `static_pages`)
- **contact** — Address, phone, email, response-time expectations, free-consultation framing, A2P-compliant note
- **philosophy** — Three Tax Buckets, retirement-gap framework, indexed strategies overview

## Step 4 — Prebuild script: `scripts/generateStaticPagesPrebuild.ts`

Mirrors `scripts/generateStaticAuthorBioPage.ts`:

1. Read production assets from `dist/index.html` (CSS/JS hashes).
2. Fetch all 8 rows from `static_pages` ordered by `(language, page_type)`.
3. For `page_type='team'`, also fetch Steven Rosenberg from `authors` to assemble Person collection.
4. Render markdown body to HTML using `marked` (verify in `package.json`; add only if missing).
5. Build per-type JSON-LD (≥3 blocks each), preserving shapes from the existing 3 generators where they overlap:
   - **about**: `AboutPage` + `Organization` (FinancialService) + `BreadcrumbList`
   - **team**: `WebPage` + `ItemList` of `Person` references + `BreadcrumbList`
   - **contact**: `ContactPage` + `Organization` with `contactPoint` + `BreadcrumbList`
   - **philosophy**: `WebPage` + `Article` + `BreadcrumbList`
6. Render full HTML doc:
   - `<head>`: title, meta description, canonical (trailing slash), hreflang en/es/x-default (x-default → en), OG tags, Twitter card, favicons, JSON-LD scripts, CSS links
   - `<body data-prebuilt="static-page" data-page-type="{type}">`: `<div id="root">` containing `<h1>`, hero image, rendered body HTML, footer Org block, then module scripts after `</div>`
7. Write to `dist/{lang}/{slug}/index.html`.
8. Log: `static_pages: {lang}/{slug} -> {bytes} bytes, {schemaCount} JSON-LD`.
9. Return generated paths for the sitemap step.

## Step 5 — React/prebuild substance parity (NEW verification)

Before shipping, manually diff each prebuilt body against what the React component renders for the same route. Standard:
- **Substance parity required**, not styling parity.
- If `Philosophy.tsx` renders an interactive Three Tax Buckets component and seed `body_markdown` is static prose describing the same three buckets with the same key facts → acceptable.
- If the React component renders entirely different topical content than the seed → that's effectively cloaking; revise the seed to match the React substance before deploying.

Surface a diff summary per page in chat at the verification stage.

## Step 6 — `/:lang/about-us` duplicate-content fix (NEW)

Both `/:lang/about` and `/:lang/about-us` currently route to `<About />`. Resolution:

1. Add Cloudflare Pages middleware redirect in `functions/_middleware.js`: 301 `/(en|es)/about-us/?` → `/(en|es)/about/`. Preserves existing backlinks.
2. Remove the `/:lang/about-us` route from `src/App.tsx`.

Middleware redirect is safer than just dropping the route (preserves any external backlinks).

## Step 7 — Build chain

Update `build.sh`:
- Replace the three invocations (`generateStaticAboutPage.ts`, `generateStaticPhilosophyPage.ts`, `generateStaticTeamPage.ts`) with a single `generateStaticPagesPrebuild.ts` call.
- Keep `generateStaticAuthorBioPage.ts` (different concern).
- Keep sitemap generation last.

The three superseded scripts stay on disk but unwired (delete in a follow-up; not removing now to keep the change surgical).

## Step 8 — Sitemap

Update `public/sitemap-core.xml`:
- Add 7 new entries (`/en/about/`, `/es/about/`, `/en/team/`, `/es/team/`, `/en/contact/`, `/es/contact/`, `/es/philosophy/`).
- Normalize existing `/en/philosophy` to trailing slash.
- Each with `<lastmod>` from `static_pages.updated_at` and `<xhtml:link rel="alternate" hreflang>` pairs.

Trailing slashes match the bio page convention to eliminate the 308 hop on Cloudflare Pages.

## Step 9 — React route hydration safety

The four page components (`About.tsx`, `Team.tsx`, `Contact.tsx`, `Philosophy.tsx`) get a small mount-time check: read `document.body.dataset.prebuilt`; if `'static-page'`, the prebuilt DOM is canonical pre-hydration. React renders into `#root` as today. No data-fetch changes; no UI change. Same hydration pattern as the bio page.

## Step 10 — Do NOT touch

- `supabase/functions/serve-seo-page/index.ts`
- Hub renderers for `/blog`, `/qa`, `/locations`, `/compare`
- (`functions/_middleware.js` IS touched, but only to add the `/about-us` 301)

## Verification (post-deploy)

User's bash loop. PASS criteria per row:
- HTTP/2 200 (trailing slash → no 308)
- `h1=1`
- `schema >= 3`
- `words >= 400`

Plus 9th check: `curl -sIL /en/about-us/` returns 301 → `/en/about/`.

## Files changed

**Created:**
- `supabase/migrations/<ts>_static_pages_table.sql` — table, triggers, RLS, extended `enforce_fiduciary_term_block()`
- `scripts/generateStaticPagesPrebuild.ts`

**Edited:**
- `build.sh` — swap 3 generators for new prebuild
- `public/sitemap-core.xml` — add 7 entries, normalize trailing slashes
- `src/App.tsx` — remove `/:lang/about-us` route
- `functions/_middleware.js` — add 301 for `/about-us` → `/about`
- `src/pages/About.tsx`, `Team.tsx`, `Contact.tsx`, `Philosophy.tsx` — hydration-safety read of `data-prebuilt`

**Data ops (insert tool, not migration):**
- 8 seed rows in `static_pages`