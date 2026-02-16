
## Add Image Alt Text, Visible Captions, and Enhanced JSON-LD

### Problem
- Most articles have `featured_image_caption` as null in the database, so no visible description appears under featured images
- The JSON-LD `ImageObject` only includes caption/description when they exist, but should always have both for SEO completeness
- Images need consistent alt text and a visible user-facing description

### What Will Change

**1. Featured Image Caption (visible to users)**
In `src/components/blog-article/ArticleContent.tsx`, update the `<figure>` block so that:
- If `featured_image_caption` exists, show it as the figcaption (current behavior)
- If no caption exists but `featured_image_alt` exists, show the alt text as the visible figcaption instead
- This ensures every featured image always has a visible description underneath

**2. JSON-LD ImageObject Enhancement**
In `src/components/schema/ArticleSchema.tsx`, update the schema so that:
- `ImageObject` always includes both `caption` and `description` fields
- If `imageCaption` is missing, fall back to `imageAlt` for caption
- If `imageAlt` is missing, fall back to `imageCaption` for description
- This ensures the structured data always has complete image metadata for search engines

**3. Diagram Image Alt Text**
In `src/components/blog-article/ArticleContent.tsx`, ensure the diagram image always has meaningful alt text from `diagramDescription` (already mostly done, just verify the fallback).

### Technical Details

**File: `src/components/blog-article/ArticleContent.tsx`** (lines 174-189)
- Change the figcaption condition from only showing when `featuredImageCaption` exists to also showing when `featuredImageAlt` exists
- When caption is missing, display the alt text as the visible description

**File: `src/components/schema/ArticleSchema.tsx`** (lines 45-52)
- Always include the `image` object when `imageUrl` exists
- Always populate both `caption` and `description` fields using fallback logic:
  - `caption`: use `imageCaption` or fall back to `imageAlt`
  - `description`: use `imageAlt` or fall back to `imageCaption`
