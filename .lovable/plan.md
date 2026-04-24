

## Detect & Replace All Images Containing Competitor Logos

The good news: most of this system already exists. We have a logo-detection edge function (`analyze-image-for-text`), an issues table (`article_image_issues`), an Image Health Dashboard at `/admin/image-health`, and a regenerator (`regenerate-article-image`) whose prompt already enforces "no text, no watermarks, no logos." The gap is that bulk **logo scanning** is currently capped at 10 images and isn't surfaced as a one-click action, and the regenerator needs a stronger anti-logo guardrail.

This plan turns the existing pieces into a complete **"Find every logo'd image → replace it"** workflow.

---

### What you'll get

A new section on the Image Health Dashboard called **"Logo & Branding Scan"** with three buttons:

1. **Scan All Article Images for Logos** — runs every published article image through the vision model, flags any that contain a brand mark, company name, or watermark. Progress bar shows X / Y scanned.
2. **Review Flagged Images** — gallery view of every flagged image side-by-side with the detected brand name (Apex, Ascend, etc.), article title, and language.
3. **Replace All Flagged (Bulk)** — one click regenerates every flagged image with the hardened "no-logo" prompt, replaces it in storage, marks the issue resolved, and shows a before/after grid.

Per-image controls: Approve (it's actually fine), Replace (regenerate just this one), Skip.

---

### How it works end-to-end

```text
[Scan All Logos button]
        │
        ▼
scan-article-images (logo mode) ──► loops every published blog_articles row
        │                            sends each image to analyze-image-for-text
        │                            (Lovable AI Gateway, Gemini 2.5 Flash vision)
        │                            writes hits to article_image_issues
        │                            with issue_type='logo_detected'
        ▼
[Review Flagged gallery] ──► shows brand_name, article, image preview
        │
        ▼
[Replace All Flagged] ──► fans out to regenerate-article-image per row
                          new prompt enforces zero text / zero logos
                          old image deleted from storage, new one written
                          article_image_issues row marked resolved
                          before/after appears in the Fixed tab
```

---

### Implementation steps

**1. Backend — upgrade `analyze-image-for-text`**
- Switch from OpenAI Vision to Lovable AI Gateway (`google/gemini-2.5-flash` with vision) — already the project standard, no extra API key.
- Tighten the prompt to specifically detect: company logos, brand wordmarks (Apex, Ascend, APEX Financial Advisors, etc.), watermarks, photographer credits, any non-Everence brand mark. Return `brandName` field when found.
- Add a `logo` value to the existing `severity` flow with `severity: 'high'` for any branded content.

**2. Backend — extend `scan-article-images`**
- Add a new `scanType: 'logos'` mode that removes the 10-image cap.
- Process in batches of 5 with concurrency control and a progress channel (writes percent-complete to a `scan_jobs` table so the UI can poll).
- Inserts go into `article_image_issues` with `issue_type='logo_detected'` and `details.brand_name`.

**3. Database — additions**
- Migration: add `'logo_detected'` to the allowed `issue_type` values (currently `duplicate | text_detected | expired_url`).
- New `image_scan_jobs` table: `id, status, total, processed, flagged, started_at, finished_at` so the UI can show live progress.
- RLS: admin-only read/write (matches existing policy).

**4. Backend — harden `regenerate-article-image` prompt**
The current prompt says "no text, no watermarks, no logos" but Kie.ai still occasionally hallucinates brand marks. Strengthen with:
- Explicit negative examples in the system prompt ("DO NOT include shields, badges, monograms, financial company logos, advisor brand marks, watermarks in corners, photographer credits").
- Append `--no logo, no watermark, no brand mark, no text overlay, no company name, no shield emblem, no monogram` to every prompt sent to Kie.ai.
- Optional post-generation check: pipe the new image through `analyze-image-for-text` and regenerate up to 2 times if a logo is still detected (auto-retry loop).

**5. Frontend — new "Logo & Branding Scan" tab on Image Health Dashboard**
- Live progress bar wired to `image_scan_jobs` (Supabase Realtime subscription).
- Flagged-images gallery: thumbnail, article title, brand name detected, language badge, severity badge.
- Per-row Replace / Skip / Approve buttons.
- Top-of-tab "Replace All Flagged" button with confirmation dialog showing count + estimated time.

**6. Frontend — link from current article preview**
On the route you're on now (`/en/blog/...`), add an admin-only floating button "Scan this image for logos" that triggers a single-image check and offers immediate replacement — handy for the cases you spot manually like the two screenshots you uploaded.

---

### Coverage

The scan covers every place an image is stored:
- `blog_articles.featured_image_url` (12 per cluster, ~hundreds total)
- `qa_pages.featured_image_url` (48 per cluster)
- `homepage_images.image_url`
- `comparison_pages.featured_image_url`
- `glossary_terms.image_url`

All of these flow through the same `regenerate-article-image` family of functions, so one workflow covers the whole site.

---

### Cost & time estimate

- Vision scan: ~1.2 s per image via Gemini 2.5 Flash. A full site sweep of ~600 images ≈ 12 min.
- Regeneration: ~8 s per image via Kie.ai Nano Banana 2. If ~10–15% are flagged (≈ 60–90 images), ≈ 8–12 min.
- Lovable AI credits: well within standard usage; no new API keys required.

---

### Out of scope

- No changes to the cluster generator's normal flow — just hardens the existing prompt.
- No changes to non-image content (text, FAQs, citations).
- No new external services. Everything uses existing Lovable AI + Kie.ai stack.

---

### Final deliverable

After approval and implementation, you'll click one button at `/admin/image-health` → "Scan All for Logos" → wait ~12 minutes → review the flagged gallery → click "Replace All" → the system regenerates every branded image with logo-free versions, marks them resolved, and you see before/after proof. The two examples you uploaded (Apex shield, Ascend wordmark) get caught and replaced automatically.

