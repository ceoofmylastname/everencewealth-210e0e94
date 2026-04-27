## Goal

Switch image generation from the current "museum-exhibit infographic apparatus" prompt style to a **photorealistic, human-centric editorial style** that visually mirrors the article's story. Add hard brand/text constraints so output never contains logos, third-party names, or readable copy. Then bulk-regenerate flagged branded images.

## What's already in place (no rework needed)

- `kieClient.ts` already pins `model: "nano-banana-2"` — verified, will surface to you.
- `LogoBrandingScanTab.tsx` **already has** a "Replace All Flagged" bulk button and a per-row "Replace" button, both wired to `regenerate-article-image`. **Step 2.2 and Step 2.3 of your spec are essentially done.** The plan keeps those buttons but tightens behaviour (forces brand-mark verification retry, marks `resolved_at` after success, refuses to re-flag the next scan via `resolved_at IS NOT NULL` filter that's already there).
- Detection store: `article_image_issues` table, filtered by `issue_type='logo_detected'` and `resolved_at IS NULL`. Detection runs via `scan-article-images` edge function which calls `analyze-image-for-text` (vision API).

## Current prompt style (what we're replacing)

`regenerate-article-image` builds a 500-word "Image Explainer" director prompt: museum apparatus with crystal vessels, brass gauges, holographic data clouds, etched plaques. Explicitly **no people** as primary subject. Visually dense, infographic-style, label-heavy.

`regenerate-cluster-images` uses a much simpler `extractImagePrompt` helper but still defaults to "professional financial advisory photograph" with brand-free constraints.

`generate-hero-image` is **not** article-driven — it generates fixed villa/couple lifestyle hero images for the homepage. Different surface; the new template doesn't apply cleanly there. **Flagged below.**

## Plan

### 1. New unified prompt template (PART 1)

Build a shared helper `buildEditorialImagePrompt({ title, firstParagraph })` in a new file `supabase/functions/_shared/editorialImagePrompt.ts` that returns the exact template from your spec:

```
Photorealistic editorial-quality image illustrating: ${title}.

Visual concept derived from: ${firstParagraph}

Style: cinematic professional photography, natural lighting,
documentary realism, financial planning context, mature professional audience.

Subject focus: human-centric storytelling that conveys the article's
emotional core (retirement security, financial confidence, family legacy,
generational wealth) through facial expression, body language, and
environmental context.

HARD CONSTRAINTS — IMAGE MUST NOT CONTAIN:
- Any company logos, brand marks, trademarks, or product packaging
- Any readable text, captions, watermarks, signs, or screen displays
- Any third-party brand names (banks, insurance carriers, financial
  products, software platforms, news outlets, etc.)
- Stock photo aesthetic, generic AI look, plastic/synthetic skin
- Cartoon, illustration, or vector art styles
- Crypto, NFT, or speculative-finance imagery
- Spanish-language signage (this is a US-market wealth firm)

Required: 16:9 aspect ratio, 2K resolution, color-graded for
professional financial publication.
```

`firstParagraph` is built by stripping HTML from `detailed_content` (or `answer_main` for QA, or `description` for locations) and trimming to ~300 chars at the nearest sentence boundary. `title` comes from `headline` / `question_main` / `topic` depending on content type.

### 2. Wire the helper into the three generation surfaces

**`regenerate-article-image/index.ts`**
- Delete the entire "Image Explainer (IE) prompt director" Lovable AI synthesis call (~150 lines of system prompt + the fetch).
- Delete `buildFallbackPrompt` (museum-exhibit fallback no longer matches the new aesthetic).
- Build the prompt directly with `buildEditorialImagePrompt({ title: article.headline, firstParagraph: stripHtml(article.detailed_content).slice(0, 300) })`.
- Keep the existing **logo verification + 1 retry loop** against `analyze-image-for-text` — it's the safety net for branded outputs. On retry, append `--strictly no brand marks, no readable text, no signage` rather than the old index-name appendix.
- Keep image upload, alt/caption metadata generation (it stays multilingual EN/ES), `featured_image_url` update, old image deletion.

**`regenerate-cluster-images/index.ts`**
- Replace `extractImagePrompt` Lovable AI call with the same direct template build per English position. Faster, cheaper, deterministic.
- Spanish translations continue to share the English image; no change to the sharing logic.

**`generate-hero-image/index.ts`**
- This is **not** article-driven — it generates fixed homepage villa/couple hero images. The new article-template doesn't fit. **Recommendation: leave the current hero prompts intact** but append the same `HARD CONSTRAINTS` block to both `desktopPrompt` and `mobilePrompt` so any incidental signage / wordmarks in the villa scene gets suppressed. No structural rewrite.
- Will surface this trade-off in chat and let you confirm before editing.

### 3. Bulk regeneration UI (PART 2)

`LogoBrandingScanTab.tsx` already has both buttons. Light tightening only:

- Confirm `resolved_at` is set after a successful replace so the next scan won't re-flag (already done — verified).
- Ensure the per-row replace passes through `force: true` so the edge function regenerates even if the article already has a Supabase image. **Note:** `regenerate-article-image` does not currently honour a `force` flag; it always regenerates the English primary. Spanish siblings always share from English. This is already the correct behaviour for "Replace All Flagged" — no flag plumbing required.
- No new buttons needed. No new force flag needed. Step 2 of your spec is functionally complete.

### 4. PART 3 verification

After deploy:
1. From `/admin/articles/batch-images` (BatchImageGeneration), pick one article missing an image and trigger generation. Inspect the result — confirm photorealistic, human-centric, no logos, no text, matches headline.
2. From `/admin/image-health` Logo & Branding tab, run a scan. Pick 5–10 flagged items, click "Replace" on each individually first to spot-check. Then "Replace All Flagged".
3. Confirm `articles.featured_image_url` updates and old image is removed from the bucket (current code already deletes the old image on success).

## Files changed

**Created:**
- `supabase/functions/_shared/editorialImagePrompt.ts` — exports `buildEditorialImagePrompt({ title, firstParagraph })` and a `stripHtml` helper.

**Edited:**
- `supabase/functions/regenerate-article-image/index.ts` — replace IE director prompt with template; keep logo-verify retry; update retry appendix.
- `supabase/functions/regenerate-cluster-images/index.ts` — replace `extractImagePrompt` with direct template build.
- `supabase/functions/generate-hero-image/index.ts` — append HARD CONSTRAINTS block to both villa prompts (no structural change).

**Untouched (per your guardrails):**
- All `supabase/migrations/*.sql`
- `OptimizedImage.tsx` (just fixed)
- `functions/_middleware.js`, `injectSeoTags()`, `serve-seo-page` HTMLRewriter
- `src/config/business.ts` BUSINESS values
- All PROMPT 20/21/22 work (sameAs, knowsAbout, security headers, llms.txt, etc.)

## Two questions before implementation

1. **Hero image (`generate-hero-image`):** OK to leave the villa/couple prompts intact and just append the no-logo / no-text constraints? Or do you want the homepage hero to also follow the article-style template (which would change the entire homepage hero aesthetic)?

2. **Per-row "force regenerate" flag:** Your spec mentions `force=true`. Current behaviour already re-runs the full pipeline regardless of whether the article has a Supabase image. Is the explicit flag needed for any case I'm missing, or is "always regenerate when called" the correct semantic?
