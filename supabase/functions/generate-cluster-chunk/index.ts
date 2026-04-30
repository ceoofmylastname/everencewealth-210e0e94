import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// Helper to safely extract JSON from response
function extractJsonFromResponse(text: string): any {
  // P1 — Robust JSON extraction. Claude sometimes wraps JSON in ```json fences,
  // adds prose preamble, or includes BOM/zero-width chars. Strategy:
  //   1. Trim + strip BOM/zero-width prefix.
  //   2. Try direct JSON.parse on the cleaned text.
  //   3. Try EVERY fenced code block in order (```json ... ``` then ``` ... ```).
  //   4. Fall back to first '{' .. last '}' substring slice.
  //   5. Throw with a diagnostic snippet so failures are debuggable.
  const original = text || '';
  const cleaned = original
    .replace(/^\uFEFF/, '')         // BOM
    .replace(/^[\u200B-\u200D]+/, '') // zero-width chars
    .trim();

  // 2. Direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) { /* fall through */ }

  // 3. Walk every fenced block (some responses contain multiple fences)
  const fenceRegex = /```(?:json|JSON)?\s*([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRegex.exec(cleaned)) !== null) {
    const inner = (m[1] || '').trim();
    if (!inner) continue;
    try {
      return JSON.parse(inner);
    } catch (_) { /* try next fence */ }
  }

  // 3b. UNCLOSED fence — Claude truncated mid-stream (max_tokens hit or stream
  // cut). Strip leading ```json\n and try to parse the remainder.
  const openFenceMatch = cleaned.match(/^```(?:json|JSON)?\s*\n?/);
  if (openFenceMatch) {
    const stripped = cleaned.slice(openFenceMatch[0].length).trim();
    try { return JSON.parse(stripped); } catch (_) { /* fall through */ }
  }

  // 4. First '{' .. last '}' substring
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } catch (_) { /* fall through */ }
  }

  // 5. Diagnostic
  const snippet = cleaned.slice(0, 300).replace(/\s+/g, ' ');
  throw new Error(`Could not extract valid JSON from response. First 300 chars: ${snippet}`);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHUNK_SIZE = 1; // One article per chunk to prevent timeouts
const MAX_CHUNK_RUNTIME = 4 * 60 * 1000; // 4 minutes per chunk (safety margin)
// 4 min per Claude call — Sonnet legitimately needs this for 1,500-2,500 word
// HTML articles + 25k-char master prompt + 5-8 FAQs + JSON wrapping.
const CLAUDE_TIMEOUT_MS = 480_000;

// SSE inactivity budget: kill the stream if no token arrives for this long.
// A healthy Sonnet stream emits a delta every few hundred ms; 60s of silence
// means the connection is wedged, not slow. Replaces the buffered single-shot
// timeout with something that lets long-but-active responses finish while
// killing dead ones fast.
const SSE_INACTIVITY_MS = 60_000;
// Hard ceiling on a single SSE call. Even a healthy stream should not exceed
// this — if it does, something pathological is happening (Sonnet stuck in a
// loop, prompt 10x too long, etc.).
const SSE_HARD_TIMEOUT_MS = 8 * 60 * 1000; // 8 min

// Heartbeat: log + persist last activity to cluster_generations.progress
// so frontend dialog & log tail both show where the worker actually is.
// IMPORTANT: merges with existing progress instead of overwriting. The v4
// post-mortem showed partial_failures writes clobbered every heartbeat, leaving
// us with zero stop_reason data. Read-modify-write here keeps both alive.
async function heartbeat(supabase: any, jobId: string, msg: string, extra?: Record<string, any>) {
  console.log(`[heartbeat] ${msg}`);
  try {
    const { data: cur } = await supabase
      .from('cluster_generations')
      .select('progress')
      .eq('id', jobId)
      .maybeSingle();
    const merged = {
      ...(cur?.progress ?? {}),
      last_heartbeat: msg,
      ts: new Date().toISOString(),
      ...(extra ?? {}),
    };
    await supabase
      .from('cluster_generations')
      .update({
        progress: merged,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  } catch (e) {
    // Heartbeat must never break generation
    console.warn('[heartbeat] update failed:', (e as any)?.message);
  }
}

// Fetch wrapper that converts AbortError → "claude_timeout" so callers can pattern-match.
async function fetchClaudeWithTimeout(url: string, init: RequestInit, timeoutMs = CLAUDE_TIMEOUT_MS): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    const name = (err as any)?.name;
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new Error('claude_timeout');
    }
    throw err;
  }
}

// Stream Claude response via SSE. Returns full accumulated text + stop_reason.
// Heartbeats every ~2s with chars_received so the dashboard shows real progress
// instead of an 8-minute black box. Inactivity timeout kills wedged connections
// fast; hard timeout caps total runtime.
async function streamClaude(
  supabase: any,
  jobId: string,
  articleNum: number,
  attempt: number,
  body: Record<string, any>,
  apiKey: string,
): Promise<{ text: string; stopReason: string; httpStatus: number; errorText?: string }> {
  const controller = new AbortController();
  const hardTimer = setTimeout(() => controller.abort(new Error('sse_hard_timeout')), SSE_HARD_TIMEOUT_MS);
  let inactivityTimer: ReturnType<typeof setTimeout> | undefined;
  const resetInactivity = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => controller.abort(new Error('sse_inactivity')), SSE_INACTIVITY_MS);
  };

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, stream: true }),
      signal: controller.signal,
    });

    if (!resp.ok || !resp.body) {
      const errorText = await resp.text().catch(() => '');
      return { text: '', stopReason: 'http_error', httpStatus: resp.status, errorText };
    }

    resetInactivity();
    const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    let accumulated = '';
    let stopReason = 'unknown';
    let lastHeartbeatChars = 0;
    let lastHeartbeatAt = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resetInactivity();
      buffer += value;

      // SSE frames are separated by blank lines. Each frame has lines like:
      //   event: content_block_delta
      //   data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"..."}}
      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        for (const line of frame.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              accumulated += evt.delta.text || '';
            } else if (evt.type === 'message_delta' && evt.delta?.stop_reason) {
              stopReason = evt.delta.stop_reason;
            } else if (evt.type === 'message_stop') {
              // terminal event
            } else if (evt.type === 'error') {
              return {
                text: accumulated,
                stopReason: 'stream_error',
                httpStatus: 200,
                errorText: JSON.stringify(evt.error ?? evt),
              };
            }
          } catch {
            // Unparseable SSE payload — skip
          }
        }
      }

      // Heartbeat at most every 2s OR every 2KB of new text, whichever comes first
      const now = Date.now();
      const newChars = accumulated.length - lastHeartbeatChars;
      if (now - lastHeartbeatAt > 2000 || newChars > 2048) {
        await heartbeat(
          supabase,
          jobId,
          `claude:stream article=${articleNum} attempt=${attempt} chars=${accumulated.length} stop_reason=${stopReason}`,
          { stream_chars: accumulated.length, stream_stop_reason: stopReason, stream_article: articleNum, stream_attempt: attempt },
        );
        lastHeartbeatChars = accumulated.length;
        lastHeartbeatAt = now;
      }
    }

    return { text: accumulated, stopReason, httpStatus: resp.status };
  } catch (err) {
    const reason = (err as any)?.message || String(err);
    if (reason === 'sse_inactivity') throw new Error('claude_timeout');
    if (reason === 'sse_hard_timeout') throw new Error('claude_timeout');
    throw err;
  } finally {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    clearTimeout(hardTimer);
  }
}

// Persist a full Claude response on parse/timeout/api failure for forensics.
// Stores the COMPLETE raw text (no 300-char truncation) so we can post-mortem
// whether the failure was truncation, escape corruption, or wrong content shape.
async function recordGenerationFailure(
  supabase: any,
  args: {
    generationId: string;
    clusterId: string | null;
    articleIndex: number;
    attempt: number;
    failureKind: 'parse' | 'timeout' | 'api_error' | 'validation';
    stopReason?: string | null;
    rawResponse?: string | null;
    errorMessage?: string | null;
    promptContext?: Record<string, any>;
  },
) {
  try {
    await supabase.from('cluster_generation_failures').insert({
      generation_id: args.generationId,
      cluster_id: args.clusterId,
      article_index: args.articleIndex,
      attempt: args.attempt,
      failure_kind: args.failureKind,
      stop_reason: args.stopReason ?? null,
      text_len: args.rawResponse?.length ?? null,
      raw_response: args.rawResponse ?? null,
      error_message: args.errorMessage ?? null,
      prompt_context: args.promptContext ?? {},
    });
  } catch (e) {
    console.warn('[recordGenerationFailure] insert failed (non-fatal):', (e as any)?.message);
  }
}

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Helper function to filter citations against approved domains
async function filterCitations(
  supabase: any,
  citations: any[],
  jobId: string,
  articleNum: number
): Promise<{ filtered: any[]; blocked: any[] }> {
  if (!citations || citations.length === 0) {
    return { filtered: citations, blocked: [] };
  }

  const { data: approvedDomains, error } = await supabase
    .from('approved_domains')
    .select('domain')
    .eq('is_allowed', true);

  if (error) {
    console.error(`[Job ${jobId}] Error fetching approved domains:`, error);
    return { filtered: citations, blocked: [] };
  }

  const approvedSet = new Set(
    (approvedDomains || []).map((d: any) => d.domain.toLowerCase())
  );

  const filtered: any[] = [];
  const blocked: any[] = [];

  for (const citation of citations) {
    const domain = extractDomain(citation.url);
    if (approvedSet.has(domain.toLowerCase())) {
      filtered.push(citation);
    } else {
      blocked.push({ domain, url: citation.url, source: citation.source || citation.sourceName });
    }
  }

  if (blocked.length > 0) {
    console.warn(`[Job ${jobId}] Blocked ${blocked.length} citations for article ${articleNum}`);
  }

  return { filtered, blocked };
}

// Count words in HTML content
function countWords(html: string): number {
  const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// FIX A — Sanitization safety net.
// Mirrors BOTH sibling DB CHECK constraints on blog_articles.detailed_content:
//   - blog_articles_body_no_head_h1   : forbids <head…> and <h1…>
//   - blog_articles_body_no_head_or_canonical : forbids <head>, </head>,
//       rel="canonical"|'canonical', rel="alternate"|'alternate', application/ld+json
// Also strips other document-level wrappers we never want in body content.
function sanitizeDetailedContent(html: string): { cleaned: string; removed: string[] } {
  const removed: string[] = [];
  let cleaned = html || '';

  // Bug 5 strike-2: gate-free always-replace pattern. The previous
  // "if test() then replace" allowed silent misses on whitespace edge cases.
  const stripIfChanged = (label: string, regex: RegExp, replacement: string | ((...a: any[]) => string) = '') => {
    const before = cleaned;
    cleaned = cleaned.replace(regex, replacement as any);
    if (cleaned !== before) removed.push(label);
  };

  stripIfChanged('head_block', /<head\b[\s\S]*?<\/head>/gi);
  stripIfChanged('head_stray', /<\/?head\b[^>]*>/gi);
  stripIfChanged('html_wrapper', /<\/?html\b[^>]*>/gi);
  stripIfChanged('body_wrapper', /<\/?body\b[^>]*>/gi);
  stripIfChanged('h1_downgraded', /<(\/?)h1\b([^>]*)>/gi, (_m: string, slash: string, attrs: string) => `<${slash}h2${attrs}>`);
  stripIfChanged('meta_tags', /<meta\b[^>]*>/gi);
  stripIfChanged('link_canonical_alternate', /<link\b[^>]*rel\s*=\s*["']?(canonical|alternate)["']?[^>]*>/gi);
  stripIfChanged('jsonld_block', /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>[\s\S]*?<\/script>/gi);
  stripIfChanged('style_block', /<style\b[\s\S]*?<\/style>/gi);

  return { cleaned: cleaned.trim(), removed };
}

// Bug 5 strike-2: forensic helpers (mirror generate-missing-articles).
function findConstraintOffenders(html: string): string[] {
  if (!html) return [];
  const offenders: string[] = [];
  const h1 = html.match(/<h1[\s>][^>]{0,200}/gi);
  const head = html.match(/<head[\s>][^>]{0,200}/gi);
  if (h1) offenders.push(`H1[${h1.length}]: ${h1.slice(0, 3).join(' || ')}`);
  if (head) offenders.push(`HEAD[${head.length}]: ${head.slice(0, 3).join(' || ')}`);
  return offenders;
}

function nuclearStrip(html: string): string {
  return (html || '')
    .replace(/<(\/?)h1\b([^>]*)>/gi, (_m, slash, attrs) => `<${slash}h2${attrs}>`)
    .replace(/<\/?head\b[^>]*>/gi, '');
}

// FIX C — Pre-insert validation mirror.
// After sanitization, verify NOTHING the DB CHECK constraints reject remains.
// Throw a descriptive error so the gen fails fast with a clear cause instead
// of a generic "violates check constraint" Postgres error.
function validateNoForbiddenTags(html: string): void {
  if (!html) return;

  // Mirror blog_articles_body_no_head_h1
  if (/<head[\s>]/i.test(html)) {
    throw new Error('db:validate:fail pattern=head_open_tag (sanitizer regression)');
  }
  if (/<h1[\s>]/i.test(html)) {
    throw new Error('db:validate:fail pattern=h1_tag (sanitizer regression)');
  }

  // Mirror blog_articles_body_no_head_or_canonical
  const lower = html.toLowerCase();
  if (lower.includes('<head>') || lower.includes('</head>')) {
    throw new Error('db:validate:fail pattern=head_block (sanitizer regression)');
  }
  if (lower.includes('rel="canonical"') || lower.includes("rel='canonical'")) {
    throw new Error('db:validate:fail pattern=rel_canonical (sanitizer regression)');
  }
  if (lower.includes('rel="alternate"') || lower.includes("rel='alternate'")) {
    throw new Error('db:validate:fail pattern=rel_alternate (sanitizer regression)');
  }
  if (lower.includes('application/ld+json')) {
    throw new Error('db:validate:fail pattern=jsonld (sanitizer regression)');
  }
}

// Content quality validation with strict word count enforcement
function validateContentQuality(article: any, plan: any): { isValid: boolean; issues: string[]; score: number; wordCount: number } {
  const issues: string[] = [];
  let score = 100;
  
  const headlineWords = plan.headline.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const contentLower = article.detailed_content.toLowerCase();
  const mentionedWords = headlineWords.filter((w: string) => contentLower.includes(w)).length;
  
  if (mentionedWords < headlineWords.length * 0.5) {
    issues.push('Content may not fully address headline topic');
    score -= 15;
  }
  
  if (plan.targetKeyword && !contentLower.includes(plan.targetKeyword.toLowerCase())) {
    issues.push('Target keyword not found in content');
    score -= 10;
  }
  
  const html = article.detailed_content || '';
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  if (h2Count < 6) {
    issues.push(`Insufficient content structure: ${h2Count} H2s (need 6+)`);
    score -= 25;
  }

  // AEO: speakable answer scaffold
  const hasSpeakableDiv = /class\s*=\s*["'][^"']*\bspeakable-answer\b/i.test(html);
  if (!hasSpeakableDiv) {
    issues.push('Missing required `.speakable-answer` div for AEO compliance');
    score -= 20;
  }

  // E-E-A-T scaffold
  const hasEeatDiv = /class\s*=\s*["'][^"']*\beeat-section\b/i.test(html);
  if (!hasEeatDiv) {
    issues.push('Missing required `.eeat-section` div for E-E-A-T compliance');
    score -= 20;
  }

  const wordCount = countWords(html);

  // HARD FAIL: Articles under 1,200 words are always invalid (master prompt demands 1,500+)
  if (wordCount < 1200) {
    issues.push(`CRITICAL: Content severely under minimum (${wordCount} words, need 1,500+)`);
    return { isValid: false, issues, score: 0, wordCount };
  }

  if (wordCount < 1500) {
    issues.push(`Content too short (${wordCount} words, minimum 1,500)`);
    score -= 30;
  } else if (wordCount > 2500) {
    issues.push(`Content too long (${wordCount} words, maximum 2,500)`);
    score -= 10;
  }

  // FAQ scaffold (master prompt demands 5-8)
  if (!article.qa_entities || !Array.isArray(article.qa_entities) || article.qa_entities.length < 5) {
    const n = Array.isArray(article.qa_entities) ? article.qa_entities.length : 0;
    issues.push(`Missing/insufficient FAQs: ${n} (need 5-8)`);
    score -= 20;
  }

  // Hard reject if any structural requirement is missing
  const hardFail = !hasSpeakableDiv || !hasEeatDiv || h2Count < 6 ||
    !Array.isArray(article.qa_entities) || article.qa_entities.length < 5;

  return { isValid: !hardFail && score >= 60, issues, score, wordCount };
}

// Generate a single article
async function generateSingleArticle(
  supabase: any,
  openaiKey: string,
  plan: any,
  articleIndex: number,
  jobId: string,
  clusterId: string,
  language: string,
  masterPrompt: string,
  authors: any[],
  categories: any[],
  clusterTopic: string
): Promise<{ articleId: string | null; error: string | null }> {
  const CLAUDE_API_KEY = openaiKey; // legacy var name, now holds CLAUDE_API_KEY
  
  console.log(`\n[Chunk ${jobId}] Generating article ${articleIndex + 1}: "${plan.headline}"`);

  // Diff 3: structured prompt-context log so we can confirm cluster→prompt routing
  // without joining DB tables. Shows up as a single line per article in edge logs.
  console.log(`[Chunk ${jobId}] PROMPT_CONTEXT ${JSON.stringify({
    cluster_id: clusterId,
    cluster_topic: clusterTopic,
    article_index: articleIndex,
    headline: plan.headline,
    target_keyword: plan.targetKeyword,
    funnel_stage: plan.funnelStage,
    language,
  })}`);

  // Stamp cluster_id on cluster_generations so future queries can join directly.
  // Forward-only fix per Diff 3 — historical generations stay un-keyed.
  try {
    await supabase
      .from('cluster_generations')
      .update({ cluster_id: clusterId })
      .eq('id', jobId)
      .is('cluster_id', null);
  } catch (e) {
    console.warn(`[Chunk ${jobId}] cluster_id stamp failed (non-fatal):`, (e as any)?.message);
  }

  const promptContext = {
    cluster_id: clusterId,
    cluster_topic: clusterTopic,
    headline: plan.headline,
    target_keyword: plan.targetKeyword,
    funnel_stage: plan.funnelStage,
    language,
  };
  
  try {
    const article: any = {
      funnel_stage: plan.funnelStage,
      language,
      status: 'draft',
      headline: plan.headline,
      slug: plan.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    };

    // 1. CATEGORY SELECTION with JSON mode
    const validCategoryNames = (categories || []).map(c => c.name);
    const categoryPrompt = `Select the most appropriate category for this article.

Available categories:
${validCategoryNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Article: ${plan.headline}
Keyword: ${plan.targetKeyword}
Funnel Stage: ${plan.funnelStage}

Respond with JSON: { "category": "exact category name from the list" }`;

    const categoryResponse = await fetchClaudeWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': CLAUDE_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: 'Return ONLY a valid JSON object as specified. No prose.',
        messages: [{ role: 'user', content: categoryPrompt }],
      }),
    }, 30_000);

    let finalCategory = 'Buying Property';
    if (categoryResponse.ok) {
      const categoryData = await categoryResponse.json();
      try {
        const categoryJson = extractJsonFromResponse(categoryData?.content?.[0]?.text || '{}');
        const aiCategory = categoryJson.category;
        const matchedCategory = validCategoryNames.find(
          name => name.toLowerCase() === aiCategory?.toLowerCase()
        );
        finalCategory = matchedCategory || 'Retirement Planning';
      } catch (e) {
        console.warn(`[Chunk ${jobId}] Category parse failed, using default`);
      }
    }
    article.category = finalCategory;

    // 2. MAIN CONTENT GENERATION with JSON mode and word count enforcement
    const languageName = { 'en': 'English', 'es': 'Spanish' }[language] || 'English';

    // Build base prompt from master prompt
    let basePrompt = masterPrompt 
      ? masterPrompt
          .replace(/\{\{headline\}\}/g, plan.headline)
          .replace(/\{\{targetKeyword\}\}/g, plan.targetKeyword || '')
          .replace(/\{\{contentAngle\}\}/g, plan.contentAngle || '')
          .replace(/\{\{funnelStage\}\}/g, plan.funnelStage || '')
          .replace(/\{\{language\}\}/g, language)
          .replace(/\{\{languageName\}\}/g, languageName)
      : `Write a comprehensive article about "${plan.headline}" targeting the keyword "${plan.targetKeyword}".`;

    // ALWAYS wrap in JSON requirements with STRICT word count (matches master prompt: 1,500-2,500)
    const contentPrompt = `${basePrompt}

CRITICAL WORD COUNT REQUIREMENT: The article MUST be between 1,500 and 2,500 words. Count your words carefully.
- Minimum: 1,500 words (articles under this will be REJECTED)
- Target: 1,800-2,000 words (ideal range)
- Maximum: 2,500 words

You MUST respond with a valid JSON object with this exact structure:
{
  "detailed_content": "<div class='article-content'>...full HTML article content (MINIMUM 1,500 words, target 1,800-2,000)...</div>",
  "meta_title": "SEO title (50-60 characters)",
  "meta_description": "SEO meta description (150-160 characters)",
  "speakable_answer": "40-60 word summary answering the main question directly",
  "qa_entities": [
    {"question": "FAQ question 1?", "answer": "Detailed answer (80-120 words, single paragraph, no lists)"},
    {"question": "FAQ question 2?", "answer": "Detailed answer (80-120 words, single paragraph, no lists)"}
  ]
}

MANDATORY STRUCTURE inside detailed_content:
- A <div class="speakable-answer">…40-60 word direct answer…</div> near the top (AEO requirement)
- An <div class="eeat-section">…200-300 word expert E-E-A-T block with credentials, experience, sources…</div>
- At least 6 <h2> headings, each followed by 2+ detailed paragraphs
- 5-8 FAQ questions in qa_entities, each answer 80-120 words, single paragraph (no lists)

OUTPUT FORMAT RULES for detailed_content (ENFORCED — violations cause REJECTION):
- Output the article BODY ONLY, wrapped in a single <div class="article-content">…</div>
- Do NOT emit <html>, <head>, <body>, or <h1> tags anywhere in detailed_content
- The article title belongs in the "headline" field at the schema root, NOT as <h1> in the body
- Section headings start at <h2>; subsections use <h3>; deeper levels use <h4>
- Do NOT include <meta>, <link>, <script>, or <style> tags
- Do NOT include rel="canonical", rel="alternate", or any application/ld+json blocks
  (canonical URLs, hreflang alternates, and JSON-LD schema are injected separately by the publishing pipeline)
- Do NOT wrap content in any document-level tags

REMEMBER: Minimum 1,500 words in detailed_content is MANDATORY. Missing .speakable-answer or .eeat-section will cause REJECTION. Document-level tags (<html>/<head>/<body>/<h1>/<meta>/<link>/<script>/<style>) will cause REJECTION at the database layer.`;

    // Generate content with retry loop for word count enforcement (3 attempts with escalating prompts)
    let contentJson: any = null;
    let attempts = 0;
    const maxAttempts = 3; // 3 retries for better success rate
    let lastWordCount = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[Chunk ${jobId}] Content generation attempt ${attempts}/${maxAttempts}...`);
      
      let currentPrompt = contentPrompt;
      let systemPrompt = `You are an expert insurance and wealth management content writer.

CRITICAL REQUIREMENTS:
1. You MUST respond with valid JSON only
2. Articles MUST be between 800 and 2,500 words - this is NON-NEGOTIABLE
3. Include at least 6 H2 sections, each with 2+ detailed paragraphs
4. Before finalizing, mentally count your words - if under 800, ADD MORE CONTENT
5. detailed_content is the article BODY ONLY — NO <html>, <head>, <body>, <h1>, <meta>, <link>, <script>, <style> tags. Section headings start at <h2>. Title goes in the "headline" field, never as <h1>.`;

      if (attempts === 2 && contentJson) {
        const prevWordCount = countWords(contentJson.detailed_content || '');
        systemPrompt = `You are an expert insurance and wealth management content writer. Your previous response was ONLY ${prevWordCount} words - this is below our minimum.

MANDATORY: This response MUST be at least 800 words. 
STRATEGY: Write 6+ sections of 150+ words each = 900+ words minimum.
DO NOT submit anything under 800 words.
detailed_content is the article BODY ONLY — NO <html>, <head>, <body>, <h1>, <meta>, <link>, <script>, <style> tags. Section headings start at <h2>.`;

        currentPrompt = `${contentPrompt}

⚠️ PREVIOUS ATTEMPT FAILED: Only ${prevWordCount} words generated.

You MUST write a MUCH LONGER article. Use this structure:
1. Introduction (150+ words)
2. Section 1 - Overview (200+ words)
3. Section 2 - Key Considerations (200+ words)
4. Section 3 - Process Details (200+ words)
5. Section 4 - Costs & Fees (200+ words)
6. Section 5 - Legal Requirements (200+ words)
7. Section 6 - Common Mistakes (200+ words)
8. Section 7 - Expert Tips (200+ words)
9. Conclusion (150+ words)

This structure gives you 1,700+ words. Follow it exactly.`;
      } else if (attempts === 3 && contentJson) {
        const prevWordCount = countWords(contentJson.detailed_content || '');
        systemPrompt = `FINAL ATTEMPT. Previous responses were too short (${prevWordCount} words).

You are a detailed writer. EVERY paragraph must be 60-80 words minimum.
Include specific examples, statistics, and expert insights.
If in doubt, ADD MORE DETAIL.
detailed_content is the article BODY ONLY — NO <html>, <head>, <body>, <h1>, <meta>, <link>, <script>, <style> tags. Section headings start at <h2>.`;

        currentPrompt = `${contentPrompt}

🚨 FINAL ATTEMPT - MUST REACH 800 WORDS 🚨

Your previous ${attempts - 1} attempts produced only ${prevWordCount} words. This is your LAST chance.

MANDATORY EXPANSION TECHNIQUES:
• Add specific examples relevant to the topic
• Include 2-3 sentences of explanation for EVERY claim
• Add "For example..." or "In practice, this means..." phrases
• Include relevant statistics and timeframes

SECTION WORD COUNTS (strict minimums):
- Introduction: 100 words
- Each of 6 body sections: 100+ words  
- FAQ section: 5-8 questions with 80-word answers each
- Conclusion: 100 words

TOTAL MINIMUM: 1,000 words. Do NOT submit under 800.`;
      }
      
      const articleNum = articleIndex + 1;
      const fetchStart = Date.now();
      await heartbeat(supabase, jobId, `claude:fetch:start article=${articleNum} attempt=${attempts}`);
      let streamResult: { text: string; stopReason: string; httpStatus: number; errorText?: string };
      try {
        // Diff 1 — stream Claude via SSE so heartbeats track real progress
        // and a stalled connection dies on inactivity instead of the 8-min wall.
        streamResult = await streamClaude(
          supabase,
          jobId,
          articleNum,
          attempts,
          {
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 12000,
            system: systemPrompt + '\n\nIMPORTANT: Return ONLY a valid JSON object as specified. No prose, no markdown fences.',
            messages: [{ role: 'user', content: currentPrompt }],
          },
          CLAUDE_API_KEY,
        );
      } catch (err) {
        if ((err as Error).message === 'claude_timeout') {
          console.warn(`[chunk ${jobId}] claude_timeout article=${articleNum} attempt=${attempts}/${maxAttempts} (after ${Date.now() - fetchStart}ms)`);
          await heartbeat(supabase, jobId, `claude:fetch:response article=${articleNum} attempt=${attempts} status=timeout`);
          await recordGenerationFailure(supabase, {
            generationId: jobId,
            clusterId,
            articleIndex,
            attempt: attempts,
            failureKind: 'timeout',
            stopReason: 'claude_timeout',
            errorMessage: `SSE timeout after ${Date.now() - fetchStart}ms`,
            promptContext,
          });
          if (attempts >= maxAttempts) {
            throw new Error(`claude_timeout: Claude API hung after ${maxAttempts} attempts (${CLAUDE_TIMEOUT_MS}ms each)`);
          }
          await new Promise(r => setTimeout(r, 1500));
          continue; // retry with next attempt
        }
        throw err;
      }

      await heartbeat(supabase, jobId, `claude:fetch:response article=${articleNum} attempt=${attempts} status=${streamResult.httpStatus === 200 ? 'ok' : 'error'} stop_reason=${streamResult.stopReason}`);

      if (streamResult.httpStatus !== 200 || streamResult.stopReason === 'http_error' || streamResult.stopReason === 'stream_error') {
        const errorText = streamResult.errorText || '';
        console.error(`[Chunk ${jobId}] Content API error (status=${streamResult.httpStatus} stop=${streamResult.stopReason}):`, errorText.substring(0, 500));
        await recordGenerationFailure(supabase, {
          generationId: jobId,
          clusterId,
          articleIndex,
          attempt: attempts,
          failureKind: 'api_error',
          stopReason: streamResult.stopReason,
          rawResponse: streamResult.text || null,
          errorMessage: errorText.substring(0, 1000),
          promptContext,
        });
        throw new Error(`Content generation failed: ${streamResult.httpStatus} ${streamResult.stopReason}`);
      }

      const contentText = streamResult.text || '';
      const stopReason = streamResult.stopReason;

      if (!contentText.trim()) {
        await recordGenerationFailure(supabase, {
          generationId: jobId,
          clusterId,
          articleIndex,
          attempt: attempts,
          failureKind: 'api_error',
          stopReason,
          errorMessage: 'empty response',
          promptContext,
        });
        throw new Error('Claude returned empty content response');
      }

      // Log Claude's stop_reason so we can distinguish max_tokens truncation
      // from end_turn / network cutoff in post-mortem analysis.
      await heartbeat(supabase, jobId, `claude:stop_reason article=${articleNum} attempt=${attempts} reason=${stopReason} text_len=${contentText.length}`);
      console.log(`[Chunk ${jobId}] Article ${articleNum} stop_reason=${stopReason} text_len=${contentText.length}`);

      await heartbeat(supabase, jobId, `claude:parse:start article=${articleNum}`);
      try {
        contentJson = extractJsonFromResponse(contentText);
      } catch (e) {
        console.error(`[Chunk ${jobId}] Content parse failed:`, e);
        console.error(`[Chunk ${jobId}] Raw content (first 500 chars):`, contentText.substring(0, 500));
        // Tail snippet — reveals whether closing fence is present (regex bug)
        // vs missing entirely (truncation). Critical for diagnosing P1 failures.
        console.error(`[Chunk ${jobId}] Raw content TAIL (last 200 chars):`, contentText.slice(-200));
        await heartbeat(supabase, jobId, `claude:parse:fail article=${articleNum} stop_reason=${stopReason} text_tail=${contentText.slice(-200).replace(/\s+/g, ' ')}`);
        // Diff 3 — persist FULL raw response for forensics, not just 300-char snippet.
        await recordGenerationFailure(supabase, {
          generationId: jobId,
          clusterId,
          articleIndex,
          attempt: attempts,
          failureKind: 'parse',
          stopReason,
          rawResponse: contentText,
          errorMessage: e instanceof Error ? e.message : String(e),
          promptContext,
        });
        throw new Error(`Failed to parse content JSON: ${e instanceof Error ? e.message : String(e)}`);
      }

      lastWordCount = countWords(contentJson.detailed_content || '');
      console.log(`[Chunk ${jobId}] ━━━ Attempt ${attempts}: ${lastWordCount} words ━━━`);

      if (lastWordCount >= 1500) {
        console.log(`[Chunk ${jobId}] ✅ Word count requirement met (${lastWordCount} ≥ 1,500)!`);
        break;
      }

      if (attempts < maxAttempts) {
        console.warn(`[Chunk ${jobId}] ⚠️ Word count ${lastWordCount} below 1,500, will retry...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.error(`[Chunk ${jobId}] ❌ Failed to reach 1,500 words after ${maxAttempts} attempts (final: ${lastWordCount})`);
      }
    }

    // HARD FAIL: If still under 1,200 words, reject the article (master prompt floor is 1,500)
    if (lastWordCount < 1200) {
      throw new Error(`Article generation failed: Could not reach minimum word count after ${maxAttempts} attempts (only ${lastWordCount} words). Article rejected.`);
    }

    // FIX A — Sanitize LLM output before any downstream use.
    // The DB has TWO sibling CHECK constraints on detailed_content; sanitize covers both
    // so a violation isn't surfaced as a generic Postgres error.
    const rawContent = contentJson.detailed_content || contentJson.content || '';
    const { cleaned: sanitizedContent, removed: sanitizerRemoved } = sanitizeDetailedContent(rawContent);
    if (sanitizerRemoved.length > 0) {
      // Surface to the heartbeat trail so we can monitor whether the prompt fix is holding.
      // Empty array = LLM is now respecting the prompt; populated = sanitizer is doing real work.
      await heartbeat(supabase, jobId, `sanitize:applied article=${articleIndex + 1} removed=${sanitizerRemoved.join(',')}`);
      console.warn(`[Chunk ${jobId}] Article ${articleIndex + 1} sanitized: ${sanitizerRemoved.join(', ')}`);
    }
    article.detailed_content = sanitizedContent;
    article.meta_title = (contentJson.meta_title || plan.headline).substring(0, 60);
    article.meta_description = (contentJson.meta_description || '').substring(0, 160);
    article.speakable_answer = contentJson.speakable_answer || '';
    article.qa_entities = contentJson.qa_entities || contentJson.faqs || [];
    article.cluster_theme = clusterTopic || '';

    // 3. FEATURED IMAGE — leave NULL so post-generation Kie.ai (Nano Banana 2)
    // step in regenerate-cluster-images is the unambiguous source of truth.
    // Hardcoded Unsplash URLs were causing every article to share the same stock photo.
    article.featured_image_url = null;
    article.featured_image_alt = `${plan.headline} - Everence Wealth`;
    console.log(`[Chunk ${jobId}] Featured image left null — Kie.ai will generate post-save`);

    // 4. AUTHOR & REVIEWER
    const randomAuthor = authors?.[Math.floor(Math.random() * (authors?.length || 1))] || { id: null };
    const randomReviewer = authors?.filter(a => a.id !== randomAuthor.id)?.[0] || randomAuthor;
    article.author_id = randomAuthor.id;
    article.reviewer_id = randomReviewer.id;

    // 5. SET CLUSTER METADATA
    article.cluster_id = clusterId;
    article.cluster_number = articleIndex + 1;
    article.date_published = new Date().toISOString();
    article.date_modified = new Date().toISOString();

    // 6. QUALITY VALIDATION — hard reject if AEO/E-E-A-T scaffolding is missing
    const quality = validateContentQuality(article, plan);
    console.log(`[Chunk ${jobId}] Article ${articleIndex + 1} quality: ${quality.score}/100 (${quality.wordCount} words)`);
    if (quality.issues.length > 0) {
      console.warn(`[Chunk ${jobId}] Quality issues:`, quality.issues);
    }
    if (!quality.isValid) {
      throw new Error(
        `Article rejected by quality gate (score=${quality.score}, words=${quality.wordCount}): ${quality.issues.join('; ')}`
      );
    }

    // FIX C — Pre-insert validation mirror.
    // Catch sanitizer regressions BEFORE the DB CHECK constraint fires, so we get
    // a precise error string instead of "violates check constraint blog_articles_…".
    try {
      validateNoForbiddenTags(article.detailed_content);
    } catch (validateErr) {
      const msg = validateErr instanceof Error ? validateErr.message : String(validateErr);
      await heartbeat(supabase, jobId, `validate:fail article=${articleIndex + 1} ${msg}`);
      throw new Error(`Article ${articleIndex + 1} pre-insert validation failed: ${msg}`);
    }

    // 7. SAVE TO DATABASE
    await heartbeat(supabase, jobId, `claude:db:save:start article=${articleIndex + 1}`);
    const saveStart = Date.now();
    const { data: savedArticle, error: saveError } = await supabase
      .from('blog_articles')
      .insert(article)
      .select('id')
      .single();

    if (saveError) {
      throw new Error(`Failed to save article: ${saveError.message}`);
    }

    await heartbeat(supabase, jobId, `claude:db:save:complete article=${articleIndex + 1} ms=${Date.now() - saveStart}`);
    console.log(`[Chunk ${jobId}] ✅ Article ${articleIndex + 1} saved: ${savedArticle.id}`);
    return { articleId: savedArticle.id, error: null };

  } catch (error) {
    console.error(`[Chunk ${jobId}] ❌ Article ${articleIndex + 1} failed:`, error);
    return { articleId: null, error: error instanceof Error ? error.message : String(error) };
  }
}

// Background processor: runs the entire chunk inside EdgeRuntime.waitUntil so
// the worker container is NOT torn down when we return 202 to the caller.
// This was the root cause of "fire next chunk → chunk boots → claude:fetch:start
// → silent shutdown ~1s later". The fire-and-forget HTTP request from chunk N
// was being aborted because chunk N's worker exited as soon as it responded.
async function processChunk(
  jobId: string,
  chunkIndex: number,
  articleStructures: any[],
  FUNCTION_START: number,
): Promise<void> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY');
    if (!CLAUDE_API_KEY) throw new Error('CLAUDE_API_KEY (or ANTHROPIC_API_KEY) is not configured');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate which articles this chunk handles
    const startIdx = chunkIndex * CHUNK_SIZE;
    const endIdx = Math.min(startIdx + CHUNK_SIZE, articleStructures.length);
    const chunkArticles = articleStructures.slice(startIdx, endIdx);

    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  CHUNK ${chunkIndex + 1} - Articles ${startIdx + 1}-${endIdx}/${articleStructures.length}  ║`);
    console.log(`╚════════════════════════════════════════╝`);
    console.log(`[Chunk] Job: ${jobId}`);
    console.log(`[Chunk] Processing ${chunkArticles.length} articles\n`);

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('cluster_generations')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Fetch authors and categories
    const { data: authors } = await supabase.from('authors').select('*');
    const { data: categories } = await supabase.from('categories').select('*');

    // Fetch master prompt — Bug A: branch by job.compliance_class
    const masterPromptKey = job.compliance_class === 'recruiting_no_income_claims'
      ? 'master_content_prompt_recruiting'
      : 'master_content_prompt';
    console.log(`[Chunk ${jobId}] Loading master prompt: ${masterPromptKey} (compliance_class=${job.compliance_class || 'wealth_standard'})`);
    const { data: promptData } = await supabase
      .from('content_settings')
      .select('setting_value')
      .eq('setting_key', masterPromptKey)
      .single();
    const masterPrompt = promptData?.setting_value || '';

    // Process articles in this chunk
    const savedIds: string[] = [];
    const errors: string[] = [];
    // FIX B — Structured partial-failure record per article (kept across chunks via progress.partial_failures)
    const partialFailures: Array<{ article_index: number; error: string; attempt_count: number }> = [];

    for (let i = 0; i < chunkArticles.length; i++) {
      const globalIndex = startIdx + i;
      const plan = chunkArticles[i];

      // Update progress
      await supabase
        .from('cluster_generations')
        .update({
          progress: {
            current_step: globalIndex + 2,
            total_steps: articleStructures.length + 2,
            current_article: globalIndex + 1,
            total_articles: articleStructures.length,
            message: `Generating article ${globalIndex + 1}/${articleStructures.length}: ${plan.headline.substring(0, 40)}...`,
            chunk: chunkIndex + 1,
            total_chunks: Math.ceil(articleStructures.length / CHUNK_SIZE),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      const result = await generateSingleArticle(
        supabase,
        CLAUDE_API_KEY,
        plan,
        globalIndex,
        jobId,
        jobId, // cluster_id = job_id
        job.language || 'en',
        masterPrompt,
        authors || [],
        categories || [],
        job.topic || ''
      );

      if (result.articleId) {
        savedIds.push(result.articleId);
      } else {
        errors.push(`Article ${globalIndex + 1}: ${result.error}`);
        partialFailures.push({
          article_index: globalIndex + 1,
          error: (result.error || 'unknown').substring(0, 500),
          attempt_count: 3, // generateSingleArticle does 3 attempts max
        });
        // If Claude timed out for the entire article (all 3 attempts), mark job failed and stop chunk.
        if (result.error && result.error.includes('claude_timeout')) {
          await supabase
            .from('cluster_generations')
            .update({
              status: 'failed',
              error: 'claude_timeout',
              progress: {
                last_heartbeat: `claude_timeout article=${globalIndex + 1} attempt=3/3`,
                ts: new Date().toISOString(),
                message: `Claude API hung on article ${globalIndex + 1} after 3 attempts.`,
                partial_failures: partialFailures,
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', jobId);
          console.error(`[Chunk] Stopping chunk ${chunkIndex + 1} due to claude_timeout on article ${globalIndex + 1}`);
          return;
        }
      }

      // Check if we're running out of time
      if (Date.now() - FUNCTION_START > MAX_CHUNK_RUNTIME) {
        console.warn(`[Chunk] ⚠️ Approaching timeout, stopping early`);
        break;
      }
    }

    // Determine if there are more chunks
    const hasMoreChunks = endIdx < articleStructures.length;
    const nextChunkIndex = chunkIndex + 1;

    // Update job with saved articles
    const existingArticles = job.articles || [];
    const allSavedArticles = [...existingArticles, ...savedIds];

    // FIX B — Merge this chunk's partial failures with any previously recorded ones.
    const existingProgress = job.progress || {};
    const existingPartialFailures: any[] = Array.isArray(existingProgress.partial_failures)
      ? existingProgress.partial_failures
      : [];
    const mergedPartialFailures = [...existingPartialFailures, ...partialFailures];

    await supabase
      .from('cluster_generations')
      .update({
        articles: allSavedArticles,
        updated_at: new Date().toISOString(),
        ...(mergedPartialFailures.length > 0 && {
          progress: {
            ...existingProgress,
            partial_failures: mergedPartialFailures,
            partial: true,
          },
        }),
      })
      .eq('id', jobId);

    console.log(`\n[Chunk] ✅ Chunk ${chunkIndex + 1} complete`);
    console.log(`[Chunk] Saved: ${savedIds.length}, Errors: ${errors.length}`);
    console.log(`[Chunk] Total saved so far: ${allSavedArticles.length}/${articleStructures.length}`);

    // FIX B — Total-failure guard: if THIS chunk saved nothing AND had errors,
    // and there are no previous saves, mark gen failed so the orchestrator advances
    // instead of waiting for the 20-min worker timeout.
    if (savedIds.length === 0 && errors.length > 0 && allSavedArticles.length === 0 && !hasMoreChunks) {
      const firstErr = (errors[0] || 'unknown').substring(0, 400);
      await supabase
        .from('cluster_generations')
        .update({
          status: 'failed',
          error: `All articles failed in chunk ${chunkIndex + 1}: ${firstErr}`,
          progress: {
            ...existingProgress,
            partial_failures: mergedPartialFailures,
            partial: false,
            total_failure: true,
            ts: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
      console.error(`[Chunk] ❌ Total failure on cluster ${jobId} — marked failed.`);
      return;
    }

    // Fire next chunk if needed (fire-and-forget)
    if (hasMoreChunks) {
      console.log(`[Chunk] 🔥 Firing chunk ${nextChunkIndex + 1}...`);
      
      fetch(`${SUPABASE_URL}/functions/v1/generate-cluster-chunk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          jobId,
          chunkIndex: nextChunkIndex,
          articleStructures,
        }),
      }).catch(err => console.error('[Chunk] Fire-and-forget error:', err));

      return;
    }

    // All chunks complete - finalize job
    console.log(`[Chunk] 🎉 All chunks complete! Finalizing job...`);

    // Verify actual saved article count from the database (ground truth)
    const { count: actualSavedCount, error: countError } = await supabase
      .from('blog_articles')
      .select('*', { count: 'exact', head: true })
      .eq('cluster_id', jobId)
      .eq('language', job.language || 'en');

    const verifiedCount = countError ? allSavedArticles.length : (actualSavedCount || 0);
    console.log(`[Chunk] 📊 Verified article count from DB: ${verifiedCount} (internal tracking: ${allSavedArticles.length}, expected: ${articleStructures.length})`);

    // FIX B — Status decision matrix:
    //   verified == 0  AND errors  → 'failed'      (orchestrator advances with fail)
    //   0 < verified < expected    → 'completed' + progress.partial=true
    //                                (orchestrator advances; flagged in step log)
    //   verified >= expected       → 'completed'   (happy path)
    // We deliberately do NOT introduce a 'completed_with_errors' status because
    // build-cluster-step:300 does a strict equality check on g.status === 'completed'.
    // A new status value would leave the batch stuck. Partial signal lives in progress.
    let finalStatus: string;
    let isPartial = false;
    if (verifiedCount === 0) {
      finalStatus = 'failed';
    } else if (verifiedCount < articleStructures.length) {
      finalStatus = 'completed';
      isPartial = true;
    } else {
      finalStatus = 'completed';
    }

    const finalExistingProgress = (await supabase
      .from('cluster_generations')
      .select('progress')
      .eq('id', jobId)
      .single()).data?.progress || {};
    const finalPartialFailures = Array.isArray(finalExistingProgress.partial_failures)
      ? finalExistingProgress.partial_failures
      : [];

    await supabase
      .from('cluster_generations')
      .update({
        status: finalStatus,
        completion_note: `${verifiedCount}/${articleStructures.length} articles generated via chunked processing (verified from DB).`,
        ...(finalStatus === 'failed' && {
          error: finalPartialFailures.length > 0
            ? `0/${articleStructures.length} articles saved. First error: ${finalPartialFailures[0]?.error || 'unknown'}`
            : `0/${articleStructures.length} articles saved (no error captured).`,
        }),
        progress: {
          ...finalExistingProgress,
          current_step: articleStructures.length + 2,
          total_steps: articleStructures.length + 2,
          current_article: articleStructures.length,
          total_articles: articleStructures.length,
          message: finalStatus === 'failed'
            ? `❌ Total failure: 0/${articleStructures.length} articles saved.`
            : isPartial
              ? `⚠️ Partial success: ${verifiedCount}/${articleStructures.length} articles saved (advancing batch).`
              : `✅ Cluster complete: ${verifiedCount} articles generated.`,
          chunked: true,
          total_chunks: Math.ceil(articleStructures.length / CHUNK_SIZE),
          partial: isPartial,
          verified_count: verifiedCount,
          expected_count: articleStructures.length,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    // Auto-generate content-aware images for the completed (or partially completed) cluster
    if (finalStatus === 'completed' && verifiedCount > 0) {
      console.log(`[Chunk] 🎨 Auto-triggering content-aware image generation for cluster ${jobId}...`);
      fetch(`${SUPABASE_URL}/functions/v1/regenerate-cluster-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ clusterId: jobId }),
      }).catch(err => console.error('[Chunk] Image generation trigger error:', err));
    }

    return;

  } catch (error) {
    console.error('[Chunk] Background processChunk error:', error);
    try {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from('cluster_generations')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch (e) {
      console.error('[Chunk] Failed to mark job failed:', e);
    }
  }
}

// HTTP entrypoint: parse request, return 202 immediately, run real work in background
// via EdgeRuntime.waitUntil so the worker container survives the in-flight Claude call
// AND the fire-next-chunk fetch.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const FUNCTION_START = Date.now();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { jobId, chunkIndex, articleStructures } = body || {};
  if (!jobId || chunkIndex === undefined || !articleStructures) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Run the actual chunk processing in the background. Critical: without
  // EdgeRuntime.waitUntil the worker is killed as soon as we respond, which
  // aborts both the Claude fetch AND the fire-next-chunk fetch.
  const work = processChunk(jobId, chunkIndex, articleStructures, FUNCTION_START);
  // @ts-ignore — EdgeRuntime is provided by Supabase Edge Runtime
  if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
    // @ts-ignore
    EdgeRuntime.waitUntil(work);
  } else {
    // Fallback: at least swallow rejections so they don't crash the worker
    work.catch(err => console.error('[Chunk] Background work error:', err));
  }

  return new Response(JSON.stringify({
    accepted: true,
    jobId,
    chunkIndex,
    message: 'Chunk processing started in background',
  }), {
    status: 202,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
