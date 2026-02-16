

## Revamp Comparison Generator: English-First with AI Images and Full JSON-LD

### Overview

Change the comparison workflow to generate English only, then let you manually translate and publish. Add AI-generated featured images via Nano Banana Pro and enrich the public-facing comparison page with full structured data (JSON-LD).

---

### 1. English-Only Generation (Admin Side)

**File: `src/pages/admin/ComparisonGenerator.tsx`**

- Remove multi-language generation from the "Create Comparison" form -- always generate English only
- Remove the language selector checkboxes from the generation form
- After English comparison is saved, immediately generate a featured image using the existing `generate-image` edge function (which already uses Nano Banana Pro and topic-aware prompts)
- Save the image URL, auto-generated alt text (from headline), and caption to the comparison record
- Translation happens separately via the existing "Translate" button in the Manage tab (already wired to `translate-comparison` edge function)
- The publish toggle button already exists in the Manage tab -- no changes needed there

### 2. AI Image Generation for Comparisons

**File: `src/pages/admin/ComparisonGenerator.tsx` (generation mutation)**

After saving the English comparison to the database:
- Call the existing `generate-image` edge function with the comparison headline
- Download the temporary Fal.ai URL and upload to the `article-images` storage bucket (same pattern used in `MediaSection.tsx`)
- Update the comparison record with:
  - `featured_image_url`: the permanent storage URL
  - `featured_image_alt`: `"{Option A} vs {Option B} - {headline}"`
  - `featured_image_caption`: `"{headline} - Everence Wealth"`

**File: `supabase/functions/translate-comparison/index.ts`**

Already copies `featured_image_url` from source and translates `featured_image_alt` and `featured_image_caption` -- no changes needed.

### 3. Full JSON-LD Structured Data on Public Page

**File: `src/pages/ComparisonPage.tsx`**

Replace the basic inline Article schema with the full schema set from `comparisonSchemaGenerator.ts` (which already exists but is unused):

- **Article schema** with author, publisher, image object, citations
- **FAQ schema** from `qa_entities` array
- **Speakable schema** targeting `.speakable-answer`, `.comparison-summary`, `.final-verdict` CSS selectors
- **Breadcrumb schema** (Home > Comparisons > Topic)
- **Image schema** with `url`, `caption`, `description`, `contentUrl`
- **Table schema** for the quick comparison table

All schemas will be rendered as separate `<script type="application/ld+json">` blocks in the `<Helmet>`.

The existing `generateAllComparisonSchemas()` function handles all of this -- it just needs to be imported and called with the comparison data.

**Update BASE_URL**: The schema generator file currently uses `delsolprimehomes.com` -- update to `everencewealth.com` to match the brand pivot.

### 4. Speakable Header Enhancement

**File: `src/components/comparison/SpeakableBox.tsx`**

Already has the correct CSS classes (`speakable-answer`, `comparison-summary`) that the Speakable schema targets. No changes needed to the component itself.

The Speakable JSON-LD schema (from step 3) will reference these CSS selectors, telling search engines which content is suitable for voice/audio reading.

---

### Technical Summary

| Change | File |
|---|---|
| Remove multi-lang from generation form, add image gen after save | `src/pages/admin/ComparisonGenerator.tsx` |
| Use full schema generator on public page | `src/pages/ComparisonPage.tsx` |
| Update BASE_URL to everencewealth.com | `src/lib/comparisonSchemaGenerator.ts` |
| No changes needed | `translate-comparison` edge function, `SpeakableBox.tsx`, Manage tab |

