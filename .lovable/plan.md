
# Fix Blog Pages Showing Blank - Server-Side Rendering Implementation

## Problem Summary
Blog pages display as blank white pages because the edge function returns an HTML shell with only `<div id="root"></div>` in the body. The actual article content (`detailed_content`) exists in the database but is not being rendered into the HTML response.

## Root Cause Analysis

| Component | Current Behavior | Issue |
|-----------|------------------|-------|
| `PageMetadata` interface | Missing content fields | Cannot pass content to template |
| `fetchBlogMetadata` | Returns SEO fields only | `detailed_content` not included |
| `generateFullHtml` | Renders empty body | No article content available |
| HTML template (line 1866-1882) | `<div id="root"></div>` only | Users see blank page |

## Solution Overview

Extend the edge function to perform true Server-Side Rendering (SSR) by:
1. Adding content fields to the `PageMetadata` interface
2. Including `detailed_content` in the metadata for each content type
3. Creating a new `generateArticleBody` function for SSR content
4. Updating `generateFullHtml` to include rendered content in `<body>`

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/serve-seo-page/index.ts` | Extend interface, update fetch functions, add body rendering |

---

## Detailed Implementation

### Change 1: Extend PageMetadata Interface (Line ~229)

Add content fields to support SSR rendering:

```typescript
interface PageMetadata {
  language: string
  meta_title: string
  meta_description: string
  canonical_url: string
  headline: string
  speakable_answer: string
  featured_image_url?: string
  featured_image_alt?: string
  date_published?: string
  date_modified?: string
  hreflang_group_id?: string
  qa_entities?: any[]
  content_type: 'qa' | 'blog' | 'compare' | 'locations'
  quick_comparison_table?: any[]
  // NEW: Content fields for SSR
  detailed_content?: string      // Blog articles
  answer_main?: string           // Q&A pages
  final_verdict?: string         // Comparison pages
  location_overview?: string     // Location pages
  read_time?: number             // For blogs
  author_bio?: string            // Author info
}
```

### Change 2: Update fetchBlogMetadata (Lines 282-310)

Include `detailed_content` in the returned metadata:

```typescript
async function fetchBlogMetadata(supabase: any, slug: string, lang: string): Promise<PageMetadata | null> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) {
    console.error('Error fetching blog article:', error)
    return null
  }

  return {
    language: data.language || lang,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    canonical_url: data.canonical_url || `${BASE_URL}/${data.language}/blog/${slug}`,
    headline: data.headline,
    speakable_answer: data.speakable_answer,
    featured_image_url: data.featured_image_url,
    featured_image_alt: data.featured_image_alt,
    date_published: data.date_published,
    date_modified: data.date_modified,
    hreflang_group_id: data.hreflang_group_id,
    qa_entities: data.qa_entities,
    content_type: 'blog',
    // NEW: Include content for SSR
    detailed_content: data.detailed_content,
    read_time: data.read_time,
    author_bio: data.author_bio_localized,
  }
}
```

### Change 3: Add New Function - generateArticleBody (Before generateFullHtml)

Create a function to render the article body HTML with styling:

```typescript
function generateArticleBody(metadata: PageMetadata): string {
  const lang = metadata.language
  const langPrefix = `/${lang}`
  
  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'nl' ? 'nl-NL' : 'en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }
  
  // Generate FAQ section if qa_entities exist
  const faqSection = metadata.qa_entities?.length ? `
    <section class="faq-section">
      <h2>Frequently Asked Questions</h2>
      ${metadata.qa_entities.map((faq: any) => `
        <details class="faq-item">
          <summary>${escapeHtml(faq.question)}</summary>
          <p>${escapeHtml(faq.answer)}</p>
        </details>
      `).join('')}
    </section>
  ` : ''
  
  // Main content based on content type
  let mainContent = ''
  
  if (metadata.content_type === 'blog' && metadata.detailed_content) {
    mainContent = metadata.detailed_content
  } else if (metadata.content_type === 'qa' && metadata.answer_main) {
    mainContent = metadata.answer_main
  } else if (metadata.content_type === 'compare' && metadata.final_verdict) {
    mainContent = metadata.final_verdict
  } else if (metadata.content_type === 'locations' && metadata.location_overview) {
    mainContent = metadata.location_overview
  }
  
  return `
    <header class="site-header">
      <nav class="nav-container">
        <a href="${langPrefix}/" class="logo-link">
          <img src="${BASE_URL}/assets/logo-new.png" alt="Del Sol Prime Homes" class="logo">
        </a>
        <div class="nav-links">
          <a href="${langPrefix}/properties">Properties</a>
          <a href="${langPrefix}/blog">Blog</a>
          <a href="${langPrefix}/contact">Contact</a>
        </div>
      </nav>
    </header>
    
    <main class="article-container">
      <article itemscope itemtype="https://schema.org/BlogPosting">
        <header class="article-header">
          <h1 itemprop="headline">${escapeHtml(metadata.headline)}</h1>
          ${metadata.date_published ? `
            <div class="article-meta">
              <time datetime="${metadata.date_published}" itemprop="datePublished">
                ${formatDate(metadata.date_published)}
              </time>
              ${metadata.read_time ? `<span class="read-time">${metadata.read_time} min read</span>` : ''}
            </div>
          ` : ''}
        </header>
        
        ${metadata.featured_image_url ? `
          <figure class="featured-image">
            <img 
              src="${metadata.featured_image_url}" 
              alt="${escapeHtml(metadata.featured_image_alt || metadata.headline)}"
              itemprop="image"
              loading="eager"
            >
          </figure>
        ` : ''}
        
        ${metadata.speakable_answer ? `
          <div class="speakable-summary" itemprop="description">
            <p>${escapeHtml(metadata.speakable_answer)}</p>
          </div>
        ` : ''}
        
        <div class="article-content" itemprop="articleBody">
          ${mainContent || '<p>Content loading...</p>'}
        </div>
        
        ${faqSection}
        
        <div class="cta-section">
          <h3>Ready to Find Your Dream Property in Costa del Sol?</h3>
          <p>Contact Del Sol Prime Homes for expert guidance on luxury real estate.</p>
          <a href="${langPrefix}/contact" class="cta-button">Get in Touch</a>
        </div>
      </article>
    </main>
    
    <footer class="site-footer">
      <div class="footer-content">
        <p>&copy; ${new Date().getFullYear()} Del Sol Prime Homes. All rights reserved.</p>
        <nav class="footer-nav">
          <a href="${langPrefix}/privacy">Privacy</a>
          <a href="${langPrefix}/terms">Terms</a>
        </nav>
      </div>
    </footer>
  `
}
```

### Change 4: Add SSR Styles Function

```typescript
function generateSSRStyles(): string {
  return `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { 
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.7;
        color: #374151;
        background: #f9fafb;
      }
      
      /* Header */
      .site-header { background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
      .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
      .logo { height: 40px; width: auto; }
      .nav-links { display: flex; gap: 1.5rem; }
      .nav-links a { color: #6b7280; text-decoration: none; font-weight: 500; }
      .nav-links a:hover { color: #c9a227; }
      
      /* Article */
      .article-container { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
      .article-header { margin-bottom: 2rem; }
      h1 { font-size: 2.5rem; font-weight: 800; color: #1f2937; line-height: 1.2; margin-bottom: 1rem; }
      .article-meta { color: #6b7280; font-size: 0.875rem; display: flex; gap: 1rem; }
      
      /* Featured Image */
      .featured-image { margin: 2rem 0; border-radius: 12px; overflow: hidden; }
      .featured-image img { width: 100%; height: auto; display: block; }
      
      /* Speakable Summary */
      .speakable-summary { 
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        padding: 1.5rem; 
        border-radius: 8px; 
        margin: 2rem 0;
        border-left: 4px solid #c9a227;
      }
      .speakable-summary p { font-size: 1.1rem; color: #92400e; font-weight: 500; }
      
      /* Content */
      .article-content { font-size: 1.1rem; }
      .article-content h2 { font-size: 1.75rem; color: #1f2937; margin: 2.5rem 0 1rem; }
      .article-content h3 { font-size: 1.35rem; color: #374151; margin: 2rem 0 0.75rem; }
      .article-content p { margin: 1rem 0; }
      .article-content ul, .article-content ol { margin: 1rem 0; padding-left: 1.5rem; }
      .article-content li { margin: 0.5rem 0; }
      .article-content a { color: #c9a227; text-decoration: underline; }
      .article-content blockquote { 
        border-left: 4px solid #c9a227; 
        padding-left: 1rem; 
        margin: 1.5rem 0; 
        font-style: italic; 
        color: #6b7280; 
      }
      .article-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; }
      
      /* FAQ Section */
      .faq-section { margin: 3rem 0; padding: 2rem; background: #f3f4f6; border-radius: 12px; }
      .faq-section h2 { margin-bottom: 1.5rem; }
      .faq-item { border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
      .faq-item summary { font-weight: 600; cursor: pointer; color: #1f2937; }
      .faq-item p { margin-top: 0.75rem; color: #4b5563; }
      
      /* CTA */
      .cta-section { 
        background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
        color: white;
        padding: 2.5rem;
        border-radius: 12px;
        margin: 3rem 0;
        text-align: center;
      }
      .cta-section h3 { font-size: 1.5rem; margin-bottom: 0.75rem; }
      .cta-section p { margin-bottom: 1.5rem; opacity: 0.9; }
      .cta-button { 
        display: inline-block;
        background: linear-gradient(135deg, #c9a227 0%, #b8941f 100%);
        color: white;
        padding: 0.875rem 2rem;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(201,162,39,0.35); }
      
      /* Footer */
      .site-footer { background: #1f2937; color: #9ca3af; padding: 2rem 0; margin-top: 4rem; }
      .footer-content { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
      .footer-nav a { color: #9ca3af; text-decoration: none; margin-left: 1.5rem; }
      .footer-nav a:hover { color: #c9a227; }
      
      /* Responsive */
      @media (max-width: 768px) {
        h1 { font-size: 1.75rem; }
        .nav-links { display: none; }
        .cta-section { padding: 1.5rem; }
        .footer-content { flex-direction: column; gap: 1rem; text-align: center; }
        .footer-nav a { margin: 0 0.75rem; }
      }
    </style>
  `
}
```

### Change 5: Update generateFullHtml (Lines 1261-1333)

Modify the function to include the article body content:

```typescript
function generateFullHtml(metadata: PageMetadata, hreflangTags: string, baseHtml: string): string {
  const locale = LOCALE_MAP[metadata.language] || 'en_GB'
  const escapedTitle = escapeHtml(metadata.meta_title || metadata.headline || 'Del Sol Prime Homes')
  const escapedDescription = escapeHtml(metadata.meta_description || '')
  
  // Generate schemas (existing code remains)
  const qaSchema = metadata.content_type === 'qa' ? generateQAPageSchema(metadata) : ''
  const blogPostingSchema = generateBlogPostingSchema(metadata)
  const articleSchema = generateArticleSchema(metadata)
  const breadcrumbSchema = generateBreadcrumbSchema(metadata)
  const speakableSchema = metadata.speakable_answer ? generateSpeakableSchema(metadata) : ''
  const comparisonTableSchema = generateComparisonTableSchema(metadata, metadata.quick_comparison_table || [])
  
  // Generate SSR styles
  const ssrStyles = generateSSRStyles()
  
  // Generate article body for SSR
  const articleBody = generateArticleBody(metadata)

  const headContent = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapedTitle}</title>
  <meta name="title" content="${escapedTitle}" />
  <meta name="description" content="${escapedDescription}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  
  <!-- Canonical & Hreflang -->
  <link rel="canonical" href="${metadata.canonical_url}" />
