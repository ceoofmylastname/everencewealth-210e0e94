

## SSR JSON-LD Migration — with Step 2 + Step 4 guardrails

Approved plan from previous round, plus two pre-flight verification gates that prevent regressing schemas to "visible to nobody."

### Guardrail A — Pre-Step-4 verification (already-SSG'd routes)

**Before** deleting any Helmet JSON-LD from `Home.tsx`, `QAPage.tsx`, `ComparisonPage.tsx`, or `LocationHub.tsx`, run against current production:

```bash
for url in "https://www.everencewealth.com/" \
           "https://www.everencewealth.com/en/qa" \
           "https://www.everencewealth.com/en/compare" \
           "https://www.everencewealth.com/en/locations"; do
  echo -n "$url: "
  curl -sA "ClaudeBot/1.0" "$url" | grep -c "application/ld+json"
done
```

**Decision matrix per route:**
- Count ≥ 1 → SSG generator is working. Safe to delete Helmet duplicate.
- Count = 0 → SSG generator is broken or not running. **Do NOT delete Helmet.** Fix the generator first (`scripts/generateStaticHomePage.ts`, `scripts/generateStaticQAPages.ts`, `scripts/generateStaticComparisonPages.ts`, `scripts/generateStaticLocationHub.ts`), re-verify, then delete.

This guardrail does not apply to strategies / philosophy / glossary / team cleanup — those routes don't have working SSG yet, so Step 2 adds the generator first and Step 4 deletion happens only after Step 6 verification confirms the new HTML carries the schema.

### Guardrail B — Post-Step-2 SpeakableSpecification check (strategies)

**After** `generateStaticStrategyPages.ts` runs locally, **before** deleting `IULSpeakable.tsx`, `WLSpeakable.tsx`, `TFRSpeakable.tsx`, `APSpeakable.tsx` Helmet blocks:

```bash
for slug in iul whole-life tax-free-retirement asset-protection; do
  echo -n "dist/en/strategies/$slug.html: "
  grep -c '"SpeakableSpecification"' dist/en/strategies/$slug.html
done
for slug in seguro-universal-indexado seguro-vida-entera retiro-libre-impuestos proteccion-de-activos; do
  echo -n "dist/es/estrategias/$slug.html: "
  grep -c '"SpeakableSpecification"' dist/es/estrategias/$slug.html
done
```

Expected: `1` per file (8 files total). If any file returns `0`, the new generator is missing the speakable emit — fix the generator's schema array (must include `buildSpeakableSchema(strategy)`), re-run, re-grep, then proceed with Helmet deletion. Speakable is the schema AI voice engines use for direct quoting; losing it on the four BOFU pages is unacceptable.

### Execution order (revised)

1. **Build new SSG generators** (Step 2 from prior plan):
   - `scripts/generateStaticStrategyPages.ts` — 8 HTML files with WebPage + Article + BreadcrumbList + FinancialService + Service + SpeakableSpecification.
   - `scripts/generateStaticPhilosophyPage.ts` — 2 HTML files (EN + ES) with WebPage + Organization + BreadcrumbList + SpeakableSpecification.
   - `scripts/generateStaticGlossary.ts` — index pages + per-term pages from `glossary_terms` table (or `public/glossary.json` fallback) with DefinedTermSet + DefinedTerm.
   - `scripts/generateStaticTeamPage.ts` — 2 HTML files with Organization + Person.
2. **Wire into `vite.config.ts`** under `staticPageGenerator → closeBundle`.
3. **Apply date sourcing rules** (Step 3): `gitLastModified()` for static i18n routes, `lastmodFromRow()` for DB-backed glossary terms. ISO-8601 only. Never `NOW()`.
4. **Run guardrail B** on locally-built `dist/` before any Helmet cleanup on strategy pages.
5. **Run guardrail A** on production before any Helmet cleanup on Home / QAPage / ComparisonPage / LocationHub.
6. **Delete Helmet JSON-LD blocks** only from routes that pass their guardrail:
   - Always-safe (Step 2 added the generator): `Philosophy.tsx`, `Glossary.tsx`, `GlossaryTerm.tsx`, `Team.tsx`, `PersonSchema.tsx`, `ArticleSchema.tsx`, all 4 `strategies/*.tsx`, all 4 `*Speakable.tsx`.
   - Conditional on guardrail A pass: `Home.tsx` line 71, `QAPage.tsx` lines 228-230, `ComparisonPage.tsx` lines 184-225, `LocationHub.tsx` line 138.
   - Strip schema only from `LandingLayout.tsx` lines 113-160 (apartments page legacy purge queued separately).
   - Helmet retains `<title>`, `<meta name="description">`, og/twitter tags, canonical, hreflang — those work fine post-hydration for Google's renderer.
7. **Step 6 verification** — for every migrated route (8 strategies + 2 philosophy + 2 glossary index + N glossary terms + 2 team), curl with ClaudeBot UA and confirm ≥ 1 `application/ld+json` block per route, plus speakable on strategies and philosophy.

### Post-deploy summary requirements

Report in this order:
1. Guardrail A output (4 lines, route → count).
2. Guardrail B output (8 lines, file → count).
3. Step 6 verification (per migrated route, count per UA).
4. List of Helmet blocks actually deleted vs. deferred (with reason if deferred).
5. Confirmation that Home / QA / Comparison / Location pages emit each schema exactly once (no double-emit from SSG + Helmet).

### Out of scope (queued separately)

- `/llms.txt` SPA shell fix.
- `/en/sitemap` HTML hub soft-404.
- Glossary content backfill if `glossary_terms` table is empty.
- Legacy `src/pages/apartments/` purge.
- `LandingLayout.tsx` SSG migration vs. deletion.

