## Hotfix: gscTriageURLs.ts trailing-slash + non-content-path false positives

Surgical change to `scripts/gscTriageURLs.ts` only. Two edits.

### Edit 1 — Simplify `existsInPublished()` (lines 105–135)

Replace the current dual-candidate loop with a single normalized lookup, since `all_published_slugs` always stores paths with a trailing slash. Keeps the existing `publishedCache` to avoid duplicate round trips.

```ts
async function existsInPublished(supabase: SupabaseClient, path: string): Promise<boolean> {
  // all_published_slugs view always stores paths with trailing slash.
  // Normalize once on input so callers don't have to remember.
  const normalizedPath = path.endsWith('/') ? path : path + '/';

  if (publishedCache.has(normalizedPath)) return publishedCache.get(normalizedPath)!;

  const { data, error } = await supabase
    .from('all_published_slugs')
    .select('full_path')
    .eq('full_path', normalizedPath)
    .maybeSingle();

  if (error) {
    console.warn(`[gsc-triage] published lookup error for ${normalizedPath}: ${error.message}`);
    publishedCache.set(normalizedPath, false);
    return false;
  }

  const exists = data != null;
  publishedCache.set(normalizedPath, exists);
  return exists;
}
```

### Edit 2 — Guard `case 'not-found'` against non-content paths (lines 177–183)

Add an `isContentPath(url)` check before the published-surface lookup so hub URLs (`/es`, `/en/glossary`, `/en/about`) get routed to `FIX_CANONICAL` instead of `ADD_TO_GONE_URLS`.

```ts
case 'not-found': {
  // Hub URLs (homepage variants like /es, /en/glossary, /en/about) are
  // NEVER in all_published_slugs (the view UNIONs content slugs only).
  // Don't blindly route them to ADD_TO_GONE_URLS — that would 410 valid
  // hubs. Send to FIX_CANONICAL for human inspection.
  if (!isContentPath(url)) {
    return { action: 'FIX_CANONICAL', reason: '404 + non-content-path URL — likely hub/static needing manual inspection' };
  }
  const exists = await existsInPublished(supabase, path);
  if (!exists) {
    return { action: 'ADD_TO_GONE_URLS', reason: '404 + content-path slug not in published surface' };
  }
  return { action: 'FIX_CANONICAL', reason: '404 but slug exists — likely path malformation' };
}
```

### Verification

Re-run the triage script against existing CSVs in `raw/`:

```
npx tsx scripts/gscTriageURLs.ts
```

Expected:
- `ADD_TO_GONE_URLS`: 4 → 2 (drops `/es` and `/en/glossary`)
- `FIX_CANONICAL`: 52 → 54 (gains the two demoted hubs)

### Out of scope

- All other branches (`soft-404`, `page-with-redirect`, `duplicate-no-canonical`, `crawled-not-indexed`, `discovered-not-indexed`)
- Regex constants (`CONTENT_PATH_REGEX_ONE`, `CONTENT_PATH_REGEX_TWO`, `COMMA_LEGACY_REGEX`)
- CSV parsing and output file format
- Middleware files
