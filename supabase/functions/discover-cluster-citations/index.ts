import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// COMPETITOR BLOCKING
// ============================================================================
const BLOCKED_DOMAINS = [
  'sothebysrealty.com', 'christiesrealestate.com', 'knightfrank.com',
  'savills.com', 'savills.es', 'engelvoelkers.com', 'engel-voelkers.com', 'engel-voelkers.es',
  'remax.com', 'remax.es', 'coldwellbanker.com', 'coldwellbanker.es',
  'century21.com', 'century21.es', 'kellerwilliams.com', 'compass.com',
  'berkshirehathaway.com',
  'zillow.com', 'trulia.com', 'realtor.com', 'redfin.com', 'apartments.com',
  'rightmove.co.uk', 'zoopla.co.uk', 'onthemarket.com', 'primelocation.com',
  'propertypal.com', 'mouseprice.com', 'propertyguides.com',
  'idealista.com', 'fotocasa.com', 'fotocasa.es', 'pisos.com', 'habitaclia.com',
  'kyero.com', 'thinkspain.com', 'spanishpropertyinsight.com', 'yaencontre.com',
  'tucasa.com', 'enalquiler.com', 'milanuncios.com', 'spanish-property-choice.com',
  'propertiesabroadspain.com', 'spainhouses.net', 'eyeonspain.com',
  'aplaceinthesun.com', 'spanishpropertychoice.com',
  'funda.nl', 'huislijn.nl', 'jaap.nl', 'pararius.nl',
  'immobilienscout24.de', 'immowelt.de', 'immonet.de',
  'seloger.com', 'pap.fr', 'leboncoin.fr', 'logic-immo.com',
  'hemnet.se', 'boligsiden.dk', 'finn.no', 'etuovi.com',
  'ingatlan.com', 'properstar.com',
  // Cleaned 2026-04-26: removed Del Sol / Marbella / Malaga agency entries
  // (Everence is US wealth management). Generic luxury brokerages above remain.
];

const BLOCKED_KEYWORDS = [
  'realty', 'realtor', 'real-estate', 'realestate', 'estate-agent', 'estate-agents',
  'property-sales', 'property-agency', 'homes-for-sale', 'house-sales',
  'luxury-homes', 'property-finder', 'home-finder',
  'forsale', 'for-sale', 'listing', 'listings', 'broker', 'brokerage', 'realtors',
  'inmobiliaria', 'inmobiliarias', 'inmueble', 'inmuebles',
  'makler', 'hauskauf',
  'agence-immobiliere',
  'makelaar', 'vastgoed',
];

// High-authority domains that bypass keyword blocking
const AUTHORITY_DOMAIN_PATTERNS = [
  '.gov', '.gob.', '.edu', 'eurostat', 'ine.es', 'boe.es',
  'irs.gov', 'sec.gov', 'ssa.gov', 'treasury.gov', 'federalreserve.gov',
  'bls.gov', 'census.gov', 'cdc.gov', 'cms.gov',
  'destatis.de', 'cbs.nl', 'insee.fr', 'stat.fi', 'scb.se', 'ssb.no',
  'reuters.com', 'bloomberg.com', 'bbc.com', 'nytimes.com', 'wsj.com',
  'investopedia.com', 'nerdwallet.com', 'bankrate.com',
  'who.int', 'oecd.org', 'worldbank.org', 'imf.org',
];

// ============================================================================
// LANGUAGE-SPECIFIC DOMAIN PREFERENCES
// ============================================================================
const LANG_DOMAIN_PREFERENCES: Record<string, string[]> = {
  en: ['.gov', '.gov.uk', '.edu', 'reuters.com', 'bbc.com'],
  es: ['.gob.es', '.gov', 'ine.es', 'boe.es', 'elpais.com', 'elmundo.es'],
  de: ['.gov.de', 'destatis.de', 'dw.com', 'spiegel.de'],
  nl: ['.gov.nl', 'cbs.nl', 'nos.nl'],
  fr: ['.gouv.fr', 'insee.fr', 'lemonde.fr'],
  sv: ['.gov.se', 'scb.se', 'svt.se'],
  da: ['.gov.dk', 'dst.dk', 'dr.dk'],
  no: ['.gov.no', 'ssb.no', 'nrk.no'],
  fi: ['.gov.fi', 'stat.fi', 'yle.fi'],
  hu: ['.gov.hu', 'ksh.hu'],
  pl: ['.gov.pl', 'stat.gov.pl'],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '').toLowerCase();
  } catch {
    return '';
  }
}

function isAuthorityDomain(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return AUTHORITY_DOMAIN_PATTERNS.some(p => lowerUrl.includes(p));
}

