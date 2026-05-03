## PROMPT 27 — Soft 404 Sweep + Slug-Suffix Dedup + Sitemap Resubmit

Three coordinated remediations. Branch: `gsc-soft404-and-dedup-2026-05-02`.

### Pre-flight findings

- `functions/_middleware.js` already has `STATIC_ROUTE_EXEMPT` (line 43), `STRUCTURAL_410_PATTERNS` (78), `REDIRECT_MAP` (433). The map already contains `/schedule`, `/financial-needs-assessment`, `/disclosures`, `/en/calculator`→`/en/`, `/es/calculator`→`/es/`, `/en/careers`→`/en/`, `/es/careers`→`/es/`, `/en/contact/fna`. These need to be **changed**, not added.
- `STRUCTURAL_410_PATTERNS` line 82 already 410s the legacy `/en/blog/<old-cat>/*` and line 83 the costadelsol paths — Bucket A's regex-matchable URLs are already gone via pattern. Only the literal odd-balls (`/blog/category/*`, `/es/stories`, the suffixed slug) need explicit `gone_urls` rows.
- DB confirms 60 rows (all `qa_pages`, `language='es'`) match the suffix regex; 0 in `blog_articles`. The "translate-cluster" generator at line 386 is **not** the producer (uses `cluster_number-rand4`). Source of `-process-XX-XXXXXXXX` is unidentified in current code — likely from a deleted/older job. Generator-fix scope shrinks to a guard, not a rewrite.
- `src/pages/Calculator.tsx` does not exist; a Calculator page must be created (or `/calculator` redirects kept and we skip Bucket C). User asked for SSR hub_cache + route wire — we'll build a thin `Calculator.tsx` page that mounts a placeholder calc and reads the hub_cache intro.
- Sitemap generators: `supabase/functions/regenerate-sitemap/index.ts` and `scripts/generateSitemap.ts`. Both need the dedup `Set` filter + `assertNoDuplicateLocs`.

### Plan

#### Fix 1A — Bucket A: 410 sweep (gone_urls)
New migration `*_soft404_gone_urls.sql` inserting the 22 paths from the prompt into `gone_urls` with `ON CONFLICT (path) DO NOTHING`. Run the wealth-management/tax-planning audit query first inside a `DO` block — only insert paths where no live `blog_articles` row matches. Paths already covered by `STRUCTURAL_410_PATTERNS` regex are still safe to insert (idempotent, defense in depth).

#### Fix 1B — Bucket B: 301 redirects (REDIRECT_MAP)
Edit `functions/_middleware.js` REDIRECT_MAP:
- **Change** `/en/calculator` and `/es/calculator` → remove (Bucket C wires them as 200s).
- **Change** `/en/careers` → `/en/join-our-team/`, `/es/careers` → `/es/unete-nuestro-equipo/`. **Verify these targets exist before merge**; if not, leave as `/en/` and `/es/` and flag in PR.
- **Change** `/en/contact/fna` → `/en/assessment/`.
- **Change** `/en/tax-bucket-guide` → `/en/blog/tax-planning/understanding-three-tax-buckets` and `/es/tax-bucket-guide` → `/es/blog/tax-planning/entender-tres-cubetas`. **Verify both blog targets exist** via `SELECT slug FROM blog_articles WHERE slug IN (...)`. If missing, fall back to `/en/strategies/tax-free-retirement/` (current target).
- **Add** `/financial-planning/three-tax-buckets` → `/en/blog/tax-planning/understanding-three-tax-buckets` (with same fallback rule).
- **Add** `/wealth-strategies/zero-is-your-hero` → `/en/blog/wealth-management/zero-is-your-hero` (same rule).
- **Add** `/es/acerca` → `/es/acerca-de/`, `/es/contacto` → `/es/contact/`.
- `/disclosures`, `/schedule`, `/financial-needs-assessment` already correct — leave.

