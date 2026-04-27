# PROMPT 24 v2 — Bulk Cluster Builder (75 → ~70 clusters)

Both seed docs read end-to-end. Manifest design below is grounded in actual seed content, not assumptions.

## What ships

| File | Action | Purpose |
|---|---|---|
| `manifests/everencewealth-75-cluster-manifest.json` | create | Rebuilt 70-entry manifest, version-controlled |
| `/mnt/documents/everencewealth-75-cluster-manifest.json` | create | Same file, downloadable artifact |
| `scripts/bulkBuildClusters.ts` | create | CLI orchestrator (Node + tsx) |
| `src/components/admin/cluster-manager/BulkImportDialog.tsx` | create | 5-step admin wizard |
| `src/pages/admin/ComplianceReview.tsx` | create | Flagged-articles review queue |
| `src/components/admin/cluster-manager/index.ts` | edit | Export new dialog |
| `src/pages/admin/ClusterGenerator.tsx` | edit | Add "Bulk Import" button next to existing Generate button |
| `src/App.tsx` (or admin router) | edit | Wire `/admin/compliance-review` route |
| `supabase/migrations/<ts>_flagged_articles.sql` | create | New table + RLS |

Untouched: every PROMPT 17/20/21/22/23 artifact, all blog/QA UI, all 5 cluster-pipeline edge functions, `editorialImagePrompt.ts`, `OptimizedImage.tsx`, `functions/_middleware.js`, `scripts/generateStaticHomePage.ts`, `serve-seo-page/**`, `public/_headers`, `src/config/business.ts`, all 11 production cluster themes.

## Manifest build (input → output)

### Inputs

- `manifests/seeds/wealth-50.md` — 10 themes, 50 clusters
- `manifests/seeds/recruiting-25.md` — 5 themes (11-15), 25 clusters

### Transformations applied

1. **Drop Theme 8** (clusters 21-25 in the wealth doc) — five Spanish-only entries (`Retiro Libre de Impuestos para Hispanos`, `Protección de Activos para Negocios`, `Planificación Patrimonial Hispana`, `Seguro de Vida para Protección`, `Jubilación Anticipada Hispana`). Auto-translate pipeline produces the Spanish versions of every English cluster, so these are redundant.
2. **Replace with 5 English-first Hispanic-targeted clusters** (slotted as IDs 21-25):
   - `21` Multi-Generational Wealth Transfer in Hispanic Families → `/en/strategies/asset-protection`
   - `22` First-Generation Wealth Building for Hispanic-American Professionals → `/en/buyers-guide/`
   - `23` Choosing a Family Financial Advisor When You're the First in Your Family → `/en/buyers-guide/`
   - `24` Bilingual Wealth Planning: When Your Parents Speak Spanish and You Don't → `/en/buyers-guide/`
   - `25` Dual-Currency Retirement Planning for Cross-Border Hispanic Families → `/en/strategies/tax-free-retirement`
3. **Remap every wealth `Money Page Target`** — every original `/pages/*` URL is dead. Mapping rules:
   - IUL / cash-value / infinite-banking / IUL strategies → `/en/strategies/iul`
   - Whole-life / dividend-paying / permanent → `/en/strategies/whole-life`
   - Tax-free retirement / Roth / tax-bracket / withdrawal / Roth conversion / Mega Backdoor → `/en/strategies/tax-free-retirement`
   - Asset protection / creditor / divorce / umbrella / LLC / business-asset / trusts → `/en/strategies/asset-protection`
   - Calculators / decision tools / advisor-selection / insurance-company-ratings → `/en/buyers-guide/`
   - Estate, legacy, beneficiary, generational transfer, charitable giving → `/en/strategies/asset-protection`
   - Anything that doesn't fit → `/en/strategies/` (hub fallback)
4. **All 25 recruiting clusters** → `/contracting/intake` (verified 200).
5. **Add `compliance_class`**: `"wealth_standard"` for IDs 1-50 (minus dropped 21-25 originals, plus replacements), `"recruiting_no_income_claims"` for IDs 51-75.
6. **Dedupe flagging** — `skip_by_default: true` for any cluster whose normalized name overlaps an existing `blog_articles.cluster_theme`.
7. **All entries**: `language: "en"`, `manifest_version: "v2-2026-04-27"`, `total_count: 75`.

### Final cluster count after dedupe

**~70 buildable** (75 − 5 likely overlaps with existing 11 themes).

