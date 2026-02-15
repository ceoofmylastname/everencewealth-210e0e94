import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALL_SUPPORTED_LANGUAGES = ['en', 'de', 'nl', 'fr', 'pl', 'sv', 'da', 'hu', 'fi', 'no'];

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German',
  nl: 'Dutch',
  fr: 'French',
  pl: 'Polish',
  sv: 'Swedish',
  da: 'Danish',
  hu: 'Hungarian',
  fi: 'Finnish',
  no: 'Norwegian',
};

const BASE_URL = 'https://www.everencewealth.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      comparison_id,
      hreflang_group_id,
      dry_run = true,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Find the source comparison (prefer English)
    let sourceQuery = supabase.from('comparison_pages').select('*');
    
    if (comparison_id) {
      sourceQuery = sourceQuery.eq('id', comparison_id);
    } else if (hreflang_group_id) {
      sourceQuery = sourceQuery.eq('hreflang_group_id', hreflang_group_id).eq('language', 'en');
    } else {
      // Find ALL incomplete groups
      const { data: allComparisons } = await supabase
        .from('comparison_pages')
        .select('hreflang_group_id, comparison_topic, language')
        .not('hreflang_group_id', 'is', null);
      
      // Group by hreflang_group_id
      const groups: Record<string, { topic: string; languages: string[] }> = {};
      for (const c of (allComparisons || [])) {
        if (!c.hreflang_group_id) continue;
        if (!groups[c.hreflang_group_id]) {
          groups[c.hreflang_group_id] = { topic: c.comparison_topic, languages: [] };
        }
        groups[c.hreflang_group_id].languages.push(c.language);
      }
      
      // Find incomplete groups
      const incompleteGroups = Object.entries(groups)
        .filter(([_, g]) => g.languages.length < 10)
        .map(([id, g]) => ({
          hreflang_group_id: id,
          topic: g.topic,
          existing_languages: g.languages,
          missing_languages: ALL_SUPPORTED_LANGUAGES.filter(l => !g.languages.includes(l)),
        }));
      
      return new Response(
        JSON.stringify({ 
          mode: 'audit',
          total_groups: Object.keys(groups).length,
          incomplete_groups: incompleteGroups.length,
          groups: incompleteGroups,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: sourceComparison, error: fetchError } = await sourceQuery.single();

    if (fetchError || !sourceComparison) {
      // Try to find any comparison in the group
      if (hreflang_group_id) {
        const { data: anyComparison } = await supabase
          .from('comparison_pages')
          .select('*')
          .eq('hreflang_group_id', hreflang_group_id)
          .limit(1)
          .single();
        
        if (anyComparison) {
          console.log(`No English found for group ${hreflang_group_id}, using ${anyComparison.language} as source`);
          // Continue with this comparison
        } else {
          return new Response(
            JSON.stringify({ error: 'No comparison found for this group' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Source comparison not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch all existing siblings
    const groupId = sourceComparison.hreflang_group_id || sourceComparison.id;
    
    const { data: existingSiblings } = await supabase
      .from('comparison_pages')
      .select('id, language, slug, comparison_topic')
      .eq('hreflang_group_id', groupId);

    const existingLanguages = (existingSiblings || []).map(s => s.language);
    const missingLanguages = ALL_SUPPORTED_LANGUAGES.filter(l => !existingLanguages.includes(l));
    
    console.log(`Source: ${sourceComparison.comparison_topic}`);
    console.log(`Existing languages: ${existingLanguages.join(', ')}`);
    console.log(`Missing languages: ${missingLanguages.join(', ')}`);

    if (missingLanguages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All 10 languages already exist',
          hreflang_group_id: groupId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (dry_run) {
      return new Response(
        JSON.stringify({ 
          mode: 'dry_run',
          hreflang_group_id: groupId,
          comparison_topic: sourceComparison.comparison_topic,
          existing_languages: existingLanguages,
          missing_languages: missingLanguages,
          will_generate: missingLanguages.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find English source for translation (or use first available)
    let englishSource = existingSiblings?.find(s => s.language === 'en');
    let translationSource: any = sourceComparison;
    
    if (englishSource && englishSource.id !== sourceComparison.id) {
      const { data: engData } = await supabase
        .from('comparison_pages')
        .select('*')
        .eq('id', englishSource.id)
        .single();
      if (engData) translationSource = engData;
    }

    // Generate missing languages
    const results: { language: string; success: boolean; slug?: string; error?: string }[] = [];
    const allSlugs: Record<string, string> = {};
    
    // Collect existing slugs
    for (const sibling of (existingSiblings || [])) {
      allSlugs[sibling.language] = sibling.slug;
    }

    const baseSlug = translationSource.slug.replace(/-[a-z]{2}$/, '');

    for (const lang of missingLanguages) {
      const languageName = LANGUAGE_NAMES[lang];
      console.log(`Generating ${languageName} (${lang})...`);

      const contentToTranslate = {
        headline: translationSource.headline,
        meta_title: translationSource.meta_title,
        meta_description: translationSource.meta_description,
        speakable_answer: translationSource.speakable_answer,
        option_a_overview: translationSource.option_a_overview,
        option_b_overview: translationSource.option_b_overview,
        side_by_side_breakdown: translationSource.side_by_side_breakdown,
        use_case_scenarios: translationSource.use_case_scenarios,
        final_verdict: translationSource.final_verdict,
        quick_comparison_table: translationSource.quick_comparison_table,
        qa_entities: translationSource.qa_entities,
      };

      const translationPrompt = `Translate this comparison page content from ${translationSource.language === 'en' ? 'English' : LANGUAGE_NAMES[translationSource.language]} to ${languageName}.

CRITICAL RULES:
1. Keep the JSON structure EXACTLY the same
2. Translate ALL text content to ${languageName}
3. Maintain the same authoritative, neutral, evidence-based tone
4. Keep HTML tags intact (<p>, <ul>, <li>, <strong>, <em>, <h3>, <h4>)
5. Do NOT translate: option names, URLs, or technical terms that should remain in English
6. For quick_comparison_table: translate criterion names and values
7. For qa_entities: translate both questions and answers
8. Keep word limits similar to original

Source content:
${JSON.stringify(contentToTranslate, null, 2)}

Return ONLY valid JSON with all content in ${languageName}, no markdown, no explanation.`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: `You are a professional translator. Translate all content to ${languageName} while maintaining the exact JSON structure.`
              },
              { role: 'user', content: translationPrompt }
            ],
            temperature: 0.3,
            max_tokens: 8000,
          }),
        });

        if (!response.ok) {
          results.push({ language: lang, success: false, error: `API error: ${response.status}` });
          continue;
        }

        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content;

        if (!content) {
          results.push({ language: lang, success: false, error: 'No content received' });
          continue;
        }

        let translatedContent;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            translatedContent = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found');
          }
        } catch {
          results.push({ language: lang, success: false, error: 'Failed to parse response' });
          continue;
        }

        // Generate slug
        const newSlug = `${baseSlug}-${lang}`;
        allSlugs[lang] = newSlug;

        const canonicalUrl = `${BASE_URL}/${lang}/compare/${newSlug}`;

        const comparisonData = {
          option_a: translationSource.option_a,
          option_b: translationSource.option_b,
          comparison_topic: translationSource.comparison_topic,
          niche: translationSource.niche,
          target_audience: translationSource.target_audience,
          language: lang,
          source_language: translationSource.language || 'en',
          hreflang_group_id: groupId,
          slug: newSlug,
          canonical_url: canonicalUrl,
          headline: translatedContent.headline,
          meta_title: translatedContent.meta_title,
          meta_description: translatedContent.meta_description,
          speakable_answer: translatedContent.speakable_answer,
          quick_comparison_table: translatedContent.quick_comparison_table,
          option_a_overview: translatedContent.option_a_overview,
          option_b_overview: translatedContent.option_b_overview,
          side_by_side_breakdown: translatedContent.side_by_side_breakdown,
          use_case_scenarios: translatedContent.use_case_scenarios,
          final_verdict: translatedContent.final_verdict,
          qa_entities: translatedContent.qa_entities,
          featured_image_url: translationSource.featured_image_url,
          internal_links: translationSource.internal_links || [],
          external_citations: translationSource.external_citations || [],
          author_id: translationSource.author_id,
          reviewer_id: translationSource.reviewer_id,
          status: 'draft',
          date_modified: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('comparison_pages')
          .insert(comparisonData);

        if (insertError) {
          results.push({ language: lang, success: false, error: insertError.message });
        } else {
          results.push({ language: lang, success: true, slug: newSlug });
          console.log(`Created ${lang}: ${newSlug}`);
        }

      } catch (error) {
        results.push({ 
          language: lang, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Update translations JSONB for ALL siblings (including new ones)
    const { data: allSiblings } = await supabase
      .from('comparison_pages')
      .select('id, language, slug')
      .eq('hreflang_group_id', groupId);

    if (allSiblings && allSiblings.length > 0) {
      const fullTranslationsMap: Record<string, string> = {};
      for (const sibling of allSiblings) {
        fullTranslationsMap[sibling.language] = sibling.slug;
      }

      for (const sibling of allSiblings) {
        const siblingCanonical = `${BASE_URL}/${sibling.language}/compare/${sibling.slug}`;
        await supabase
          .from('comparison_pages')
          .update({ 
            translations: fullTranslationsMap,
            canonical_url: siblingCanonical,
          })
          .eq('id', sibling.id);
      }
      
      console.log(`Updated translations JSONB for ${allSiblings.length} siblings`);
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ 
        success: successCount === missingLanguages.length,
        hreflang_group_id: groupId,
        comparison_topic: translationSource.comparison_topic,
        languages_generated: successCount,
        languages_needed: missingLanguages.length,
        total_languages_now: existingLanguages.length + successCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in backfill-comparison-languages:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
