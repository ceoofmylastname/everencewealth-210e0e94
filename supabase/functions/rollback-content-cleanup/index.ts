import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RollbackRequest {
  revision_id: string;
  user_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { revision_id, user_id }: RollbackRequest = await req.json();

    if (!revision_id) {
      throw new Error('Revision ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🔄 Rolling back revision: ${revision_id}`);

    // Fetch revision
    const { data: revision, error: fetchError } = await supabase
      .from('article_revisions')
      .select('*')
      .eq('id', revision_id)
      .single();

    if (fetchError || !revision) {
      throw new Error('Revision not found');
    }

    // Verify can rollback
    if (!revision.can_rollback) {
      throw new Error('This revision can no longer be rolled back');
    }

    // Verify rollback window
    const expiresAt = new Date(revision.rollback_expires_at);
    if (expiresAt < new Date()) {
      throw new Error('Rollback window has expired (24 hours)');
    }

    // Fetch current article
    const { data: article, error: articleError } = await supabase
      .from('blog_articles')
      .select('headline, detailed_content, updated_at')
      .eq('id', revision.article_id)
      .single();

    if (articleError || !article) {
      throw new Error('Article not found');
    }

    // Restore previous content
    const { error: updateError } = await supabase
      .from('blog_articles')
      .update({
        detailed_content: revision.previous_content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', revision.article_id);

    if (updateError) {
      throw updateError;
    }

    // Mark revision as rolled back
    await supabase
      .from('article_revisions')
      .update({
        can_rollback: false,
      })
      .eq('id', revision_id);

    // Create new revision documenting the rollback
    await supabase.from('article_revisions').insert({
      article_id: revision.article_id,
      previous_content: article.detailed_content,
      revision_type: 'content_cleanup_rollback',
      changed_by: user_id,
      change_reason: `Rolled back content marker cleanup (revision ${revision_id})`,
      can_rollback: false,
    });

    // Log to content_updates
    await supabase.from('content_updates').insert({
      article_id: revision.article_id,
      update_type: 'content_cleanup_rollback',
      updated_fields: ['detailed_content'],
      update_notes: `Rolled back content marker cleanup to previous state`,
      updated_by: user_id,
      previous_date_modified: article.updated_at,
      new_date_modified: new Date().toISOString(),
    });

    console.log(`✅ Successfully rolled back article: ${article.headline}`);

    return new Response(
      JSON.stringify({
        success: true,
        article_id: revision.article_id,
        headline: article.headline,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error rolling back:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
