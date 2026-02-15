import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

// Calculate read time
function calculateReadTime(content: string): number {
  const wordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
  return Math.max(5, Math.ceil(wordCount / 200));
}

// BOFU Page Templates - AI-Query Friendly Titles
const BOFU_TEMPLATES: Record<string, {
  topic: string;
  targetKeyword: string;
  category: string;
  targetAudience: string;
  pageType: string;
  contentFocus: string[];
}> = {
  'whole-life-insurance': {
    topic: 'Whole Life Insurance 2026: Benefits, Costs & Complete Guide',
    targetKeyword: 'whole life insurance benefits costs',
    category: 'Insurance Products',
    targetAudience: 'Families and individuals seeking permanent life insurance with cash value growth',
    pageType: 'comprehensive-guide',
    contentFocus: [
      'Guaranteed death benefit that never decreases',
      'Cash value accumulation with guaranteed minimum interest rate',
      'Policy loan options and how to access cash value',
      'Dividend participation in mutual insurance companies',
      'Premium payment structures (limited pay vs lifetime)',
      'Comparison with term life insurance',
      'Tax advantages of cash value growth',
      'Living benefits and accelerated death benefit riders',
      'Estate planning applications',
      'How to choose between whole life carriers'
    ]
  },
  'retirement-income': {
    topic: 'Retirement Income Planning: Complete Strategy Guide for 2026',
    targetKeyword: 'retirement income planning strategy',
    category: 'Retirement Planning',
    targetAudience: 'Pre-retirees and retirees planning sustainable income streams',
    pageType: 'calculator-guide',
    contentFocus: [
      'The 4% withdrawal rule and its limitations',
      'Social Security optimization strategies',
      'Annuity types and guaranteed income options',
      'Tax-efficient withdrawal sequencing (Roth, Traditional, Brokerage)',
      'Required Minimum Distributions (RMDs) planning',
      'Healthcare cost projections in retirement',
      'Inflation protection strategies',
      'Bucket strategy for retirement income',
      'Pension maximization techniques',
      'Longevity risk and planning for 30+ year retirements'
    ]
  },
  'iul-guide': {
    topic: 'Indexed Universal Life Insurance (IUL): How It Works & Who It\'s For',
    targetKeyword: 'indexed universal life insurance how it works',
    category: 'Insurance Products',
    targetAudience: 'High-income individuals seeking tax-advantaged growth with downside protection',
    pageType: 'process-guide',
    contentFocus: [
      'How index-linked crediting works (S&P 500, participation rates, caps)',
      'Floor protection - 0% minimum guarantees',
      'Flexible premium payments and death benefit options',
      'Cash value accumulation vs traditional investments',
      'Tax-free policy loans for retirement income',
      'Cost of insurance charges and their impact',
      'Illustration regulations and realistic expectations',
      'IUL vs 401(k) and Roth IRA comparison',
      'Suitability considerations and who should avoid IUL',
      'How to evaluate IUL illustrations from different carriers'
    ]
  },
  'estate-planning': {
    topic: 'Estate Planning with Life Insurance: Strategies for Wealth Transfer',
    targetKeyword: 'estate planning life insurance strategies',
    category: 'Wealth Management',
    targetAudience: 'High-net-worth individuals and families planning wealth transfer',
    pageType: 'comprehensive-guide',
    contentFocus: [
      'Irrevocable Life Insurance Trusts (ILITs)',
      'Estate tax exemption thresholds and planning',
      'Generation-skipping transfer strategies',
      'Survivorship (second-to-die) life insurance',
      'Premium financing for large policies',
      'Charitable giving with life insurance',
      'Business succession planning',
      'Key person insurance for business owners',
      'Buy-sell agreement funding with life insurance',
      'State-specific estate tax considerations'
    ]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const { 
      templateId, 
      customTopic, 
      customKeyword, 
      customAudience,
      language = 'en',
      authorId,
      generateAll = false 
    } = await req.json();

    console.log(`[BOFU Generator] Starting generation...`, { templateId, customTopic, generateAll, language });

    // Fetch approved domains for citations
    const { data: approvedDomains } = await supabase
      .from('approved_domains')
      .select('domain, category, trust_score')
      .eq('is_allowed', true)
      .gte('trust_score', 70)
      .limit(50);

    const topDomains = (approvedDomains || [])
      .map(d => d.domain)
      .slice(0, 20)
      .join(', ');

    // Determine which templates to generate
    const templatesToGenerate: string[] = generateAll 
      ? Object.keys(BOFU_TEMPLATES) 
      : [templateId];

    const results: any[] = [];
    const errors: string[] = [];

    for (const tplId of templatesToGenerate) {
      try {
        const template = BOFU_TEMPLATES[tplId];
        
        if (!template && !customTopic) {
          errors.push(`Template ${tplId} not found`);
          continue;
        }

        const topic = customTopic || template.topic;
        const targetKeyword = customKeyword || template?.targetKeyword || topic.toLowerCase();
        const targetAudience = customAudience || template?.targetAudience || 'Retirement planning clients';
        const category = template?.category || 'Buying Guide';
        const contentFocus = template?.contentFocus || [];

        console.log(`[BOFU Generator] Generating: ${topic}`);

        // Check if article already exists
        const proposedSlug = generateSlug(topic);
        const { data: existing } = await supabase
          .from('blog_articles')
          .select('id, slug')
          .eq('slug', proposedSlug)
          .single();

        if (existing) {
          console.log(`[BOFU Generator] Article already exists: ${proposedSlug}`);
          results.push({ 
            templateId: tplId, 
            status: 'exists', 
            articleId: existing.id,
            slug: existing.slug 
          });
          continue;
        }

        // Generate the BOFU page content
        const prompt = `You are an expert insurance and wealth management content writer. Create a comprehensive BOFU (Bottom of Funnel) guide that is optimized for AI citation and voice search.

TOPIC: ${topic}
TARGET KEYWORD: ${targetKeyword}
TARGET AUDIENCE: ${targetAudience}
LANGUAGE: ${language === 'en' ? 'English' : language}

${contentFocus.length > 0 ? `MUST COVER THESE TOPICS:\n${contentFocus.map((f, i) => `${i + 1}. ${f}`).join('\n')}` : ''}

APPROVED CITATION SOURCES (use these domains when citing statistics or facts):
${topDomains}

Generate a complete article with the following JSON structure:

{
  "headline": "Clear, intent-matching headline under 70 characters",
  "meta_title": "SEO title under 60 characters including primary keyword",
  "meta_description": "Compelling meta description 150-160 characters with keyword",
  "speakable_answer": "A concise 50-80 word answer that directly answers the main question. This should be citation-worthy for AI systems like Google's featured snippets.",
  "executive_summary": "A 2-3 sentence summary providing the key takeaways upfront.",
  "detailed_content": "Full HTML content with proper structure: multiple H2 and H3 headings, bullet lists, tables where appropriate, at least 3000 words. Include practical steps, real costs, timelines. Use <strong> for key terms.",
  "qa_entities": [
    {
      "question": "Decision-level question buyers ask",
      "answer": "Clear, helpful answer 2-4 sentences"
    }
  ],
  "external_citations": [
    {
      "text": "Anchor text for the citation",
      "url": "https://approved-domain.com/relevant-page",
      "source": "Source Name",
      "verified": true
    }
  ],
  "featured_image_alt": "Descriptive alt text for hero image",
  "featured_image_caption": "Caption explaining the image context"
}

CRITICAL REQUIREMENTS:
1. The speakable_answer MUST be a complete, standalone answer suitable for voice assistants
2. Include 8-10 qa_entities with genuine buyer questions
3. Content must be factual with current 2024-2025 data
4. Include step-by-step processes where relevant
5. Add cost breakdowns with actual figures
6. The detailed_content must have at least 6 H2 sections
7. Use tables for comparisons and cost breakdowns
8. Cite sources from the approved domains list
9. NO placeholder text - all content must be complete
10. Focus on actionable, practical information

Return ONLY valid JSON, no markdown code blocks.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are a professional insurance and financial planning content writer. Return only valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 8000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[BOFU Generator] AI API error:`, errorText);
          errors.push(`Failed to generate ${tplId}: AI API error`);
          continue;
        }

        const aiData = await response.json();
        let content = aiData.choices?.[0]?.message?.content || '';

        // Clean JSON response
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let articleData;
        try {
          articleData = JSON.parse(content);
        } catch (parseError) {
          console.error(`[BOFU Generator] JSON parse error for ${tplId}:`, parseError);
          errors.push(`Failed to parse ${tplId}: Invalid JSON from AI`);
          continue;
        }

        // Filter citations to approved domains only
        const filteredCitations = (articleData.external_citations || []).filter((c: any) => {
          const domain = extractDomain(c.url);
          return approvedDomains?.some(d => d.domain === domain);
        });

        // Create the article
        const slug = generateSlug(articleData.headline || topic);
        const now = new Date().toISOString();

        const { data: newArticle, error: insertError } = await supabase
          .from('blog_articles')
          .insert({
            slug,
            language,
            category,
            funnel_stage: 'BOFU',
            is_primary: true,
            headline: articleData.headline,
            meta_title: articleData.meta_title,
            meta_description: articleData.meta_description,
            speakable_answer: articleData.speakable_answer,
            detailed_content: articleData.detailed_content,
            featured_image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=630&fit=crop',
            featured_image_alt: articleData.featured_image_alt || `${topic} guide`,
            featured_image_caption: articleData.featured_image_caption,
            qa_entities: articleData.qa_entities || [],
            external_citations: filteredCitations,
            internal_links: [],
            author_id: authorId || null,
            status: 'draft',
            date_published: null,
            date_modified: now,
            read_time: calculateReadTime(articleData.detailed_content || ''),
            created_at: now,
            updated_at: now,
          })
          .select('id, slug, headline')
          .single();

        if (insertError) {
          console.error(`[BOFU Generator] Insert error for ${tplId}:`, insertError);
          errors.push(`Failed to save ${tplId}: ${insertError.message}`);
          continue;
        }

        console.log(`[BOFU Generator] ✅ Created: ${newArticle.slug}`);
        results.push({
          templateId: tplId,
          status: 'created',
          articleId: newArticle.id,
          slug: newArticle.slug,
          headline: newArticle.headline
        });

      } catch (templateError: unknown) {
        const errMsg = templateError instanceof Error ? templateError.message : 'Unknown error';
        console.error(`[BOFU Generator] Error generating ${tplId}:`, templateError);
        errors.push(`Error generating ${tplId}: ${errMsg}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: results.filter(r => r.status === 'created').length,
        existing: results.filter(r => r.status === 'exists').length,
        failed: errors.length,
        results,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[BOFU Generator] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