function isBlockedDomain(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  // Always block exact competitor domains
  if (BLOCKED_DOMAINS.some(d => lowerUrl.includes(d))) return true;
  // For keyword blocking, exempt high-authority domains
  if (isAuthorityDomain(url)) return false;
  if (BLOCKED_KEYWORDS.some(k => lowerUrl.includes(k))) return true;
  return false;
}

async function checkApprovedDomains(supabase: any, domain: string, language: string): Promise<{ approved: boolean; tier?: string; trustScore?: number }> {
  try {
    const { data } = await supabase
      .from('approved_domains')
      .select('tier, trust_score, is_allowed, is_international, language')
      .eq('domain', domain)
      .eq('is_allowed', true)
      .maybeSingle();
    
    if (data) {
      if (data.is_international || data.language === language || !data.language) {
        return { approved: true, tier: data.tier, trustScore: data.trust_score };
      }
    }
    return { approved: false };
  } catch {
    return { approved: false };
  }
}

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CitationBot/1.0)' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status === 403;
  } catch {
    return false;
  }
}

// ============================================================================
// PERPLEXITY API CALL WITH RETRY LOGIC
// ============================================================================

function buildPromptAttempt(
  attempt: number,
  headline: string,
  content: string,
  language: string,
  domainPrefs: string[]
): { system: string; user: string } {
  const langNames: Record<string, string> = {
    en: 'English', de: 'German', nl: 'Dutch', fr: 'French', es: 'Spanish',
    pl: 'Polish', sv: 'Swedish', da: 'Danish', hu: 'Hungarian', fi: 'Finnish', no: 'Norwegian'
  };
  const langName = langNames[language] || 'English';

  if (attempt === 1) {
    // Attempt 1: Broad topic-focused search
    return {
      system: 'You are a citation research assistant specializing in finding authoritative sources. Return ONLY valid JSON arrays. Never include real estate listing sites or competitor financial advisory firms.',
      user: `Find 4-6 high-authority citations that support the claims in this ${langName} article.

ARTICLE: "${headline}"

CONTENT EXCERPT:
${content.substring(0, 5000)}

PREFERRED SOURCES (in order of priority):
- Government websites (${domainPrefs.slice(0, 3).join(', ')})
- Official statistics bureaus and regulators
- Major established news outlets (Reuters, Bloomberg, BBC, etc.)
- Academic research (.edu)
- Reputable financial education sites (Investopedia, NerdWallet, etc.)

RULES:
- Each URL must be real and publicly accessible
- Diversify domains — no repeating the same site
- English OR ${langName} sources are both acceptable
- Focus on the specific claims, statistics, or facts in the article

Return JSON array:
[{"url": "https://...", "source": "Source Name", "context": "The specific claim this supports", "relevance": 8}]`
    };
  } else if (attempt === 2) {
    // Attempt 2: Statistics and government data angle
    return {
      system: 'You are a research assistant finding government data, statistics, and regulatory sources. Return ONLY valid JSON arrays.',
      user: `Find 3-5 government, regulatory, or statistical sources related to this topic: "${headline}"

Look for:
- Official government statistics or reports
- Regulatory guidelines or rules (IRS, SEC, state insurance departments, Social Security Administration)
- Census data or economic indicators
- Academic studies or research papers
- Official .gov or .edu pages

Return JSON array:
[{"url": "https://...", "source": "Source Name", "context": "What data or regulation this provides", "relevance": 7}]`
    };
  } else {
    // Attempt 3: Simple headline-only search
    return {
      system: 'Find authoritative web sources. Return ONLY a JSON array.',
      user: `Find 3 authoritative sources about: "${headline}"

Prefer .gov, .edu, major news outlets, or well-known financial education sites.

Return JSON array:
[{"url": "https://...", "source": "Source Name", "context": "Brief description", "relevance": 7}]`
    };
  }
}

