import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Function re-enabled with timeout protection
const FUNCTION_DISABLED = false

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PROMPT 20 P0-4: trailing-slash normalizer for canonical + hreflang URLs.
// Sitemaps and middleware route-detection use trailing-slash URLs for every
// content-detail and hub page. Canonical and hreflang must match or AI
// engines see a self-referencing contradiction and down-weight the page.
function withTrailingSlash(url: string | null | undefined): string {
  if (!url) return url ?? ''
  const [bareAndQuery, ...fragmentParts] = url.split('#')
  const [path, ...queryParts] = bareAndQuery.split('?')
  if (path.endsWith('/')) return url
  const lastSegment = path.split('/').pop() || ''
  if (lastSegment.includes('.')) return url
  const slashed = `${path}/`
  const rebuilt = queryParts.length ? `${slashed}?${queryParts.join('?')}` : slashed
  return fragmentParts.length ? `${rebuilt}#${fragmentParts.join('#')}` : rebuilt
}

// ============================================================
// TIMEOUT & CIRCUIT BREAKER CONFIGURATION
// Prevents 504/524 errors from hanging database queries
// ============================================================
const QUERY_TIMEOUT = 12000 // 12 seconds max per database query (allow cold-start queries to complete)
const TOTAL_REQUEST_TIMEOUT = 20000 // 20 seconds max for entire request

// In-memory cache to reduce DB load (1-hour TTL, covers most of 9,600 Q&A pages)
const pageCache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Circuit breaker state
let consecutiveFailures = 0
const FAILURE_THRESHOLD = 3
const CIRCUIT_RESET_TIME = 30000 // 30 seconds
let circuitOpenUntil = 0

function getCachedPage(key: string): any | null {
  const cached = pageCache.get(key)
  if (cached && cached.expires > Date.now()) {
    console.log(`[Cache] HIT: ${key}`)
    return cached.data
  }
  if (cached) {
    pageCache.delete(key) // Clean up expired entry
  }
  return null
}

function setCachedPage(key: string, data: any): void {
  pageCache.set(key, { data, expires: Date.now() + CACHE_TTL })
  // Limit cache size to 2000 entries to cover more of the 9,600 Q&A pages
  if (pageCache.size > 2000) {
    const oldest = pageCache.keys().next().value
    if (oldest) pageCache.delete(oldest)
  }
}

function isCircuitOpen(): boolean {
  if (Date.now() < circuitOpenUntil) {
    console.log('[Circuit] OPEN - returning 503 immediately')
    return true
  }
  return false
}

function recordFailure(): void {
  consecutiveFailures++
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + CIRCUIT_RESET_TIME
    console.log(`[Circuit] OPENED for ${CIRCUIT_RESET_TIME}ms after ${consecutiveFailures} consecutive failures`)
    consecutiveFailures = 0
  }
}

function recordSuccess(): void {
  consecutiveFailures = 0
}

/**
 * Wraps a promise with a timeout - returns fallback HTML if too slow
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackResponse: Response
): Promise<T | Response> {
  const timeout = new Promise<Response>((resolve) => {
    setTimeout(() => {
      console.warn(`[SEO] Timeout after ${timeoutMs}ms - returning fallback HTML`);
      resolve(fallbackResponse);
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

/**
 * Generates minimal SEO-friendly fallback HTML when database is slow
 */
function generateFallbackHTML(url: URL): string {
  const baseUrl = url.origin;
  const pathname = url.pathname;
  
  // Extract language and content type from URL path
  const langMatch = pathname.match(/^\/([a-z]{2})\//);
  const lang = langMatch ? langMatch[1] : 'en';
  
  // Detect Q&A paths and extract slug for hreflang generation
  const qaMatch = pathname.match(/^\/([a-z]{2})\/qa\/(.+?)$/);
  const slug = qaMatch ? qaMatch[2] : null;
  const isQA = !!qaMatch;
  
  // Generate hreflang tags for all 10 supported languages (even without DB data)
  const supportedLangs = ['en', 'es'];
  const contentPath = isQA ? 'qa' : pathname.split('/').filter(Boolean)[1] || '';
  const hreflangTags = isQA && slug
    ? supportedLangs.map(l => 
        `<link rel="alternate" hreflang="${l}" href="${withTrailingSlash(`${BASE_URL}/${l}/qa/${slug}`)}">`
      ).join('\n  ') + `\n  <link rel="alternate" hreflang="x-default" href="${withTrailingSlash(`${BASE_URL}/en/qa/${slug}`)}">`
    : '';
  
  const baseTitle = isQA
    ? 'Insurance & Wealth Q&A | Everence Wealth'
    : 'Everence Wealth - Insurance & Retirement Planning';
  const baseDescription = isQA
    ? 'Expert answers about insurance, retirement planning, and wealth management. Guidance for individuals and families.'
    : 'Protect your future with life insurance, retirement income strategies, and comprehensive wealth management from Everence Wealth.';
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseTitle}</title>
  <meta name="description" content="${baseDescription}">
  <meta name="robots" content="index, follow">
  
  <!-- Canonical -->
  <link rel="canonical" href="${withTrailingSlash(`${BASE_URL}${pathname}`)}">
  
  <!-- Hreflang tags -->
  ${hreflangTags}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${withTrailingSlash(`${BASE_URL}${pathname}`)}">
  <meta property="og:title" content="${baseTitle}">
  <meta property="og:description" content="${baseDescription}">
   <meta property="og:site_name" content="Everence Wealth">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${baseTitle}">
  <meta name="twitter:description" content="${baseDescription}">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${isQA ? 'QAPage' : 'FinancialService'}",
    "name": "Everence Wealth",
    "description": "${baseDescription}",
    "url": "${BASE_URL}${pathname}"
  }
  </script>
</head>
<body>
  <header>
    <h1>${baseTitle}</h1>
  </header>
  <main>
    <p>${baseDescription}</p>
     ${isQA ? '<section><p>Expert insurance &amp; wealth management Q&amp;A. Our team provides detailed answers about life insurance, retirement planning, and financial strategies.</p></section>' : ''}
  </main>
  <footer>
    <p>&copy; Everence Wealth</p>
  </footer>