Likely `skip_by_default: true` matches:
- ID 1 "IUL Basics for High Earners" ↔ existing `IUL vs 401(k) Head-to-Head`
- ID 3 "Tax-Free Retirement Income Planning" ↔ existing `Tax-Free Retirement Income`
- ID 6 "Sequence of Returns Risk Explained" ↔ existing `Sequence of Returns Risk in the First 5 Years of Retirement`
- ID 7 "The Retirement Gap — When Social Security Isn't Enough" ↔ existing `The Retirement Gap Crisis` / `The Retirement Gap Nobody Is Talking About`
- ID 36 "Generational Wealth Transfer" ↔ existing `Legacy Planning & Estate Strategy`

Operator can override any with `--force` or by toggling the dedupe checkbox in the dialog.

### Money-page distribution (target)

```
/en/strategies/iul                  → ~9   (IUL, infinite banking, life-insurance retirement)
/en/strategies/whole-life           → ~5   (whole life, dividend-paying, key-person)
/en/strategies/tax-free-retirement  → ~13  (Roth, NQDC, mega-backdoor, tax bracket, withdrawals, ESPP)
/en/strategies/asset-protection     → ~13  (creditor, divorce, LLC, trusts, estate, legacy, generational)
/en/buyers-guide/                   → ~9   (calculators, advisor selection, decision tools)
/en/strategies/ (hub fallback)      → ~1   (anything that doesn't fit cleanly)
/contracting/intake                 → 25   (every recruiting cluster)
TOTAL                               → 75   entries (~70 buildable after dedupe)
```

### 5 sample manifest entries

```json
{
  "manifest_version": "v2-2026-04-27",
  "total_count": 75,
  "clusters": [
    {
      "id": 1,
      "name": "IUL Basics for High Earners",
      "topic": "Indexed Universal Life Insurance",
      "primaryKeyword": "indexed universal life insurance for high earners",
      "secondaryKeywords": ["how IUL works", "IUL explained", "IUL for high earners", "cash value life insurance"],
      "targetAudience": "High-Earner Pre-Retiree (5y out)",
      "searchIntent": "Informational",
      "moneyPageTarget": "/en/strategies/iul",
      "compliance_class": "wealth_standard",
      "tofu_titles": ["What is Indexed Universal Life Insurance — A Beginner's Guide", "How IUL Cash Value Grows Without Market Risk", "IUL vs Term Life Insurance: Where High Earners Go Wrong"],
      "mofu_titles": ["IUL vs 401(k) for Tax-Free Income — The Comparison", "Does IUL Really Offer Tax-Free Withdrawals — How It Works"],
      "bofu_title": "IUL for High Earners: Tax-Free Retirement Income Strategy",
      "internal_link_anchors": ["IUL cash value growth", "tax-free retirement income", "high-earner retirement strategy", "indexed universal life insurance", "sequence-of-returns risk mitigation"],
      "language": "en",
      "skip_by_default": true,
      "skip_reason": "Overlaps existing theme: IUL vs 401(k) Head-to-Head"
    },
    {
      "id": 21,
      "name": "Multi-Generational Wealth Transfer in Hispanic Families",
      "topic": "Multi-Generational Wealth Transfer",
      "primaryKeyword": "multi-generational wealth transfer hispanic families",
      "secondaryKeywords": ["family wealth transfer", "first-generation wealth", "hispanic family financial planning", "generational asset protection"],
      "targetAudience": "First-Gen Hispanic-American High Earner (40-55)",
      "searchIntent": "Decision",
      "moneyPageTarget": "/en/strategies/asset-protection",
      "compliance_class": "wealth_standard",
      "tofu_titles": ["What Multi-Generational Wealth Actually Looks Like", "Why First-Generation Wealth Builders Lose Assets at Transfer", "How Hispanic Families Pass Wealth Across Generations"],
      "mofu_titles": ["Trust Structures for First-Generation Wealth Builders", "Beneficiary Strategy When Family Spans Two Countries"],
      "bofu_title": "Multi-Generational Wealth Transfer Plan for Hispanic-American Families",
      "internal_link_anchors": ["generational wealth transfer", "first-generation wealth", "trust structures", "beneficiary designation", "family financial planning"],
      "language": "en",
      "skip_by_default": false
    },
    {
      "id": 39,
      "name": "Retirement Savings Goal Calculator",
      "topic": "Retirement Calculator",
      "primaryKeyword": "retirement savings goal calculator",
      "secondaryKeywords": ["retirement nest egg calculator", "how much do I need to retire", "retirement savings benchmark", "retirement number"],
      "targetAudience": "Pre-Retiree (10y out)",
      "searchIntent": "Calculator / Decision",
      "moneyPageTarget": "/en/buyers-guide/",
      "compliance_class": "wealth_standard",
      "tofu_titles": ["...", "...", "..."],
      "mofu_titles": ["...", "..."],
      "bofu_title": "Your Personal Retirement Savings Plan",
      "internal_link_anchors": ["retirement calculator", "savings goal", "retirement number", "nest egg planning", "retirement readiness"],
      "language": "en",
      "skip_by_default": false
    },
    {
      "id": 51,
      "name": "Becoming an Insurance Broker — Career Overview",
      "topic": "Insurance Career",
      "primaryKeyword": "how to become insurance broker",
      "secondaryKeywords": ["insurance broker career", "insurance career path", "broker vs agent", "insurance professional"],
      "targetAudience": "Career Changer",
      "searchIntent": "Informational",
      "moneyPageTarget": "/contracting/intake",
      "compliance_class": "recruiting_no_income_claims",
      "tofu_titles": ["What Does an Insurance Broker Actually Do", "Insurance Broker vs Insurance Agent: The Real Difference", "A Day in the Life of a Modern Insurance Professional"],
      "mofu_titles": ["Independent Broker vs Captive Agent: Which Path Fits You", "5 Signs You'd Thrive in an Insurance Career"],
      "bofu_title": "How to Start a Career as an Insurance Broker",
      "internal_link_anchors": ["insurance career path", "becoming a broker", "independent broker", "day in the life", "career transition"],
      "language": "en",
      "skip_by_default": false
    },
    {
      "id": 56,
      "name": "Life Insurance License Path",
      "topic": "Life Insurance Licensing",
      "primaryKeyword": "how to get life insurance license",
      "secondaryKeywords": ["life insurance license requirements", "life insurance exam", "insurance licensing process", "life insurance license"],
      "targetAudience": "Aspiring Agent / Pre-Licensee",
      "searchIntent": "Informational / Decision",
      "moneyPageTarget": "/contracting/intake",
      "compliance_class": "recruiting_no_income_claims",
      "tofu_titles": ["How to Get Your Life Insurance License (Step by Step)", "Life Insurance License Requirements by State", "The Life Insurance Pre-Licensing Course Explained"],
      "mofu_titles": ["Life Insurance vs Life and Health: Which License to Get First", "Self-Study vs Classroom Pre-Licensing: Pros and Cons"],
      "bofu_title": "Your Complete Life Insurance Licensing Roadmap",
      "internal_link_anchors": ["life insurance license", "pre-licensing course", "state requirements", "licensing roadmap", "exam preparation"],
      "language": "en",
      "skip_by_default": false
    }
  ]
}
```