${hreflangTags}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${metadata.content_type === 'blog' ? 'article' : 'website'}" />
  <meta property="og:url" content="${metadata.canonical_url}" />
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDescription}" />
  <meta property="og:image" content="${metadata.featured_image_url || `${BASE_URL}/assets/logo-new.png`}" />
  <meta property="og:image:alt" content="${escapeHtml(metadata.featured_image_alt) || escapedTitle}" />
  <meta property="og:locale" content="${locale}" />
  <meta property="og:site_name" content="Del Sol Prime Homes" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${metadata.canonical_url}" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDescription}" />
  <meta name="twitter:image" content="${metadata.featured_image_url || `${BASE_URL}/assets/logo-new.png`}" />
  
  <!-- Article Meta -->
  ${metadata.date_published ? `<meta property="article:published_time" content="${metadata.date_published}" />` : ''}
  ${metadata.date_modified ? `<meta property="article:modified_time" content="${metadata.date_modified}" />` : ''}
  
  <!-- Schema.org JSON-LD -->
  ${qaSchema}
  ${blogPostingSchema}
  ${articleSchema}
  ${breadcrumbSchema}
  ${speakableSchema}
  ${comparisonTableSchema}
  
  <!-- SSR Styles -->
  ${ssrStyles}
`

  // Build complete HTML with content body (NOT empty div)
  return `<!DOCTYPE html>
