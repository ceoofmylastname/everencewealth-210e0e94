# PROMPT 12 — Static SSR for /team, /philosophy, /contact (Option A, finalized)

Scope narrowed to the 3 pages with the SPA-shell soft-content problem. `/about` opts out (already DB-driven via `about_page_content` with 6 schemas + 700+ word baked body — working pipeline).

## Goal

Eliminate empty-body shells on `/team`, `/philosophy`, `/contact` for non-JS bots (ClaudeBot, GPTBot, Applebot-Extended, PerplexityBot). Today these serve 7-9 visible words pre-hydration. After this ships: 600-1200 words of compliance-clean visible body + preserved JSON-LD schemas, baked into pre-hydration HTML at trailing-slash URLs, with inline critical CSS so humans see styled content immediately.

## What the user will see

- `https://www.everencewealth.com/{en,es}/team/` — 4 schemas (AboutPage, FinancialService, Person, BreadcrumbList) + visible H1 + body + advisor section, styled pre-hydration.
- `https://www.everencewealth.com/{en,es}/philosophy/` — 5 schemas (WebPage, FinancialService w/ nested founder @id-ref, Person, BreadcrumbList, SpeakableSpecification) + visible body covering Three Silent Killers framework.
- `https://www.everencewealth.com/{en,es}/contact/` — 3 schemas (ContactPage, FinancialService, BreadcrumbList) + visible body + contact details.
- React hydrates over the prebuilt DOM cleanly — no flash, no double-render.
- `/about` untouched.

## Database

**New table** `public.static_pages`:

```text
id              uuid pk default gen_random_uuid()
slug            text   ('team' | 'philosophy' | 'contact')
language        text   ('en' | 'es')
page_type       text   ('AboutPage' | 'WebPage' | 'ContactPage')
title           text
meta_description text
h1              text
body_markdown   text   600-1200 words
created_at      timestamptz default now()
updated_at      timestamptz default now()
unique (slug, language)
```

**Triggers**:
- `static_pages_set_updated_at` — bumps `updated_at` ONLY when `title`, `meta_description`, `h1`, or `body_markdown` actually change (not on every UPDATE). This makes `updated_at` an authentic content-change signal.
- Extend existing `public.enforce_fiduciary_term_block()` to validate `title`, `meta_description`, `h1`, `body_markdown` on `static_pages`.

**RLS**: Enabled. Public SELECT (build-time read by service role; content is public). No write policies — managed via insert tool.

**Seed**: 6 rows drafted from project memory + existing React component visible copy. Pre-seed grep for regulated terms (`fiduciary`, `RIA`, `fee-only`, ambiguous "advisor" usage) — Steven is an independent insurance broker, not an RIA.

## Static generator

**New file** `scripts/generateStaticInformationalPages.ts` (category name; works for 3 pages).

Reads `static_pages` via service role + Supabase client, renders markdown via `marked`, emits per-page schemas, writes `dist/{lang}/{slug}/index.html` with directory-based trailing-slash routing.

### `dateModified` resolution (per row, NOT git log)

