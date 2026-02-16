

## Fix: Translation Fails During Multi-Language Comparison Generation

### Problem
When generating a comparison in multiple languages (e.g., EN + ES), the English version is created successfully, but the Spanish translation fails with:
```
"comparison_id and target_language are required"
```

The client sends `source_comparison` (the full comparison object) instead of `comparison_id` (just the ID string) that the backend function expects.

### Fix

**File: `src/pages/admin/ComparisonGenerator.tsx`** (lines 205-209)

Change:
```typescript
body: { 
  source_comparison: englishComparison,
  target_language: lang,
}
```

To:
```typescript
body: { 
  comparison_id: englishComparison.id,
  target_language: lang,
}
```

### Why This Works
- The `englishComparison` object already contains the `id` field (assigned when it was inserted into the database on line 198)
- The `translate-comparison` edge function fetches the full comparison from the database using this ID, so sending the whole object is unnecessary
- This matches how the same function is correctly called elsewhere in the file (lines 337 and 376)

One line change, single file.
