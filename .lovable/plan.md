

## Fix: Assessment Full Insert Failing

### Root Cause
The full insert in `src/pages/Assessment.tsx` (line 222) sends `language: navigator.language`, but the database column is named `lead_language`, not `language`. PostgREST rejects the entire insert, and the fallback only saves 3 base fields.

### Fix
In `src/pages/Assessment.tsx`, change line 222 from:
```
language: navigator.language,
```
to:
```
lead_language: navigator.language,
```

This single-line fix will make the full insert succeed, saving all 10 answers, scores, tier, and recommendations to the database. Future submissions will then appear with complete data in the admin view.

### Files to change
- `src/pages/Assessment.tsx` — rename `language` to `lead_language` in the insert object (~line 222)

