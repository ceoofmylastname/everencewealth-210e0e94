

## Production SSG delivery fix — make the generated HTML actually ship and resolve

Your diagnosis is mostly right, and the code audit shows two additional issues that must be fixed in the same pass.

### What the audit confirmed

- `package.json` still runs:
  - `"build": "tsx scripts/generateSitemap.ts && vite build"`
- `build.sh` now contains all SSG generators, but it currently calls `npm run build` at the top.
  - If we simply point `"build"` to `bash build.sh` without restructuring, it will recurse forever.
- `vite.config.ts` has the SSG plugins commented out, so the old generators are not running through Vite either.
- The new generators output many routes as flat files:
  - `dist/en/philosophy.html`
  - `dist/en/team.html`
  - `dist/en/glossary.html`
  - `dist/en/glossary/{slug}.html`
  - `dist/en/strategies/iul.html`
- Existing successful generators mostly use `.../index.html` directory routing.
- Homepage SSG currently writes `dist/home.html`, but nothing in `functions/_middleware.js` or routing serves `/` from `home.html`.

That means there are really **three** fixes, not one:
1. Deploy must run the full generator pipeline.
2. New SSG outputs must match extensionless route resolution reliably.
3. Homepage SSG must be wired to a file the host actually serves.

## Implementation plan

### 1) Fix the build pipeline without recursion

Update build flow so the deploy command runs the full static generation pipeline exactly once.

Recommended structure:
- In `package.json`:
  - add `"build:app": "vite build"`
  - change `"build"` to `"bash build.sh"`
- In `build.sh`:
  - add `set -euo pipefail`
  - replace `npm run build` with `npm run build:app` or `npx vite build`

This makes the production deploy run:
- app build
- app-shell generation
- all existing SSG generators
- the 4 new JSON-LD generators
- sitemap generation
- functions copy

### 2) Change the new generators to output directory-based `index.html` files

Do not keep the new routes as flat `.html` files. Match the already-working pattern used by blog/qa/compare/location pages.

Change outputs to:

```text
dist/en/strategies/iul/index.html
dist/en/strategies/whole-life/index.html
dist/en/strategies/tax-free-retirement/index.html
dist/en/strategies/asset-protection/index.html

dist/es/estrategias/seguro-universal-indexado/index.html
dist/es/estrategias/seguro-vida-entera/index.html
dist/es/estrategias/retiro-libre-impuestos/index.html
dist/es/estrategias/proteccion-de-activos/index.html

dist/en/philosophy/index.html
dist/es/philosophy/index.html

dist/en/team/index.html
dist/es/team/index.html

dist/en/glossary/index.html
dist/es/glossary/index.html

dist/en/glossary/{termSlug}/index.html
dist/es/glossary/{termSlug}/index.html
```

Files to update:
- `scripts/generateStaticStrategyPages.ts`
- `scripts/generateStaticPhilosophyPage.ts`
- `scripts/generateStaticGlossary.ts`
- `scripts/generateStaticTeamPage.ts`

This aligns the filesystem with the actual routes in `src/App.tsx` and avoids ambiguous clean-URL resolution.

### 3) Fix homepage SSG so `/` serves real static HTML

Right now `generateStaticHomePage.ts` writes `dist/home.html`, but nothing serves it.

Implement one of these in the same commit:

Preferred:
- keep `dist/app-shell.html` as the generic SPA shell
- make homepage generation write the English homepage to `dist/index.html`
- keep `/en/index.html` for the language-prefixed homepage

Alternative:
- add explicit middleware handling for `/` that serves `home.html`

Preferred is simpler and removes the current dead-file problem. The important rule is: **`/` must map to real generated HTML, not to unused `home.html`.**

Files:
- `scripts/generateStaticHomePage.ts`
- possibly `functions/_middleware.js` only if you choose the explicit `home.html` serving route

### 4) Keep middleware changes minimal unless preview still falls through

Current `_routes.json` includes all HTML routes, but that alone is not the main failure. The bigger issues are:
- the build pipeline never ran the generators in production
- the new generators wrote flat `.html` files
- homepage output is disconnected

So the routing order should be:

1. Fix build command
2. Fix output paths to `index.html`
3. Verify preview/build output
4. Only if extensionless routes still fall through, add narrow exclusions in `functions/_routes.json` for the fully static families:
   - `/en/strategies/*`
   - `/es/estrategias/*`
   - `/en/philosophy`
   - `/es/philosophy`
   - `/en/team`
   - `/es/team`
   - `/en/glossary*`
   - `/es/glossary*`

No blanket middleware rewrite is needed unless post-fix verification shows one of those route families is still being overridden.

### 5) Verify locally from a clean `npm run build`

After the code change, verify that the deploy command itself produces the real files.

Check for existence of:
- all 8 strategy route files
- philosophy EN/ES
- team EN/ES
- glossary index EN/ES
- glossary term pages
- homepage at `dist/index.html`
- existing generators’ outputs (qa, compare, locations, buyers-guide, about, blog)

Then verify each generated file contains schema:
- strategies: expect 6 JSON-LD blocks each
- philosophy: expect 4
- glossary index: expect 3
- glossary term: expect 2
- team: expect 4
- homepage: expect at least 1 graph block

Also preserve the existing guardrail:
- do not remove any remaining Helmet JSON-LD from legacy routes unless the baked HTML is confirmed present in the generated files and then again in production.

### 6) Publish and verify production

After publish, confirm the production build actually ran `bash build.sh` by capturing the publish/build log excerpt showing:
- build command used
- generator steps executed
- counts of generated routes

Then re-check the previously failing URLs with ClaudeBot user-agent and report:
- JSON-LD block count
- title
- canonical
- whether the page is static HTML or SPA fallback

Priority verification set:
- `/`
- `/en/strategies/asset-protection`
- `/en/philosophy`
- `/en/glossary`
- `/en/glossary/indexed-universal-life`
- `/en/team`
- `/en/qa`
- `/en/compare`
- `/en/locations`

## Expected outcome

This single deploy should unblock all of the currently dark routes because it fixes the real production gap:
- the full generator pipeline actually runs during deploy
- generated files match route resolution shape
- homepage is no longer written to an unserved filename

## Files to change

- `package.json`
- `build.sh`
- `scripts/generateStaticHomePage.ts`
- `scripts/generateStaticStrategyPages.ts`
- `scripts/generateStaticPhilosophyPage.ts`
- `scripts/generateStaticGlossary.ts`
- `scripts/generateStaticTeamPage.ts`
- possibly `functions/_routes.json` only if post-build preview still falls through after the path-shape fix

## Post-fix report format

1. Final build command used in production
2. Build log excerpt showing each generator ran
3. Dist file existence list for all new route families
4. Grep counts of `application/ld+json` per generated route
5. Production curl verification for the 9 priority URLs
6. Any `_routes.json` exclusions added, or confirmation that none were needed

