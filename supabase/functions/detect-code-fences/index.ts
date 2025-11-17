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
  fields_affected: string[];
  previews: Record<string, string>;
  fence_types: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Scanning all articles for code fence prefixes...');

    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select('id, headline, language, slug, speakable_answer, detailed_content');

    if (error) {
      throw error;
    }

    const codeFencePattern = /^```([\w]*)\n/;
    const affectedArticles: AffectedArticle[] = [];

    for (const article of articles || []) {
      const fieldsAffected: string[] = [];
      const previews: Record<string, string> = {};
      const fenceTypes: Record<string, string> = {};

      // Check speakable_answer
      if (article.speakable_answer && codeFencePattern.test(article.speakable_answer)) {
        fieldsAffected.push('speakable_answer');
        previews.speakable_answer = article.speakable_answer.substring(0, 200);
        const match = article.speakable_answer.match(codeFencePattern);
        fenceTypes.speakable_answer = match?.[1] || 'generic';
      }

      // Check detailed_content
      if (article.detailed_content && codeFencePattern.test(article.detailed_content)) {
        fieldsAffected.push('detailed_content');
        previews.detailed_content = article.detailed_content.substring(0, 200);
        const match = article.detailed_content.match(codeFencePattern);
        fenceTypes.detailed_content = match?.[1] || 'generic';
      }

      if (fieldsAffected.length > 0) {
        affectedArticles.push({
          id: article.id,
          headline: article.headline,
          language: article.language,
          slug: article.slug,
          fields_affected: fieldsAffected,
          previews,
          fence_types: fenceTypes,
        });
      }
    }

    console.log(`✅ Found ${affectedArticles.length} articles with code fence prefixes`);

    return new Response(
      JSON.stringify({
        affected_articles: affectedArticles,
        total_affected: affectedArticles.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error detecting code fences:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
