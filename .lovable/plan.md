

## Purge `kazggnufaoicopvmwhdl` from the codebase, point everything at `zbzrmpmqijvmjbhctfoe`

### Root cause (newly discovered, not in your prompt)

`build.sh` lines 5-6 contain:
```bash
export VITE_SUPABASE_URL="https://kazggnufaoicopvmwhdl.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="eyJ...ref:kazggnufaoicopvmwhdl..."
```

That export runs **before any generator**, which is why the build log showed Del-Sol-shaped data (3,808 articles, 10 European languages) even though Cloudflare Pages env vars are unset and `.env` points at the right project. Vite would also pick this up. **This is the single biggest fix.**

### Full grep results (8 code files + 6 docs)

**Code files to fix (8):**
1. `build.sh` — lines 5-6 (hardcoded export — root cause)
2. `functions/_middleware.js` — lines 10-11 (SSR runtime URL + key)
3. `index.html` — line 42 (DNS prefetch)
4. `public/app-shell.html` — line 25 (DNS prefetch)
5. `public/cloudflare-worker.js` — line 31 (edge function URL — legacy worker, may be unused but consistent)
6. `scripts/generateAppShell.ts` — line 69 (DNS prefetch)
7. `scripts/sampleQAPages.ts` — lines 4-5 (silent fallback)
8. `scripts/testAllLanguagesQA.ts` — lines 4-5 (silent fallback)
9. `scripts/generatePriorityQAUrls.ts` — lines 6-7 (silent fallback)
10. `src/pages/admin/MigrateImages.tsx` — line 138 (string match in URL classifier — update to match new ref)

**Docs (informational only — fix for accuracy):**
- `docs/crm/CRM_DEPLOYMENT_GUIDE.md` (lines 59, 61, 244, 324)
- `docs/crm/CRM_MONITORING_GUIDE.md` (line 54)
- `PERFORMANCE.md` (line 101)
- `DEPLOYMENT_GUIDE.md` (lines 297, 299)
- `supabase/cron_jobs.sql` (line 3 — comment)
- `supabase/migrations/20260103041602_*.sql` (line 29 — historical migration; do NOT edit applied migration — leave as-is)

**Files already correct:**
- `scripts/generateSitemap.ts` — fallback already points at `zbzrmpmqijvmjbhctfoe` ✓
- 6 SSG generators (`generateStaticPages/QAPages/ComparisonPages/LocationPages/LocationHub/AboutPage`) already use `process.env.VITE_SUPABASE_URL!` (non-null assertion, no fallback) ✓
- `verifySsgDeployment.ts`, `validateAEOImplementation.ts` already fail-fast ✓
- The 4 newly added generators (Strategy/Philosophy/Glossary/Team) and Home/BuyersGuide do not call Supabase at all ✓

### Implementation plan

**Step 1 — Fix `build.sh` (root cause)**

Replace the hardcoded exports with the correct project. Two valid approaches; recommended is **option A** (keep export, correct value) so the build is reproducible regardless of Cloudflare Pages env state:

```bash
export VITE_SUPABASE_URL="https://zbzrmpmqijvmjbhctfoe.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienJtcG1xaWp2bWpiaGN0Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjk1MzUsImV4cCI6MjA4Njc0NTUzNX0.cI7HQmbY1XF_wmPMSm9ofbQdR3iujQ5_YNg8h_YLkVg"
```

**Step 2 — Fix runtime SSR middleware (`functions/_middleware.js`)**

Replace URL + anon key on lines 10-11 with the Everence values. Cloudflare Pages Functions cannot read env vars at runtime here, so hardcoding is intentional — just hardcode the *correct* project.

**Step 3 — Fix DNS prefetch hints (3 files)**

Update `index.html` line 42, `public/app-shell.html` line 25, `scripts/generateAppShell.ts` line 69 — same one-line replacement.

**Step 4 — Fix legacy/utility scripts with silent fallbacks (3 files)**

Per your instruction, replace the `process.env.X || 'hardcoded'` pattern in `sampleQAPages.ts`, `testAllLanguagesQA.ts`, `generatePriorityQAUrls.ts` with fail-fast:

```ts
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — aborted');
}
```

**Step 5 — Apply same fail-fast to `generateSitemap.ts`**

Currently has fallback to `zbzrmpmqijvmjbhctfoe` (correct project but still silent). Convert to fail-fast for consistency and to surface env regressions immediately. The 6 already-correct generators using `!` non-null assertion are fine — those crash on undefined access naturally.

**Step 6 — Update `public/cloudflare-worker.js`**

Line 31 edge function URL → new project. (This worker file may be unused legacy, but if it's deployed anywhere it would call the wrong project's edge function.)

**Step 7 — Update `src/pages/admin/MigrateImages.tsx` line 138**

Change the URL classifier string match from `'kazggnufaoicopvmwhdl'` to `'zbzrmpmqijvmjbhctfoe'` so the admin migration tool correctly identifies Supabase-hosted images.

**Step 8 — Update docs (5 files)**

Find/replace `kazggnufaoicopvmwhdl` → `zbzrmpmqijvmjbhctfoe` in the 5 markdown/config docs listed above. Skip the applied SQL migration (`20260103041602_*.sql`) — never edit applied migrations.

### Verification (post-edit)

1. `grep -rn "kazggnufaoicopvmwhdl" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.html" --include="*.json" --include="*.sh"` → expect **zero matches** (excluding the applied migration which lives in `*.sql`).
2. `npm run build` locally → confirm build log shows blog_articles ≈ 84, qa_pages ≈ 336, languages = `en, es`, no `state_code` error, all 4 new generators emit their `index.html` files.
3. `grep -c "application/ld+json" dist/en/strategies/iul/index.html` → expect ≥ 1 (Guardrail B from prior plan).
4. Publish, then curl-verify the 9 priority URLs with ClaudeBot UA.

### Files to change (10 code + 5 docs)

**Code:**
- `build.sh`
- `functions/_middleware.js`
- `index.html`
- `public/app-shell.html`
- `public/cloudflare-worker.js`
- `scripts/generateAppShell.ts`
- `scripts/sampleQAPages.ts`
- `scripts/testAllLanguagesQA.ts`
- `scripts/generatePriorityQAUrls.ts`
- `scripts/generateSitemap.ts` (fail-fast conversion)
- `src/pages/admin/MigrateImages.tsx`

**Docs:**
- `docs/crm/CRM_DEPLOYMENT_GUIDE.md`
- `docs/crm/CRM_MONITORING_GUIDE.md`
- `PERFORMANCE.md`
- `DEPLOYMENT_GUIDE.md`
- `supabase/cron_jobs.sql` (comment only)

**Explicitly NOT changed:**
- `supabase/migrations/20260103041602_*.sql` — applied migration, immutable history
- The 6 SSG generators already using `process.env.X!` — already correct
- `.env` and `src/integrations/supabase/client.ts` — already correct

### Post-deploy report format

1. Pre-edit grep count: 149 matches across 20 files
2. Post-edit grep count: 0 (in code) / 1 (in immutable SQL migration, expected)
3. Local build log excerpt: row counts + language breakdown
4. Production curl audit: 9 priority URLs, JSON-LD block count per route
5. Confirmation that `_middleware.js` runtime SSR now hits the correct DB

