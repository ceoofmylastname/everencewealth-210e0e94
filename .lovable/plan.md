

## Confirm "Regenerate Image" reads the article → Kie.ai → no branding

### What the button does today (already correct)

When you click **Regenerate** on `/admin/image-health`:

1. Edge function loads the article (headline, meta, theme, funnel stage, first 2,000 chars of body).
2. Sends that to **Lovable AI Gemini 2.5 Flash** with a strict system prompt that:
   - Bans 24+ named competitors (Apex, Ascend, Edward Jones, Fidelity, etc.) plus generic "any other firm/competitor logo or wordmark."
   - Requires "no text, no watermarks, no logos, no brand marks, no monograms, no shields, no badges, no company names, no signatures, no words anywhere in the frame."
3. Hard-appends `--no logo, no watermark, no brand mark, no text overlay, no company name, no shield emblem, no monogram, no badge, no signature, no photographer credit, no stock-photo mark, no letters, no words` to whatever the AI produced.
4. Sends the final prompt to **Kie.ai Nano Banana 2** (16:9, 2K).
5. Pipes the result through `analyze-image-for-text` (logo mode). If a logo is still detected, regenerates up to 2 more times with stricter wording.
6. Uploads to Supabase Storage, updates `featured_image_url` + alt + caption, deletes the old image.

So the core flow you described is exactly what runs.

### One behavior worth your decision

For **Spanish articles** the function does NOT generate a new Kie.ai image by default — it copies the English sibling's image and writes Spanish alt/caption. This was added so EN/ES pairs share visual identity. Your wording today ("read the article and create an image based on it") suggests you may want each language to get its own image instead. Two options:

| Option | Behavior |
|---|---|
| **A. Keep sharing (current)** | Spanish articles inherit the English image. Faster, no extra Kie.ai cost. |
| **B. Always regenerate fresh** | Every click reads that specific article and asks Kie.ai for a new image, regardless of language. |

### Three small hardenings I'd ship alongside

1. **Tighten the Lovable AI system prompt** — remove a contradictory line currently in it (`"NEVER generate financial planning, villas, professional, or property images"`) which conflicts with the rest of the prompt and likely came from legacy real-estate copy. Replace with a cleaner positive directive.
2. **Add the article body content into the negative-suffix sanity check** — currently the suffix is appended only if `--no logo` isn't already present. Make that check also catch `no logos` / `no brand` so we never get a duplicate stack.
3. **Surface the verification result in the toast** — when the retry loop catches a logo on attempt 1 or 2 and successfully replaces it, log "Logo blocked on attempt N — regenerated clean" so you can see it working in the activity feed.

### Out of scope

- No UI changes to the dashboard.
- No schema changes.
- No changes to scan / detection logic.
- Logo-verification retry loop (already in place) untouched.

### Pick one to proceed

Reply with **A** (keep EN→ES sharing) or **B** (every click = fresh Kie.ai image), and I'll ship that plus the three hardenings.