#### Fix 1C — Bucket C: Calculator route + hub_cache SSR
- New file `src/pages/Calculator.tsx`: lightweight component that fetches the matching `hub_cache` row (by `slug = '/<lang>/calculator/'`) and renders its HTML server-side via the existing hub_cache rendering pattern used by `/en/assessment/`. Below the SSR block, mount a placeholder calculator UI (<5 inputs, 1 output) in a div with id `calculator-mount`.
- `src/App.tsx`: lazy import + 2 routes (with and without trailing slash).
- `functions/_middleware.js`: add `/en/calculator`, `/en/calculator/`, `/es/calculator`, `/es/calculator/` to `STATIC_ROUTE_EXEMPT`.
- New migration `*_calculator_hub_cache.sql`: insert 2 rows into `hub_cache` (en + es) with the `<header>` + speakable summary HTML from the prompt.

#### Fix 2 — Slug-suffix dedup (qa_pages only, 60 rows)
- New migration `*_dedup_slug_suffixes.sql`:
  - Create `slug_dedup_log` table.
  - For each suffixed `qa_pages` row: derive canonical slug, check for canonical row in same language. If canonical exists → insert `/es/qa/<suffixed_slug>` into `gone_urls`, delete suffixed row, log `merged`. If not → `UPDATE` slug to canonical, log `renamed`.
  - Skip `blog_articles` block (0 rows) but include the SQL commented out for parity.
- **Generator guard**: edit `supabase/functions/translate-cluster/index.ts` line 386 to use deterministic counter-based dedup (`generateUniqueSlug` helper) instead of `cluster_number-rand4`. While we did not confirm this is the producer of the `-process-XX-` pattern, the random-suffix approach is still wrong per the audit; this prevents regression.

#### Fix 2B — Sitemap dedup
- Edit `supabase/functions/regenerate-sitemap/index.ts` and `scripts/generateSitemap.ts`: add a `Set<string>`-based filter before XML emission, plus an `assertNoDuplicateLocs(xml, path)` function that throws if duplicates are detected.

#### Fix 3 — Resubmit + log
- Append a dated entry to `Branded/log.md` recording PROMPT 27 ship + pre-deploy GSC counts (49 soft 404, 602 discovered-not-indexed, 20 dup-canonical).
- Manual step (post-deploy, called out in PR description, not coded): resubmit `sitemap-index.xml` in GSC + Bing, run `bun run scripts/indexnowBulkSubmit.ts`.

### Files changed

```text
supabase/migrations/<ts>_soft404_gone_urls.sql        NEW
supabase/migrations/<ts>_dedup_slug_suffixes.sql      NEW
supabase/migrations/<ts>_calculator_hub_cache.sql     NEW
functions/_middleware.js                              EDIT (REDIRECT_MAP + STATIC_ROUTE_EXEMPT)
src/App.tsx                                           EDIT (Calculator route)
src/pages/Calculator.tsx                              NEW
supabase/functions/translate-cluster/index.ts         EDIT (slug dedup guard, line 386)
supabase/functions/regenerate-sitemap/index.ts        EDIT (Set dedup + assertion)
scripts/generateSitemap.ts                            EDIT (Set dedup + assertion)
Branded/log.md                                        APPEND
```

### Risks / open items I'll resolve at build time

1. `/en/blog/tax-planning/understanding-three-tax-buckets` and `/es/blog/tax-planning/entender-tres-cubetas` existence — verified via `SELECT` before writing the redirect; fall back to current targets if missing.
2. `/en/join-our-team/` and `/es/unete-nuestro-equipo/` existence — same.
3. The actual producer of `-process-XX-XXXXXXXX` slugs is not in current code (likely older deleted job). Cleanup migration handles existing rows; the generator guard prevents the documented PROMPT 24 path from regressing. If new suffixed rows reappear, that's a separate hunt.
4. `Calculator.tsx` will be a stub (3-input projection). Full calculator UX is out of scope per prompt — only the SSR hub_cache + 200 OK matter for indexing.

### Acceptance check (post-deploy, manual via curl)

Run the verification block from the prompt. All 410s, 301s, body-word > 80 on calculator pages, 0 suffixed slugs, 0 dup `<loc>`, IndexNow 200/202.
