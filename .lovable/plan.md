

## Why Phase 2 (Translate to Languages) isn't finishing perfectly

### Root cause

Phase 2 (the purple "Translate to Languages" card under each cluster) calls the `translate-qas-to-language` edge function once per click. That function is hard-capped to translate **only 6 Q&As per invocation** (`BATCH_SIZE = 6` at line 573 of `supabase/functions/translate-qas-to-language/index.ts`). So a fresh language needs **4 button presses** (6+6+6+6 = 24) to finish, and any timeout, parse error, or rate-limit on a single Q&A inside a batch leaves a permanent gap.

Today's database confirms exactly this:

| cluster | EN articles | ES articles | EN Q&As | ES Q&As |
|---|---|---|---|---|
| `3de11630…` | 6 | 6 | 24 | **14** ← stuck |
| 8 other clusters | 6 | 6 | 24 | 24 ✅ |

10 English Q&As in that cluster have **no Spanish counterpart**. There are **no broken hreflang links and no orphaned ES Q&As** — the function simply never finished translating those 10 rows.

### Five concrete failure modes in the current code

1. **Hard 6-per-call cap.** `BATCH_SIZE = 6` then the function returns. The frontend's "fire-and-forget + 10s polling for 5 min" loop in `ClusterQATab.handleTranslateToLanguage` doesn't auto-relaunch — the user must click again.
2. **Single TARGET_LANGUAGES = ['es'].** `MAX_PARALLEL_TRANSLATIONS = 1`. No way to fan out work — it's strictly serial, ~12-15 s per Q&A × 24 = up to 6 min wall-clock per language even on the happy path.
3. **One-shot retries + no DLQ.** `translateSingleQA` retries 3× inside the function call, but if the *whole* edge function times out (Lovable Cloud invocation limit), the in-flight Q&A is silently dropped and not re-queued. There is no `cluster_translation_queue` analog for Q&As (the queue table exists only for *article* translation).
4. **Stall detection is passive.** The frontend `noProgressTicks` poller waits 5 min then warns the user. It never automatically re-invokes. So a partial 14/24 looks "done" until a human notices and clicks "Resume ES".
5. **Q&A→article linking pre-check is brittle.** When a single English Q&A points to an English article whose `hreflang_group_id` is null or mismatched, the function returns `blocked: 'missing_article_linking'` and translates **zero** Q&As that batch — even the ones that *could* have succeeded. The "Fix Article Linking" button must be clicked first, then translation retried.

### Plan to make Phase 2 reliable and one-click

**A. Auto-resume loop in the edge function (highest leverage)**

Change `translate-qas-to-language` so it processes all remaining Q&As within a single invocation, with internal time-budgeting:

- Replace `BATCH_SIZE = 6` with a `while (validQAs.length > 0 && Date.now() - startTime < 240_000)` loop (4-min wall budget, well under Lovable Cloud's edge timeout).
- After the loop, if Q&As remain, **self-invoke** the same edge function (`supabase.functions.invoke('translate-qas-to-language', { body: { clusterId, targetLanguage } })` fire-and-forget) so the queue drains automatically without user clicks.
- Add per-Q&A error isolation: a failed Q&A is logged to a new `qa_translation_failures` table (or `cluster_completion_progress.languages_status.qa_failures[]`) and skipped, not aborted.

**B. Increase concurrency inside a batch**

- Process Q&As in parallel groups of 3 (`Promise.allSettled`) instead of strictly serial. Q&As are independent rows — there's no ordering requirement. Cuts wall time ~3×.
- Keep `DELAY_BETWEEN_QAS = 1500ms` between *batches* (not between every single Q&A) to respect Lovable AI Gateway rate limits.

**C. Fix the "all-or-nothing" blocking pre-check**

In `translate-qas-to-language` lines 524-568, change the blocked response from "abort everything" to "skip the blocked Q&As and translate the rest". The blocked Q&A IDs still surface to the frontend, but the user gets 22/24 ES instead of 0/24 ES + a vague error.

**D. Add a "Translate All Missing" admin button**

In `ClusterQATab.tsx` add a button next to "Phase 2: Translate to Languages" that:
1. Queries every cluster with `es_qas < 24`.
2. Calls `translate-qas-to-language` for each in series.
3. Polls `qa_pages` count per cluster until ≥24 or 10-min timeout.
4. Reports a final table: cluster_id → final_count.

This lets you fix all incomplete clusters in one click instead of clicking through each cluster manager.

**E. Repair the current 10-Q&A gap immediately**

Cluster `3de11630-ac9e-4c05-b85f-d07c555412ba` is stuck at 14/24 ES Q&As. Once the edge function fix is deployed, calling `translate-qas-to-language { clusterId: '3de11630…', targetLanguage: 'es' }` will pick up the 10 missing Q&As (skip-existing logic at lines 402-414 already handles resume safely).

### Out of scope

- The `cluster_translation_queue` *article* translation system shown in `process-translation-queue/index.ts` is separate and currently working correctly (12 of 12 jobs `completed`). No changes there.
- No DB schema changes required for the auto-resume loop. A new `qa_translation_failures` table is optional polish; the JSONB column on `cluster_completion_progress` can hold failures meanwhile.
- No frontend re-architecture — `handleTranslateToLanguage`'s polling loop stays; it just becomes more decorative since the backend now self-completes.

### Verification after fix

```sql
-- Should return 0 rows (all clusters at 24/24 ES)
SELECT cluster_id, COUNT(*) AS es_count
FROM qa_pages WHERE language='es' AND cluster_id IS NOT NULL
GROUP BY cluster_id HAVING COUNT(*) < 24;

-- Should return 0 (no EN Q&A without ES sibling)
SELECT COUNT(*) FROM qa_pages qa_en
WHERE qa_en.language='en' AND qa_en.hreflang_group_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM qa_pages qa_es 
                WHERE qa_es.hreflang_group_id=qa_en.hreflang_group_id 
                AND qa_es.language='es');
```

Manual: open the cluster manager for `3de11630…`, click "Resume ES (14/24)" once, watch progress climb to 24/24 within ~3 min without further clicks.

