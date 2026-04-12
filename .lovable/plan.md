

## Improve Citation Discovery Hit Rate

### Problem
The `discover-cluster-citations` edge function has a low hit rate — many articles get 0 citations from Perplexity. Root causes:

1. **Weak model**: Uses `sonar` (basic) instead of `sonar-pro` (multi-step reasoning with 2x citations)
2. **Too little context**: Only sends first 3000 chars of article content
3. **No retry logic**: If Perplexity returns 0 results, gives up immediately
4. **Over-specific prompt**: Asks for wealth management citations specifically, which narrows results unnecessarily for articles on broader topics
5. **Temperature too low** (0.1): Reduces creative search ability
6. **No fallback strategy**: Single prompt attempt with no variation

### Plan

#### Step 1: Upgrade `discover-cluster-citations/index.ts` — Prompt & Model
- Switch from `sonar` to `sonar-pro` for better search depth
- Raise temperature from 0.1 to 0.3
- Increase `max_tokens` from 2000 to 3000
- Broaden the prompt: instead of "wealth management and financial planning" framing, use the actual article topic and let Perplexity find the best sources
- Send more article content (up to 5000 chars) for better context
- Simplify the prompt to reduce over-constraining — fewer "NEVER" rules in the initial search, filter bad results after

#### Step 2: Add retry with varied prompts
- If first attempt returns 0 valid citations, retry with a **broader prompt** (different angle: ask for statistics, research, government data related to the topic)
- If second attempt also returns 0, try a **third prompt** focused on the article headline only (simpler query = more results)
- Max 3 attempts per article, with 2s delay between retries

#### Step 3: Relax post-filtering
- Currently blocks any URL with keywords like "property", "estate", "housing" — this is too aggressive for a wealth management site that may legitimately cite housing statistics
- Add exception: allow government/statistical domains (.gov, .edu, eurostat, ine.es) even if they contain blocked keywords in their URL path
- Keep competitor domain blocking but loosen keyword blocking for high-authority sources

#### Step 4: Increase batch parallelism
- Currently processes 3 articles at a time with 1s delay
- Increase to 4 articles at a time (Perplexity rate limits are per-key, sonar-pro handles this)

### Technical details
- Single file change: `supabase/functions/discover-cluster-citations/index.ts`
- The `findCitationsForArticle` function inside this file will be rewritten with retry logic
- Deploy via `supabase--deploy_edge_functions`
- Test with `supabase--curl_edge_functions` on one cluster

