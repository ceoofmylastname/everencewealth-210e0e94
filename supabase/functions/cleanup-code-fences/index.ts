import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupRequest {
  article_ids: string[];
  backup_enabled: boolean;
  user_id: string;
}

interface CleanupResult {
  article_id: string;
  headline: string;
  success: boolean;
  changes: Record<string, string>;
  revision_id?: string;
  error?: string;
}

function removeCodeFence(content: string): {
  cleaned: string;
  wasChanged: boolean;
  removedFence: string | null;
} {
  const codeFencePattern = /^```([\w]*)\n/;
  const match = content.match(codeFencePattern);

  if (!match) {
    return { cleaned: content, wasChanged: false, removedFence: null };
  }

  let cleaned = content.replace(codeFencePattern, '');
  const fenceType = match[1] || 'generic';

  // Also remove closing fence if at end
  if (cleaned.endsWith('\n```')) {
    cleaned = cleaned.replace(/\n```$/, '');
  }

  return {
    cleaned: cleaned.trim(),
    wasChanged: true,
    removedFence: fenceType,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { article_ids, backup_enabled, user_id }: CleanupRequest = await req.json();

    if (!article_ids || article_ids.length === 0) {
      throw new Error('No article IDs provided');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🧹 Cleaning ${article_ids.length} articles...`);
    console.log(`📦 Backup enabled: ${backup_enabled}`);

    const results: CleanupResult[] = [];

    for (const articleId of article_ids) {
      try {
        // Fetch current article
        const { data: article, error: fetchError } = await supabase
          .from('blog_articles')
          .select('id, headline, speakable_answer, detailed_content, updated_at')
          .eq('id', articleId)
          .single();

        if (fetchError || !article) {
          results.push({
            article_id: articleId,
            headline: 'Unknown',
            success: false,
            changes: {},
          error: 'Article not found',
        });
        continue;
      }

      const changes: Record<string, string> = {};
      const updateData: any = {};

      // Clean speakable_answer
      if (article.speakable_answer) {
        const result = removeCodeFence(article.speakable_answer);
        if (result.wasChanged) {
          updateData.speakable_answer = result.cleaned;
          changes.speakable_answer = `Removed ${result.removedFence} fence`;
        }
      }

      // Clean detailed_content
      if (article.detailed_content) {
        const result = removeCodeFence(article.detailed_content);
        if (result.wasChanged) {
          updateData.detailed_content = result.cleaned;
          changes.detailed_content = `Removed ${result.removedFence} fence`;
        }
      }

      if (Object.keys(changes).length === 0) {
        results.push({
          article_id: articleId,
          headline: article.headline,
          success: true,
          changes: { info: 'No changes needed' },
        });
        continue;
      }

      let revisionId: string | undefined;

      // Create backup if enabled
      if (backup_enabled) {
        const rollbackExpiresAt = new Date();
        rollbackExpiresAt.setHours(rollbackExpiresAt.getHours() + 24);

        const { data: revision, error: revisionError } = await supabase
          .from('article_revisions')
          .insert({
            article_id: articleId,
            previous_content: article.detailed_content,
            revision_type: 'code_fence_cleanup',
            changed_by: user_id,
            change_reason: 'Removed code fence prefix',
            can_rollback: true,
            rollback_expires_at: rollbackExpiresAt.toISOString(),
          })
          .select('id')
          .single();

        if (revisionError) {
          console.error('⚠️ Failed to create backup:', revisionError);
        } else {
          revisionId = revision?.id;
        }
      }

      // Update article
      const { error: updateError } = await supabase
        .from('blog_articles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (updateError) {
        throw updateError;
      }

      // Log to content_updates
      await supabase.from('content_updates').insert({
        article_id: articleId,
        update_type: 'code_fence_cleanup',
        updated_fields: Object.keys(changes),
        update_notes: `Removed code fence prefixes: ${Object.values(changes).join(', ')}`,
        updated_by: user_id,
        previous_date_modified: article.updated_at,
        new_date_modified: new Date().toISOString(),
      });

      console.log(`✅ Cleaned article: ${article.headline}`);

      results.push({
        article_id: articleId,
        headline: article.headline,
        success: true,
        changes,
        revision_id: revisionId,
      });
    } catch (error) {
      console.error(`❌ Failed to clean article ${articleId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        article_id: articleId,
        headline: 'Unknown',
        success: false,
        changes: {},
        error: errorMessage,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    console.log(`🎉 Cleanup complete: ${successCount} success, ${errorCount} failed`);

    return new Response(
      JSON.stringify({
        results,
        success_count: successCount,
        error_count: errorCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error cleaning code fences:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
