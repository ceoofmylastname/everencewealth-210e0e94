import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all published English comparisons
    const { data: englishComparisons, error: fetchError } = await supabase
      .from('comparison_pages')
      .select('id, comparison_topic, slug, headline')
      .eq('language', 'en')
      .eq('status', 'published');

    if (fetchError) throw new Error(`Failed to fetch comparisons: ${fetchError.message}`);
    if (!englishComparisons || englishComparisons.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No published English comparisons found', translated: [], skipped: [], errors: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check which ones already have Spanish translations
    const { data: spanishComparisons } = await supabase
      .from('comparison_pages')
      .select('comparison_topic')
      .eq('language', 'es');

    const spanishTopics = new Set((spanishComparisons || []).map(c => c.comparison_topic));

    const missing = englishComparisons.filter(c => !spanishTopics.has(c.comparison_topic));

    if (missing.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All comparisons already translated to Spanish', translated: [], skipped: englishComparisons.map(c => c.comparison_topic), errors: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${missing.length} comparisons missing Spanish translations`);

    const translated: string[] = [];
    const errors: { topic: string; error: string }[] = [];

    // Translate sequentially to avoid rate limits
    for (const comparison of missing) {
      try {
        console.log(`Translating: ${comparison.comparison_topic}`);
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/translate-comparison`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            comparison_id: comparison.id,
            target_language: 'es',
          }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.error || `HTTP ${response.status}`);
        }

        translated.push(comparison.comparison_topic);
        console.log(`✓ Translated: ${comparison.comparison_topic}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ topic: comparison.comparison_topic, error: errorMsg });
        console.error(`✗ Failed: ${comparison.comparison_topic} - ${errorMsg}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Translated ${translated.length}/${missing.length} comparisons to Spanish`,
        translated,
        errors,
        total_english: englishComparisons.length,
        already_translated: englishComparisons.length - missing.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Batch translate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