</body>
</html>`;
}

/**
 * Create a Supabase client with timeout handling
 */
function createTimeoutClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: (url, options = {}) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log(`[Timeout] Query aborted after ${QUERY_TIMEOUT}ms`)
          controller.abort()
        }, QUERY_TIMEOUT)
        
        return fetch(url, { ...options, signal: controller.signal })
          .finally(() => clearTimeout(timeoutId))
      }
    }
  })
}

// Language to locale mapping - Only 10 supported languages
const LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  es: 'es_US',
}

const SUPPORTED_LANGUAGES = ['en', 'es']
const BASE_URL = 'https://www.everencewealth.com'

/**
 * Normalize a slug by removing hidden characters, URL-encoded garbage, 
 * and accidentally appended domains from copy-paste errors.
 */
function normalizeSlug(rawSlug: string): string {
  if (!rawSlug) return ''
  
  let clean = decodeURIComponent(rawSlug)
  // Remove newlines, carriage returns, tabs, null bytes
  clean = clean.replace(/[\r\n\t\x00]/g, '')
  // Remove accidentally appended domain (common copy-paste error)
  clean = clean.replace(/everencewealth\.com.*$/i, '')
  // Trim whitespace
  clean = clean.trim()
  // Remove trailing slashes
  clean = clean.replace(/\/+$/, '')
  
  return clean
}

/**
 * Checks if content is empty/placeholder (should trigger 410 Gone)
 * Empty content patterns: null, '', '<p></p>', '<p><br></p>', whitespace-only
 * This implements the "Wrecking Ball" policy for ghost pages
 */
function isEmptyContent(content: string | null | undefined): boolean {
  if (!content) return true
  
  const stripped = content
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/&nbsp;/g, ' ')   // Replace &nbsp;
    .trim()
  
  return stripped.length === 0
}

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
  quick_comparison_table?: any[] // For comparison pages
  // SSR content fields
  detailed_content?: string      // Blog articles
  answer_main?: string           // Q&A pages
  final_verdict?: string         // Comparison pages
  location_overview?: string     // Location pages
  read_time?: number             // For blogs
  author_bio?: string            // Author info
  internal_links?: Array<{ text: string; url: string; title?: string; funnelStage?: string }>
  // Location-only fields — populated when content_type === 'locations'.
  // Used to build FinancialService schema (areaServed, name, etc.).
  city_name?: string
  region?: string         // state code, e.g. "CA"
  country?: string        // e.g. "United States"
  // Author authority fields — populated for blog content (Fix 13 Phase 2)
  author_id?: string
  author?: AuthorRecord | null
}

// Author record sourced from `authors` table for E-E-A-T Person schema.
// Reads only — never written by this function.
interface AuthorRecord {
  id: string
  name: string
  job_title: string | null
  bio: string | null
  bio_short: string | null
  bio_full_markdown: string | null
  photo_url: string | null
  linkedin_url: string | null
  credentials: string[] | null
  years_experience: number | null
}

// In-memory author cache for the lifetime of the isolate.
// Authors rarely change; matches the pattern used by `pageCache`.
const authorCache = new Map<string, { data: AuthorRecord | null; expires: number }>()
const AUTHOR_CACHE_TTL = 60 * 60 * 1000 // 1 hour

async function fetchAuthor(supabase: any, authorId: string): Promise<AuthorRecord | null> {
  if (!authorId) return null
  const cached = authorCache.get(authorId)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('id, name, job_title, bio, bio_short, bio_full_markdown, photo_url, linkedin_url, credentials, years_experience')
      .eq('id', authorId)
      .maybeSingle()
    if (error) {
      console.error(`[Author] lookup failed for ${authorId}: ${error.message}`)
      authorCache.set(authorId, { data: null, expires: Date.now() + 60 * 1000 })
      return null
    }
    if (!data) {
      console.warn(`[Author] no row found for ${authorId}`)
      authorCache.set(authorId, { data: null, expires: Date.now() + 60 * 1000 })
      return null
    }
    const record: AuthorRecord = {
      id: data.id,
      name: data.name,
      job_title: data.job_title ?? null,
      bio: data.bio ?? null,
      bio_short: data.bio_short ?? null,
      bio_full_markdown: data.bio_full_markdown ?? null,
      photo_url: data.photo_url ?? null,
      linkedin_url: data.linkedin_url ?? null,
      credentials: Array.isArray(data.credentials) ? data.credentials : null,
      years_experience: typeof data.years_experience === 'number' ? data.years_experience : null,
    }
    authorCache.set(authorId, { data: record, expires: Date.now() + AUTHOR_CACHE_TTL })
    return record
  } catch (e) {
    console.error(`[Author] lookup exception for ${authorId}: ${(e as Error).message}`)
    return null
  }
}

// Result type for metadata with potential redirect (language mismatch handling)
interface MetadataResult {
  metadata: PageMetadata | null
  redirect?: { to: string; reason: string }
}

interface HreflangSibling {
  language: string
  slug: string
  canonical_url: string
}

/**
 * Helper to extract slug string from translations JSONB
 * The translations column can contain either:
 * - Simple strings: { "en": "slug-here" }
 * - Objects: { "en": { "id": "uuid", "slug": "slug-here" } }
 */
function getSlugFromTranslation(value: any): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'slug' in value) return value.slug
  return null
}

async function fetchQAMetadata(supabase: any, slug: string, lang: string): Promise<MetadataResult> {
  // First try: exact match (slug + language)
  const { data: exactMatch, error: exactError } = await supabase
    .from('qa_pages')
    .select('language, slug, question_main, answer_main, speakable_answer, meta_title, meta_description, canonical_url, featured_image_url, featured_image_alt, date_published, date_modified, hreflang_group_id, related_qas, translations, title, internal_links')
    .eq('slug', slug)
    .eq('language', lang)
    .eq('status', 'published')
    .maybeSingle()

  if (exactMatch) {
    return {
      metadata: {
        language: exactMatch.language || lang,
        meta_title: exactMatch.meta_title || exactMatch.title || '',
        meta_description: exactMatch.meta_description || '',
        canonical_url: withTrailingSlash(exactMatch.canonical_url || `${BASE_URL}/${exactMatch.language}/qa/${slug}`),
        headline: exactMatch.question_main || exactMatch.title || '',
        speakable_answer: exactMatch.answer_main || exactMatch.speakable_answer || '',
        featured_image_url: exactMatch.featured_image_url,
        featured_image_alt: exactMatch.featured_image_alt,
        date_published: exactMatch.date_published,
        date_modified: exactMatch.date_modified,
        hreflang_group_id: exactMatch.hreflang_group_id,
        qa_entities: exactMatch.related_qas,
        content_type: 'qa',
        answer_main: exactMatch.answer_main,
        internal_links: exactMatch.internal_links,
      }
    }
  }

  // Second try: find by slug alone (language mismatch case)
  const { data: anyLangMatch, error: anyError } = await supabase
    .from('qa_pages')
    .select('language, translations, slug')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (anyLangMatch) {
    // Check if translation exists for requested language
    const correctSlug = getSlugFromTranslation(anyLangMatch.translations?.[lang])
    if (correctSlug) {
      console.log(`[QA] Language mismatch: redirecting /${lang}/qa/${slug} → /${lang}/qa/${correctSlug}`)
      return {
        metadata: null,
        redirect: {
          to: `/${lang}/qa/${correctSlug}`,
          reason: `language_mismatch:${anyLangMatch.language}->${lang}`
        }
      }
    }
  }

  console.error('Error fetching QA page:', exactError || anyError)
  return { metadata: null }
}

async function fetchBlogMetadata(supabase: any, slug: string, lang: string): Promise<MetadataResult> {
  // First try: exact match (slug + language)
  const { data: exactMatch, error: exactError } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('slug', slug)
    .eq('language', lang)
    .eq('status', 'published')
    .maybeSingle()

  if (exactMatch) {
    const author = exactMatch.author_id
      ? await fetchAuthor(supabase, exactMatch.author_id)
      : null
    return {
      metadata: {
        language: exactMatch.language || lang,
        meta_title: exactMatch.meta_title,
        meta_description: exactMatch.meta_description,
        canonical_url: withTrailingSlash(exactMatch.canonical_url || `${BASE_URL}/${exactMatch.language}/blog/${slug}`),
        headline: exactMatch.headline,
        speakable_answer: exactMatch.speakable_answer,
        featured_image_url: exactMatch.featured_image_url,
        featured_image_alt: exactMatch.featured_image_alt,
        date_published: exactMatch.date_published,
        date_modified: exactMatch.date_modified,
        hreflang_group_id: exactMatch.hreflang_group_id,
        qa_entities: exactMatch.qa_entities,
        content_type: 'blog',
        detailed_content: exactMatch.detailed_content,
        read_time: exactMatch.read_time,
        author_bio: exactMatch.author_bio_localized,
        internal_links: exactMatch.internal_links,
        author_id: exactMatch.author_id,
        author,
      }
    }
  }

  // Second try: find by slug alone (language mismatch case)
  const { data: anyLangMatch, error: anyError } = await supabase
    .from('blog_articles')
    .select('language, translations, slug')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (anyLangMatch) {
    // Check if translation exists for requested language
    const correctSlug = getSlugFromTranslation(anyLangMatch.translations?.[lang])
    if (correctSlug) {
      console.log(`[Blog] Language mismatch: redirecting /${lang}/blog/${slug} → /${lang}/blog/${correctSlug}`)
      return {
        metadata: null,
        redirect: {
          to: `/${lang}/blog/${correctSlug}`,
          reason: `language_mismatch:${anyLangMatch.language}->${lang}`
        }
      }
    }
  }

  console.error('Error fetching blog article:', exactError || anyError)
  return { metadata: null }
}

async function fetchComparisonMetadata(supabase: any, slug: string, lang: string): Promise<MetadataResult> {
  // First try: exact match (slug + language)
  const { data: exactMatch, error: exactError } = await supabase
    .from('comparison_pages')
    .select('*')
    .eq('slug', slug)
    .eq('language', lang)
    .eq('status', 'published')
    .maybeSingle()

  if (exactMatch) {
    return {
      metadata: {
        language: exactMatch.language || lang,
        meta_title: exactMatch.meta_title,
        meta_description: exactMatch.meta_description,
        canonical_url: withTrailingSlash(exactMatch.canonical_url || `${BASE_URL}/${exactMatch.language}/compare/${slug}`),
        headline: exactMatch.headline,
        speakable_answer: exactMatch.speakable_answer,
        featured_image_url: exactMatch.featured_image_url,
        featured_image_alt: exactMatch.featured_image_alt,
        date_published: exactMatch.date_published,
        date_modified: exactMatch.date_modified,
        hreflang_group_id: exactMatch.hreflang_group_id,
        qa_entities: exactMatch.qa_entities,
        content_type: 'compare',
        quick_comparison_table: exactMatch.quick_comparison_table,
        final_verdict: exactMatch.final_verdict,
      }
    }
  }

  // Second try: find by slug alone (language mismatch case)
  const { data: anyLangMatch, error: anyError } = await supabase
    .from('comparison_pages')
    .select('language, translations, slug')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (anyLangMatch) {
    // Check if translation exists for requested language
    const correctSlug = getSlugFromTranslation(anyLangMatch.translations?.[lang])
    if (correctSlug) {
      console.log(`[Compare] Language mismatch: redirecting /${lang}/compare/${slug} → /${lang}/compare/${correctSlug}`)
      return {
        metadata: null,
        redirect: {
          to: `/${lang}/compare/${correctSlug}`,
          reason: `language_mismatch:${anyLangMatch.language}->${lang}`
        }
      }
    }
  }

  console.error('Error fetching comparison page:', exactError || anyError)
  return { metadata: null }
}

// Note: LocationResult is now replaced by MetadataResult for consistency
// The fetchLocationMetadata function already returns MetadataResult-compatible structure

async function fetchLocationMetadata(supabase: any, slug: string, lang: string): Promise<MetadataResult> {
  // Location pages have compound slugs: city_slug/topic_slug
  // The slug parameter will be "city-slug/topic-slug" or just the topic_slug if parsed separately
  const slugParts = slug.split('/')
  
  let data, error
  let citySlug = ''
  let topicSlug = ''
  
  if (slugParts.length >= 2) {
    // Full path: city_slug/topic_slug
    [citySlug, topicSlug] = slugParts
    console.log(`[Location] Querying by city_slug="${citySlug}" AND topic_slug="${topicSlug}" AND language="${lang}"`)
    
    // CRITICAL: Include language filter to prevent cross-language slug resolution
    const result = await supabase
      .from('location_pages')
      .select('*')
      .eq('city_slug', citySlug)
      .eq('topic_slug', topicSlug)
      .eq('language', lang)  // ← LANGUAGE FILTER
      .eq('status', 'published')
      .maybeSingle()
    
    data = result.data
    error = result.error
    
    // If not found with language match, check if it exists in another language (for redirect)
    if (!data && !error) {
      console.log(`[Location] Not found in ${lang}, checking other languages for redirect...`)
      const anyLangResult = await supabase
        .from('location_pages')
        .select('language, canonical_url, city_slug, topic_slug')
        .eq('city_slug', citySlug)
        .eq('topic_slug', topicSlug)
        .eq('status', 'published')
        .maybeSingle()
      
      if (anyLangResult.data) {
        const foundPage = anyLangResult.data
        console.log(`[Location] Found in ${foundPage.language}, should redirect to: ${foundPage.canonical_url}`)
        return {
          metadata: null,
          redirect: {
            to: foundPage.canonical_url || `${BASE_URL}/${foundPage.language}/locations/${foundPage.city_slug}/${foundPage.topic_slug}`,
            reason: `language_mismatch:${lang}->${foundPage.language}`
          }
        }
      }
    }
  } else {
    // Single slug - try topic_slug first, then city_slug (with language filter)
    console.log(`[Location] Querying by topic_slug="${slug}" AND language="${lang}"`)
    
    let result = await supabase
      .from('location_pages')
      .select('*')
      .eq('topic_slug', slug)
      .eq('language', lang)  // ← LANGUAGE FILTER
      .eq('status', 'published')
      .maybeSingle()
    
    if (!result.data) {
      console.log(`[Location] topic_slug not found in ${lang}, trying city_slug="${slug}"`)
      result = await supabase
        .from('location_pages')
        .select('*')
        .eq('city_slug', slug)
        .eq('language', lang)  // ← LANGUAGE FILTER
        .eq('status', 'published')
        .limit(1)
        .maybeSingle()
    }
    
    data = result.data
    error = result.error
  }

  if (error || !data) {
    console.error('Error fetching location page:', error)
    return { metadata: null }
  }

  const fullSlug = `${data.city_slug}/${data.topic_slug}`
  return {
    metadata: {
      language: data.language || lang,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      canonical_url: withTrailingSlash(data.canonical_url || `${BASE_URL}/${data.language}/locations/${fullSlug}`),
      headline: data.headline,
      speakable_answer: data.speakable_answer,
      featured_image_url: data.featured_image_url,
      featured_image_alt: data.featured_image_alt,
      date_published: data.date_published,
      date_modified: data.date_modified,
      hreflang_group_id: data.hreflang_group_id,
      qa_entities: data.qa_entities,
      content_type: 'locations',
      // SSR content
      location_overview: data.location_overview,
      // FinancialService schema fields
      city_name: data.city_name,
      region: data.region,
      country: data.country,
    }
  }
}

async function fetchHreflangSiblings(supabase: any, hreflangGroupId: string, contentType: string): Promise<HreflangSibling[]> {
  if (!hreflangGroupId) return []

  const tableMap: Record<string, string> = {
    qa: 'qa_pages',
    blog: 'blog_articles',
    compare: 'comparison_pages',
    locations: 'location_pages',
  }

  const tableName = tableMap[contentType]
  if (!tableName) return []

  // Location pages have city_slug + topic_slug instead of slug
  if (contentType === 'locations') {
    const { data, error } = await supabase
      .from(tableName)
      .select('language, city_slug, topic_slug, canonical_url')
      .eq('hreflang_group_id', hreflangGroupId)
      .eq('status', 'published')

    if (error || !data) {
      console.error('Error fetching location hreflang siblings:', error)
      return []
    }

    // Convert to HreflangSibling format with compound slug
    return data.map((item: any) => ({
      language: item.language,
      slug: `${item.city_slug}/${item.topic_slug}`,
      canonical_url: item.canonical_url,
    })) as HreflangSibling[]
  }

  // Standard content types with slug column
  const { data, error } = await supabase
    .from(tableName)
    .select('language, slug, canonical_url')
    .eq('hreflang_group_id', hreflangGroupId)
    .eq('status', 'published')
    .limit(15)

  if (error || !data) {
    console.error('Error fetching hreflang siblings:', error)
    return []
  }

  return data as HreflangSibling[]
}

function generateHreflangTags(siblings: HreflangSibling[], currentLang: string, contentType: string): string {
  const pathPrefix = contentType === 'blog' ? 'blog' : contentType === 'qa' ? 'qa' : contentType === 'compare' ? 'compare' : 'locations'
  
  // Create a map of available languages from siblings
  const availableLanguages = new Map<string, HreflangSibling>()
  siblings.forEach(sibling => {
    availableLanguages.set(sibling.language, sibling)
  })

  // FIXED: Only generate hreflang tags for languages that ACTUALLY EXIST
  // DO NOT create placeholder URLs for missing translations - this causes 
  // "Duplicate without user-selected canonical" errors in Google Search Console
  const tags: string[] = []
  
  for (const sibling of siblings) {
    // Only include published siblings with valid slugs
    if (sibling.language && sibling.slug) {
      const url = withTrailingSlash(sibling.canonical_url || `${BASE_URL}/${sibling.language}/${pathPrefix}/${sibling.slug}`)
      tags.push(`  <link rel="alternate" hreflang="${sibling.language}" href="${url}" />`)
    }
  }

  // Add x-default (points to English if it exists, otherwise current language)
  const englishVersion = availableLanguages.get('en')
  const xDefaultVersion = englishVersion || availableLanguages.get(currentLang) || siblings[0]
  const xDefaultLang = englishVersion ? 'en' : (xDefaultVersion?.language || currentLang)
  const xDefaultUrl = withTrailingSlash(xDefaultVersion 
    ? (xDefaultVersion.canonical_url || `${BASE_URL}/${xDefaultLang}/${pathPrefix}/${xDefaultVersion.slug}`)
    : `${BASE_URL}/${currentLang}/${pathPrefix}/${siblings[0]?.slug || ''}`)
  tags.push(`  <link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`)

  return tags.join('\n')
}

// ============================================================
// HUB / INDEX PAGE RENDERERS (Fix 9, 2026-04-24)
//
// Renders fully-formed SEO HTML for the four hub pages:
//   /en|es/blog
//   /en|es/qa
//   /en|es/locations  (also /es/ubicaciones)
//   /en|es/compare    (also /es/comparar, /es/comparisons)
//
// Each hub emits:
//   - <title> + <meta name="description"> + canonical + hreflang + og:*
//   - JSON-LD: Organization + CollectionPage + ItemList + FAQPage +
//     BreadcrumbList + SpeakableSpecification
//   - Visible H1, 80-120 word speakable intro, child link list
//     (grouped for /locations + /compare, flat for /blog + /qa),
//     5-question FAQ accordion, closing CTA paragraph
//   - <nav class="internal-links-section"> with the same child links
//
// Source data is cached in the hub_cache table (10-min TTL, invalidated
// on publish via DB triggers). Cache miss falls back to a live query.
// ============================================================

type HubType = 'blog' | 'qa' | 'locations' | 'compare'

interface HubChildLink {
  url: string
  title: string
  description: string
  group?: string
  groupSubtitle?: string
}

interface HubPayload {
  links: HubChildLink[]
  totalPublished: number
}

interface HubMeta {
  title: string
  description: string
  h1: string
  intro: string
  faqs: { q: string; a: string }[]
  ctaText: string
  ctaHref: string
  breadcrumbName: string
}

const HUB_PATH_FOR_TYPE: Record<HubType, string> = {
  blog: 'blog',
  qa: 'qa',
  locations: 'locations',
  compare: 'compare',
}

function getHubMeta(hubType: HubType, lang: string, totalPublished: number): HubMeta {
  const isEs = lang === 'es'
  const fmtCount = totalPublished > 0 ? totalPublished : ''

  switch (hubType) {
    case 'blog':
      return isEs ? {
        title: 'Artículos de Gestión Patrimonial | Everence Wealth',
        description: 'Guías expertas sobre planificación de jubilación, estrategias fiscales, seguros indexados y protección patrimonial. Publicado y revisado por asesores autorizados.',
        h1: 'Artículos de Gestión Patrimonial',
        intro: `Everence Wealth publica análisis editoriales sobre planificación de jubilación, estrategias indexadas, eficiencia fiscal y protección de activos. Cada artículo es escrito o revisado por un profesional autorizado y se actualiza cuando cambia la ley fiscal o las prácticas del sector. Actualmente disponibles ${fmtCount} artículos en español, ordenados por fecha de actualización para que primero veas el contenido más reciente. <a href="/es/blog/comprender-la-brecha-de-jubilacion-por-que-es-mas-importante-que-nunca-1-992v">Comienza con nuestro artículo principal sobre la brecha de jubilación</a>.`,
        faqs: [
          { q: '¿Con qué frecuencia publica nuevos artículos Everence Wealth?', a: 'Publicamos contenido nuevo varias veces al mes, priorizando temas que reflejan cambios recientes en la legislación fiscal estadounidense y en los productos del IRS Code 7702. Los artículos existentes se revisan trimestralmente.' },
          { q: '¿Quién escribe los artículos?', a: 'Cada artículo es producido o revisado por un asesor autorizado del equipo Everence Wealth, encabezado por Steven Rosenberg. Los autores y revisores aparecen claramente identificados al final de cada artículo, junto con sus credenciales.' },
          { q: '¿Qué temas cubre Everence Wealth?', a: 'Cubrimos planificación de jubilación libre de impuestos, seguros indexados (IUL), seguros de vida entera, protección de activos, planificación patrimonial, estrategias contra los "Tres Asesinos Silenciosos" (comisiones, volatilidad, impuestos) y educación financiera para familias en su etapa de acumulación y distribución.' },
          { q: '¿Cómo encuentro un artículo relevante para mi situación?', a: 'Usa la lista cronológica a continuación o navega por categorías. Si necesitas orientación personalizada, agenda una consulta gratuita y te conectaremos con un asesor que revisará tu caso específico antes de la llamada.' },
          { q: '¿Reflejan los artículos la ley fiscal vigente?', a: 'Sí. Cada artículo lleva una fecha de "última actualización" visible y se revisa cuando hay cambios significativos en el IRS Code, leyes estatales aplicables o regulaciones de aseguradoras. Si encuentras información desactualizada, contáctanos.' },
        ],
        ctaText: '¿Listo para una conversación personalizada? Reserva una consulta gratuita de 30 minutos con un asesor de Everence Wealth y revisaremos tu situación específica antes de recomendar cualquier estrategia.',
        ctaHref: '/es/contact',
        breadcrumbName: 'Artículos',
      } : {
        title: 'Wealth Management Articles | Everence Wealth',
        description: 'Expert guides on retirement planning, tax strategies, indexed universal life insurance, and asset protection. Authored and reviewed by licensed advisors.',
        h1: 'Wealth Management Articles',
        intro: `Everence Wealth publishes editorial analysis on retirement planning, indexed strategies, tax efficiency, and asset protection. Every article is written or reviewed by a licensed professional and updated whenever tax law or industry practices change. ${fmtCount} articles are currently available in English, ordered by most-recently-updated so the freshest analysis appears first. <a href="/en/blog/understanding-the-retirement-gap-why-it-matters-now-more-than-ever">Start with our flagship article on the retirement gap</a>.`,
        faqs: [
          { q: 'How often does Everence Wealth publish new articles?', a: 'We publish new content several times per month, prioritizing topics that reflect recent changes in U.S. tax law and IRS Code 7702 products. Existing articles are reviewed quarterly and updated whenever the underlying regulations change.' },
          { q: 'Who writes the articles on Everence Wealth?', a: 'Every article is produced or reviewed by a licensed advisor on the Everence Wealth team, led by Steven Rosenberg. Authors and reviewers are clearly identified at the end of each article along with their credentials and years of experience.' },
          { q: 'What wealth topics does Everence Wealth cover?', a: 'We cover tax-free retirement planning, indexed universal life insurance (IUL), whole life insurance, asset protection, estate planning, the "Three Silent Killers" framework (fees, volatility, taxes), and financial education for families in both the accumulation and distribution stages.' },
          { q: 'How do I find articles relevant to my specific situation?', a: 'Use the reverse-chronological list below or browse by category from any article page. If you need personalized guidance, schedule a free consultation and we will connect you with an advisor who reviews your specific situation before the call.' },
          { q: 'Do articles reflect current tax law?', a: 'Yes. Each article carries a visible "last updated" date and is reviewed whenever there are material changes to the IRS Code, applicable state law, or carrier regulation. If you spot outdated information, please reach out and we will refresh it.' },
        ],
        ctaText: 'Ready for a personalized conversation? Book a free 30-minute consultation with an Everence Wealth advisor and we will review your specific situation before recommending any strategy.',
        ctaHref: '/en/contact',
        breadcrumbName: 'Articles',
      }

    case 'qa':
      return isEs ? {
        title: 'Preguntas Frecuentes sobre Patrimonio | Everence Wealth',
        description: 'Respuestas claras y directas a preguntas comunes sobre jubilación, impuestos, seguros indexados y planificación patrimonial. Curadas por asesores autorizados.',
        h1: 'Preguntas Frecuentes sobre Gestión Patrimonial',
        intro: `Esta es la biblioteca de preguntas y respuestas de Everence Wealth: respuestas concisas y citables a las preguntas que las familias estadounidenses hacen con más frecuencia sobre jubilación libre de impuestos, seguros indexados, protección de activos y planificación financiera. Cada respuesta es revisada por un asesor autorizado y enlaza con el artículo completo cuando se necesita más profundidad. ${fmtCount} preguntas en español están disponibles a continuación, ordenadas por última actualización. <a href="/es/qa">Explora la biblioteca completa</a>.`,
        faqs: [
          { q: '¿De dónde vienen las preguntas en esta biblioteca?', a: 'Las preguntas provienen de tres fuentes: consultas reales de clientes recibidas por nuestros asesores, búsquedas frecuentes en motores de búsqueda y motores de IA conversacional, y consultas que llegan a nuestro formulario de contacto. Priorizamos preguntas con alto volumen de búsqueda y baja calidad de respuesta en otros sitios.' },
          { q: '¿Quién revisa las respuestas?', a: 'Cada respuesta es revisada por un asesor autorizado de Everence Wealth antes de publicarse, y revalidada cuando cambia la ley fiscal o la regulación de aseguradoras. Las respuestas que afectan decisiones financieras llevan una fecha de revisión visible.' },
          { q: '¿Puedo confiar en las respuestas para tomar decisiones financieras?', a: 'Las respuestas son educativas y no constituyen asesoramiento financiero personalizado. Para decisiones específicas (compra de pólizas, asignación de activos, planificación de jubilación) recomendamos agendar una consulta donde un asesor revise tu situación particular.' },
          { q: '¿Qué hacer si mi pregunta no aparece aquí?', a: 'Envía tu pregunta por el formulario de contacto. Las preguntas frecuentes se incorporan a la biblioteca en español e inglés dentro de 7-14 días. Las preguntas urgentes reciben respuesta directa por correo o llamada.' },
          { q: '¿Las respuestas reflejan la ley fiscal estadounidense actual?', a: 'Sí. Toda la biblioteca está alineada con el IRS Code, regulaciones estatales aplicables y prácticas vigentes del sector asegurador. Cuando cambia una regla material, actualizamos las respuestas afectadas.' },
        ],
        ctaText: '¿Tienes una pregunta sobre tu situación específica? Reserva una consulta gratuita de 30 minutos y un asesor responderá directamente, con análisis personalizado de tu caso.',
        ctaHref: '/es/contact',
        breadcrumbName: 'Preguntas y Respuestas',
      } : {
        title: 'Frequently Asked Wealth Questions | Everence Wealth',
        description: 'Clear, direct answers to common questions about retirement, taxes, indexed life insurance, and wealth planning. Curated by licensed advisors.',
        h1: 'Frequently Asked Wealth Management Questions',
        intro: `This is the Everence Wealth question library: concise, citable answers to the questions American families most frequently ask about tax-free retirement, indexed life insurance, asset protection, and financial planning. Each answer is reviewed by a licensed advisor and links to the full article when more depth is needed. ${fmtCount} English questions are available below, ordered by most-recently-updated. <a href="/en/qa">Browse the full library</a>.`,
        faqs: [
          { q: 'Where do the questions in this library come from?', a: 'Questions come from three sources: actual client conversations received by our advisors, high-volume queries in search engines and conversational AI, and questions submitted through our contact form. We prioritize questions with high search volume and low answer quality on other sites.' },
          { q: 'Who reviews the answers?', a: 'Every answer is reviewed by a licensed Everence Wealth advisor before publication and revalidated whenever tax law or carrier regulation changes. Answers that affect financial decisions carry a visible review date.' },
          { q: 'Can I rely on these answers to make financial decisions?', a: 'Answers are educational and do not constitute personalized financial advice. For specific decisions (purchasing policies, asset allocation, retirement income planning) we recommend scheduling a consultation where an advisor reviews your particular situation in detail.' },
          { q: 'What if my question is not listed?', a: 'Submit your question through the contact form. Recurring questions are added to the library in both English and Spanish within 7-14 days. Time-sensitive questions receive a direct email or call response from an advisor.' },
          { q: 'Do answers reflect current U.S. tax law?', a: 'Yes. The entire library is kept aligned with the IRS Code, applicable state regulations, and current insurance industry practice. When a material rule changes, we update the affected answers and bump the visible review date.' },
        ],
        ctaText: 'Have a question about your specific situation? Book a free 30-minute consultation and an advisor will respond directly with personalized analysis of your case.',
        ctaHref: '/en/contact',
        breadcrumbName: 'Q&A',
      }

    case 'locations':
      return isEs ? {
        title: 'Servicios por Ubicación | Everence Wealth',
        description: 'Estrategias de gestión patrimonial y planificación de jubilación adaptadas a tu estado y ciudad. Cobertura nacional con foco en regulaciones fiscales locales.',
        h1: 'Servicios de Gestión Patrimonial por Ubicación',
        intro: `Everence Wealth atiende familias en todo Estados Unidos, con páginas dedicadas que explican cómo las regulaciones fiscales estatales y municipales afectan las estrategias de jubilación libre de impuestos, seguros indexados y protección de activos. Selecciona tu ciudad o estado a continuación para ver guías localizadas, regulaciones aplicables y aseguradoras autorizadas en tu jurisdicción. ${fmtCount} páginas de ubicación en español están disponibles. <a href="/es/contact">Habla con un asesor sobre tu estado específico</a>.`,
        faqs: [
          { q: '¿Por qué importa la ubicación en planificación patrimonial?', a: 'La regulación fiscal estatal, las leyes de protección de activos (homestead, ERISA, exenciones de seguros) y las aseguradoras autorizadas varían dramáticamente entre estados. California, Texas, Florida y Nueva York tienen marcos completamente diferentes que afectan cuánto retienes después de impuestos.' },
          { q: '¿Atiende Everence Wealth a clientes fuera de su estado de residencia?', a: 'Sí. Nuestros asesores tienen licencias en múltiples estados y trabajamos con familias en todo Estados Unidos. Las consultas iniciales son virtuales; las reuniones presenciales se coordinan según ubicación.' },
          { q: '¿Qué información incluye cada página de ubicación?', a: 'Cada página describe el marco fiscal estatal, las protecciones de activos disponibles, las aseguradoras autorizadas, ejemplos de casos relevantes para residentes de esa zona, y las consideraciones específicas para residentes de alto patrimonio en esa jurisdicción.' },
          { q: '¿Cómo selecciono la página correcta para mi situación?', a: 'Empieza por tu estado de residencia fiscal. Si tienes propiedades o negocios en múltiples estados, agenda una consulta para que un asesor diseñe una estrategia multijurisdiccional adecuada.' },
          { q: '¿Las páginas reflejan las regulaciones estatales actuales?', a: 'Sí. Las páginas se revisan cuando hay cambios materiales en la legislación estatal o federal aplicable. Cada página lleva fecha de actualización visible.' },
        ],
        ctaText: '¿No encuentras tu ciudad? Atendemos familias en los 50 estados. Reserva una consulta gratuita y un asesor con licencia en tu estado revisará tu situación.',
        ctaHref: '/es/contact',
        breadcrumbName: 'Ubicaciones',
      } : {
        title: 'Wealth Management by Location | Everence Wealth',
        description: 'Wealth management and retirement planning strategies tailored to your state and city. Nationwide coverage with focus on local tax regulations.',
        h1: 'Wealth Management Services by Location',
        intro: `Everence Wealth serves families across the United States with dedicated pages explaining how state and municipal tax regulations affect tax-free retirement, indexed life insurance, and asset protection strategies. Select your city or state below to see localized guides, applicable regulations, and licensed carriers in your jurisdiction. ${fmtCount} location pages are currently published in English. <a href="/en/contact">Speak with an advisor about your specific state</a>.`,
        faqs: [
          { q: 'Why does location matter in wealth planning?', a: 'State tax regulation, asset protection law (homestead, ERISA, insurance exemptions), and licensed carriers vary dramatically between states. California, Texas, Florida, and New York have fundamentally different frameworks that affect after-tax outcomes by tens of thousands of dollars over a lifetime.' },
          { q: 'Does Everence Wealth serve clients outside its home state?', a: 'Yes. Our advisors hold licenses in multiple states and we work with families nationwide. Initial consultations are virtual; in-person meetings are coordinated based on location and advisor availability.' },
          { q: 'What information is on each location page?', a: 'Each page covers the state tax framework, available asset protection, licensed carriers, case examples relevant to residents of that area, and specific considerations for high-net-worth residents in that jurisdiction.' },
          { q: 'How do I pick the right page for my situation?', a: 'Start with your state of tax residence. If you own property or businesses across multiple states, schedule a consultation so an advisor can design an appropriate multi-jurisdictional strategy.' },
          { q: 'Are pages kept current with state regulations?', a: 'Yes. Pages are reviewed whenever there are material changes to applicable state or federal legislation. Each page carries a visible last-updated date.' },
        ],
        ctaText: 'Cannot find your city? We serve families in all 50 states. Book a free consultation and an advisor licensed in your state will review your situation.',
        ctaHref: '/en/contact',
        breadcrumbName: 'Locations',
      }

    case 'compare':
      return isEs ? {
        title: 'Comparaciones de Productos Financieros | Everence Wealth',
        description: 'Comparaciones lado a lado de IUL vs Whole Life, planes 401(k) vs IRA, seguros vs inversiones, y otras decisiones clave de planificación patrimonial.',
        h1: 'Comparaciones de Productos y Estrategias Financieras',
        intro: `La biblioteca de comparaciones de Everence Wealth ayuda a las familias a tomar decisiones informadas entre productos financieros que parecen similares pero tienen consecuencias fiscales y de protección muy diferentes. Cada comparación incluye un veredicto claro, escenarios de caso de uso, y la recomendación basada en perfil de cliente. ${fmtCount} comparaciones en español están disponibles. <a href="/es/contact">Si necesitas ayuda eligiendo, agenda una consulta</a>.`,
        faqs: [
          { q: '¿Cómo se eligen las comparaciones?', a: 'Comparamos productos y estrategias que las familias confunden con frecuencia: IUL vs Whole Life, anualidades indexadas vs anualidades fijas, 401(k) vs Roth IRA, seguros de vida como protección vs como inversión. Priorizamos pares que reciben búsquedas frecuentes y respuestas confusas en otros sitios.' },
          { q: '¿Las comparaciones favorecen ciertos productos?', a: 'Las comparaciones son objetivas y se basan en datos del IRS, regulaciones estatales y rendimientos históricos. Cuando un producto es claramente superior para un perfil específico, lo decimos; cuando depende del caso, explicamos cuándo cada opción gana.' },
          { q: '¿Quién valida las comparaciones?', a: 'Cada comparación es revisada por un asesor autorizado del equipo Everence Wealth y enlaza con las fuentes regulatorias originales. Las comparaciones llevan fecha de actualización visible.' },
          { q: '¿Puedo usar las comparaciones para decidir qué comprar?', a: 'Las comparaciones son educativas y muestran cuándo cada opción es apropiada. Para una recomendación personalizada que considere tu situación fiscal, perfil de riesgo y objetivos, agenda una consulta gratuita con un asesor.' },
          { q: '¿Qué pasa si necesito comparar productos que no aparecen aquí?', a: 'Solicita la comparación por el formulario de contacto. Las comparaciones de alta demanda se publican en 7-14 días en ambos idiomas. Para casos urgentes, un asesor responde directamente con un análisis personalizado.' },
        ],
        ctaText: '¿No estás seguro cuál opción es mejor para ti? Reserva una consulta gratuita de 30 minutos con un asesor que revisará tu situación antes de recomendar.',
        ctaHref: '/es/contact',
        breadcrumbName: 'Comparaciones',
      } : {
        title: 'Financial Product Comparisons | Everence Wealth',
        description: 'Side-by-side comparisons of IUL vs Whole Life, 401(k) vs IRA, insurance vs investments, and other key wealth planning decisions.',
        h1: 'Financial Product and Strategy Comparisons',
        intro: `The Everence Wealth comparison library helps families make informed choices between financial products that look similar but carry very different tax and protection consequences. Each comparison includes a clear verdict, use-case scenarios, and a recommendation by client profile. ${fmtCount} comparisons are currently published in English. <a href="/en/contact">If you need help choosing, schedule a consultation</a>.`,
        faqs: [
          { q: 'How are comparisons chosen?', a: 'We compare products and strategies that families frequently conflate: IUL vs Whole Life, indexed annuities vs fixed annuities, 401(k) vs Roth IRA, life insurance as protection vs as investment. We prioritize pairs that receive heavy search volume with confusing answers elsewhere.' },
          { q: 'Do comparisons favor certain products?', a: 'Comparisons are objective and based on IRS data, state regulations, and historical performance. When a product is clearly superior for a specific profile, we say so; when it depends on the case, we explain exactly when each option wins.' },
          { q: 'Who validates the comparisons?', a: 'Each comparison is reviewed by a licensed advisor on the Everence Wealth team and links to original regulatory sources. Comparisons carry a visible last-updated date.' },
          { q: 'Can I use comparisons to decide what to buy?', a: 'Comparisons are educational and show when each option is appropriate. For a personalized recommendation that considers your tax situation, risk profile, and goals, schedule a free consultation with an advisor.' },
          { q: 'What if I need to compare products not listed?', a: 'Request the comparison through the contact form. High-demand comparisons are published in 7-14 days in both languages. For urgent cases, an advisor responds directly with personalized analysis.' },
        ],
        ctaText: 'Not sure which option is right for you? Book a free 30-minute consultation with an advisor who will review your situation before recommending.',
        ctaHref: '/en/contact',
        breadcrumbName: 'Comparisons',
      }
  }
}

/**
 * Fetch the child link list for a hub from the source detail tables.
 * Each branch knows its own table + columns + grouping rules.
 */
async function fetchHubChildren(
  supabase: ReturnType<typeof createTimeoutClient>,
  hubType: HubType,
  lang: string,
): Promise<HubPayload> {
  switch (hubType) {
    case 'blog': {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('slug, headline, meta_description, date_modified')
        .eq('language', lang)
        .eq('status', 'published')
        .order('date_modified', { ascending: false })
        .limit(40)
      if (error) throw error
      const links: HubChildLink[] = (data || []).map((row: any) => ({
        url: `/${lang}/blog/${row.slug}`,
        title: row.headline,
        description: row.meta_description || '',
      }))
      return { links, totalPublished: links.length }
    }

    case 'qa': {
      const { data, error } = await supabase
        .from('qa_pages')
        .select('slug, question_main, speakable_answer, date_modified')
        .eq('language', lang)
        .eq('status', 'published')
        .order('date_modified', { ascending: false })
        .limit(40)
      if (error) throw error
      const links: HubChildLink[] = (data || []).map((row: any) => ({
        url: `/${lang}/qa/${row.slug}`,
        title: row.question_main,
        description: row.speakable_answer || '',
      }))
      return { links, totalPublished: links.length }
    }

    case 'locations': {
      const { data, error } = await supabase
        .from('location_pages')
        .select('city_slug, topic_slug, city_name, state_code, region, headline, meta_description')
        .eq('language', lang)
        .eq('status', 'published')
        .order('state_code', { ascending: true, nullsFirst: false })
        .order('city_name', { ascending: true })
        .limit(80)
      if (error) throw error
      const links: HubChildLink[] = (data || []).map((row: any) => {
        const stateLabel = row.state_code || row.region || 'United States'
        return {
          url: `/${lang}/locations/${row.city_slug}/${row.topic_slug}`,
          title: row.headline || `${row.city_name}, ${stateLabel}`,
          description: row.meta_description || '',
          group: stateLabel,
          groupSubtitle: row.city_name,
        }
      })
      return { links, totalPublished: links.length }
    }

    case 'compare': {
      const { data, error } = await supabase
        .from('comparison_pages')
        .select('slug, comparison_topic, headline, meta_description, option_a, option_b, date_modified')
        .eq('language', lang)
        .eq('status', 'published')
        .order('comparison_topic', { ascending: true, nullsFirst: false })
        .order('date_modified', { ascending: false })
        .limit(40)
      if (error) throw error
      const links: HubChildLink[] = (data || []).map((row: any) => ({
        url: `/${lang}/compare/${row.slug}`,
        title: row.headline || `${row.option_a} vs ${row.option_b}`,
        description: row.meta_description || '',
        group: row.comparison_topic || (lang === 'es' ? 'Comparaciones generales' : 'General comparisons'),
      }))
      return { links, totalPublished: links.length }
    }
  }
}

/**
 * Get hub payload from cache, falling back to a live query and writing back.
 */
async function getHubPayload(
  supabase: ReturnType<typeof createTimeoutClient>,
  hubType: HubType,
  lang: string,
): Promise<HubPayload> {
  // 1. Try cache
  try {
    const { data: cacheRow } = await supabase
      .from('hub_cache')
      .select('payload, expires_at, is_stale')
      .eq('hub_type', hubType)
      .eq('language', lang)
      .maybeSingle()

    if (cacheRow && !cacheRow.is_stale && new Date(cacheRow.expires_at) > new Date()) {
      console.log(`[HubCache] HIT: ${hubType}:${lang}`)
      return cacheRow.payload as HubPayload
    }
    console.log(`[HubCache] MISS or STALE: ${hubType}:${lang}`)
  } catch (e) {
    console.warn('[HubCache] read failed, falling through to live query:', e)
  }

  // 2. Live query
  const payload = await fetchHubChildren(supabase, hubType, lang)

  // 3. Best-effort write-back (non-blocking semantics)
  try {
    await supabase.from('hub_cache').upsert({
      hub_type: hubType,
      language: lang,
      payload: payload as any,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      is_stale: false,
    }, { onConflict: 'hub_type,language' })
  } catch (e) {
    console.warn('[HubCache] write-back failed:', e)
  }

  return payload
}

function renderChildLinkList(payload: HubPayload, hubType: HubType, lang: string): string {
  if (payload.links.length === 0) {
    return `<p>${lang === 'es' ? 'No hay contenido publicado todavía.' : 'No content published yet.'}</p>`
  }

  const useGrouping = hubType === 'locations' || hubType === 'compare'
  if (!useGrouping) {
    // Flat reverse-chronological list for blog + qa
    const items = payload.links.map(link => `
      <li class="hub-child-item">
        <a href="${escapeHtml(link.url)}" class="hub-child-title">${escapeHtml(link.title)}</a>
        ${link.description ? `<p class="hub-child-description">${escapeHtml(link.description)}</p>` : ''}
      </li>`).join('')
    return `<ul class="hub-child-list">${items}</ul>`
  }

  // Grouped list for locations + compare
  const groups = new Map<string, HubChildLink[]>()
  for (const link of payload.links) {
    const g = link.group || (lang === 'es' ? 'Otros' : 'Other')
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g)!.push(link)
  }

  const sections: string[] = []
  for (const [groupName, links] of groups) {
    const items = links.map(link => `
      <li class="hub-child-item">
        <a href="${escapeHtml(link.url)}" class="hub-child-title">${escapeHtml(link.title)}</a>
        ${link.description ? `<p class="hub-child-description">${escapeHtml(link.description)}</p>` : ''}
      </li>`).join('')
    sections.push(`
      <section class="hub-group">
        <h2 class="hub-group-heading">${escapeHtml(groupName)}</h2>
        <ul class="hub-child-list">${items}</ul>
      </section>`)
  }
  return sections.join('\n')
}

function renderFaqAccordion(faqs: { q: string; a: string }[]): string {
  return faqs.map((faq, i) => `
    <details class="hub-faq-item"${i === 0 ? ' open' : ''}>
      <summary class="hub-faq-question">${escapeHtml(faq.q)}</summary>
      <div class="hub-faq-answer">${escapeHtml(faq.a)}</div>
    </details>`).join('')
}

/**
 * Generate full SEO HTML for a hub page (DB-backed, cached).
 */
async function generateHubPageHtmlAsync(
  supabase: ReturnType<typeof createTimeoutClient>,
  lang: string,
  hubType: HubType,
): Promise<string> {
  const locale = LOCALE_MAP[lang] || 'en_US'
  const canonicalPath = `/${lang}/${HUB_PATH_FOR_TYPE[hubType]}`
  const canonicalUrl = withTrailingSlash(`${BASE_URL}${canonicalPath}`)
  const altLang = lang === 'en' ? 'es' : 'en'
  const altUrl = withTrailingSlash(`${BASE_URL}/${altLang}/${HUB_PATH_FOR_TYPE[hubType]}`)
  const xDefaultUrl = withTrailingSlash(`${BASE_URL}/en/${HUB_PATH_FOR_TYPE[hubType]}`)

  const payload = await getHubPayload(supabase, hubType, lang)
  const meta = getHubMeta(hubType, lang, payload.totalPublished)

  // ItemList JSON-LD entries
  const itemListElements = payload.links.slice(0, 30).map((link, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${BASE_URL}${link.url}`,
    name: link.title,
  }))

  // FAQPage JSON-LD entries
  const faqEntities = meta.faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  }))

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Everence Wealth',
        url: BASE_URL,
        logo: { '@type': 'ImageObject', url: 'https://www.everencewealth.com/logo.png' },
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'Everence Wealth',
        publisher: { '@id': `${BASE_URL}/#organization` },
        inLanguage: locale,
      },
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collectionpage`,
        url: canonicalUrl,
        name: meta.title,
        description: meta.description,
        inLanguage: locale,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': `${BASE_URL}/#organization` },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.speakable-answer', '.hub-intro', 'h1'],
        },
        hasPart: [
          { '@id': `${canonicalUrl}#itemlist` },
          { '@id': `${canonicalUrl}#faqpage` },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        name: meta.h1,
        numberOfItems: itemListElements.length,
        itemListElement: itemListElements,
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faqpage`,
        mainEntity: faqEntities,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: `${BASE_URL}/${lang}` },
          { '@type': 'ListItem', position: 2, name: meta.breadcrumbName, item: canonicalUrl },
        ],
      },
    ],
  }

  const childListHtml = renderChildLinkList(payload, hubType, lang)
  const faqAccordionHtml = renderFaqAccordion(meta.faqs)

  // Internal-link nav block (same links, different DOM structure for AI parsers)
  const internalNavLinks = payload.links.slice(0, 20).map(link =>
    `<a href="${escapeHtml(link.url)}">${escapeHtml(link.title)}</a>`
  ).join('\n      ')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />

  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="${lang}" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="${altLang}" href="${altUrl}" />
  <link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:locale" content="${locale}" />
  <meta property="og:site_name" content="Everence Wealth" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />

  <script type="application/ld+json">
${JSON.stringify(schemaGraph, null, 2)}
  </script>

  <style>
    body { font-family: 'Lato', system-ui, sans-serif; line-height: 1.7; max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; color: #1a1d24; }
    h1 { font-size: 2.25rem; line-height: 1.2; margin-bottom: 1rem; color: #1a1d24; }
    .hub-intro, .speakable-answer { font-size: 1.125rem; line-height: 1.7; max-width: 780px; margin-bottom: 2.5rem; color: #2c3138; }
    .hub-intro a, .hub-cta a { color: #b08400; text-decoration: underline; font-weight: 600; }
    .hub-section-heading { font-size: 1.5rem; margin: 2.5rem 0 1rem; }
    .hub-child-list { list-style: none; padding: 0; margin: 0; }
    .hub-child-item { padding: 1rem 0; border-bottom: 1px solid #e5e7eb; }
    .hub-child-title { font-size: 1.125rem; font-weight: 600; color: #1a1d24; text-decoration: none; display: block; margin-bottom: .25rem; }
    .hub-child-title:hover { color: #b08400; text-decoration: underline; }
    .hub-child-description { color: #4b5563; font-size: .95rem; margin: 0; }
    .hub-group { margin-bottom: 2rem; }
    .hub-group-heading { font-size: 1.25rem; font-weight: 700; margin-bottom: .5rem; padding-bottom: .25rem; border-bottom: 2px solid #b08400; }
    .hub-faq-section { margin-top: 3rem; }
    .hub-faq-item { padding: 1rem 0; border-bottom: 1px solid #e5e7eb; }
    .hub-faq-question { font-weight: 600; font-size: 1.05rem; cursor: pointer; }
    .hub-faq-answer { margin-top: .75rem; color: #4b5563; }
    .hub-cta { background: #f8fafc; border-left: 4px solid #b08400; padding: 1.5rem; margin: 3rem 0 2rem; border-radius: 4px; }
    .internal-links-section { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; }
    .internal-links-section a { display: inline-block; margin: .25rem .5rem .25rem 0; color: #b08400; }
  </style>
</head>
<body>
  <main>
    <nav aria-label="${lang === 'es' ? 'Migas de pan' : 'Breadcrumb'}">
      <a href="/${lang}">${lang === 'es' ? 'Inicio' : 'Home'}</a> &raquo;
      <span aria-current="page">${escapeHtml(meta.breadcrumbName)}</span>
    </nav>

    <h1>${escapeHtml(meta.h1)}</h1>

    <div class="speakable-answer hub-intro">${meta.intro}</div>

    <h2 class="hub-section-heading">${lang === 'es' ? 'Contenido publicado' : 'Published content'} (${payload.totalPublished})</h2>
    ${childListHtml}

    <section class="hub-faq-section" aria-labelledby="hub-faq-heading">
      <h2 id="hub-faq-heading" class="hub-section-heading">${lang === 'es' ? 'Preguntas frecuentes sobre esta sección' : 'Questions about this section'}</h2>
      ${faqAccordionHtml}
    </section>

    <aside class="hub-cta">
      <p><strong>${lang === 'es' ? 'Próximo paso' : 'Next step'}:</strong> ${escapeHtml(meta.ctaText)} <a href="${meta.ctaHref}">${lang === 'es' ? 'Reservar consulta' : 'Book a consultation'}</a>.</p>
    </aside>

    <nav class="internal-links-section" aria-label="${lang === 'es' ? 'Enlaces internos' : 'Internal links'}">
      <h2 class="hub-section-heading">${lang === 'es' ? 'Explorar más' : 'Explore more'}</h2>
      ${internalNavLinks}
    </nav>
  </main>
</body>
</html>`
}

