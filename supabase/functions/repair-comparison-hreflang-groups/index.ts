import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComparisonPage {
  id: string;
  slug: string;
  language: string;
  comparison_topic: string;
  option_a: string;
  option_b: string;
  hreflang_group_id: string | null;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dryRun = true } = await req.json().catch(() => ({ dryRun: true }));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting comparison hreflang repair (dryRun: ${dryRun})`);

    // Fetch all published comparison pages
    const { data: comparisons, error: fetchError } = await supabase
      .from('comparison_pages')
      .select('id, slug, language, comparison_topic, option_a, option_b, hreflang_group_id, status')
      .eq('status', 'published');

    if (fetchError) {
      throw new Error(`Failed to fetch comparisons: ${fetchError.message}`);
    }

    console.log(`Found ${comparisons?.length || 0} published comparison pages`);

    if (!comparisons || comparisons.length === 0) {
      return new Response(JSON.stringify({
        message: 'No published comparison pages found',
        dry_run: dryRun
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Group comparisons by their semantic topic (option_a + option_b combination)
    // This groups translations of the same comparison together
    const topicGroups = new Map<string, ComparisonPage[]>();
    
    for (const comp of comparisons) {
      // Create a normalized key from options (alphabetically sorted to match regardless of order)
      const optionKey = [comp.option_a, comp.option_b]
        .map(o => o.toLowerCase().trim())
        .sort()
        .join('|');
      
      if (!topicGroups.has(optionKey)) {
        topicGroups.set(optionKey, []);
      }
      topicGroups.get(optionKey)!.push(comp);
    }

    console.log(`Grouped into ${topicGroups.size} topic groups`);

    // Build updates
    const updates: { 
      id: string; 
      hreflang_group_id: string; 
      translations: Record<string, string>;
    }[] = [];

    const groupStats: { topic: string; languages: string[]; pages: number }[] = [];

    for (const [topicKey, pages] of topicGroups) {
      // Use existing hreflang_group_id if any page has one, otherwise create new
      const existingGroupId = pages.find(p => p.hreflang_group_id)?.hreflang_group_id;
      const groupId = existingGroupId || crypto.randomUUID();
      
      // Build translations JSONB - map language to slug
      const translations: Record<string, string> = {};
      const languages: string[] = [];
      
      for (const page of pages) {
        translations[page.language] = page.slug;
        languages.push(page.language);
      }

      // Track stats
      groupStats.push({
        topic: pages[0].comparison_topic,
        languages,
        pages: pages.length
      });

      // Create update for each page in the group
      for (const page of pages) {
        // Only update if something changed
        const needsUpdate = page.hreflang_group_id !== groupId;
        
        if (needsUpdate || dryRun) {
          updates.push({
            id: page.id,
            hreflang_group_id: groupId,
            translations
          });
        }
      }
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        message: 'Dry run complete',
        dry_run: true,
        summary: {
          total_comparisons: comparisons.length,
          topic_groups: topicGroups.size,
          updates_needed: updates.length
        },
        groups: groupStats.slice(0, 20),
        sample_updates: updates.slice(0, 10).map(u => ({
          id: u.id,
          hreflang_group_id: u.hreflang_group_id.substring(0, 8) + '...',
          translations: u.translations
        }))
      }, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Apply updates
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      const { error } = await supabase
        .from('comparison_pages')
        .update({
          hreflang_group_id: update.hreflang_group_id,
          translations: update.translations
        })
        .eq('id', update.id);

      if (error) {
        console.error(`Failed to update comparison ${update.id}:`, error.message);
        errorCount++;
      } else {
        successCount++;
      }
    }

    console.log(`Repair complete: ${successCount} updated, ${errorCount} errors`);

    return new Response(JSON.stringify({
      message: 'Comparison hreflang repair applied',
      dry_run: false,
      summary: {
        total_comparisons: comparisons.length,
        topic_groups: topicGroups.size,
        updates_applied: successCount,
        errors: errorCount
      },
      groups: groupStats
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Repair error:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
