import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QAPage {
  id: string
  cluster_id: string | null
  language: string
  qa_type: string | null
  slug: string
  hreflang_group_id: string | null
  source_article_id: string | null
  created_at: string
}

/**
 * Repairs hreflang_group_id assignments for QA pages.
 * 
 * Strategy:
 * 1. Group Q&As by cluster_id and qa_type
 * 2. Within each group, use English Q&As as anchors
 * 3. Match other languages to English by position (creation order within cluster+qa_type)
 * 4. Assign the English Q&A's hreflang_group_id to all matching translations
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { dryRun = true, clusterId } = await req.json().catch(() => ({ dryRun: true }))

    console.log(`Starting hreflang group repair (dryRun: ${dryRun}, clusterId: ${clusterId || 'all'})`)

    // Fetch all published Q&A pages with cluster_id
    let query = supabase
      .from('qa_pages')
      .select('id, cluster_id, language, qa_type, slug, hreflang_group_id, source_article_id, created_at')
      .eq('status', 'published')
      .not('cluster_id', 'is', null)
      .order('cluster_id')
      .order('qa_type')
      .order('created_at')

    if (clusterId) {
      query = query.eq('cluster_id', clusterId)
    }

    const { data: qaPages, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching Q&A pages:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Q&A pages', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!qaPages || qaPages.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No Q&A pages found to repair', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${qaPages.length} Q&A pages to process`)

    // Group Q&As by cluster_id and qa_type
    const groupedQAs = new Map<string, QAPage[]>()
    for (const qa of qaPages) {
      const key = `${qa.cluster_id}::${qa.qa_type || 'unknown'}`
      if (!groupedQAs.has(key)) {
        groupedQAs.set(key, [])
      }
      groupedQAs.get(key)!.push(qa)
    }

    console.log(`Grouped into ${groupedQAs.size} cluster+qa_type combinations`)

    const updates: { id: string; hreflang_group_id: string; translations: Record<string, string> }[] = []
    const stats = {
      groupsProcessed: 0,
      englishAnchors: 0,
      translationsLinked: 0,
      noEnglishAnchor: 0,
    }

    for (const [groupKey, qas] of groupedQAs) {
      stats.groupsProcessed++
      
      // Separate English Q&As from other languages
      const englishQAs = qas.filter(q => q.language === 'en').sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      
      const otherLangQAs = qas.filter(q => q.language !== 'en')
      
      if (englishQAs.length === 0) {
        // No English anchor - use the first Q&A of any language as anchor
        stats.noEnglishAnchor++
        const sortedQAs = qas.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        
        if (sortedQAs.length > 0) {
          const anchor = sortedQAs[0]
          const hreflangGroupId = anchor.hreflang_group_id || anchor.id
          
          // Group all Q&As in this group under the anchor's hreflang_group_id
          const translations: Record<string, string> = {}
          for (const qa of sortedQAs) {
            translations[qa.language] = qa.slug
          }
          
          for (const qa of sortedQAs) {
            if (qa.hreflang_group_id !== hreflangGroupId) {
              updates.push({ id: qa.id, hreflang_group_id: hreflangGroupId, translations })
            }
          }
        }
        continue
      }

      stats.englishAnchors += englishQAs.length

      // Group other language Q&As by language
      const otherByLang = new Map<string, QAPage[]>()
      for (const qa of otherLangQAs) {
        if (!otherByLang.has(qa.language)) {
          otherByLang.set(qa.language, [])
        }
        otherByLang.get(qa.language)!.push(qa)
      }

      // Sort each language's Q&As by creation time
      for (const [lang, langQAs] of otherByLang) {
        langQAs.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }

      // Match translations by position
      for (let i = 0; i < englishQAs.length; i++) {
        const englishQA = englishQAs[i]
        const hreflangGroupId = englishQA.hreflang_group_id || englishQA.id
        
        // Build translations map
        const translations: Record<string, string> = {
          en: englishQA.slug
        }
        
        const toUpdate: QAPage[] = [englishQA]

        // Match each language's i-th Q&A to this English anchor
        for (const [lang, langQAs] of otherByLang) {
          if (i < langQAs.length) {
            const matchedQA = langQAs[i]
            translations[lang] = matchedQA.slug
            toUpdate.push(matchedQA)
            stats.translationsLinked++
          }
        }

        // Queue updates for all matched Q&As
        for (const qa of toUpdate) {
          if (qa.hreflang_group_id !== hreflangGroupId) {
            updates.push({ id: qa.id, hreflang_group_id: hreflangGroupId, translations })
          } else {
            // Even if group ID matches, update translations JSONB
            updates.push({ id: qa.id, hreflang_group_id: hreflangGroupId, translations })
          }
        }
      }
    }

    console.log(`Stats:`, stats)
    console.log(`Total updates queued: ${updates.length}`)

    if (dryRun) {
      // Return preview of changes without applying
      const preview = updates.slice(0, 20).map(u => ({
        id: u.id,
        new_hreflang_group_id: u.hreflang_group_id,
        languages_linked: Object.keys(u.translations),
      }))

      return new Response(
        JSON.stringify({
          dryRun: true,
          message: `Would update ${updates.length} Q&A pages`,
          stats,
          preview,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Apply updates in batches
    let successCount = 0
    let errorCount = 0
    const batchSize = 50

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('qa_pages')
          .update({
            hreflang_group_id: update.hreflang_group_id,
            translations: update.translations,
          })
          .eq('id', update.id)

        if (updateError) {
          console.error(`Error updating Q&A ${update.id}:`, updateError)
          errorCount++
        } else {
          successCount++
        }
      }

      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, success: ${successCount}, errors: ${errorCount}`)
    }

    return new Response(
      JSON.stringify({
        dryRun: false,
        message: `Updated ${successCount} Q&A pages (${errorCount} errors)`,
        stats: {
          ...stats,
          successCount,
          errorCount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in repair-hreflang-groups:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
