import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_NAMES: Record<string, string> = {
  de: 'German',
  nl: 'Dutch',
  fr: 'French',
  pl: 'Polish',
  sv: 'Swedish',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian',
  hu: 'Hungarian',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clusterId, dryRun = false, limit = 50 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query for non-English articles missing localized bio
    let query = supabase
      .from('blog_articles')
      .select('id, headline, language, author_id')
      .neq('language', 'en')
      .is('author_bio_localized', null)
      .not('author_id', 'is', null)
      .eq('status', 'published')
      .limit(limit);

    if (clusterId) {
      query = query.eq('cluster_id', clusterId);
    }

    const { data: articles, error: articlesError } = await query;

    if (articlesError) {
      throw articlesError;
    }

    console.log(`Found ${articles?.length || 0} articles needing EEAT translation`);

    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No articles need EEAT translation',
        updated: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get unique author IDs
    const authorIds = [...new Set(articles.map(a => a.author_id).filter(Boolean))];
    
    // Fetch authors
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .select('id, bio, job_title, name')
      .in('id', authorIds);

    if (authorsError) {
      throw authorsError;
    }

    const authorMap = new Map(authors?.map(a => [a.id, a]) || []);

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        articlesToUpdate: articles.length,
        articles: articles.map(a => ({
          id: a.id,
          headline: a.headline,
          language: a.language,
          authorName: authorMap.get(a.author_id)?.name,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group articles by language and author for efficient batch translation
    const groupedByLangAuthor = new Map<string, typeof articles>();
    for (const article of articles) {
      const key = `${article.language}:${article.author_id}`;
      if (!groupedByLangAuthor.has(key)) {
        groupedByLangAuthor.set(key, []);
      }
      groupedByLangAuthor.get(key)!.push(article);
    }

    let updated = 0;
    const errors: string[] = [];

    for (const [key, groupedArticles] of groupedByLangAuthor) {
      const [language, authorId] = key.split(':');
      const author = authorMap.get(authorId);
      
      if (!author) {
        errors.push(`Author not found for ID: ${authorId}`);
        continue;
      }

      const targetLang = LANGUAGE_NAMES[language] || language;

      try {
        // Translate author bio to target language
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional translator specializing in real estate content. Translate the following author bio from English to ${targetLang}. Keep the same professional tone and maintain any proper nouns (names, certifications, organizations) unchanged. Return ONLY the translated text, no explanations.`
              },
              {
                role: 'user',
                content: author.bio
              }
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error for ${targetLang}:`, errorText);
          errors.push(`Translation failed for ${targetLang}: ${errorText}`);
          continue;
        }

        const data = await response.json();
        const translatedBio = data.choices[0]?.message?.content?.trim();

        if (!translatedBio) {
          errors.push(`Empty translation for ${targetLang}`);
          continue;
        }

        console.log(`Translated bio to ${targetLang}: ${translatedBio.substring(0, 100)}...`);

        // Update all articles in this group with the translated bio
        const articleIds = groupedArticles.map(a => a.id);
        const { error: updateError } = await supabase
          .from('blog_articles')
          .update({ author_bio_localized: translatedBio })
          .in('id', articleIds);

        if (updateError) {
          errors.push(`Update failed for ${articleIds.length} articles: ${updateError.message}`);
        } else {
          updated += articleIds.length;
          console.log(`Updated ${articleIds.length} ${targetLang} articles with translated bio`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error translating to ${targetLang}:`, err);
        errors.push(`${targetLang}: ${errorMessage}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      updated,
      total: articles.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in backfill-eeat-translations:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
