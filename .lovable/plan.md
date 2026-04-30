# Bug 5 Strike-2: Sanitizer Bypass Fix

## What happened

Cluster `7eeebd5d` ran generate-missing (4 articles needed). Article #3 ("Roth Conversion Windows in Retirement") was generated successfully (2803 words, quality 90/100), passed all gates, then **died on the DB constraint**:

```
code: 23514
constraint: blog_articles_body_no_head_h1
```

Critically, the sanitizer's `[Missing] Sanitizer applied:` warning did NOT fire before the error. That means our regex thought the content was clean, but Postgres found `<h1` or `<head` in `detailed_content`. The two checks should be equivalent — they aren't. Something is slipping through.

Session replay confirms the run halted after this: progress hit 183 chars, then "No backend activity for 185s" and the button reverted to "Generate Missing (4)" — meaning of the 4 articles needed, only 0 of this run made it in (the row got rejected, the chain aborted).

## Why the previous fix didn't catch it

The current sanitizer (`generate-missing-articles/index.ts` lines 52-94) uses `/<h1[\s>]/i.test()` as a gate before stripping. The Postgres constraint uses `<h1[[:space:]>]` (POSIX). On paper identical — but we shipped without **forensic logging of what actually got rejected**, so we're flying blind on the divergence. Possible culprits we can't currently distinguish:

- Unicode whitespace variant Claude emitted that JS `\s` treats as match but our `.test()` short-circuits incorrectly
- A nested HTML comment `<!-- <h1>...</h1> -->` — our regex would match, but maybe didn't because of how Claude formatted it
- An `<h1` that's part of an attribute value like `data-tag="<h1>"` — both regexes would catch it, but constraint fires regardless of semantics
- The fallback path `contentJson.content` (line 591) was used and bypassed sanitization — unlikely but possible

## The fix (surgical, per your decision)

### 1. Tighten the regex + drop the gate-before-strip pattern

Change every sanitizer rule from "test, then conditionally replace" to **always replace**. The `if (regex.test()) { replace; push removed; }` pattern is what caused the silent miss — if `.test()` returns false on a weird edge case, we skip the replace AND skip logging.

Replace with:
```ts
const before = cleaned;
cleaned = cleaned.replace(/<\/?h1\b[^>]*>/gi, (m) => m.includes('/') ? '</h2>' : '<h2>');
if (cleaned !== before) removed.push('h1_downgraded');
```

Apply the same pattern to `<head>`, `<html>`, `<body>`, `<meta>`, `<link rel=canonical|alternate>`, `<style>`, `ld+json`. The `\b` word-boundary catches `<h1>`, `<h1 class>`, `<h1\n>`, `<h1/>` — anything Postgres would also match.

### 2. Add a pre-insert hard guard with forensic logging

Right before `.insert(article)` (line 652), add:

```ts
const offenders: string[] = [];
const h1Match = article.detailed_content?.match(/<\/?h1\b[^>]{0,200}>/gi);
const headMatch = article.detailed_content?.match(/<\/?head\b[^>]{0,200}>/gi);
if (h1Match) offenders.push(`H1 found: ${h1Match.slice(0,3).join(' | ')}`);
if (headMatch) offenders.push(`HEAD found: ${headMatch.slice(0,3).join(' | ')}`);

if (offenders.length > 0) {
  console.error('[Missing] 🚨 GUARD TRIPPED — sanitizer bypass detected:', offenders);
  // Force-strip nuclear option
  article.detailed_content = article.detailed_content
    .replace(/<\/?h1\b[^>]*>/gi, (m) => m.includes('/') ? '</h2>' : '<h2>')
    .replace(/<\/?head\b[^>]*>/gi, '');
  // Persist forensic record so we can analyze the pattern later
  await recordGenerationFailure(supabase, {
    cluster_id: clusterId,
    stage: 'pre_insert_sanitizer_guard',
    raw_response: offenders.join('\n'),
    prompt_context: { cluster_number: nextClusterNumber, headline: plan.headline },
  });
}
```

This guarantees no constraint violation can ever reach the DB AND we get a forensic trail of what slipped past the primary sanitizer.

### 3. Apply same guard in `generate-cluster-chunk`

Mirror the guard at every `blog_articles.insert(...)` call site in `generate-cluster-chunk/index.ts` (the orchestrator that handles the 6-pack generation in atomic clusters). Same pattern: post-sanitize guard + forensic log + force-strip.

### 4. Sanitize the fallback field too

Line 591 reads `contentJson.detailed_content || contentJson.content`. Make sure both paths are sanitized (currently they are via the unified `rawContent`, but adding the guard covers any future drift).

## After the fix lands

Per your "retry the 4 missing pieces" decision:

1. Re-trigger `generate-missing-articles` on cluster `7eeebd5d-a03d-4c26-837e-f197d81afeb5`.
2. Watch logs for either: 
   - Clean run → 4 articles inserted → cluster hits 6/6 → atomic gate verifies → status `completed`. 
   - Guard tripped → forensic record written → we finally see the offending pattern.

## Files to edit

- `supabase/functions/generate-missing-articles/index.ts` — replace `sanitizeDetailedContent`, add pre-insert guard at line ~650.
- `supabase/functions/generate-cluster-chunk/index.ts` — mirror the same sanitizer + guard at each blog_articles insert.

## Out of scope

- DB-side trigger (you chose surgical, not defense-in-depth).
- v5 cluster batch retest — still gated on this fix proving out on a single cluster first.
- Re-running cluster 51 — still in the freezer per the two-strike rule.
