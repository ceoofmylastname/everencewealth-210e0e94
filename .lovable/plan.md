
Goal: stabilize Q&A generation for the 3 affected clusters, regenerate only missing published Q&As, and verify each cluster reaches 24 published Q&A pages.

What I found from the current code:
- `generate-cluster-qas` only orchestrates work; the JSON parse failures are happening inside `supabase/functions/generate-article-qas/index.ts`.
- The function already inserts Q&As with `status: 'published'`, so new pages should be live if generation succeeds.
- There is a real logic bug in completion checks: it still assumes 10 languages (`existingLangs.size >= 10`, comments, expected totals), while this function is currently configured for only `['en', 'es']`. That can cause unnecessary retries/skips behavior.
- The current parser only extracts a JSON object (`{...}`), but your requested retry message expects a JSON array. If we switch to 1 Q&A per call, we should support both array and object extraction safely.
- There is already a more resilient parsing pattern in `supabase/functions/repair-missing-qas/index.ts` that can be adapted here.

Implementation plan:
1. Inspect current backend state with your SQL
- Run the requested SQL first to confirm current article / published Q&A / draft Q&A counts for:
  - Tax-Free Retirement Income
  - Living Benefits & Protection
  - Legacy Planning & Estate Strategy
- Also run a direct `qa_pages`-based verification query per cluster/article/qa_type so we can identify exactly which articles have fewer than 4 published EN Q&As.

2. Harden `generate-article-qas` (the real failure point)
- Update JSON parsing in `supabase/functions/generate-article-qas/index.ts`:
  - wrap parsing in try/catch
  - first try normal parse
  - then strip markdown fences
  - then regex-extract either array or object payload
  - then repair common malformed JSON before final parse
- Add retry logic for English generation:
  - attempt 1 = current prompt
  - attempt 2 = same prompt plus explicit instruction:
    `Respond with ONLY a valid JSON array. No markdown, no code fences, no explanation. Start with [ and end with ]`
- If the retry returns an array, normalize by taking the first valid item so the rest of the function can still work with one Q&A result.

3. Reduce failure blast radius
- Keep generation at 1 Q&A type per AI call (the function already does this), but fix the misleading “4 types × 10 languages” assumptions and logs.
- Add a 1-second delay between each English Q&A generation call.
- Keep the existing delay between translations, and normalize all totals/skip logic to the actual enabled languages (`en`, `es`).

4. Fix selective regeneration logic
- Change completion checks to use dynamic enabled-language counts instead of hardcoded 10.
- Re-trigger generation only for English articles in the 3 target clusters where fewer than 4 published EN Q&As exist.
- Do not regenerate Q&A types that already exist for that article.
- If an article already has some completed Q&A types, the function should only fill the missing ones.

5. Deploy and test
- Deploy the updated edge function(s).
- Test the function on one affected article first to confirm:
  - malformed AI output no longer aborts the whole article
  - new rows are created with `status = 'published'`
  - existing Q&As are skipped correctly

6. Regenerate missing Q&As for the 3 clusters
- Trigger regeneration only for underfilled articles in:
  - Tax-Free Retirement Income
  - Living Benefits & Protection
  - Legacy Planning & Estate Strategy
- Monitor jobs until they finish or stall.
- If any articles still remain under 4 published EN Q&As, run a second targeted pass only for those.

7. Final verification
- Re-run your exact SQL from step 1.
- Also verify with a direct `qa_pages` query that each of the 3 clusters has:
  - 6 English articles
  - 24 published Q&A pages total for the cluster’s active language scope
  - no newly created draft Q&As
- Report final totals in the database after completion.

Files to update:
- `supabase/functions/generate-article-qas/index.ts`
- possibly `supabase/functions/generate-cluster-qas/index.ts` only if its totals/messages need to be corrected to match the new logic

Technical notes:
- The user asked to update `generate-cluster-qas`, but the actual parsing code lives in `generate-article-qas`; that is the function that must be fixed.
- The function currently says “4 types × 10 languages” but is configured for only `en` and `es`. I would correct those constants/comments/logs so progress tracking and skip logic are accurate.
- New Q&As are already inserted with `status: 'published'`, so no separate publish step should be needed after the fix.
- Because this is read-only mode, I cannot run the SQL, edit the function, deploy, or retrigger jobs yet. Once you approve, I’ll implement the fix, run the targeted regeneration, and verify the final counts.