// ============================================================
// BUYERS GUIDE SEO TRANSLATIONS - All 10 languages
// ============================================================
const BUYERS_GUIDE_META: Record<string, { 
  title: string; 
  description: string;
  headline: string;
  subheadline: string;
}> = {
  en: {
    title: "Complete Wealth Management Guide | Everence Wealth",
    description: "Your comprehensive guide to wealth management. Tax-free retirement strategies, IUL options, asset protection, and expert financial advice.",
    headline: "The Complete Guide to Wealth Management",
    subheadline: "Everything you need to know about building and protecting your wealth with independent financial strategies."
  },
  nl: {
    title: "Complete Gids voor Vermogensbeheer | Everence Wealth",
    description: "Uw uitgebreide gids voor vermogensbeheer. Strategieën voor belastingvrij pensioen, IUL-opties en vermogensbescherming. Stap-voor-stap proces, kosten, juridische vereisten en deskundig advies.",
    headline: "De Complete Gids voor Vermogensbeheer",
    subheadline: "Alles wat u moet weten over het opbouwen en beschermen van uw vermogen."
  },
  de: {
    title: "Vollständiger Leitfaden zur Vermögensverwaltung | Everence Wealth",
    description: "Ihr umfassender Leitfaden zur Vermögensverwaltung. Steuerfreie Altersvorsorge, IUL-Optionen und Vermögensschutz. Schritt-für-Schritt-Prozess, Kosten, rechtliche Anforderungen und Expertenberatung.",
    headline: "Der Komplette Leitfaden zur Vermögensverwaltung",
    subheadline: "Alles, was Sie über den Aufbau und Schutz Ihres Vermögens wissen müssen."
  },
  fr: {
    title: "Guide Complet de Gestion de Patrimoine | Everence Wealth",
    description: "Votre guide complet de gestion de patrimoine. Stratégies de retraite défiscalisée, options IUL et protection des actifs. Processus étape par étape, coûts, exigences légales et conseils d'experts.",
    headline: "Le Guide Complet de Gestion de Patrimoine",
    subheadline: "Tout ce que vous devez savoir sur la construction et la protection de votre patrimoine."
  },
  sv: {
    title: "Komplett Guide till Förmögenhetsförvaltning | Everence Wealth",
    description: "Din kompletta guide till förmögenhetsförvaltning. Skattefria pensionsstrategier, IUL-alternativ och tillgångsskydd. Steg-för-steg-process, kostnader, juridiska krav och expertråd.",
    headline: "Den Kompletta Guiden till Förmögenhetsförvaltning",
    subheadline: "Allt du behöver veta om att bygga och skydda din förmögenhet."
  },
  no: {
    title: "Komplett Guide til Formuesforvaltning | Everence Wealth",
    description: "Din komplette guide til formuesforvaltning. Skattefrie pensjonsstrategier, IUL-alternativer-prosess, kostnader, juridiske krav og ekspertråd.",
    headline: "Den Komplette Guiden til Formuesforvaltning",
    subheadline: "Alt du trenger å vite om å bygge og beskytte din formue."
  },
  da: {
    title: "Komplet Guide til Formueforvaltning | Everence Wealth",
    description: "Din komplette guide til formueforvaltning. Skattefrie pensionsstrategier, IUL-alternativer-proces, omkostninger, juridiske krav og ekspertrådgivning.",
    headline: "Den Komplette Guide til Formueforvaltning",
    subheadline: "Alt hvad du behøver at vide om at opbygge og beskytte din formue."
  },
  fi: {
    title: "Täydellinen Opas Varallisuudenhoitoon | Everence Wealth",
    description: "Kattava oppaasi varallisuudenhoitoon. Verovapaita eläkestrategioita, IUL-vaihtoehtoja ja varallisuuden suojausta. Vaiheittainen prosessi, kustannukset, oikeudelliset vaatimukset ja asiantuntijaneuvot.",
    headline: "Täydellinen Opas Varallisuudenhoitoon",
    subheadline: "Kaikki mitä sinun tarvitsee tietää varallisuuden rakentamisesta ja suojaamisesta."
  },
  pl: {
    title: "Kompletny Przewodnik po Zarządzaniu Majątkiem | Everence Wealth",
    description: "Twój kompleksowy przewodnik po zarządzaniu majątkiem. Strategie emerytury wolnej od podatków, opcje IUL i ochrona aktywów. Proces krok po kroku, koszty, wymogi prawne i porady ekspertów.",
    headline: "Kompletny Przewodnik po Zarządzaniu Majątkiem",
    subheadline: "Wszystko, co musisz wiedzieć o budowaniu i ochronie swojego majątku."
  },
  hu: {
    title: "Teljes Útmutató a Vagyonkezeléshez | Everence Wealth",
    description: "Átfogó útmutatója a vagyonkezeléshez. Adómentes nyugdíj stratégiák, IUL lehetőségek és vagyonvédelem. Lépésről lépésre folyamat, költségek, jogi követelmények és szakértői tanácsok.",
    headline: "A Teljes Útmutató a Vagyonkezeléshez",
    subheadline: "Minden, amit tudnia kell vagyona felépítéséről és védelméről."
  }
}

