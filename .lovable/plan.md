
# Remove [CITATION_NEEDED] Markers from 3 Articles

## Problem

3 articles still contain `[CITATION_NEEDED]` markers that couldn't be resolved by the Perplexity API. These need to be cleaned up since external sources weren't found.

## Articles to Fix

| Language | Article | Marker Context |
|----------|---------|----------------|
| Danish (DA) | Fra Drøm til Virkelighed... | Meta-reference to markers themselves - needs sentence rewrite |
| Finnish (FI) | Asuntoverojen ymmärtäminen... | After tax list - simple removal |
| Norwegian (NO) | Forstå eiendomsskatter... | After tax list - simple removal |

## Solution

Create a one-time cleanup script as an edge function that:
1. Fetches the 3 specific articles by ID
2. Removes `[CITATION_NEEDED]` markers
3. For the Danish article, also fixes the meta-reference sentence

### Cleanup Logic

**Finnish & Norwegian** - Simple removal:
```typescript
content = content.replace(/\s*\[CITATION_NEEDED\]/g, '');
```

**Danish** - Sentence needs rewriting since it references the markers:
```
Original: "...som angivet i [CITATION_NEEDED]-markeringerne."
Fixed: "...som angivet i officielle kilder."
```

## Implementation

### Create Edge Function: `supabase/functions/cleanup-citation-markers/index.ts`

One-time cleanup function that:
- Targets the 3 specific article IDs
- Applies appropriate removal/rewrite for each
- Updates the database
- Reports results

### Run Once

After deploying, call the function once to clean up, then it can be deleted or left for future use.

## Files

| File | Action |
|------|--------|
| `supabase/functions/cleanup-citation-markers/index.ts` | Create |
| `supabase/config.toml` | Add function registration |

## Expected Outcome

- All 3 articles will have markers removed
- `/admin/citation-backfill` will show "All Clear" (0 articles with markers)
- No broken text left behind
