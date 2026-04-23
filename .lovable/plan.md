

## Fix Q&A count labels in cluster manager

Two cosmetic label changes in `src/components/admin/cluster-manager/ClusterQATab.tsx` so the numbers match what users expect.

### Change 1 — Header article count

**Now:** `12 articles` (sums EN + ES rows, looks like 12 unique topics)
**After:** `6 articles × 2 languages`

Compute `enArticleCount` (rows where `language='en'`) and `languageCount` (distinct languages present), then render:
```
{enArticleCount} articles × {languageCount} languages
```

### Change 2 — Per-language Q&A breakdown in the summary card

**Now:** single line "Total Q&As: 48 of 48 expected" (denominator jumps from 24 → 48 when ES is added, confusing)
**After:** stacked rows, one per language, each with a stable 24 target:

```
Q&A Coverage
🇺🇸 EN  24 / 24  ✓
🇪🇸 ES  24 / 24  ✓
```

Use the existing `qa_pages` per-language counts already in `ClusterData.qa_pages` — no new query needed. Show a green check when count ≥ 24, amber "in progress" when 0 < count < 24, gray "not started" when 0.

### Files

- `src/components/admin/cluster-manager/ClusterQATab.tsx` — header line + summary card JSX only

### Out of scope

- No backend, RPC, or DB changes
- No change to Phase 1 / Phase 2 button logic
- Does not touch the "Translate All Missing" flow

### Verification

Open `/admin/clusters` → expand the IUL vs 401(k) cluster:
- Header reads "6 articles × 2 languages"
- Q&A card shows two rows: `EN 24/24 ✓` and `ES 24/24 ✓`
- Other clusters with only EN show one row: `EN 24/24 ✓`

