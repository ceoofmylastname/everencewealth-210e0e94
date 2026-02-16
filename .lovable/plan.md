

## Fix: English Q&A Count Always Shows 0/24

### Problem

The "Q&As by Language" display shows **0/24** for English even though 24 English Q&As exist in the database. Spanish shows correctly at 24/24.

### Root Cause

In `ClusterQATab.tsx`, the Q&A counting logic (around line 201) explicitly **skips English** Q&As when building the `languageQACounts` dictionary:

```typescript
if (qa.language && qa.language !== 'en' && TARGET_LANGUAGES.includes(...))
```

English Q&As are counted separately into `englishQACount` (line 188), but that value is **never written into `languageQACounts`**. So when `getQAStatusForLanguage('en')` checks `languageQACounts['en']` on line 990, it gets `undefined` and falls back to `cluster.qa_pages['en']?.total`, which is also 0.

### Fix

**File: `src/components/admin/cluster-manager/ClusterQATab.tsx`**

After line 232 (`setLanguageQACounts(langCounts)`), add English to the counts dictionary **before** setting state:

- Insert `langCounts['en'] = englishQAs.length;` right before the `setLanguageQACounts(langCounts)` call (around line 231-232).

This one-line addition ensures `getQAStatusForLanguage('en')` returns the correct count, and the UI tile turns green with "24/24".

### Result

- English tile: green, showing **24/24** with the green checkmark
- Spanish tile: unchanged, still **24/24**
- No more "Q&A Count Mismatch" warning for this cluster