/**
 * Generate full SEO HTML for Buyers Guide pages (e.g., /{lang}/buyers-guide)
 * Includes all metadata, hreflang tags, and JSON-LD schema
 */
function generateBuyersGuidePageHtml(lang: string): string {
  const locale = LOCALE_MAP[lang] || 'en_GB'
  const canonicalUrl = withTrailingSlash(`${BASE_URL}/${lang}/buyers-guide`)
  const content = BUYERS_GUIDE_META[lang] || BUYERS_GUIDE_META.en
  
  // Generate hreflang tags for all 10 languages + x-default
  const hreflangTags = SUPPORTED_LANGUAGES.map(langCode => 
    `  <link rel="alternate" hreflang="${langCode}" href="${withTrailingSlash(`${BASE_URL}/${langCode}/buyers-guide`)}" />`
  ).join('\n')
  const xDefaultTag = `  <link rel="alternate" hreflang="x-default" href="${withTrailingSlash(`${BASE_URL}/en/buyers-guide`)}" />`
  
  // Generate JSON-LD schema with WebPage and HowTo types
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "name": "Everence Wealth",
        "url": BASE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "url": canonicalUrl,
        "name": content.title,
        "description": content.description,
        "inLanguage": locale,
        "isPartOf": { "@id": `${BASE_URL}/#website` },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["#speakable-summary", ".speakable-answer"]
        }
      },
      {
        "@type": "HowTo",
        "@id": `${canonicalUrl}#howto`,
        "name": content.headline,
        "description": content.description,
        "inLanguage": locale,
        "totalTime": "P3M",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "EUR",
          "value": "10-13%",
          "description": "Additional costs on top of purchase price"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/${lang}` },
          { "@type": "ListItem", "position": 2, "name": "Buyers Guide", "item": canonicalUrl }
        ]
      }
    ]
  }
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <meta name="description" content="${content.description}">
  
  <!-- Canonical -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Hreflang tags - 10 languages + x-default -->
${hreflangTags}
${xDefaultTag}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${content.title}">
  <meta property="og:description" content="${content.description}">
  <meta property="og:locale" content="${locale}">
  <meta property="og:site_name" content="Everence Wealth">
  <meta property="og:image" content="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80">
  <meta property="og:image:alt" content="${content.headline}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${content.title}">
  <meta name="twitter:description" content="${content.description}">
  <meta name="twitter:image" content="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@400;700&family=Raleway:wght@400;500;600;700&display=swap">
  
  <!-- Critical inline CSS for initial render -->
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Lato', sans-serif; margin: 0; padding: 0; background: #fff; color: #1a1a1a; }
    .seo-content { max-width: 800px; margin: 4rem auto; padding: 0 1.5rem; text-align: center; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2.5rem; line-height: 1.2; margin-bottom: 1rem; color: #1a1a1a; }
    .seo-content p { font-size: 1.125rem; line-height: 1.7; color: #4a4a4a; margin-bottom: 1rem; }
    #speakable-summary { font-size: 1rem; color: #666; max-width: 600px; margin: 0 auto 2rem; }
  </style>
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(schemaGraph, null, 2)}
  </script>
</head>
<body>
  <div id="root">
    <!-- Static SEO content - React will hydrate this -->
    <main class="seo-content">
      <h1>${content.headline}</h1>
      <p>${content.subheadline}</p>
      <p id="speakable-summary">${content.description}</p>
    </main>
  </div>
  
  <!-- React bootstrap - loads the full app -->
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`
}

// Removed FAQPage schema generation - QAPage schema is sufficient for single Q&A pages
// FAQPage was causing redundancy with QAPage

/**
 * Hans' AEO Rules: Truncate answer at sentence boundary for AI-safe schema
 * - Max 800 characters
 * - Max 150 words
 * - No list formatting allowed
 */
function truncateAtSentence(text: string, maxChars: number = 800): string {
  const MAX_WORDS = 150;
  const MIN_LENGTH = 160;
  
  // Strip HTML tags for clean processing
  let cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Check for list patterns and clean them (Hans' AEO rule: no lists)
  const listPatterns = [
    /^\d+\.\s/m,           // Numbered lists at line start
    /^[-*•]\s/m,           // Bullet points at line start  
    /\n\s*\d+\.\s/,        // Numbered lists mid-text
    /\n\s*[-*•]\s/,        // Bullets mid-text
  ];
  
  for (const pattern of listPatterns) {
    if (pattern.test(cleanText)) {
      // Clean list formatting - convert to flowing prose
      cleanText = cleanText.replace(/^\s*\d+\.\s+/gm, '');
      cleanText = cleanText.replace(/\n\s*\d+\.\s+/g, ' ');
      cleanText = cleanText.replace(/^\s*[-*•]\s+/gm, '');
      cleanText = cleanText.replace(/\n\s*[-*•]\s+/g, ' ');
      cleanText = cleanText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      break;
    }
  }
  
  // Check word count first (Hans' rule: max 150 words)
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  if (words.length > MAX_WORDS) {
    cleanText = words.slice(0, MAX_WORDS).join(' ');
  }
  
  // Now check character limit (Hans' rule: max 800 chars)
  if (cleanText.length <= maxChars) {
    // Ensure proper ending
    if (!cleanText.endsWith('.') && !cleanText.endsWith('!') && !cleanText.endsWith('?')) {
      cleanText = cleanText.trim() + '.';
    }
    return cleanText;
  }
  
  // Need to truncate - find sentence boundary
  const truncated = cleanText.substring(0, maxChars);
  
  // Find last sentence ending
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (lastSentenceEnd >= MIN_LENGTH) {
    return cleanText.substring(0, lastSentenceEnd + 1).trim();
  }
  
  // Fallback: truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace >= MIN_LENGTH) {
    return cleanText.substring(0, lastSpace).trim() + '.';
  }
  
  // Final fallback
  return cleanText.substring(0, MIN_LENGTH).trim() + '...';
}

function generateQAPageSchema(metadata: PageMetadata): string {
  // For QA pages, use QAPage schema with full authority signals (E-E-A-T requirements)
  // Content must be in the page's language (no hardcoded English)
  const schema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "@id": `${metadata.canonical_url}#qapage`,
    "headline": metadata.headline, // This comes from question_main in the DB (in page's language)
    "inLanguage": LOCALE_MAP[metadata.language] || metadata.language,
    "url": metadata.canonical_url,
    "datePublished": metadata.date_published || new Date().toISOString(),
    "dateModified": metadata.date_modified || metadata.date_published || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "@id": `${BASE_URL}/#steven-rosenberg`,
      "name": "Steven Rosenberg",
      "jobTitle": "Senior Wealth Strategist"
    },
    "publisher": ORGANIZATION_SCHEMA,
    "mainEntity": {
      "@type": "Question",
      "name": metadata.headline, // In page's language
      "text": metadata.headline,
      "answerCount": 1,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": truncateAtSentence(metadata.speakable_answer?.replace(/<[^>]*>/g, '') || '', 600),
        "inLanguage": LOCALE_MAP[metadata.language] || metadata.language,
        "author": {
          "@type": "Person",
          "@id": `${BASE_URL}/#steven-rosenberg`
        }
      }
    }
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

// Organization schema for publisher
const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  "name": "Everence Wealth",
  "url": BASE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png",
    "width": 1200,
    "height": 630
  },
  "sameAs": [
    "https://www.linkedin.com/company/everencewealth/"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "455 Market St Ste 1940 PMB 350011",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94105",
    "addressCountry": "US"
  },
  "telephone": "+1-925-433-7724",
  "email": "info@everencewealth.com",
  "areaServed": { "@type": "Country", "name": "United States" },
  "foundingDate": "1990",
  "slogan": "Architecting Your Financial Legacy",
  "priceRange": "$$$",
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "license",
    "name": "Licensed Insurance Broker",
    "recognizedBy": {
      "@type": "Organization",
      "name": "State Department of Insurance"
    }
  }
}

// Founder Person schemas with LinkedIn sameAs
const FOUNDERS_SCHEMAS = [
  {
    "@type": "Person",
    "@id": `${BASE_URL}/#steven-rosenberg`,
    "name": "Steven Rosenberg",
    "jobTitle": "Founder & Chief Wealth Strategist",
    // sameAs intentionally omitted — pending verified personal profile URL.
    // Per schema.org, Person.sameAs must point to pages ABOUT THAT PERSON;
    // a company LinkedIn page is NOT valid here.
    "worksFor": { "@id": `${BASE_URL}/#organization` }
  }
]

function generateOrganizationSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      ORGANIZATION_SCHEMA,
      ...FOUNDERS_SCHEMAS
    ]
  }
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

