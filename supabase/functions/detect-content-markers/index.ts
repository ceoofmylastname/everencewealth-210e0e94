import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AffectedArticle {
  id: string;
  headline: string;
  language: string;
  slug: string;
  status: string;
  citation_markers_count: number;
  internal_link_markers_count: number;
  code_fence_count: number;
  total_issues: number;
  citation_markers: string[];
  internal_link_markers: string[];
  content_preview: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Scanning all articles for content markers...');

    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select('id, headline, language, slug, status, detailed_content')
      .eq('status', 'published');

    if (error) {
      throw error;
    }

    const citationPattern = /\[CITATION_NEEDED:([^\]]+)\]/g;
    const internalLinkPattern = /\[INTERNAL_LINK:([^\]]+)\]/g;
    const codeFencePattern = /^```[\w]*\n|```$/gm;

    const affectedArticles: AffectedArticle[] = [];

    for (const article of articles || []) {
      const content = article.detailed_content || '';
      
      const citationMatches: RegExpMatchArray[] = Array.from(content.matchAll(citationPattern));
      const internalLinkMatches: RegExpMatchArray[] = Array.from(content.matchAll(internalLinkPattern));
      const codeFenceMatches: RegExpMatchArray[] = Array.from(content.matchAll(codeFencePattern));

      const citationCount = citationMatches.length;
      const internalLinkCount = internalLinkMatches.length;
      const codeFenceCount = codeFenceMatches.length;
      const totalIssues = citationCount + internalLinkCount + codeFenceCount;

      if (totalIssues > 0) {
        affectedArticles.push({
          id: article.id,
          headline: article.headline,
          language: article.language,
          slug: article.slug,
          status: article.status,
          citation_markers_count: citationCount,
          internal_link_markers_count: internalLinkCount,
          code_fence_count: codeFenceCount,
          total_issues: totalIssues,
          citation_markers: citationMatches.map(m => m[1].trim()),
          internal_link_markers: internalLinkMatches.map(m => m[1].trim()),
          content_preview: content.substring(0, 200),
        });
      }
    }

    // Sort by total issues descending
    affectedArticles.sort((a, b) => b.total_issues - a.total_issues);

    console.log(`✅ Found ${affectedArticles.length} articles with content markers`);

    // Calculate statistics
    const stats = {
      total_affected: affectedArticles.length,
      total_citation_markers: affectedArticles.reduce((sum, a) => sum + a.citation_markers_count, 0),
      total_internal_link_markers: affectedArticles.reduce((sum, a) => sum + a.internal_link_markers_count, 0),
      total_code_fences: affectedArticles.reduce((sum, a) => sum + a.code_fence_count, 0),
      by_language: {} as Record<string, number>,
      articles_scanned: articles?.length || 0,
    };

    affectedArticles.forEach(article => {
      stats.by_language[article.language] = (stats.by_language[article.language] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        affected_articles: affectedArticles,
        statistics: stats,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error detecting content markers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