(All 70 entries follow this exact shape; abbreviated above.)

## Compliance enforcement (recruiting-only, post-generation pre-publish)

Confirmed publish policy per your direction:
- **Wealth (1-50)**: auto-publish on EN+ES completion. No regex pass. Existing `enforce_fiduciary_term_block` DB trigger still applies.
- **Recruiting (51-75)**: auto-publish UNLESS the income-claim regex bank fires on any field of any generated article. Flagged articles → `status='draft'` + row in `flagged_articles`. Untouched recruiting articles publish normally.

### Income-claim regex bank (CLI + admin dialog both run identical logic)

```js
const INCOME_PATTERNS = [
  /\$\s?\d[\d,.]*\s*(per|a|each|every)?\s*(year|month|week|hour|day|annually|annual)/i,
  /\bearn(ing|s|ed)?\s+\$\s?\d/i,
  /\bincome\s+(potential|of\s+\$|up\s+to|range)/i,
  /\bmak(e|ing)\s+(money|\$\s?\d)/i,
  /\b(salary|commission|compensation)\s+(range|of\s+\$|up\s+to|structure\s+example)/i,
  /\b(average|typical|median)\s+(compensation|earnings|income|salary)/i,
  /\btop[-\s]?(earner|earning|paid|paying)\b/i,
  /\b(highest|best)[-\s]?(paid|paying)\b/i,
  /\b\$\s?\d[\d,.]*\s*(k|m|million|grand)\b/i,
];
```

Scanned fields per article: `headline`, `meta_title`, `meta_description`, `speakable_answer`, `detailed_content`. First match wins; row inserted with regex source + ±60-char excerpt.

### `flagged_articles` table

```sql
create table public.flagged_articles (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references blog_articles(id) on delete cascade,
  reason text not null,
  matched_pattern text,
  matched_excerpt text,
  cluster_generation_id uuid references cluster_generations(id),
  compliance_class text,
  status text not null default 'pending_review',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (article_id, reason)
);
alter table public.flagged_articles enable row level security;
create policy "admins read"   on public.flagged_articles for select using (public.is_admin(auth.uid()));
create policy "admins update" on public.flagged_articles for update using (public.is_admin(auth.uid()));
create policy "service insert" on public.flagged_articles for insert with check (true);
```

### `/admin/compliance-review` page