function generateBlogPostingSchema(metadata: PageMetadata): string {
  // Only generate BlogPosting schema for blog content
  if (metadata.content_type !== 'blog') {
    return ''
  }

  // Author authority block (Fix 13 Phase 2).
  // - When the author lookup returns a row, emit a fully-populated Person
  //   schema with hasCredential[] and a reviewedBy: Person echo.
  // - When the lookup fails (network error, missing row, etc.), fall back to
  //   the Organization stub so the page never breaks. reviewedBy is omitted
  //   in that case because we cannot truthfully attribute review.
  const author = metadata.author
  let authorNode: Record<string, unknown>
  let reviewedByNode: Record<string, unknown> | undefined

  if (author) {
    // All published blog articles currently map to Steven Rosenberg.
    // The /team/steven-rosenberg page lands in Phase 3; the URL is emitted
    // now so the entity graph is consistent the moment that page deploys.
    const personUrl = `${BASE_URL}/${metadata.language}/team/steven-rosenberg`
    const personId = `${personUrl}#person`
    const description = author.bio_short
      ?? (author.bio ? truncateAtSentence(author.bio.replace(/<[^>]*>/g, ''), 200) : undefined)

    authorNode = {
      "@type": "Person",
      "@id": personId,
      "name": author.name,
      "jobTitle": author.job_title || undefined,
      "url": personUrl,
      "image": author.photo_url || undefined,
      "description": description || undefined,
      "worksFor": { "@id": `${BASE_URL}/#organization` },
      "sameAs": author.linkedin_url ? [author.linkedin_url] : undefined,
      "hasCredential": (author.credentials || []).map((c) => ({
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "professional certification",
        "name": c,
      })),
    }
    reviewedByNode = {
      "@type": "Person",
      "@id": personId,
      "name": author.name,
    }
  } else {
    // Defensive fallback — never break the page on a failed author lookup.
    authorNode = {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "Everence Wealth",
    }
    // reviewedBy intentionally omitted when author is unknown.
  }

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${metadata.canonical_url}#blogposting`,
    "headline": metadata.headline,
    "description": metadata.meta_description,
    "image": {
      "@type": "ImageObject",
      "url": metadata.featured_image_url || "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png",
      "caption": metadata.featured_image_alt || metadata.headline
    },
    "datePublished": metadata.date_published || new Date().toISOString(),
    "dateModified": metadata.date_modified || metadata.date_published || new Date().toISOString(),
    "inLanguage": LOCALE_MAP[metadata.language] || metadata.language,
    "author": authorNode,
    "publisher": ORGANIZATION_SCHEMA,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": metadata.canonical_url
    },
    "isPartOf": {
      "@type": "Blog",
      "@id": `${BASE_URL}/${metadata.language}/blog#blog`,
      "name": "Everence Wealth Blog",
      "publisher": {
        "@id": `${BASE_URL}/#organization`
      }
    }
  }

  if (reviewedByNode) {
    schema.reviewedBy = reviewedByNode
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

function generateBreadcrumbSchema(metadata: PageMetadata): string {
  const pathMap: Record<string, { name: string; path: string }> = {
    blog: { name: 'Blog', path: 'blog' },
    qa: { name: 'Q&A', path: 'qa' },
    compare: { name: 'Comparisons', path: 'compare' },
    locations: { name: 'Locations', path: 'locations' }
  }
  
  const section = pathMap[metadata.content_type] || { name: 'Content', path: '' }
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${BASE_URL}/${metadata.language}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": section.name,
        "item": `${BASE_URL}/${metadata.language}/${section.path}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": metadata.headline,
        "item": metadata.canonical_url
      }
    ]
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

function generateArticleSchema(metadata: PageMetadata): string {
  // Article schema is the primary @type for COMPARE pages only.
  // - QA / blog have their own primary types (QAPage / BlogPosting).
  // - Locations get FinancialService (a wealth-management service in
  //   a geographic area), not Article.
  if (metadata.content_type === 'qa' || metadata.content_type === 'blog') {
    return '' // QA pages use QAPage, blog uses BlogPosting
  }

  if (metadata.content_type === 'locations') {
    return generateFinancialServiceSchema(metadata)
  }

  // Compare pages keep Article — they genuinely are educational
  // comparison articles.
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${metadata.canonical_url}#article`,
    "headline": metadata.headline,
    "description": metadata.meta_description,
    "image": metadata.featured_image_url || "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png",
    "datePublished": metadata.date_published || new Date().toISOString(),
    "dateModified": metadata.date_modified || new Date().toISOString(),
    "inLanguage": LOCALE_MAP[metadata.language] || metadata.language,
    "author": {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "Everence Wealth"
    },
    "publisher": ORGANIZATION_SCHEMA,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": metadata.canonical_url
    }
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

// US state code -> full name. Used to expand location.region (e.g. "CA")
// to the canonical state name in FinancialService.areaServed.
const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii',
  ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska',
  NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

function generateFinancialServiceSchema(metadata: PageMetadata): string {
  const regionRaw = metadata.region || ''
  // region may already be a full state name; only expand if it's a 2-letter code
  const stateName = US_STATE_NAMES[regionRaw.toUpperCase()] || regionRaw
  const cityName = metadata.city_name || ''

  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${metadata.canonical_url}#financialservice`,
    "name": cityName && regionRaw
      ? `Everence Wealth - ${cityName}, ${regionRaw}`
      : "Everence Wealth",
    "description": metadata.meta_description,
    "url": metadata.canonical_url,
    "image": {
      "@type": "ImageObject",
      "url": metadata.featured_image_url || "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png",
      "width": 1200,
      "height": 630
    },
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "containedInPlace": {
        "@type": "State",
        "name": stateName,
        "containedInPlace": {
          "@type": "Country",
          "name": metadata.country || "United States"
        }
      }
    },
    "parentOrganization": {
      "@id": `${BASE_URL}/#organization`
    },
    "priceRange": "$$$",
    "serviceType": "Wealth Management",
    "knowsAbout": [
      "retirement planning",
      "tax strategy",
      "asset protection",
      "estate planning",
      "indexed universal life insurance"
    ],
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".speakable-answer"]
    }
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

function generateSpeakableSchema(metadata: PageMetadata): string {
  // Generate SpeakableSpecification for AI/voice assistants
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${metadata.canonical_url}#webpage-speakable`,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        ".speakable-answer",
        ".comparison-summary",
        ".tl-dr-summary",
        ".speakable-box"
      ]
    },
    "url": metadata.canonical_url
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

function generateComparisonTableSchema(metadata: PageMetadata, comparisonTable: any[]): string {
  // Only generate Table schema for comparison pages with comparison data
  if (metadata.content_type !== 'compare' || !comparisonTable || comparisonTable.length === 0) {
    return ''
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Table",
    "@id": `${metadata.canonical_url}#comparison-table`,
    "about": metadata.headline,
    "description": `Comparison table for ${metadata.headline}`,
    "mainEntity": comparisonTable.map((row: any, index: number) => ({
      "@type": "ItemList",
      "position": index + 1,
      "name": row.attribute || row.name,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "item": { "@type": "Thing", "name": row.option_a || row.optionA } },
        { "@type": "ListItem", "position": 2, "item": { "@type": "Thing", "name": row.option_b || row.optionB } }
      ]
    }))
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

/**
 * Generate FAQPage JSON-LD for blog posts that have qa_entities.
 * Only emits when:
 *   - content_type is 'blog' (BlogPosting + FAQPage composition is valid;
 *     QAPage uses a different shape and gets its own mainEntity Question)
 *   - qa_entities is a non-empty array
 *
 * BlogPosting uses mainEntityOfPage (a WebPage reference), so adding
 * FAQPage here does NOT create a duplicate mainEntity field on the
 * document. FAQPage is its own top-level @type with its own mainEntity.
 */
function generateFAQPageSchema(metadata: PageMetadata): string {
  if (metadata.content_type !== 'blog') return ''
  const faqs = Array.isArray(metadata.qa_entities) ? metadata.qa_entities : []
  if (faqs.length === 0) return ''

  const mainEntity = faqs
    .map((entry: any) => {
      // Tolerate multiple shapes used historically:
      //   { question, answer }
      //   { q, a }
      //   { name, acceptedAnswer: { text } }
      const question =
        (entry?.question ?? entry?.q ?? entry?.name ?? '').toString().trim()
      const rawAnswer =
        (entry?.answer ?? entry?.a ?? entry?.acceptedAnswer?.text ?? '').toString()
      if (!question || !rawAnswer) return null
      const cleanAnswer = truncateAtSentence(rawAnswer.replace(/<[^>]*>/g, ''), 800)
      if (!cleanAnswer) return null
      return {
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": cleanAnswer,
          "inLanguage": LOCALE_MAP[metadata.language] || metadata.language
        }
      }
    })
    .filter(Boolean)

  if (mainEntity.length === 0) return ''

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${metadata.canonical_url}#faqpage`,
    "inLanguage": LOCALE_MAP[metadata.language] || metadata.language,
    "isPartOf": { "@id": `${metadata.canonical_url}#blogposting` },
    "mainEntity": mainEntity
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Generate SSR styles for server-rendered content
 */
function generateSSRStyles(): string {
  return `
    <style>
      /* Everence Wealth Brand Design System */
      :root {
        --prime-gold: 43 74% 49%;
        --prime-gold-dark: 43 74% 40%;
        --prime-950: 220 20% 10%;
        --foreground: 220 20% 10%;
        --muted-foreground: 220 10% 45%;
        --background: 0 0% 100%;
        --card-bg: 0 0% 98%;
        --border: 220 13% 91%;
      }
      
      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      body { 
        font-family: 'Lato', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.7;
        color: hsl(var(--foreground));
        background: hsl(var(--background));
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 600;
        color: hsl(var(--prime-950));
      }
      
      /* Header - Sticky with Brand Shadow */
      .site-header { 
        background: hsl(var(--background)); 
        border-bottom: 1px solid hsl(var(--border)); 
        padding: 1rem 0;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .nav-container { 
        max-width: 1280px; 
        margin: 0 auto; 
        padding: 0 1.5rem; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
      }
      .logo { height: 44px; width: auto; }
      .logo-link { display: flex; align-items: center; }
      .nav-links { display: flex; gap: 2rem; list-style: none; }
      .nav-links a { 
        color: hsl(var(--muted-foreground)); 
        text-decoration: none; 
        font-weight: 500;
        font-size: 0.95rem;
        transition: color 0.2s ease;
      }
      .nav-links a:hover { color: hsl(var(--prime-gold)); }
      
      /* Article Container */
      .article-container { 
        max-width: 800px; 
        margin: 0 auto; 
        padding: clamp(1.5rem, 5vw, 3rem) 1.5rem; 
      }
      .article-header { margin-bottom: 2rem; }
      
      h1 { 
        font-size: clamp(1.75rem, 4vw, 2.75rem); 
        font-weight: 700; 
        line-height: 1.15; 
        margin-bottom: 1rem;
        letter-spacing: -0.02em;
      }
      
      .article-meta { 
        color: hsl(var(--muted-foreground)); 
        font-size: 0.875rem; 
        display: flex; 
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
      }
      .read-time { 
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }
      .read-time::before {
        content: '•';
        margin-right: 0.5rem;
      }
      
      /* Featured Image */
      .featured-image { 
        margin: 2rem 0; 
        border-radius: 16px; 
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }
      .featured-image img { 
        width: 100%; 
        height: auto; 
        display: block;
        aspect-ratio: 16/9;
        object-fit: cover;
      }
      
      /* Speakable Summary Box - Brand Gold Gradient */
      .speakable-summary { 
        background: linear-gradient(135deg, hsl(48 100% 96%) 0%, hsl(48 96% 89%) 100%);
        padding: 1.75rem; 
        border-radius: 12px; 
        margin: 2rem 0;
        border-left: 5px solid hsl(var(--prime-gold));
        position: relative;
        box-shadow: 0 2px 12px rgba(201, 162, 39, 0.1);
      }
      .speakable-summary::before {
        content: 'Quick Answer';
        display: block;
        font-family: 'Lato', sans-serif;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: hsl(var(--prime-gold-dark));
        margin-bottom: 0.75rem;
      }
      .speakable-summary p { 
        font-size: 1.1rem; 
        line-height: 1.75;
        color: hsl(35 60% 20%); 
        font-weight: 500; 
      }
      
      /* Content Styling */
      .article-content { 
        font-size: clamp(1rem, 2vw, 1.125rem);
        line-height: 1.8;
      }
      .article-content h2 { 
        font-size: clamp(1.5rem, 3vw, 1.875rem); 
        margin: 3rem 0 1.25rem;
        padding-top: 1rem;
      }
      .article-content h3 { 
        font-size: clamp(1.25rem, 2.5vw, 1.5rem); 
        margin: 2.5rem 0 1rem; 
      }
      .article-content p { margin: 1.25rem 0; }
      .article-content ul, .article-content ol { 
        margin: 1.25rem 0; 
        padding-left: 1.75rem; 
      }
      .article-content li { 
        margin: 0.625rem 0;
        padding-left: 0.25rem;
      }
      .article-content a { 
        color: hsl(var(--prime-gold-dark)); 
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: color 0.2s ease;
      }
      .article-content a:hover {
        color: hsl(var(--prime-gold));
      }
      .article-content blockquote { 
        border-left: 4px solid hsl(var(--prime-gold)); 
        padding: 1rem 1.5rem; 
        margin: 2rem 0; 
        font-style: italic;
        background: hsl(var(--card-bg));
        border-radius: 0 8px 8px 0;
        color: hsl(var(--muted-foreground)); 
      }
      .article-content img { 
        max-width: 100%; 
        height: auto; 
        border-radius: 12px; 
        margin: 2rem 0;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      }
      .article-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 2rem 0;
        font-size: 0.95rem;
      }
      .article-content th {
        background: hsl(var(--prime-950));
        color: white;
        padding: 0.875rem 1rem;
        text-align: left;
        font-weight: 600;
      }
      .article-content td {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid hsl(var(--border));
      }
      .article-content tr:nth-child(even) td {
        background: hsl(var(--card-bg));
      }
      
      /* FAQ Section */
      .faq-section { 
        margin: 3rem 0; 
        padding: 2rem; 
        background: hsl(var(--card-bg)); 
        border-radius: 16px;
        border: 1px solid hsl(var(--border));
      }
      .faq-section h2 { 
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
      }
      .faq-item { 
        background: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-left: 4px solid hsl(var(--prime-gold));
        border-radius: 8px;
        margin-bottom: 1rem;
        overflow: hidden;
      }
      .faq-item summary { 
        font-weight: 600; 
        cursor: pointer; 
        color: hsl(var(--prime-950));
        padding: 1rem 1.25rem;
        list-style: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .faq-item summary::-webkit-details-marker { display: none; }
      .faq-item summary::after {
        content: '+';
        font-size: 1.25rem;
        color: hsl(var(--prime-gold));
        font-weight: 400;
      }
      .faq-item[open] summary::after { content: '−'; }
      .faq-item p { 
        padding: 0 1.25rem 1rem;
        color: hsl(var(--muted-foreground));
        line-height: 1.7;
      }
      
      /* Internal Links Section */
      .internal-links-section {
        margin: 2rem 0;
        padding: 1.5rem 2rem;
        border: 1px solid hsl(220 15% 85%);
        border-radius: 12px;
        background: hsl(220 20% 97%);
      }
      .internal-links-section h3 {
        font-size: 1.15rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        color: hsl(220 25% 20%);
      }
      .internal-links-section ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .internal-links-section li a {
        color: hsl(var(--prime-700, 210 70% 45%));
        text-decoration: none;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
      .internal-links-section li a::before {
        content: '→';
        font-size: 0.9em;
      }
      .internal-links-section li a:hover {
        text-decoration: underline;
      }

      /* CTA Section */
      .cta-section { 
        background: linear-gradient(135deg, hsl(var(--prime-950)) 0%, hsl(220 25% 15%) 100%);
        color: white;
        padding: clamp(2rem, 5vw, 3rem);
        border-radius: 16px;
        margin: 3rem 0;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      }
      .cta-section h3 { 
        font-size: clamp(1.25rem, 3vw, 1.625rem); 
        margin-bottom: 0.875rem;
        color: white;
      }
      .cta-section p { 
        margin-bottom: 1.5rem; 
        opacity: 0.9;
        font-size: 1.05rem;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
      }
      .cta-button { 
        display: inline-block;
        background: linear-gradient(135deg, hsl(var(--prime-gold)) 0%, hsl(var(--prime-gold-dark)) 100%);
        color: hsl(var(--prime-950));
        padding: 1rem 2.5rem;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 4px 16px rgba(201, 162, 39, 0.25);
      }
      .cta-button:hover { 
        transform: translateY(-3px); 
        box-shadow: 0 8px 24px rgba(201, 162, 39, 0.35);
      }
      
      /* Footer */
      .site-footer { 
        background: hsl(var(--prime-950)); 
        color: hsl(220 10% 65%); 
        padding: 2.5rem 0; 
        margin-top: 4rem;
        border-top: 4px solid hsl(var(--prime-gold));
      }
      .footer-content { 
        max-width: 1280px; 
        margin: 0 auto; 
        padding: 0 1.5rem; 
        display: flex; 
        justify-content: space-between; 
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .footer-content p {
        font-size: 0.875rem;
      }
      .footer-nav { display: flex; gap: 1.5rem; }
      .footer-nav a { 
        color: hsl(220 10% 65%); 
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s ease;
      }
      .footer-nav a:hover { color: hsl(var(--prime-gold)); }
      
      /* Location/Area Cards */
      .area-card {
        background: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
        transition: box-shadow 0.2s ease;
      }
      .area-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .nav-links { display: none; }
        .cta-section { padding: 1.75rem; }
        .footer-content { 
          flex-direction: column; 
          text-align: center; 
        }
        .footer-nav { justify-content: center; }
        .speakable-summary { padding: 1.25rem; }
        .faq-section { padding: 1.5rem; }
      }
      
      /* Print Styles */
      @media print {
        .site-header, .site-footer, .cta-section { display: none; }
        .article-container { max-width: 100%; padding: 0; }
      }
    </style>
  `
}

/**
 * Generate the article body HTML for SSR
 */