async function findCitationsForArticle(
  perplexityKey: string,
  headline: string,
  content: string,
  language: string
): Promise<Array<{ url: string; source: string; context: string; relevance: number }>> {
  const domainPrefs = LANG_DOMAIN_PREFERENCES[language] || LANG_DOMAIN_PREFERENCES['en'];
  
  const MAX_ATTEMPTS = 3;
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { system, user } = buildPromptAttempt(attempt, headline, content, language, domainPrefs);
    
    try {
      console.log(`[discover] Attempt ${attempt}/${MAX_ATTEMPTS} for: ${headline.substring(0, 50)}...`);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Accept': 'application/json',
          'User-Agent': 'LovableCitationBot/1.0 (https://everencewealth.com)',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
          ],
          temperature: 0.3,
          max_tokens: 3000
        }),
      });

      if (!response.ok) {
        console.error(`[discover] Perplexity API error: ${response.status} on attempt ${attempt}`);
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        return [];
      }

      const data = await response.json();
      const contentResponse = data.choices?.[0]?.message?.content || '';
      
      const jsonMatch = contentResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const citations = JSON.parse(jsonMatch[0]);
        if (Array.isArray(citations) && citations.length > 0) {
          console.log(`[discover] Attempt ${attempt} found ${citations.length} citations`);
          
          // Also grab Perplexity's own citations if available
          const perplexityCitations = data.citations || [];
          if (perplexityCitations.length > 0) {
            // Add any Perplexity-native citations not already in the list
            for (const pUrl of perplexityCitations) {
              if (typeof pUrl === 'string' && !citations.some((c: any) => c.url === pUrl)) {
                citations.push({
                  url: pUrl,
                  source: extractDomain(pUrl),
                  context: `Source referenced by Perplexity for: ${headline.substring(0, 80)}`,
                  relevance: 6
                });
              }
            }
          }
          
          return citations;
        }
      }
      
      console.log(`[discover] Attempt ${attempt} returned 0 results, ${attempt < MAX_ATTEMPTS ? 'retrying...' : 'giving up'}`);
      
      if (attempt < MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) {
      console.error(`[discover] Error on attempt ${attempt}:`, e);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  
  return [];
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { cluster_id, max_articles } = await req.json();

    if (!cluster_id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing cluster_id'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[discover-cluster-citations] Starting for cluster: ${cluster_id}`);

    const { data: articles, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id, headline, detailed_content, language, external_citations')
      .eq('cluster_id', cluster_id)
      .order('language', { ascending: true });

    if (fetchError) throw fetchError;

    const articleLimit = max_articles || articles.length;
    const articlesToProcess = articles.slice(0, articleLimit);

    console.log(`[discover-cluster-citations] Processing ${articlesToProcess.length} articles`);

    const results: Array<{
      articleId: string;
      headline: string;
      language: string;
      existingCitations: number;
      discoveredCitations: Array<{ url: string; source: string; context: string; verified: boolean; approved: boolean }>;
      error?: string;
    }> = [];

    let totalDiscovered = 0;
    let totalVerified = 0;
    let totalApproved = 0;

    // Process articles in batches of 4
    for (let i = 0; i < articlesToProcess.length; i += 4) {
      const batch = articlesToProcess.slice(i, i + 4);
      
      const batchPromises = batch.map(async (article) => {
        const existingCitations = (article.external_citations as any[]) || [];
        
        try {
          const rawCitations = await findCitationsForArticle(
            PERPLEXITY_API_KEY,
            article.headline,
            article.detailed_content,
            article.language
          );

          console.log(`[discover] Found ${rawCitations.length} raw citations for: ${article.headline.substring(0, 50)}...`);

          const validatedCitations: Array<{ url: string; source: string; context: string; verified: boolean; approved: boolean }> = [];

          for (const citation of rawCitations) {
            if (!citation.url) continue;

            if (isBlockedDomain(citation.url)) {
              console.log(`[discover] Blocked: ${citation.url}`);
              continue;
            }

            if (existingCitations.some((c: any) => c.url === citation.url)) continue;

            const domain = extractDomain(citation.url);
            const approvalCheck = await checkApprovedDomains(supabase, domain, article.language);
            const verified = await verifyUrl(citation.url);

            validatedCitations.push({
              url: citation.url,
              source: citation.source,
              context: citation.context,
              verified,
              approved: approvalCheck.approved,
            });

            if (verified) totalVerified++;
            if (approvalCheck.approved) totalApproved++;
          }

          totalDiscovered += validatedCitations.length;

          return {
            articleId: article.id,
            headline: article.headline,
            language: article.language,
            existingCitations: existingCitations.length,
            discoveredCitations: validatedCitations,
          };
        } catch (e: any) {
          console.error(`[discover] Error for article ${article.id}:`, e);
          return {
            articleId: article.id,
            headline: article.headline,
            language: article.language,
            existingCitations: existingCitations.length,
            discoveredCitations: [],
            error: e.message,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + 4 < articlesToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const duration = Date.now() - startTime;

    console.log(`[discover-cluster-citations] Complete. Found ${totalDiscovered} citations, ${totalVerified} verified, ${totalApproved} approved. Duration: ${duration}ms`);

    return new Response(JSON.stringify({
      success: true,
      clusterId: cluster_id,
      articlesProcessed: results.length,
      totalDiscovered,
      totalVerified,
      totalApproved,
      duration,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[discover-cluster-citations] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Unknown error',
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