<html lang="${metadata.language}">
<head>${headContent}</head>
<body>
  ${articleBody}
</body>
</html>`
}
```

### Change 6: Update returnHtml Block (Lines 1864-1900)

Simplify since generateFullHtml now handles everything:

```typescript
if (returnHtml) {
  // Generate full SSR HTML with content
  const fullHtml = generateFullHtml(metadata, hreflangTags, '')
  
  const response = new Response(fullHtml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-SEO-Source': 'edge-function-ssr',
      'X-Content-Language': metadata.language,
    }
  })
  
  setCachedPage(cacheKey, response.clone())
  return response
}
```

---

## Summary of Changes

| Location | Before | After |
|----------|--------|-------|
| `PageMetadata` interface | SEO fields only | + `detailed_content`, `answer_main`, etc. |
| `fetchBlogMetadata` | Returns metadata | + includes `detailed_content`, `read_time` |
| `fetchQAMetadata` | Returns metadata | + includes `answer_main` |
| `fetchComparisonMetadata` | Returns metadata | + includes `final_verdict` |
| `fetchLocationMetadata` | Returns metadata | + includes `location_overview` |
| New function | N/A | `generateArticleBody()` |
| New function | N/A | `generateSSRStyles()` |
| `generateFullHtml` | Empty body template | Full SSR rendering with content |
| HTML output | `<div id="root"></div>` | Complete article with header, content, CTA, footer |

---

## Verification After Deployment

1. **Direct Edge Function Test**:
   ```
   https://kazggnufaoicopvmwhdl.supabase.co/functions/v1/serve-seo-page?path=/en/blog/why-sustainable-living-discovering-the-benefits-of-eco-properties-in-costa-del-sol&html=true
   ```
   Should display full article with styling

2. **Production Test**:
   ```
   https://www.delsolprimehomes.com/en/blog/why-sustainable-living-discovering-the-benefits-of-eco-properties-in-costa-del-sol
   ```
   Should show complete rendered article

3. **View Page Source**: Should show full HTML with content in `<body>`, not just `<div id="root"></div>`

4. **JavaScript Disabled Test**: Content should be fully visible without JavaScript

---

## Benefits of This Approach

| Benefit | Description |
|---------|-------------|
| SEO | Full content visible to search engines |
| Performance | No JavaScript required for initial render |
| Accessibility | Works without JS enabled |
| Core Web Vitals | Improved LCP (content visible immediately) |
| Consistency | Same experience for all users and bots |
