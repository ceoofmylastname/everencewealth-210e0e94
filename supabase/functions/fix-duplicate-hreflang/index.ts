import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QAPage {
  id: string;
  language: string;
  qa_type: string;
  slug: string;
  hreflang_group_id: string | null;
  canonical_url: string | null;
  translations: Record<string, string> | null;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dryRun = true, cluster_id } = await req.json().catch(() => ({ dryRun: true }));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting duplicate hreflang fix (dryRun: ${dryRun}${cluster_id ? `, cluster: ${cluster_id}` : ''})`);

    // Fetch Q&A pages with their hreflang groups (optionally filtered by cluster)
    let query = supabase
      .from('qa_pages')
      .select('id, language, qa_type, slug, hreflang_group_id, canonical_url, translations, created_at, cluster_id')
      .eq('status', 'published')
      .not('hreflang_group_id', 'is', null);
    
    if (cluster_id) {
      query = query.eq('cluster_id', cluster_id);
      console.log(`🎯 Filtering to cluster: ${cluster_id}`);
    }
    
    const { data: qaPages, error: qaError } = await query.order('created_at', { ascending: true });

    if (qaError) {
      throw new Error(`Failed to fetch Q&A pages: ${qaError.message}`);
    }

    // Group by hreflang_group_id
    const groupMap = new Map<string, QAPage[]>();
    for (const qa of qaPages || []) {
      if (!qa.hreflang_group_id) continue;
      if (!groupMap.has(qa.hreflang_group_id)) {
        groupMap.set(qa.hreflang_group_id, []);
      }
      groupMap.get(qa.hreflang_group_id)!.push(qa);
    }

    // Find groups with duplicate languages
    const groupsWithDuplicates: { 
      groupId: string; 
      duplicates: { language: string; qas: QAPage[] }[] 
    }[] = [];

    for (const [groupId, qas] of groupMap) {
      const languageCounts = qas.reduce((acc, qa) => {
        acc[qa.language] = acc[qa.language] || [];
        acc[qa.language].push(qa);
        return acc;
      }, {} as Record<string, QAPage[]>);

      const duplicates = Object.entries(languageCounts)
        .filter(([_, pages]) => pages.length > 1)
        .map(([language, pages]) => ({ language, qas: pages }));

      if (duplicates.length > 0) {
        groupsWithDuplicates.push({ groupId, duplicates });
      }
    }

    console.log(`Found ${groupsWithDuplicates.length} groups with duplicate languages`);

    if (groupsWithDuplicates.length === 0) {
      return new Response(JSON.stringify({
        message: 'No duplicate languages found in any hreflang group',
        groups_checked: groupMap.size,
        duplicates_found: 0,
        dry_run: dryRun
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process each group with duplicates
    const updates: { id: string; hreflang_group_id: string; translations: Record<string, string> }[] = [];
    const kept: { id: string; slug: string; language: string; reason: string }[] = [];
    const moved: { id: string; slug: string; language: string; old_group: string; new_group: string }[] = [];

    for (const { groupId, duplicates } of groupsWithDuplicates) {
      const allQAsInGroup = groupMap.get(groupId) || [];
      
      for (const { language, qas } of duplicates) {
        // NEW LOGIC: Check which Q&A slug is referenced by OTHER languages' translations
        // The one that matches what other languages point to is the "correct" one
        
        const otherLanguageQAs = allQAsInGroup.filter(qa => qa.language !== language);
        const slugReferenceCounts = new Map<string, number>();
        
        for (const qa of qas) {
          slugReferenceCounts.set(qa.slug, 0);
        }
        
        // Count how many other languages reference each slug
        for (const otherQA of otherLanguageQAs) {
          if (otherQA.translations && typeof otherQA.translations === 'object') {
            const referencedSlug = otherQA.translations[language];
            if (referencedSlug && slugReferenceCounts.has(referencedSlug)) {
              slugReferenceCounts.set(referencedSlug, slugReferenceCounts.get(referencedSlug)! + 1);
            }
          }
        }
        
        // Sort by: most references first, then has canonical, then oldest
        const sorted = [...qas].sort((a, b) => {
          const aRefs = slugReferenceCounts.get(a.slug) || 0;
          const bRefs = slugReferenceCounts.get(b.slug) || 0;
          if (aRefs !== bRefs) return bRefs - aRefs; // More references = better
          if (a.canonical_url && !b.canonical_url) return -1;
          if (!a.canonical_url && b.canonical_url) return 1;
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        const [keepQA, ...moveQAs] = sorted;
        const keepReason = (slugReferenceCounts.get(keepQA.slug) || 0) > 0 
          ? 'referenced_by_translations' 
          : (keepQA.canonical_url ? 'has_canonical' : 'oldest');
        
        kept.push({
          id: keepQA.id,
          slug: keepQA.slug,
          language: keepQA.language,
          reason: keepReason
        });

        // Move duplicates to their own isolated groups
        for (const moveQA of moveQAs) {
          const newGroupId = crypto.randomUUID();
          
          updates.push({
            id: moveQA.id,
            hreflang_group_id: newGroupId,
            translations: { [moveQA.language]: moveQA.slug }
          });

          moved.push({
            id: moveQA.id,
            slug: moveQA.slug,
            language: moveQA.language,
            old_group: groupId,
            new_group: newGroupId
          });
        }
      }

      // Rebuild translations for the original group (without moved duplicates)
      const remainingQAs = allQAsInGroup.filter(qa => 
        !moved.some(m => m.id === qa.id)
      );
      
      const newTranslations: Record<string, string> = {};
      for (const qa of remainingQAs) {
        newTranslations[qa.language] = qa.slug;
      }

      // Update remaining QAs with corrected translations
      for (const qa of remainingQAs) {
        const existingUpdate = updates.find(u => u.id === qa.id);
        if (!existingUpdate) {
          updates.push({
            id: qa.id,
            hreflang_group_id: groupId,
            translations: newTranslations
          });
        }
      }
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        message: 'Dry run complete',
        dry_run: true,
        summary: {
          groups_with_duplicates: groupsWithDuplicates.length,
          qas_to_keep: kept.length,
          qas_to_move: moved.length,
          total_updates: updates.length
        },
        kept,
        moved,
        sample_updates: updates.slice(0, 10).map(u => ({
          id: u.id,
          hreflang_group_id: u.hreflang_group_id.substring(0, 8) + '...',
          translations: u.translations
        }))
      }, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Apply updates in batches
    let successCount = 0;
    let errorCount = 0;
    const batchSize = 50;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        const { error } = await supabase
          .from('qa_pages')
          .update({
            hreflang_group_id: update.hreflang_group_id,
            translations: update.translations
          })
          .eq('id', update.id);

        if (error) {
          console.error(`Failed to update QA ${update.id}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

    console.log(`Fix complete: ${successCount} updated, ${errorCount} errors`);

    return new Response(JSON.stringify({
      message: 'Duplicate hreflang fix applied',
      dry_run: false,
      summary: {
        groups_fixed: groupsWithDuplicates.length,
        qas_kept: kept.length,
        qas_moved: moved.length,
        updates_applied: successCount,
        errors: errorCount
      },
      kept,
      moved
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fix error:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
