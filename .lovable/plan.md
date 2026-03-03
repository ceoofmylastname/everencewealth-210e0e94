

## Fix: Edge Function Only Checks `advisors` Table

The error happens because the `update-portal-agent-password` edge function validates the target user against the `advisors` table only. Domaneque Newsome is in `contracting_agents`, not `advisors`, so the function returns 404 → "non-2xx status code" error.

### Change

**File:** `supabase/functions/update-portal-agent-password/index.ts` (lines 71–83)

Replace the single `advisors` lookup with checks against **both** `advisors` and `contracting_agents`:

- Query `advisors` with `.maybeSingle()` (instead of `.single()` which throws on no match)
- Query `contracting_agents` with `.maybeSingle()`
- Only return 404 if the user is found in **neither** table

Then redeploy the edge function.