The body lives in DB, not the TSX file. Git log of `Team.tsx` would be wrong in both directions (styling tweaks bump it falsely; insert-tool body edits don't bump it at all).

Resolution order, per row:
1. `static_pages.updated_at` (primary — trigger only fires on content changes)
2. `static_pages.created_at` (fallback)
3. Hardcoded `2026-04-12T00:00:00Z` (last-resort)

Same source feeds sitemap `<lastmod>`.

### Schema richness rule

Preserve all schemas from existing generators. Net counts after PROMPT 12:

| Page | Schemas |
|------|---------|
| /team | AboutPage + FinancialService (#organization) + Person (#steven-rosenberg, full def) + BreadcrumbList |
| /philosophy | WebPage + FinancialService (#organization, w/ `founder: { "@id": ".../team/steven-rosenberg/#person" }`) + Person (top-level, references same @id) + BreadcrumbList + SpeakableSpecification |
| /contact | ContactPage + FinancialService (#organization) + BreadcrumbList |

**Person @id discipline**: The canonical Person definition lives on `/en/team/steven-rosenberg/#person` (existing bio page). All other Person references across the site (philosophy founder nest, team page, future pages) use `{ "@id": "https://www.everencewealth.com/en/team/steven-rosenberg/#person" }` — never duplicated objects. Keeps the @id graph linked so AI engines resolve all Steven references as one entity.

All schemas pull from `src/config/business.ts` — single source of truth.

### Inline critical CSS

Match `generateStaticAuthorBioPage.ts` and `generateStaticPages.ts` convention. Inline `<style>` block in `<head>` covering:
- Typography: Playfair Display (headings), Lato (body), Raleway (accents)
- Layout: max-width container, padding, line-height
- H1/H2 sizing, breadcrumb styling, body paragraph rhythm
- Color tokens matching the live theme (#d4a574 accent, neutral surfaces)

Bots ignore CSS; humans get styled content immediately. Eliminates the 200-500ms FOUC window.

### HTML structure

```text
<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta + title + description + canonical + hreflang (trailing slashes) />
  <link rel="canonical" href=".../{lang}/{slug}/" />
  <link rel="alternate" hreflang="en" href=".../en/{slug}/" />
  <link rel="alternate" hreflang="es" href=".../es/{slug}/" />
  <link rel="alternate" hreflang="x-default" href=".../en/{slug}/" />
  <style>{CRITICAL_CSS}</style>
  <script type="application/ld+json" data-schema="{slug}">...</script>  // × N
  <link rel="stylesheet" href="{prod CSS}" />
</head>
<body data-prebuilt="static-page" data-slug="{slug}">
  <div id="root">
    <h1>{h1}</h1>
    <nav class="breadcrumb">...</nav>
    <article>{rendered markdown}</article>
  </div>
  <script type="module" src="{prod JS}"></script>
</body>
</html>
```

Production CSS/JS asset paths read from `dist/index.html` (same pattern as existing generators).

## React component updates

`src/pages/Team.tsx`, `src/pages/Philosophy.tsx`, `src/pages/Contact.tsx`:
- `useEffect` check for `document.body.dataset.prebuilt === 'static-page'` (marker for analytics/debug).
- Substance parity: rendered React output stays substantively similar to baked markdown (same topics, similar length, key phrases preserved) — avoids cloaking flags. Not pixel-perfect.
- `Philosophy.tsx` line 34: fix stale Spanish canonical from `/es/filosofia` → `/es/philosophy/` (trailing slash).
- Existing `<Helmet>` blocks remain (harmless duplicates post-SSR; preserves dev experience).

## Routing & redirects

`functions/_middleware.js`:
- Remove incorrect entries from `SLUG_MAP_EN_TO_ES` (`about → acerca`, `team → equipo`, `philosophy → filosofia`, `contact → contacto`). Actual app routes are English-slug-only for both langs.
- Add 301: `/:lang/about-us` → `/:lang/about/`.
- Trailing-slash 308 rule continues to apply via Cloudflare Pages directory serving.

`src/App.tsx`: no route changes.

## Build pipeline

`build.sh`:
- Replace `generateStaticPhilosophyPage.ts` and `generateStaticTeamPage.ts` calls with single `generateStaticInformationalPages.ts`.
- Keep `generateStaticAboutPage.ts` as-is.
- New generator runs after `generateAppShell.ts`, before `generateSitemap.ts`.

## Sitemap

`public/sitemap-core.xml`: 6 trailing-slash entries with hreflang pairs:
- `/en/team/`, `/es/team/`
- `/en/philosophy/`, `/es/philosophy/`
- `/en/contact/`, `/es/contact/`

`<lastmod>` per entry pulls from `static_pages.updated_at` (same resolution as schema dateModified). Remove any existing no-slash duplicates.

## Verification (post-deploy)

```bash
for path in /en/team /es/team /en/philosophy /es/philosophy /en/contact /es/contact; do
  code=$(curl -sI -A "ClaudeBot/1.0" "https://www.everencewealth.com$path/" | head -1 | awk '{print $2}')
  h1=$(curl -sL -A "ClaudeBot/1.0" "https://www.everencewealth.com$path/" | grep -oc '<h1')
  schema=$(curl -sL -A "ClaudeBot/1.0" "https://www.everencewealth.com$path/" | grep -oc 'application/ld+json')
  words=$(curl -sL -A "ClaudeBot/1.0" "https://www.everencewealth.com$path/" | python3 -c "import sys,re; t=re.sub('<[^>]+>',' ',sys.stdin.read()); print(len(t.split()))")
  echo "$path | $code | h1=$h1 | schema=$schema | words=$words"
done
```

PASS per row: HTTP 200, h1=1, schema≥3, words≥400.

Additional spot-check: confirm philosophy founder reference uses `@id` ref (not duplicated Person), and confirm one row's `dateModified` matches `static_pages.updated_at` exactly.

## File-by-file change list

**Created**:
- `supabase/migrations/{timestamp}_static_pages_table.sql` — table + content-aware updated_at trigger + extend enforce_fiduciary_term_block + RLS
- `scripts/generateStaticInformationalPages.ts`
- Insert tool call to seed 6 `static_pages` rows

**Edited**:
- `build.sh`
- `functions/_middleware.js`
- `public/sitemap-core.xml`
- `src/pages/Team.tsx`
- `src/pages/Philosophy.tsx` (incl. line 34 stale ES canonical fix)
- `src/pages/Contact.tsx`

**Deleted**:
- `scripts/generateStaticTeamPage.ts`
- `scripts/generateStaticPhilosophyPage.ts`

**Untouched**: `src/pages/About.tsx`, `scripts/generateStaticAboutPage.ts`, `about_page_content` table.

## Out of scope (queued separately)

1. `/about` schema audit + substance-parity check
2. Codebase audit doc note: `about_page_content` ≠ `static_pages`
3. PROMPT 17 (46 Soft 404s) ships next per GSC-driven reorder
