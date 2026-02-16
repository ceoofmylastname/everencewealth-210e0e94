

# Rebrand Cleanup: Remove "Costa del Sol Real Estate" References

## Problem
The entire codebase was originally a Costa del Sol real estate site. It was rebranded to "Everence Wealth" (insurance, retirement planning, wealth management), but hundreds of hardcoded "Costa del Sol" references remain across 140+ files. This causes:
- Articles about retirement/insurance showing real estate images and metadata
- AI-generated images depicting Mediterranean villas instead of financial planning scenes
- Alt text, captions, and meta descriptions referencing Spanish property

## Scope
Full cleanup of 140+ files is a multi-phase effort. This plan covers the **highest-impact items** that directly affect article content and image generation.

## Phase 1: Fix Article Image Generation (immediate impact)

### 1a. `src/components/article-editor/MediaSection.tsx`
- Line 87: Change `${headline} - Costa del Sol real estate` to `${headline} - Everence Wealth`
- Line 91: Change `${headline} - Luxury real estate in Costa del Sol` to `${headline} - Everence Wealth`

### 1b. `supabase/functions/generate-image/index.ts` (complete rewrite of prompts)
- Replace all real estate topic detection with financial/insurance topics (retirement, insurance, tax planning, wealth management, estate planning)
- Replace property-type inference with financial scene inference
- Replace location inference (Marbella, Estepona, etc.) with generic professional settings
- Replace all image prompts: villas/pools/Mediterranean become office consultations, retirement lifestyle, financial charts, family protection scenes
- Update fallback prompt from "Costa del Sol real estate" to "professional financial advisory"

### 1c. `supabase/functions/regenerate-article-image/index.ts`
- Update system prompt from "Costa del Sol real estate" expert to financial/insurance content expert
- Update fallback metadata references

### 1d. `supabase/functions/regenerate-cluster-images/index.ts`
- Replace "Costa del Sol real estate photograph" prompts with financial/wealth imagery

## Phase 2: Fix the existing article data

### 2a. Update the current article's bad metadata
```sql
UPDATE blog_articles 
SET 
  featured_image_alt = 'Bridging the Retirement Gap - Everence Wealth',
  meta_description = 'Discover effective strategies to close your retirement savings shortfall. Learn about catch-up contributions, tax optimization, and income planning with Everence Wealth.'
WHERE id = 'e86ad454-5649-416c-b787-dc0882b4b5cc';
```

### 2b. Bulk fix all articles with stale Costa del Sol references
```sql
UPDATE blog_articles 
SET featured_image_alt = REPLACE(featured_image_alt, 'Costa del Sol real estate', 'Everence Wealth')
WHERE featured_image_alt LIKE '%Costa del Sol%';

UPDATE blog_articles 
SET featured_image_caption = REPLACE(featured_image_caption, 'Luxury real estate in Costa del Sol', 'Everence Wealth')
WHERE featured_image_caption LIKE '%Costa del Sol%';
```

## Phase 3: Fix remaining edge functions (13+ functions)
Update Costa del Sol references in these edge functions:
- `generate-hero-image` - hero image prompts
- `generate-brochure-images` - brochure prompts  
- `generate-location-image` - location prompts
- `resume-cluster` - article generation prompts
- `regenerate-section` - section prompts
- `find-citations-perplexity` - citation context
- `generate-qa-pages` - QA generation context
- `generate-city-qa-pages` - city QA prompts
- `serve-seo-page` - SEO page templates
- And others

## Phase 4: Fix frontend translations and components (100+ files)
- All i18n translation files (en, de, nl, fr, fi, sv, no, etc.)
- Component files referencing Costa del Sol
- Constants and configuration files

---

**Recommendation**: Phases 1 and 2 are the priority -- they fix the immediate broken article experience. Phases 3 and 4 are larger efforts that can be tackled incrementally.

## Files Changed (Phase 1-2)
- `src/components/article-editor/MediaSection.tsx`
- `supabase/functions/generate-image/index.ts`
- `supabase/functions/regenerate-article-image/index.ts`
- `supabase/functions/regenerate-cluster-images/index.ts`
- Database updates for existing articles