function generateArticleBody(metadata: PageMetadata): string {
  const lang = metadata.language
  const langPrefix = `/${lang}`
  
  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'nl' ? 'nl-NL' : lang === 'fr' ? 'fr-FR' : 'en-GB', {
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
  
  // CTA text based on language
  const ctaTexts: Record<string, { title: string; text: string; button: string }> = {
    en: { title: "Ready to Build Your Financial Future?", text: "Contact Everence Wealth for expert independent financial guidance.", button: "Get in Touch" },
    nl: { title: "Klaar om Uw Financiële Toekomst op te Bouwen?", text: "Neem contact op met Everence Wealth voor deskundig onafhankelijk financieel advies.", button: "Neem Contact Op" },
    de: { title: "Bereit, Ihre Finanzielle Zukunft Aufzubauen?", text: "Kontaktieren Sie Everence Wealth für kompetente unabhängige Finanzberatung.", button: "Kontakt Aufnehmen" },
    fr: { title: "Prêt à Construire Votre Avenir Financier?", text: "Contactez Everence Wealth pour des conseils financiers indépendants.", button: "Nous Contacter" },
  }
  const cta = ctaTexts[lang] || ctaTexts.en
  
  // Nav labels based on language
  const navTexts: Record<string, { properties: string; blog: string; contact: string; locations: string }> = {
    en: { properties: 'Properties', blog: 'Blog', contact: 'Contact', locations: 'Locations' },
    nl: { properties: 'Vastgoed', blog: 'Blog', contact: 'Contact', locations: 'Locaties' },
    de: { properties: 'Immobilien', blog: 'Blog', contact: 'Kontakt', locations: 'Standorte' },
    fr: { properties: 'Propriétés', blog: 'Blog', contact: 'Contact', locations: 'Emplacements' },
    sv: { properties: 'Fastigheter', blog: 'Blogg', contact: 'Kontakt', locations: 'Platser' },
    no: { properties: 'Eiendommer', blog: 'Blogg', contact: 'Kontakt', locations: 'Steder' },
    da: { properties: 'Ejendomme', blog: 'Blog', contact: 'Kontakt', locations: 'Steder' },
    fi: { properties: 'Kiinteistöt', blog: 'Blogi', contact: 'Yhteystiedot', locations: 'Sijainnit' },
    pl: { properties: 'Nieruchomości', blog: 'Blog', contact: 'Kontakt', locations: 'Lokalizacje' },
    hu: { properties: 'Ingatlanok', blog: 'Blog', contact: 'Kapcsolat', locations: 'Helyszínek' },
  }
  const nav = navTexts[lang] || navTexts.en

  return `
    <header class="site-header">
      <nav class="nav-container">
        <a href="${langPrefix}/" class="logo-link">
          <img src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" alt="Everence Wealth" class="logo">
        </a>
        <div class="nav-links">
          <a href="${langPrefix}/properties">${nav.properties}</a>
          <a href="${langPrefix}/locations">${nav.locations}</a>
          <a href="${langPrefix}/blog">${nav.blog}</a>
          <a href="${langPrefix}/contact">${nav.contact}</a>
        </div>
      </nav>
    </header>
    
    <main class="article-container">
      <article itemscope itemtype="https://schema.org/${metadata.content_type === 'qa' ? 'QAPage' : 'BlogPosting'}">
        ${metadata.content_type === 'qa' ? '<div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">' : ''}
        <header class="article-header">
          <h1 itemprop="${metadata.content_type === 'qa' ? 'name' : 'headline'}">${escapeHtml(metadata.headline)}</h1>
          ${metadata.content_type === 'qa' ? '<meta itemprop="answerCount" content="1" />' : ''}
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
              fetchpriority="high"
            >
          </figure>
        ` : ''}
        
        ${metadata.speakable_answer ? `
          <div class="speakable-summary speakable-answer" id="speakable-summary" itemprop="description">
            <p>${escapeHtml(metadata.speakable_answer)}</p>
          </div>
        ` : ''}
        
        ${metadata.content_type === 'qa' ? '<div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">' : ''}
        <div class="article-content" itemprop="${metadata.content_type === 'qa' ? 'text' : 'articleBody'}">
          ${mainContent || '<p>Content loading...</p>'}
        </div>
        ${metadata.content_type === 'qa' ? '</div>' : ''}
        
        ${faqSection}
        
        <nav class="internal-links-section" aria-label="Related articles">
          <h3>${metadata.language === 'es' ? 'Lectura relacionada' : 'Related Reading'}</h3>
          <ul>
            ${(metadata.internal_links && Array.isArray(metadata.internal_links) && metadata.internal_links.length > 0
              ? metadata.internal_links.map((link: any) => `<li><a href="${escapeHtml(link.url)}"${link.title ? ` title="${escapeHtml(link.title)}"` : ''}>${escapeHtml(link.text)}</a></li>`).join('\n            ')
              : `<li><a href="${langPrefix}/blog">${metadata.language === 'es' ? 'Explorar el blog' : 'Explore the blog'}</a></li>
            <li><a href="${langPrefix}/qa">${metadata.language === 'es' ? 'Preguntas y respuestas' : 'Questions & Answers'}</a></li>
            <li><a href="${langPrefix}/contact">${metadata.language === 'es' ? 'Hablar con un asesor' : 'Speak with an advisor'}</a></li>`)}
          </ul>
        </nav>
        
        <div class="cta-section">
          <h3>${cta.title}</h3>
          <p>${cta.text}</p>
          <a href="${langPrefix}/contact" class="cta-button">${cta.button}</a>
        </div>
        ${metadata.content_type === 'qa' ? '</div>' : ''}
      </article>
    </main>
    
    <footer class="site-footer">
      <div class="footer-content">
        <p>&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
        <nav class="footer-nav">
          <a href="${langPrefix}/privacy">Privacy</a>
          <a href="${langPrefix}/terms">Terms</a>
          <a href="${langPrefix}/contact">${nav.contact}</a>
        </nav>
      </div>
    </footer>
  `
}

function generateFullHtml(metadata: PageMetadata, hreflangTags: string, _baseHtml: string): string {
  const locale = LOCALE_MAP[metadata.language] || 'en_GB'
  const escapedTitle = escapeHtml(metadata.meta_title || metadata.headline || 'Everence Wealth')
  const escapedDescription = escapeHtml(metadata.meta_description || '')
  
  // Generate schemas based on content type
  const qaSchema = metadata.content_type === 'qa' ? generateQAPageSchema(metadata) : ''
  const blogPostingSchema = generateBlogPostingSchema(metadata)
  const articleSchema = generateArticleSchema(metadata)
  const breadcrumbSchema = generateBreadcrumbSchema(metadata)
  const speakableSchema = metadata.speakable_answer ? generateSpeakableSchema(metadata) : ''
  const comparisonTableSchema = generateComparisonTableSchema(metadata, metadata.quick_comparison_table || [])
  const faqPageSchema = generateFAQPageSchema(metadata)

  // Generate SSR styles and body content
  const ssrStyles = generateSSRStyles()
  const articleBody = generateArticleBody(metadata)

  const headContent = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Google Fonts: Playfair Display + Lato -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  
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
  <meta property="og:image" content="${metadata.featured_image_url || 'https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png'}" />
  <meta property="og:image:alt" content="${escapeHtml(metadata.featured_image_alt) || escapedTitle}" />
  <meta property="og:locale" content="${locale}" />
  <meta property="og:site_name" content="Everence Wealth" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${metadata.canonical_url}" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDescription}" />
  <meta name="twitter:image" content="${metadata.featured_image_url || 'https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png'}" />
  <meta name="twitter:image:alt" content="${escapeHtml(metadata.featured_image_alt) || escapedTitle}" />
  
  <!-- Article Meta -->
  ${metadata.date_published ? `<meta property="article:published_time" content="${metadata.date_published}" />` : ''}
  ${metadata.date_modified ? `<meta property="article:modified_time" content="${metadata.date_modified}" />` : ''}
  
  <!-- Schema.org JSON-LD -->
  ${qaSchema}
  ${blogPostingSchema}
  ${articleSchema}
  ${breadcrumbSchema}
  ${speakableSchema}
  ${faqPageSchema}
  ${comparisonTableSchema}
  
  <!-- SSR Styles -->
  ${ssrStyles}
`

  // Build complete HTML with full SSR body content
  return `<!DOCTYPE html>
<html lang="${metadata.language}">
<head>${headContent}</head>
<body>
  ${articleBody}
</body>
</html>`
}

// Localized messages for 410 page
const GONE_PAGE_MESSAGES: Record<string, { title: string; subtitle: string; message: string; browseProperties: string; readBlog: string; home: string }> = {
  en: {
    title: 'Content Removed',
    subtitle: 'Page No Longer Available',
    message: 'This page has been permanently removed and is no longer available. We apologize for any inconvenience.',
    browseProperties: 'Browse Properties',
    readBlog: 'Read Our Blog',
    home: 'Go Home'
  },
  de: {
    title: 'Inhalt Entfernt',
    subtitle: 'Seite Nicht Mehr Verfügbar',
    message: 'Diese Seite wurde dauerhaft entfernt und ist nicht mehr verfügbar. Wir entschuldigen uns für etwaige Unannehmlichkeiten.',
    browseProperties: 'Immobilien Durchsuchen',
    readBlog: 'Blog Lesen',
    home: 'Startseite'
  },
  nl: {
    title: 'Inhoud Verwijderd',
    subtitle: 'Pagina Niet Meer Beschikbaar',
    message: 'Deze pagina is permanent verwijderd en is niet meer beschikbaar. Onze excuses voor het ongemak.',
    browseProperties: 'Vastgoed Bekijken',
    readBlog: 'Blog Lezen',
    home: 'Home'
  },
  fr: {
    title: 'Contenu Supprimé',
    subtitle: 'Page Non Disponible',
    message: 'Cette page a été définitivement supprimée et n\'est plus disponible. Nous nous excusons pour tout inconvénient.',
    browseProperties: 'Parcourir les Propriétés',
    readBlog: 'Lire le Blog',
    home: 'Accueil'
  },
  sv: {
    title: 'Innehåll Borttaget',
    subtitle: 'Sidan Inte Längre Tillgänglig',
    message: 'Den här sidan har tagits bort permanent och är inte längre tillgänglig. Vi ber om ursäkt för eventuella olägenheter.',
    browseProperties: 'Bläddra Fastigheter',
    readBlog: 'Läs Bloggen',
    home: 'Hem'
  },
  no: {
    title: 'Innhold Fjernet',
    subtitle: 'Siden Ikke Lenger Tilgjengelig',
    message: 'Denne siden er permanent fjernet og er ikke lenger tilgjengelig. Vi beklager eventuelle ulemper.',
    browseProperties: 'Bla Gjennom Eiendommer',
    readBlog: 'Les Bloggen',
    home: 'Hjem'
  },
  da: {
    title: 'Indhold Fjernet',
    subtitle: 'Siden Ikke Længere Tilgængelig',
    message: 'Denne side er blevet permanent fjernet og er ikke længere tilgængelig. Vi beklager eventuelle ulejligheder.',
    browseProperties: 'Gennemse Ejendomme',
    readBlog: 'Læs Bloggen',
    home: 'Hjem'
  },
  fi: {
    title: 'Sisältö Poistettu',
    subtitle: 'Sivu Ei Enää Saatavilla',
    message: 'Tämä sivu on poistettu pysyvästi eikä ole enää saatavilla. Pahoittelemme mahdollisia haittoja.',
    browseProperties: 'Selaa Kiinteistöjä',
    readBlog: 'Lue Blogia',
    home: 'Etusivu'
  },
  pl: {
    title: 'Treść Usunięta',
    subtitle: 'Strona Niedostępna',
    message: 'Ta strona została trwale usunięta i nie jest już dostępna. Przepraszamy za wszelkie niedogodności.',
    browseProperties: 'Przeglądaj Nieruchomości',
    readBlog: 'Czytaj Blog',
    home: 'Strona Główna'
  },
  hu: {
    title: 'Tartalom Eltávolítva',
    subtitle: 'Az Oldal Már Nem Elérhető',
    message: 'Ez az oldal véglegesen eltávolításra került és már nem érhető el. Elnézést kérünk a kellemetlenségért.',
    browseProperties: 'Ingatlanok Böngészése',
    readBlog: 'Blog Olvasása',
    home: 'Főoldal'
  }
}

/**
 * Generate 410 Gone HTML for deleted/ghost content
 * Enhanced with branding, navigation, and localized messaging
 */
function generate410GoneHtml(lang: string = 'en'): string {
  const messages = GONE_PAGE_MESSAGES[lang] || GONE_PAGE_MESSAGES.en
  const langPrefix = `/${lang}`
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <meta name="googlebot" content="noindex, nofollow">
  <title>410 - ${messages.title} | Everence Wealth</title>
  <link rel="icon" type="image/png" href="${BASE_URL}/favicon.png">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      display: flex; 
      flex-direction: column;
      justify-content: center; 
      align-items: center; 
      min-height: 100vh; 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #374151;
      padding: 1rem;
    }
    .logo-container {
      margin-bottom: 2rem;
    }
    .logo {
      height: 60px;
      width: auto;
    }
    .container { 
      text-align: center; 
      padding: 2.5rem; 
      max-width: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    }
    .status-code {
      font-size: 5rem;
      font-weight: 800;
      color: #c9a227;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    h1 { 
      font-size: 1.75rem; 
      font-weight: 700;
      margin-bottom: 0.5rem; 
      color: #1f2937; 
    }
    .subtitle {
      font-size: 1rem;
      color: #6b7280;
      margin-bottom: 1.5rem;
    }
    p { 
      font-size: 1rem; 
      color: #4b5563; 
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }
    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    .nav-link.primary {
      background: linear-gradient(135deg, #c9a227 0%, #b8941f 100%);
      color: white;
    }
    .nav-link.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(201, 162, 39, 0.35);
    }
    .nav-link.secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #e5e7eb;
    }
    .nav-link.secondary:hover {
      background: #e5e7eb;
    }
    .footer {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #9ca3af;
    }
    .footer a {
      color: #c9a227;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    @media (max-width: 480px) {
      .status-code { font-size: 4rem; }
      h1 { font-size: 1.5rem; }
      .nav-links { flex-direction: column; }
      .nav-link { width: 100%; justify-content: center; }
    }
  </style>
</head>
<body>
  <div class="logo-container">
    <a href="${langPrefix}/">
      <img src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" alt="Everence Wealth" class="logo">
    </a>
  </div>
  <div class="container">
    <div class="status-code">410</div>
    <h1>${messages.title}</h1>
    <p class="subtitle">${messages.subtitle}</p>
    <p>${messages.message}</p>
    <div class="nav-links">
      <a href="${langPrefix}/properties" class="nav-link primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        ${messages.browseProperties}
      </a>
      <a href="${langPrefix}/blog" class="nav-link secondary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        ${messages.readBlog}
      </a>
      <a href="${langPrefix}/" class="nav-link secondary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        ${messages.home}
      </a>
    </div>
  </div>
  <div class="footer">
    © ${new Date().getFullYear()} <a href="${BASE_URL}">Everence Wealth</a> • Independent Wealth Management
  </div>
