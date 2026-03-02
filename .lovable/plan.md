

## Fix Mismatched FAQs on "Choosing the Right Advisor" Article

### Problem
The article "Choosing the Right Advisor: How to Protect Your Wealth from Volatility Drag and Market Risk" has 7 FAQ entries entirely about IUL insurance, which has nothing to do with the article's actual content about volatility drag, market risk, and advisor selection.

### Solution
Use the existing `regenerate-qa-section` edge function to regenerate the `qa_entities` for this article with topic-appropriate questions. However, that function targets `qa_pages`, not `blog_articles.qa_entities` directly.

Instead, we'll create a simple edge function call (or direct DB update via an existing admin function) to:

1. **Call OpenAI** to generate 5-7 new FAQ Q&As that match the article's actual content — covering volatility drag, market risk, sequence-of-returns risk, advisor fiduciary duty, fee structures, and wealth protection strategies.

2. **Update `blog_articles.qa_entities`** for article ID `8beab0a5-aeb6-4e5f-b85b-a6c652ba9ebd` with the new Q&As.

### Implementation
- Modify the existing `regenerate-qa-section` edge function to also support a mode where it regenerates `qa_entities` on `blog_articles` (not just `qa_pages`). Add a new `targetType: 'article'` parameter alongside `articleId`.
- Alternatively, create a one-off script that calls OpenAI and updates the row directly — faster to implement.

### Recommended approach
Add a `targetType` and `articleId` parameter to `regenerate-qa-section`:
- When `targetType === 'article'`: fetch `blog_articles` by `articleId`, generate Q&As from `headline` + `detailed_content`, update `qa_entities` on the article row.
- Keep existing `qa_pages` logic unchanged.

### Scope check
Before fixing just this one article, we should audit all articles for the same issue — many may have IUL-focused FAQs that don't match their content. A bulk regeneration would be more efficient.

### Files changed
- `supabase/functions/regenerate-qa-section/index.ts` — add `targetType: 'article'` support

