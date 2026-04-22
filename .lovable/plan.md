

## Migrate all content writing to `CLAUDE_API_KEY` (Anthropic)

Replace OpenAI and Lovable AI Gateway calls with direct Anthropic Claude API calls across every content-writing edge function. Citations stay on Perplexity (separate concern). Images stay on Fal.ai/Lovable AI (not text content).

### Scope — what counts as "content writing"

**Blog articles (currently OpenAI):**
- `generate-cluster` — main article generator
- `generate-cluster-chunk` — chunked article generation
- `generate-missing-articles` — gap-filler
- `regenerate-article` — full article regeneration
- `regenerate-section` — per-section regeneration (headlines, SEO, content, etc.)

**Q&A pages (currently Lovable AI / Gemini):**
- `generate-article-qas`
- `generate-cluster-qas`
- `generate-10lang-qa`
- `generate-qa-pages`
- `backfill-tofu-faqs`
- `backfill-article-faqs` (if present)

**Translations & misc text (currently Lovable AI):**
- Any `translate-*` edge function that produces published copy → audit and migrate
- `generate-speakable-answer`, `generate-meta-*` if they exist as standalone functions

**Out of scope (stays as-is):**
- `find-citations-perplexity`, `find-citations-fast`, `discover-cluster-citations`, `perplexity-health` → Perplexity
- Image generation (`fal-*`, Nano Banana) → Fal.ai
- Underwriting AI (Claude already, via `ANTHROPIC_API_KEY` — verify it's the same key or consolidate)
- Internal admin/debug tools that don't ship content

### Step 1 — Audit (first thing in default mode)

Grep every edge function for:
- `OPENAI_API_KEY` usage
- `LOVABLE_API_KEY` usage where the output is article/Q&A/meta content (not images, not citations)
- Existing `CLAUDE_API_KEY` / `ANTHROPIC_API_KEY` usage to confirm pattern

Produce a definitive file list before editing. Confirm whether `CLAUDE_API_KEY` and `ANTHROPIC_API_KEY` are the same value or two separate keys (both exist in secrets).

### Step 2 — Build a shared Claude client

Create `supabase/functions/_shared/claudeClient.ts`:
- Reads `CLAUDE_API_KEY`
- Wraps `https://api.anthropic.com/v1/messages` with required headers (`anthropic-version: 2023-06-01`, `x-api-key`, `content-type`)
- Default model: `claude-sonnet-4-5-20250929` (best quality for long-form content)
- Helper for JSON-mode responses (Claude doesn't have native JSON mode — use system prompt + extraction)
- Handles 429/529 (overloaded) with friendly errors mirroring current OpenAI/Lovable error surface
- Optional `maxTokens` (default 8000 for articles, 2000 for Q&As)

### Step 3 — Migrate each function

For each function in scope, replace the `fetch('https://api.openai.com/...')` or `fetch('https://ai.gateway.lovable.dev/...')` block with the shared Claude client. Keep prompts identical (they're already tuned), only swap the transport + response parsing:
- OpenAI: `data.choices[0].message.content`
- Lovable AI: `data.choices[0].message.content`
- Claude: `data.content[0].text`

JSON parsing helper already exists in `regenerate-article` (`extractJsonFromResponse`) — promote it to the shared module so every function uses the same robust extractor.

### Step 4 — Fix the cosmetic logging bug

`generate-cluster/index.ts` line ~592 currently logs `LOVABLE_API_KEY` while validating `OPENAI_API_KEY`. After migration, both references become `CLAUDE_API_KEY`.

### Step 5 — Model selection per use case

| Use case | Model | Reason |
|---|---|---|
| Full article (1,500–2,500 words) | `claude-sonnet-4-5-20250929` | Best long-form quality |
| Q&A entries (80–120 words each) | `claude-haiku-4-5-20250514` | Faster + cheaper, quality is fine |
| Section regeneration (headlines, meta) | `claude-haiku-4-5-20250514` | Short outputs, latency matters |
| Translations | `claude-sonnet-4-5-20250929` | Nuance matters for multi-lingual |

User can override via env var if they want a single model everywhere.

### Step 6 — Verification

After migration, in default mode:
1. `grep -rE "OPENAI_API_KEY|api\.openai\.com" supabase/functions/` — expect zero hits except possibly in deprecated/disabled functions
2. `grep -rE "LOVABLE_API_KEY|ai\.gateway\.lovable\.dev" supabase/functions/` — expect hits ONLY in image-generation and citation-adjacent functions, never in text-content functions
3. Test invoke `regenerate-section` on one article with `section: 'speakable'` — confirm Claude responds and the article updates
4. Test invoke `generate-article-qas` on one article — confirm 3–5 FAQs persist
5. Report:
   - List of migrated functions (expect ~10)
   - List of intentionally untouched functions (citations, images, underwriting)
   - Smoke-test results for the two test invocations
   - Any prompts that needed tweaking for Claude's response style

### Files to change (estimated ~12)

**New:** `supabase/functions/_shared/claudeClient.ts`

**Migrated (text content):** `generate-cluster`, `generate-cluster-chunk`, `generate-missing-articles`, `regenerate-article`, `regenerate-section`, `generate-article-qas`, `generate-cluster-qas`, `generate-10lang-qa`, `generate-qa-pages`, `backfill-tofu-faqs`, `backfill-article-faqs` (if exists), translation functions (audit step will list)

**Untouched:** `find-citations-*`, `discover-cluster-citations`, `perplexity-health`, `fal-*` image functions, underwriting RAG (already Claude), admin/debug tools

### Open questions to confirm before coding

1. **Model preference:** Sonnet 4.5 for articles + Haiku 4.5 for Q&As (recommended), or Sonnet for everything (more expensive, slightly higher quality on Q&As)?
2. **`CLAUDE_API_KEY` vs `ANTHROPIC_API_KEY`:** both exist in secrets — should both be normalized to `CLAUDE_API_KEY`, or keep `ANTHROPIC_API_KEY` for the underwriting RAG and use `CLAUDE_API_KEY` for content writing?
3. **Translations:** confirm in-scope. The current setup uses Lovable AI / Gemini for cheaper bulk translations. Moving to Claude raises cost but unifies the stack. Migrate or leave on Gemini?