</body>
</html>`
}

/**
 * Check if a path looks like a content URL pattern
 * Returns the detected language if it matches, null otherwise
 */
function isContentPathPattern(path: string): { lang: string; type: string } | null {
  // Match patterns like: /en/blog/*, /es/qa/*, /de/locations/*, /fr/compare/*
  const contentPattern = /^\/([a-z]{2})\/(qa|blog|compare|locations)\//i
  const match = path.match(contentPattern)
  if (match) {
    return { lang: match[1].toLowerCase(), type: match[2].toLowerCase() }
  }
  return null
}

// ============================================================
// STRATEGY (BOFU) HARDCODED CONTENT MAP
// English slugs → bilingual content. ES slugs map back to EN keys.
// ============================================================
const STRATEGY_ES_TO_EN: Record<string, string> = {
  'seguro-vida-entera': 'whole-life',
  'seguro-universal-indexado': 'iul',
  'retiro-libre-impuestos': 'tax-free-retirement',
  'proteccion-de-activos': 'asset-protection',
}
const STRATEGY_EN_TO_ES: Record<string, string> = {
  'whole-life': 'seguro-vida-entera',
  'iul': 'seguro-universal-indexado',
  'tax-free-retirement': 'retiro-libre-impuestos',
  'asset-protection': 'proteccion-de-activos',
}

interface StrategyContent {
  en: { title: string; h1: string; description: string; intro: string; faqs: { q: string; a: string }[] }
  es: { title: string; h1: string; description: string; intro: string; faqs: { q: string; a: string }[] }
}

const STRATEGY_CONTENT: Record<string, StrategyContent> = {
  'iul': {
    en: {
      title: 'Indexed Universal Life Insurance (IUL) | Everence Wealth',
      h1: 'Indexed Universal Life Insurance: Tax-Advantaged Growth with Downside Protection',
      description: 'Build cash value tied to market index performance with a 0% floor that protects against losses. IUL combines life insurance protection with tax-free retirement income potential.',
      intro: 'Indexed Universal Life (IUL) insurance is a permanent life insurance policy whose cash value growth is linked to a market index such as the S&P 500. Unlike direct market investments, IUL offers a 0% floor that protects your principal from market losses while allowing you to participate in market upside up to a defined cap. Properly structured, an IUL provides tax-deferred accumulation, tax-free policy loans for retirement income, and a tax-free death benefit for your heirs.',
      faqs: [
        { q: 'What is the difference between IUL and a 401(k)?', a: 'A 401(k) offers tax-deferred growth but withdrawals are taxed as ordinary income and subject to RMDs at age 73. An IUL offers tax-free policy loans, no RMDs, no contribution limits, and a tax-free death benefit, in addition to downside protection through its 0% floor.' },
        { q: 'Can I lose money in an IUL?', a: 'Your cash value cannot lose money due to market downturns thanks to the 0% floor. However, policy fees, cost of insurance, and underperformance vs. cap rates can erode value if the policy is not properly funded.' },
        { q: 'How much can I contribute to an IUL?', a: 'Unlike qualified retirement plans, IULs have no IRS contribution limits. The maximum is set by your policy structure under IRS guidelines (TEFRA/DEFRA/TAMRA) to maintain tax-advantaged status.' },
      ],
    },
    es: {
      title: 'Seguro de Vida Universal Indexado (IUL) | Everence Wealth',
      h1: 'Seguro de Vida Universal Indexado: Crecimiento con Ventajas Fiscales y Protección',
      description: 'Acumule valor en efectivo vinculado al rendimiento de un índice del mercado con un piso del 0% que protege contra pérdidas. El IUL combina protección de vida con potencial de ingresos de jubilación libres de impuestos.',
      intro: 'El Seguro de Vida Universal Indexado (IUL) es una póliza permanente cuyo valor en efectivo está vinculado a un índice de mercado como el S&P 500. A diferencia de las inversiones directas en el mercado, el IUL ofrece un piso del 0% que protege su principal de las pérdidas del mercado al tiempo que le permite participar en el alza del mercado hasta un tope definido.',
      faqs: [
        { q: '¿Cuál es la diferencia entre un IUL y un 401(k)?', a: 'Un 401(k) ofrece crecimiento con impuestos diferidos, pero los retiros se gravan como ingresos ordinarios y están sujetos a RMD a los 73 años. Un IUL ofrece préstamos de póliza libres de impuestos, sin RMD, sin límites de contribución y un beneficio por fallecimiento libre de impuestos.' },
        { q: '¿Puedo perder dinero en un IUL?', a: 'Su valor en efectivo no puede perder dinero debido a caídas del mercado gracias al piso del 0%. Sin embargo, las tarifas de póliza pueden erosionar el valor si la póliza no está bien financiada.' },
        { q: '¿Cuánto puedo aportar a un IUL?', a: 'A diferencia de los planes de jubilación calificados, los IUL no tienen límites de contribución del IRS. El máximo lo establece la estructura de su póliza según las directrices del IRS.' },
      ],
    },
  },
  'whole-life': {
    en: {
      title: 'Whole Life Insurance | Everence Wealth',
      h1: 'Whole Life Insurance: Guaranteed Cash Value & Lifetime Protection',
      description: 'Permanent life insurance with guaranteed cash value growth, fixed premiums, and a guaranteed death benefit. A foundational asset for tax-advantaged wealth transfer.',
      intro: 'Whole life insurance is a permanent policy that provides guaranteed cash value growth, fixed level premiums, and a guaranteed death benefit for your entire life. Issued by mutual insurance carriers, participating whole life policies also pay non-guaranteed dividends that can compound your cash value, increase your death benefit, or be received as cash. Whole life is a cornerstone of multi-generational wealth planning, business succession, and tax-efficient legacy transfer.',
      faqs: [
        { q: 'How is whole life different from term life?', a: 'Term life provides coverage for a fixed period (10-30 years) with no cash value. Whole life provides lifetime coverage, builds guaranteed cash value, and pays dividends from mutual carriers — making it both protection and an asset.' },
        { q: 'Can I borrow against my whole life policy?', a: 'Yes. Policy loans are not taxable income and do not require credit approval. The cash value continues to earn dividends even on the loaned amount in many policies.' },
        { q: 'Are whole life dividends guaranteed?', a: 'No, dividends are not guaranteed, but top mutual carriers like New York Life, MassMutual, Northwestern Mutual, and Guardian have paid dividends every year for over 150 years.' },
      ],
    },
    es: {
      title: 'Seguro de Vida Entera | Everence Wealth',
      h1: 'Seguro de Vida Entera: Valor en Efectivo Garantizado y Protección Vitalicia',
      description: 'Seguro de vida permanente con crecimiento garantizado del valor en efectivo, primas fijas y un beneficio por fallecimiento garantizado.',
      intro: 'El seguro de vida entera es una póliza permanente que ofrece crecimiento garantizado del valor en efectivo, primas fijas niveladas y un beneficio por fallecimiento garantizado de por vida. Emitido por aseguradoras mutuales, las pólizas participantes también pagan dividendos no garantizados que pueden capitalizar su valor en efectivo.',
      faqs: [
        { q: '¿En qué se diferencia el seguro de vida entera del seguro de vida a término?', a: 'El seguro a término ofrece cobertura por un período fijo sin valor en efectivo. El de vida entera ofrece cobertura vitalicia, acumula valor en efectivo garantizado y paga dividendos.' },
        { q: '¿Puedo pedir prestado contra mi póliza?', a: 'Sí. Los préstamos de póliza no son ingresos imponibles y no requieren aprobación crediticia.' },
        { q: '¿Están garantizados los dividendos?', a: 'No, los dividendos no están garantizados, pero las principales aseguradoras mutuales han pagado dividendos durante más de 150 años consecutivos.' },
      ],
    },
  },
  'tax-free-retirement': {
    en: {
      title: 'Tax-Free Retirement Income Strategies | Everence Wealth',
      h1: 'Tax-Free Retirement: Build Income You Will Never Owe Taxes On',
      description: 'Combine Roth accounts, cash-value life insurance, and municipal bonds to create retirement income that is fully tax-free at the federal level — and not subject to RMDs.',
      intro: 'Tax-free retirement income strategies use a combination of Roth IRAs, Roth 401(k)s, properly structured cash-value life insurance (IUL or whole life), and municipal bonds to generate retirement income that is not subject to federal income tax. Unlike traditional 401(k) and IRA withdrawals — which are taxed as ordinary income and subject to Required Minimum Distributions at age 73 — tax-free strategies give you full control over your distributions and protect you against future tax-rate increases.',
      faqs: [
        { q: 'Why is tax-free retirement income important?', a: 'Federal tax rates are at historic lows. Most economists expect rates to rise as the national debt and entitlement obligations grow. Locking in tax-free income today protects you from paying significantly more tax in 20-30 years.' },
        { q: 'How much of my retirement should be tax-free?', a: 'Most planners recommend at least 30-50% of retirement income come from tax-free sources, with the balance from tax-deferred and taxable accounts. This is the "Three Tax Buckets" framework.' },
        { q: 'Are Roth conversions worth it?', a: 'For most pre-retirees in the 12-24% federal bracket, converting traditional IRA assets to Roth before age 73 can save tens of thousands in lifetime taxes — especially if you expect higher tax rates in retirement.' },
      ],
    },
    es: {
      title: 'Estrategias de Jubilación Libres de Impuestos | Everence Wealth',
      h1: 'Jubilación Libre de Impuestos: Construya Ingresos Que Nunca Pagarán Impuestos',
      description: 'Combine cuentas Roth, seguros de vida con valor en efectivo y bonos municipales para crear ingresos de jubilación totalmente libres de impuestos federales.',
      intro: 'Las estrategias de jubilación libres de impuestos utilizan una combinación de Roth IRAs, Roth 401(k), seguros de vida con valor en efectivo (IUL o vida entera) y bonos municipales para generar ingresos de jubilación que no están sujetos al impuesto federal sobre la renta.',
      faqs: [
        { q: '¿Por qué es importante la jubilación libre de impuestos?', a: 'Las tasas impositivas federales están en mínimos históricos. La mayoría de los economistas esperan que las tasas suban a medida que crezca la deuda nacional.' },
        { q: '¿Cuánto de mi jubilación debe ser libre de impuestos?', a: 'La mayoría de los planificadores recomiendan que al menos el 30-50% de los ingresos de jubilación provenga de fuentes libres de impuestos.' },
        { q: '¿Vale la pena hacer conversiones Roth?', a: 'Para la mayoría de las personas pre-jubiladas en categorías impositivas del 12-24%, convertir activos IRA tradicionales a Roth antes de los 73 años puede ahorrar decenas de miles en impuestos.' },
      ],
    },
  },
  'asset-protection': {
    en: {
      title: 'Asset Protection Strategies | Everence Wealth',
      h1: 'Asset Protection: Shield Your Wealth from Lawsuits, Creditors, and Taxes',
      description: 'Use trusts, life insurance, qualified retirement plans, and proper entity structuring to legally protect your assets from creditors and frivolous lawsuits.',
      intro: 'Asset protection planning uses legal structures — irrevocable trusts, properly structured life insurance, qualified retirement accounts, LLCs, and family limited partnerships — to shield personal and business wealth from creditors, lawsuits, and excessive taxation. In most US states, life insurance cash value and qualified retirement plan assets receive significant statutory protection from creditors. A properly designed asset protection plan must be in place BEFORE a claim arises — fraudulent transfer laws prevent last-minute restructuring.',
      faqs: [
        { q: 'When should I start asset protection planning?', a: 'Now. Asset protection only works if it is established before any claim or threat arises. Transfers made in anticipation of a known creditor are typically void under fraudulent transfer statutes.' },
        { q: 'Are retirement accounts protected from creditors?', a: 'Yes — ERISA-qualified plans (401(k), pension) receive unlimited federal protection. IRAs are protected up to $1,512,350 (2024) under federal bankruptcy law, with broader protection in many states.' },
        { q: 'Does life insurance protect from lawsuits?', a: 'In most states, the cash value of life insurance owned by the insured is partially or fully exempt from creditor claims. Florida, Texas, and several other states offer 100% protection.' },
      ],
    },
    es: {
      title: 'Protección de Activos | Everence Wealth',
      h1: 'Protección de Activos: Proteja Su Patrimonio de Demandas, Acreedores e Impuestos',
      description: 'Use fideicomisos, seguros de vida, planes de jubilación calificados y estructuración de entidades para proteger legalmente sus activos.',
      intro: 'La planificación de protección de activos utiliza estructuras legales — fideicomisos irrevocables, seguros de vida correctamente estructurados, cuentas de jubilación calificadas, LLC y sociedades familiares limitadas — para proteger el patrimonio personal y empresarial de acreedores, demandas e impuestos excesivos.',
      faqs: [
        { q: '¿Cuándo debo comenzar la planificación de protección de activos?', a: 'Ahora. La protección de activos solo funciona si se establece antes de que surja cualquier reclamo o amenaza.' },
        { q: '¿Las cuentas de jubilación están protegidas de los acreedores?', a: 'Sí — los planes calificados ERISA (401(k), pensión) reciben protección federal ilimitada.' },
        { q: '¿El seguro de vida protege contra demandas?', a: 'En la mayoría de los estados, el valor en efectivo del seguro de vida está parcial o totalmente exento de reclamos de acreedores.' },
      ],
    },
  },
}

function generateStrategyHtml(lang: string, slugRaw: string): string | null {
  // Normalize ES slug → EN key
  const enKey = STRATEGY_ES_TO_EN[slugRaw] || slugRaw
  const content = STRATEGY_CONTENT[enKey]
  if (!content) return null

  const c = lang === 'es' ? content.es : content.en
  const enSlug = enKey
  const esSlug = STRATEGY_EN_TO_ES[enKey] || enKey
  const canonicalPath = lang === 'es'
    ? `/es/estrategias/${esSlug}`
    : `/en/strategies/${enSlug}`
  const canonical = `${BASE_URL}${canonicalPath}`
  const altEn = `${BASE_URL}/en/strategies/${enSlug}`
  const altEs = `${BASE_URL}/es/estrategias/${esSlug}`

  const escTitle = escapeHtml(c.title)
  const escDesc = escapeHtml(c.description)
  const escH1 = escapeHtml(c.h1)

  const serviceSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    'name': c.h1,
    'description': c.description,
    'url': canonical,
    'provider': {
      '@type': 'FinancialService',
      'name': 'Everence Wealth',
      'url': BASE_URL,
    },
    'inLanguage': lang,
  })

  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': c.faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
    })),
  })

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': lang === 'es' ? 'Inicio' : 'Home', 'item': `${BASE_URL}/${lang}/` },
      { '@type': 'ListItem', 'position': 2, 'name': lang === 'es' ? 'Estrategias' : 'Strategies', 'item': `${BASE_URL}/${lang}/${lang === 'es' ? 'estrategias' : 'strategies'}` },
      { '@type': 'ListItem', 'position': 3, 'name': c.h1, 'item': canonical },
    ],
  })

  const speakableSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': c.h1,
    'speakable': { '@type': 'SpeakableSpecification', 'cssSelector': ['#speakable-summary', 'h1'] },
    'url': canonical,
  })

  const ssrStyles = generateSSRStyles()
  const langPrefix = `/${lang}`
  const stratLabel = lang === 'es' ? 'Estrategias' : 'Strategies'
  const ctaTitle = lang === 'es' ? '¿Listo para construir su futuro financiero?' : 'Ready to Build Your Financial Future?'
  const ctaText = lang === 'es' ? 'Hable con un asesor independiente de Everence Wealth.' : 'Speak with an independent Everence Wealth advisor.'
  const ctaButton = lang === 'es' ? 'Contáctenos' : 'Get in Touch'
  const faqHeading = lang === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'
  const relatedHeading = lang === 'es' ? 'Lectura relacionada' : 'Related Reading'

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  <title>${escTitle}</title>
  <meta name="title" content="${escTitle}" />
  <meta name="description" content="${escDesc}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${altEn}" />
  <link rel="alternate" hreflang="es" href="${altEs}" />
  <link rel="alternate" hreflang="x-default" href="${altEn}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escTitle}" />
  <meta property="og:description" content="${escDesc}" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${LOCALE_MAP[lang] || 'en_US'}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escTitle}" />
  <meta name="twitter:description" content="${escDesc}" />
  <script type="application/ld+json">${serviceSchema}</script>
  <script type="application/ld+json">${faqSchema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>
  <script type="application/ld+json">${speakableSchema}</script>
  ${ssrStyles}
</head>
<body>
  <header class="site-header">
    <nav class="nav-container">
      <a href="${langPrefix}/" class="logo-link">
        <img src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" alt="Everence Wealth" class="logo">
      </a>
      <div class="nav-links">
        <a href="${langPrefix}/${lang === 'es' ? 'estrategias' : 'strategies'}/iul">${stratLabel}</a>
        <a href="${langPrefix}/blog">Blog</a>
        <a href="${langPrefix}/qa">Q&amp;A</a>
        <a href="${langPrefix}/${lang === 'es' ? 'contacto' : 'contact'}">${lang === 'es' ? 'Contacto' : 'Contact'}</a>
      </div>
    </nav>
  </header>
  <main class="article-container">
    <article itemscope itemtype="https://schema.org/FinancialProduct">
      <header class="article-header">
        <h1 itemprop="name">${escH1}</h1>
      </header>
      <div class="speakable-summary speakable-answer" id="speakable-summary" itemprop="description">
        <p>${escapeHtml(c.description)}</p>
      </div>
      <div class="article-content" itemprop="description">
        <p>${escapeHtml(c.intro)}</p>
      </div>
      <section class="faq-section">
        <h2>${faqHeading}</h2>
        ${c.faqs.map(f => `
        <details class="faq-item">
          <summary>${escapeHtml(f.q)}</summary>
          <p>${escapeHtml(f.a)}</p>
        </details>`).join('')}
      </section>
      <nav class="internal-links-section" aria-label="Related strategies">
        <h3>${relatedHeading}</h3>
        <ul>
          ${Object.keys(STRATEGY_CONTENT).filter(k => k !== enKey).map(k => {
            const slug = lang === 'es' ? (STRATEGY_EN_TO_ES[k] || k) : k
            const label = lang === 'es' ? STRATEGY_CONTENT[k].es.h1 : STRATEGY_CONTENT[k].en.h1
            return `<li><a href="${langPrefix}/${lang === 'es' ? 'estrategias' : 'strategies'}/${slug}">${escapeHtml(label)}</a></li>`
          }).join('\n          ')}
        </ul>
      </nav>
      <div class="cta-section">
        <h3>${ctaTitle}</h3>
        <p>${ctaText}</p>
        <a href="${langPrefix}/${lang === 'es' ? 'contacto' : 'contact'}" class="cta-button">${ctaButton}</a>
      </div>
    </article>
  </main>
  <footer class="site-footer">
    <div class="footer-content">
      <p>&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`
}

// ============================================================
// HOMEPAGE SSR
// ============================================================
function generateHomeHtml(lang: 'en' | 'es'): string {
  const isEs = lang === 'es'
  const title = isEs
    ? 'Everence Wealth | Asesoría Financiera Independiente y Seguros de Vida'
    : 'Everence Wealth | Independent Financial Advisory & Life Insurance'
  const description = isEs
    ? 'Asesoría financiera independiente especializada en estrategias de jubilación libres de impuestos, seguros de vida con valor en efectivo y protección de activos.'
    : 'Independent financial advisory specializing in tax-free retirement strategies, cash-value life insurance, and asset protection. Bridge the retirement gap with proven wealth-building frameworks.'
  const h1 = isEs
    ? 'Cierre la Brecha de la Jubilación con Estrategias Probadas de Riqueza'
    : 'Bridge the Retirement Gap with Proven Wealth Strategies'
  const intro = isEs
    ? 'Everence Wealth es una firma de asesoría financiera independiente que ayuda a familias y profesionales a construir riqueza con ventajas fiscales mediante seguros de vida con valor en efectivo, estrategias de jubilación Roth y planificación de protección de activos.'
    : 'Everence Wealth is an independent financial advisory firm helping families and professionals build tax-advantaged wealth through cash-value life insurance, Roth retirement strategies, and asset protection planning.'

  const canonical = `${BASE_URL}/${lang}/`
  const altEn = `${BASE_URL}/en/`
  const altEs = `${BASE_URL}/es/`

  const orgSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    'name': 'Everence Wealth',
    'url': BASE_URL,
    'logo': 'https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png',
    'description': description,
    'sameAs': [],
    'areaServed': { '@type': 'Country', 'name': 'United States' },
  })

  const websiteSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Everence Wealth',
    'url': BASE_URL,
    'inLanguage': [lang],
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${BASE_URL}/${lang}/qa?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  })

  const faqs = isEs ? [
    { q: '¿Qué es Everence Wealth?', a: 'Everence Wealth es una firma de asesoría financiera independiente especializada en estrategias de jubilación libres de impuestos, seguros de vida con valor en efectivo y protección de activos.' },
    { q: '¿Trabajan con clientes en todo Estados Unidos?', a: 'Sí. Trabajamos con familias y profesionales en los 50 estados a través de reuniones virtuales seguras.' },
    { q: '¿Cómo cobran sus servicios?', a: 'Como asesores independientes, nuestros servicios de planificación y estrategia generalmente son sin costo para el cliente; somos compensados por las compañías de seguros cuando un producto es adecuado.' },
  ] : [
    { q: 'What is Everence Wealth?', a: 'Everence Wealth is an independent financial advisory firm specializing in tax-free retirement strategies, cash-value life insurance, and asset protection planning.' },
    { q: 'Do you work with clients nationwide?', a: 'Yes. We work with families and professionals in all 50 states through secure virtual meetings.' },
    { q: 'How do you charge for your services?', a: 'As independent advisors, our planning and strategy services are typically no-cost to the client; we are compensated by insurance carriers when a product is appropriate.' },
  ]

  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question', 'name': f.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
    })),
  })

  const speakableSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': h1,
    'speakable': { '@type': 'SpeakableSpecification', 'cssSelector': ['#speakable-summary', 'h1'] },
    'url': canonical,
  })

  const escTitle = escapeHtml(title)
  const escDesc = escapeHtml(description)
  const escH1 = escapeHtml(h1)
  const langPrefix = `/${lang}`
  const ssrStyles = generateSSRStyles()
  const stratLabel = isEs ? 'Estrategias' : 'Strategies'

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  <title>${escTitle}</title>
  <meta name="description" content="${escDesc}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${altEn}" />
  <link rel="alternate" hreflang="es" href="${altEs}" />
  <link rel="alternate" hreflang="x-default" href="${altEn}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escTitle}" />
  <meta property="og:description" content="${escDesc}" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${LOCALE_MAP[lang] || 'en_US'}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escTitle}" />
  <meta name="twitter:description" content="${escDesc}" />
  <script type="application/ld+json">${orgSchema}</script>
  <script type="application/ld+json">${websiteSchema}</script>
  <script type="application/ld+json">${faqSchema}</script>
  <script type="application/ld+json">${speakableSchema}</script>
  ${ssrStyles}
