

# Fix SSR Edge Function QAPage Microdata

## Root Cause
Google detects **two** QAPage schema items on each Q&A page:
1. The JSON-LD script (correct -- has `mainEntity` with Question/Answer)
2. The HTML microdata on the `<article>` tag (broken -- uses `headline` and `articleBody` without `mainEntity`)

The second item is the "Unnamed item" shown in the Rich Results Test with the critical error "Missing field mainEntity".

## Fix

### File: `supabase/functions/serve-seo-page/index.ts` (lines 1835-1878)

Update the HTML template to use correct QAPage microdata when rendering Q&A content. The template currently shares the same structure for both blog posts and Q&A pages, but QAPage requires different Schema.org attributes.

**For Q&A pages**, the HTML structure will become:

```html
<main class="article-container">
  <article itemscope itemtype="https://schema.org/QAPage">
    <div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
      <header class="article-header">
        <h1 itemprop="name">{question}</h1>
        <meta itemprop="answerCount" content="1" />
        <!-- date/meta info (no itemprop needed) -->
      </header>
      <!-- featured image (outside Question itemprop scope is fine) -->
      <!-- speakable summary -->
      <div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
        <div class="article-content" itemprop="text">
          {answer content}
        </div>
      </div>
    </div>
  </article>
</main>
```

**For blog posts**, the existing structure remains unchanged (keeps `headline`, `articleBody`, etc.).

### Specific changes:
1. **Line 1838**: Change `itemprop="headline"` to `itemprop="name"` for Q&A pages only
2. **Line 1867**: Change `itemprop="articleBody"` to `itemprop="text"` for Q&A pages only
3. **Add `mainEntity` wrapper**: Insert opening `<div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">` after the `<article>` tag for Q&A pages, with `<meta itemprop="answerCount" content="1" />` in the header
4. **Add `acceptedAnswer` wrapper**: Wrap the article-content div with `<div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">` for Q&A pages
5. **Close wrappers**: Close the mainEntity and acceptedAnswer divs before `</article>`

This will make the microdata match the JSON-LD, so Google sees two consistent, valid QAPage items instead of one valid and one broken.

## No other files need changes
- `src/pages/QAPage.tsx` -- already fixed in the previous edit (client-side, secondary)
- `src/lib/qaPageSchemaGenerator.ts` -- already correct
- The SSR edge function's JSON-LD (`generateQAPageSchema`) -- already correct

## Verification
After deploying, re-test the same URL in Google Rich Results Test. The "Unnamed item" error should disappear, leaving only valid Q&A structured data.
