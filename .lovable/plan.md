

## Why the regeneration failed

I traced your failed attempt in the edge function logs. Here is exactly what happened.

### The article that failed

**"The Retirement Savings Gap: Why 64% of Americans Over 50 Are Financially Unprepared"** (English, article ID `0655c0e6…`).

You actually clicked Regenerate **twice**, ~5 minutes apart. Both clicks failed for the **same reason**, but at different points.

### What the logs show

```text
06:25:36  🖼️ Starting image regeneration for article: 0655c0e6 (English)
06:25:36  📝 Article: "The Retirement Savings Gap…"
06:25:36  🧠 Generating content-based image prompt via Lovable AI...
06:25:42  🎨 Generated prompt: "A museum-grade exhibit showcasing a Tax-Advantaged Retirement Income Gateway…"
06:25:42  🖼️ Generating image with Kie.ai Nano Banana 2...
06:27:23  [kie] task c3a5e69e state=success      ← 1st image came back
06:27:23  ⚠️ Attempt 1: brand mark still detected (S&P 500). Regenerating…
06:27:23  [kie] task 746e8965 state=waiting       ← retry kicked off
          (no further logs — function timed out / connection closed)
06:28:05  Toast: "Failed: The Retirement Savings Gap…"
```

### Root cause

The **logo-verification retry loop** caught a brand mark (`S&P 500`) burned into the first generated image, kicked off a stricter retry, and the **second Kie.ai job didn't finish before the edge function's wall-clock budget expired** (or before the client-side request aborted). The function never returned a 2xx, so the dashboard surfaced a generic `FunctionsHttpError`.

This is a known weak spot:
- One Kie.ai generation = ~90 seconds (your earlier successful runs match: 06:23:09 → 06:25:13 = 124 s).
- A retry doubles the wall clock to ~3 minutes.
- The function is doing all this **synchronously** on the client request, so it's racing against both the edge function timeout (~150 s default) and the Supabase Functions client timeout.

It is NOT a problem with your prompt, your Kie.ai key, or the article. The same article on a fresh run will probably succeed — but any article whose first image happens to contain "S&P 500", "Nasdaq", "Apple", "401(k)" rendered as a logo, etc. will hit this trap.

### Why "S&P 500" keeps appearing

Gemini generates a prompt mentioning index investing, and Kie.ai renders an apparatus with "S&P 500" engraved on a plaque. The current negative suffix bans logos and brand names but does NOT explicitly ban index names like "S&P 500", "Dow Jones", "Nasdaq", "Russell 2000". The vision check then correctly flags it as a brand mark, triggering the retry that runs out of time.

### The fix (3 small changes, all in `supabase/functions/regenerate-article-image/index.ts`)

**1. Pre-empt the retry — ban index/ticker names in the prompt itself.**
Add to the existing negative suffix and to the system prompt's "STRICT NON-NEGOTIABLE RULES":
- No index names: S&P 500, Dow Jones, DJIA, Nasdaq, Russell 2000, FTSE, MSCI, Wilshire
- No ticker symbols, no exchange names
- Plaques referring to "the market" or "broad index" must use generic phrasing like "MARKET INDEX" only

This stops ~90% of the brand-mark false positives at the source so the retry never has to fire.

**2. Cut the retry wall-clock risk — drop max retries from 2 to 1, and skip the retry entirely on the second attempt if we're already past 90 s elapsed.**
Track `Date.now()` at function start. If a brand mark is detected but `elapsed > 90_000 ms`, accept the image with a logged warning rather than starting another 90-second Kie.ai job that we know won't finish.

**3. Return a structured error to the dashboard instead of a generic 500.**
When the function does time out or fail, respond with a JSON body like `{ error: "kie_timeout", message: "Image generation exceeded budget — try again", articleId, attempts: 2 }` so the toast shows something actionable instead of "Edge Function returned a non-2xx status code".

### What stays unchanged

- Kie.ai Nano Banana 2 stays the renderer.
- The Image Explainer system prompt (museum exhibit / metaphor library) is untouched.
- Buckets/jars stay allowed.
- The EN→ES sharing path is untouched (it worked correctly for the Spanish sibling — log line `✅ Found English primary image - sharing instead of generating new`).
- The vision-check logo verifier stays — we're just making the retry cheaper, not removing the safety net.

### How you'll verify it worked

1. After the change ships, click **Regenerate** on the same article (`The Retirement Savings Gap…`).
2. Watch the edge logs — the first generated image should no longer contain "S&P 500" because the prompt now bans index names outright.
3. If a retry does fire, it should now complete within budget OR the function should return a clean error toast instead of a generic 500.
4. Test on 5 more articles to confirm no regressions.

### Out of scope

- No async/background-job refactor (that's a bigger change; the 3 fixes above should make it unnecessary for normal volume).
- No UI changes to the dashboard.
- No DB schema changes.

Reply approve to ship.