</head>
<body>
  <header class="site-header">
    <nav class="nav-container">
      <a href="${langPrefix}/" class="logo-link">
        <img src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" alt="Everence Wealth" class="logo">
      </a>
      <div class="nav-links">
        <a href="${langPrefix}/${isEs ? 'estrategias' : 'strategies'}/iul">${stratLabel}</a>
        <a href="${langPrefix}/blog">Blog</a>
        <a href="${langPrefix}/qa">Q&amp;A</a>
        <a href="${langPrefix}/${isEs ? 'contacto' : 'contact'}">${isEs ? 'Contacto' : 'Contact'}</a>
      </div>
    </nav>
  </header>
  <main class="article-container">
    <article>
      <header class="article-header">
        <h1>${escH1}</h1>
      </header>
      <div class="speakable-summary speakable-answer" id="speakable-summary">
        <p>${escDesc}</p>
      </div>
      <div class="article-content">
        <p>${escapeHtml(intro)}</p>
      </div>
      <section class="faq-section">
        <h2>${isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}</h2>
        ${faqs.map(f => `
        <details class="faq-item">
          <summary>${escapeHtml(f.q)}</summary>
          <p>${escapeHtml(f.a)}</p>
        </details>`).join('')}
      </section>
      <nav class="internal-links-section" aria-label="Explore">
        <h3>${isEs ? 'Explorar' : 'Explore'}</h3>
        <ul>
          <li><a href="${langPrefix}/${isEs ? 'estrategias' : 'strategies'}/iul">${isEs ? 'Seguro de Vida Universal Indexado (IUL)' : 'Indexed Universal Life Insurance (IUL)'}</a></li>
          <li><a href="${langPrefix}/${isEs ? 'estrategias' : 'strategies'}/${isEs ? 'seguro-vida-entera' : 'whole-life'}">${isEs ? 'Seguro de Vida Entera' : 'Whole Life Insurance'}</a></li>
          <li><a href="${langPrefix}/${isEs ? 'estrategias' : 'strategies'}/${isEs ? 'retiro-libre-impuestos' : 'tax-free-retirement'}">${isEs ? 'Jubilación Libre de Impuestos' : 'Tax-Free Retirement'}</a></li>
          <li><a href="${langPrefix}/${isEs ? 'estrategias' : 'strategies'}/${isEs ? 'proteccion-de-activos' : 'asset-protection'}">${isEs ? 'Protección de Activos' : 'Asset Protection'}</a></li>
          <li><a href="${langPrefix}/blog">${isEs ? 'Blog' : 'Blog'}</a></li>
          <li><a href="${langPrefix}/qa">${isEs ? 'Preguntas y Respuestas' : 'Questions &amp; Answers'}</a></li>
        </ul>
      </nav>
      <div class="cta-section">
        <h3>${isEs ? '¿Listo para empezar?' : 'Ready to Get Started?'}</h3>
        <p>${isEs ? 'Hable con un asesor independiente hoy.' : 'Speak with an independent advisor today.'}</p>
        <a href="${langPrefix}/${isEs ? 'contacto' : 'contact'}" class="cta-button">${isEs ? 'Contáctenos' : 'Get in Touch'}</a>
      </div>
    </article>
  </main>
  <footer class="site-footer">
    <div class="footer-content">
      <p>&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`
}

/**
 * Main request handler with timeout protection
 */
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.searchParams.get('path')
  
  // If no path parameter, check if this looks like a missing path error
  if (!path) {
    return new Response(
      JSON.stringify({ error: 'Missing path parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log(`[SEO] Processing path: ${path}`)

  // ============================================================
  // HUB / INDEX PAGE DETECTION (Fix 9, 2026-04-24)
  // Routes /blog, /qa, /locations, /compare hubs (and Spanish
  // aliases /ubicaciones, /comparar, /comparisons) to a DB-backed,
  // cached SSR renderer. Must come BEFORE content slug parsing.
  // ============================================================
  const hubMatch = path.match(
    /^\/(en|es)\/(blog|qa|locations|ubicaciones|compare|comparar|comparisons)\/?$/
  )
  if (hubMatch) {
    const [, lang, rawHub] = hubMatch
    // Normalize Spanish aliases back to canonical hub_type values
    const hubTypeMap: Record<string, HubType> = {
      blog: 'blog',
      qa: 'qa',
      locations: 'locations',
      ubicaciones: 'locations',
      compare: 'compare',
      comparar: 'compare',
      comparisons: 'compare',
    }
    const hubType = hubTypeMap[rawHub]
    console.log(`[SEO] Detected hub page: lang=${lang}, raw=${rawHub}, type=${hubType}`)

    try {
      const supabase = createTimeoutClient()
      const hubHtml = await generateHubPageHtmlAsync(supabase, lang, hubType)
      return new Response(hubHtml, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
          'X-SEO-Source': 'edge-function-ssr',
          'X-SSR-Source': 'edge-function-ssr',
          'X-SSR-Schema': 'injected=true',
          'X-Content-Language': lang,
          'X-Hub-Type': hubType,
        }
      })
    } catch (e) {
      console.error(`[SEO] Hub render failed for ${hubType}:${lang}:`, e)
      // Fall through to existing handlers / fallback HTML
    }
  }

  // ============================================================
  // BUYERS GUIDE PAGE DETECTION: Handle /{lang}/buyers-guide
  // Must come BEFORE the content slug parsing
  // ============================================================
  const buyersGuideMatch = path.match(/^\/(\w{2})\/buyers-guide\/?$/)
  if (buyersGuideMatch) {
    const [, lang] = buyersGuideMatch
    console.log(`[SEO] Detected Buyers Guide page: lang=${lang}`)
    
    // Generate full SEO HTML for buyers guide page
    const buyersGuideHtml = generateBuyersGuidePageHtml(lang)
    
    return new Response(buyersGuideHtml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-SEO-Source': 'edge-function-buyers-guide',
        'X-SSR-Schema': 'injected=true'
      }
    })
  }

  // ============================================================
  // STRATEGY DETAIL: /{lang}/strategies/{slug} or /es/estrategias/{slug}
  // Hardcoded BOFU money-pages — emit full SSR with H1, body, schemas
  // ============================================================
  const strategyMatch = path.match(/^\/(en|es)\/(strategies|estrategias)\/([a-z0-9-]+)\/?$/i)
  if (strategyMatch) {
    const [, lang, , slugRaw] = strategyMatch
    const slug = slugRaw.toLowerCase()
    console.log(`[SEO] Detected strategy detail: lang=${lang}, slug=${slug}`)
    const html = generateStrategyHtml(lang, slug)
    if (html) {
      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-SEO-Source': 'edge-function-strategy',
          'X-SSR-Schema': 'injected=true',
          'X-Content-Language': lang,
        }
      })
    }
  }

  // ============================================================
  // HOMEPAGE: /, /en, /en/, /es, /es/
  // Emit Organization + WebSite + FAQPage schemas with visible H1
  // ============================================================
  const homeMatch = path.match(/^\/(en|es)?\/?$/)
  if (homeMatch) {
    const lang = (homeMatch[1] || 'en') as 'en' | 'es'
    console.log(`[SEO] Detected homepage: lang=${lang}`)
    const html = generateHomeHtml(lang)
    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-SEO-Source': 'edge-function-home',
        'X-SSR-Schema': 'injected=true',
        'X-Content-Language': lang,
      }
    })
  }

  // Parse the path: /{lang}/{type}/{slug}
  const pathMatch = path.match(/^\/(\w{2})\/(qa|blog|compare|locations)\/(.+)$/)
  
  // If parsing fails, check if it LOOKS like a content pattern
  // If yes → assume deleted content → return 410 Gone
  // If no → return 400 Bad Request
  if (!pathMatch) {
    const contentCheck = isContentPathPattern(path)
    
    if (contentCheck) {
      // This looks like a content URL but we couldn't parse the slug
      // Treat as deleted/ghost content → 410 Gone
      console.log(`[SEO] WRECKING BALL: Malformed content path "${path}" → returning 410 Gone`)
      return new Response(
        generate410GoneHtml(contentCheck.lang),
        { 
          status: 410, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html; charset=utf-8',
            'X-Robots-Tag': 'noindex',
            'X-Wrecking-Ball': 'malformed-path'
          } 
        }
      )
    }
    
    // Not a content pattern at all → 400 Bad Request
    return new Response(
      JSON.stringify({ error: 'Invalid path format. Expected: /{lang}/{type}/{slug}' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const [, lang, contentType, rawSlug] = pathMatch
  
  // Normalize the slug to handle malformed URLs from copy-paste errors
  const slug = normalizeSlug(rawSlug)
  console.log(`[SEO] Parsed: lang=${lang}, type=${contentType}, slug=${slug}${slug !== rawSlug ? ` (normalized from "${rawSlug}")` : ''}`)

  // Check cache first (before any DB calls)
  const cacheKey = `${contentType}:${lang}:${slug}`
  const cachedResponse = getCachedPage(cacheKey)
  if (cachedResponse) {
    console.log(`[SEO] Returning cached response for ${cacheKey}`)
    return cachedResponse
  }

  // Initialize Supabase client WITH timeout handling
  const supabase = createTimeoutClient()

  // Fetch metadata based on content type
  let metadata: PageMetadata | null = null
  let redirectInfo: { to: string; reason: string } | undefined
  
  switch (contentType) {
    case 'qa': {
      const qaResult = await fetchQAMetadata(supabase, slug, lang)
      metadata = qaResult.metadata
      redirectInfo = qaResult.redirect
      break
    }
    case 'blog': {
      const blogResult = await fetchBlogMetadata(supabase, slug, lang)
      metadata = blogResult.metadata
      redirectInfo = blogResult.redirect
      break
    }
    case 'compare': {
      const compareResult = await fetchComparisonMetadata(supabase, slug, lang)
      metadata = compareResult.metadata
      redirectInfo = compareResult.redirect
      break
    }
    case 'locations': {
      const locationResult = await fetchLocationMetadata(supabase, slug, lang)
      metadata = locationResult.metadata
      redirectInfo = locationResult.redirect
      break
    }
  }

  // Language mismatch with valid translation → 301 Permanent Redirect
  if (redirectInfo) {
    const redirectUrl = `${BASE_URL}${redirectInfo.to}`
    console.log(`[SEO] Language mismatch - 301 redirecting to: ${redirectUrl} (${redirectInfo.reason})`)
    
    return new Response(null, {
      status: 301,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
        'X-Redirect-Reason': redirectInfo.reason,
        'Cache-Control': 'public, max-age=31536000', // Cache 301 for 1 year
      }
    })
  }

  // ============================================================
  // WRECKING BALL POLICY: Content not found → 410 Gone
  // This is a ghost page that should be de-indexed immediately
  // ============================================================
  if (!metadata) {
    console.log(`[SEO] WRECKING BALL: Content not found "${path}" → returning 410 Gone`)
    return new Response(
      generate410GoneHtml(lang),
      { 
        status: 410, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex',
          'X-Wrecking-Ball': 'content-not-found'
        } 
      }
    )
  }

  // ============================================================
  // WRECKING BALL POLICY: Language Mismatch Check → 410 Gone
  // If the URL's language prefix doesn't match the content's actual language
  // ============================================================
  if (metadata.language && metadata.language !== lang) {
    console.log(`[SEO] WRECKING BALL: Language mismatch ${lang} vs ${metadata.language} for ${path} → returning 410 Gone`)
    return new Response(
      generate410GoneHtml(lang),
      { 
        status: 410, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex',
          'X-Wrecking-Ball': `language-mismatch:${lang}->${metadata.language}`
        } 
      }
    )
  }

  // ============================================================
  // WRECKING BALL POLICY: Check for empty content → 410 Gone
  // Prevents indexing of "ghost pages" with null/placeholder content
  // Extended to cover ALL content types (blog, qa, compare, locations)
  // ============================================================
  let hasEmptyContent = false
  let contentField = ''
  
  if (contentType === 'blog') {
    const { data } = await supabase
      .from('blog_articles')
      .select('detailed_content')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    hasEmptyContent = isEmptyContent(data?.detailed_content)
    contentField = 'detailed_content'
  } else if (contentType === 'qa') {
    // Optimization: if metadata already has answer_main (from fetchQAMetadata),
    // skip the redundant DB query to eliminate one round-trip
    if (metadata?.answer_main !== undefined) {
      hasEmptyContent = isEmptyContent(metadata.answer_main)
    } else {
      const { data } = await supabase
        .from('qa_pages')
        .select('answer_main')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      hasEmptyContent = isEmptyContent(data?.answer_main)
    }
    contentField = 'answer_main'
  } else if (contentType === 'compare') {
    const { data } = await supabase
      .from('comparison_pages')
      .select('final_verdict, speakable_answer, side_by_side_breakdown')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    hasEmptyContent = isEmptyContent(data?.final_verdict) && isEmptyContent(data?.speakable_answer) && isEmptyContent(data?.side_by_side_breakdown)
    contentField = 'final_verdict/speakable_answer/side_by_side_breakdown'
  } else if (contentType === 'locations') {
    // Location pages use city_slug/topic_slug format
    const slugParts = slug.split('/')
    if (slugParts.length >= 2) {
      const [citySlug, topicSlug] = slugParts
      const { data } = await supabase
        .from('location_pages')
        .select('location_overview, speakable_answer')
        .eq('city_slug', citySlug)
        .eq('topic_slug', topicSlug)
        .eq('language', lang)
        .eq('status', 'published')
        .maybeSingle()
      hasEmptyContent = isEmptyContent(data?.location_overview) && isEmptyContent(data?.speakable_answer)
      contentField = 'location_overview/speakable_answer'
    }
  }
  
  if (hasEmptyContent) {
    console.log(`[SEO] WRECKING BALL: Empty ${contentField} for ${contentType}/${slug} → returning 410 Gone`)
    return new Response(
      generate410GoneHtml(lang), 
      { 
        status: 410, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex',
          'X-Wrecking-Ball': 'empty-content'
        } 
      }
    )
  }

  console.log(`[SEO] Found metadata for: ${metadata.headline}`)

  // Fetch hreflang siblings
  const siblings = await fetchHreflangSiblings(supabase, metadata.hreflang_group_id || '', contentType)
  const hreflangTags = generateHreflangTags(siblings, metadata.language, contentType)

  // Return full SSR HTML or JSON based on query param
  const returnHtml = url.searchParams.get('html') === 'true'
  
  if (returnHtml) {
    // Generate full SSR HTML with actual content (not empty React shell)
    const fullHtml = generateFullHtml(metadata, hreflangTags, '')
    
    const response = new Response(fullHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-SEO-Source': 'edge-function-ssr',
        'X-SSR-Schema': 'injected=true',
        'X-Content-Language': metadata.language,
      }
    })
    
    // Cache the successful HTML response
    setCachedPage(cacheKey, response.clone())
    return response
  }

  // Return metadata as JSON (useful for debugging)
  const jsonResponse = new Response(
    JSON.stringify({
      success: true,
      metadata: {
        language: metadata.language,
        locale: LOCALE_MAP[metadata.language] || 'en_GB',
        title: metadata.meta_title,
        description: metadata.meta_description,
        canonical: metadata.canonical_url,
        headline: metadata.headline,
        image: metadata.featured_image_url,
        datePublished: metadata.date_published,
        dateModified: metadata.date_modified,
        contentType,
      },
      hreflangTags: hreflangTags.split('\n').map(t => t.trim()).filter(Boolean),
      schemas: {
        faq: metadata.qa_entities?.length || 0,
        article: true,
        speakable: !!metadata.speakable_answer,
      },
      siblings: siblings.map(s => ({
        language: s.language,
        url: s.canonical_url || `${BASE_URL}/${s.language}/${contentType}/${s.slug}`
      }))
    }, null, 2),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
  
  // Cache the successful JSON response
  setCachedPage(cacheKey, jsonResponse.clone())
  return jsonResponse
}

// ============================================================
// MAIN ENTRY POINT with timeout protection and fallback HTML
// Always returns 200 OK with HTML - never 503/524 errors
// ============================================================
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)

  // Create fallback response for timeouts/errors
  const fallbackResponse = new Response(
    generateFallbackHTML(url),
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-SEO-Fallback': 'timeout',
        ...corsHeaders
      }
    }
  )

  // Circuit breaker check - return fallback HTML instead of 503
  if (isCircuitOpen()) {
    console.log('[SEO] Circuit breaker open - returning fallback HTML')
    return new Response(
      generateFallbackHTML(url),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
          'X-SEO-Fallback': 'circuit-breaker',
          ...corsHeaders
        }
      }
    )
  }

  try {
    // Wrap the request with 8-second timeout protection
    const result = await withTimeout(
      handleRequest(req),
      15000, // 15 second timeout (increased from 8s for cold starts + multiple DB queries)
      fallbackResponse
    )

    // Success - reset circuit breaker
    recordSuccess()
    return result

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[SEO] Error: ${errorMessage}`)
    recordFailure()
    
    // Always return fallback HTML on any error - never 500/503
    return new Response(
      generateFallbackHTML(url),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
          'X-SEO-Fallback': 'error',
          ...corsHeaders
        }
      }
    )
  }
})