Lists `flagged_articles WHERE status='pending_review'`. Per row: matched pattern, ±60-char excerpt with the regex hit highlighted, action buttons:
- **Approve & Publish** → `blog_articles.status='published'`, `flagged_articles.status='approved'`
- **Keep as Draft** → `flagged_articles.status='rejected'`, no publish
- **Open in Editor** → existing article editor
- **View Live (if approved)** → preview link

## CLI orchestrator behavior recap

`npx tsx scripts/bulkBuildClusters.ts --manifest <path> [flags]`

Flags: `--dry-run` `--limit=N` `--start-from=N` `--force` `--debug` `--report=<path>`

Per cluster (sequential, 10s gap):
1. Zod-validate entry. Reject if `language !== 'en'`, `moneyPageTarget` not in 7-URL whitelist, or `compliance_class` not one of the two values.
2. Compliance pre-flight: `\bfiduciar/i` across all text fields → abort run on hit (matches existing DB trigger).
3. Dedupe: lowercase + collapse whitespace on `name`/`topic`/`primaryKeyword`. Skip if matches existing `blog_articles.cluster_theme` (substring either way) OR a completed `cluster_generations` row's `topic`/`primary_keyword`. `--force` overrides.
4. POST `generate-cluster` with `{ topic, language: 'en', target_audience, primary_keyword }`. Capture `jobId`.
5. Poll `cluster_generations` every 15s. Success = `status='completed'` AND `completed_languages` ⊇ `[en, es]`. 30-min hard timeout → `kill-cluster-job` + advance.
6. Recruiting only — post-completion compliance scan over fresh `blog_articles` for that `cluster_generation_id`. Flag + draft on hit; otherwise leave published.
7. Append to `cluster-generation-report.json`.

## Admin UI (BulkImportDialog.tsx)

5-step wizard wired alongside the existing "Generate Cluster" button (both coexist, both visible).

1. **Input** — paste textarea OR file upload. Zod-validate.
2. **Preview** — table: name, theme, audience, money-page target, compliance_class, dedupe status. Per-row checkbox to override skip.
3. **Confirm** — count summary + estimated runtime.
4. **Progress** — Realtime via `supabase.channel('postgres_changes', table: 'cluster_generations', filter: id=in.(...jobIds))`. Live counter. Per-cluster retry. Parallel subscription to `flagged_articles` surfaces a "🚩 N flagged" badge per recruiting cluster.
5. **Complete** — final summary, downloadable report JSON, "Open Compliance Review" CTA if any flags.

## Runtime estimate

- Per cluster: ~5-6 min (EN ~2-3 min + ES ~2-3 min + 10s gap)
- 70 buildable clusters: **~6.0-7.0 hours** (skipped clusters pass through in seconds)
- Recommend overnight run after a 5-cluster smoke test passes

## Verification block (post-ship)

```bash
# 1. Dry run
npx tsx scripts/bulkBuildClusters.ts \
  --manifest manifests/everencewealth-75-cluster-manifest.json \
  --dry-run --limit=5
# Expect: 5 cluster names, dedupe status, money-page targets. No edge calls.

# 2. Live smoke test
npx tsx scripts/bulkBuildClusters.ts \
  --manifest manifests/everencewealth-75-cluster-manifest.json --limit=5
# Expect: ~25-30 min, report written, EN+ES completed for each.

# 3. Compliance check on a recruiting cluster
curl -sL https://www.everencewealth.com/en/blog/<recruiting-slug>/ \
  | grep -oE '\$[0-9,]+|earn(ing|s)? \$|salary range|typical earnings'
# Expect: zero hits OR article is in draft + listed in /admin/compliance-review

# 4. Spot-check pages
# Visit /en/blog/<slug>/ + /es/blog/<slug>/ — hero image renders, body, schema, internal links, BOFU → correct strategy URL.

# 5. Full run (overnight)
npx tsx scripts/bulkBuildClusters.ts \
  --manifest manifests/everencewealth-75-cluster-manifest.json
```

## Open concerns

1. **Manifest target path on your Mac.** Sandbox writes to `manifests/` (in repo) and `/mnt/documents/` (downloadable artifact). Move locally if you want it inside the wiki folder.
2. **Regex catches literal $ amounts only.** Implied claims ("the most successful agents we know…") slip through and require manual review — that's exactly what `/admin/compliance-review` is for.
3. **Cluster generation needs SERVICE_ROLE_KEY on the operator's machine.** The CLI calls `generate-cluster` directly. Anon key isn't sufficient because it polls private rows. Will pull from `SUPABASE_SERVICE_ROLE_KEY` env var on the operator's machine; CLI errors out clearly if missing.
4. **Carrier logos in editorial images.** PROMPT 23's `editorialImagePrompt.ts` already prompt-blocks third-party logos/trademarks for both wealth and recruiting. No change needed.
