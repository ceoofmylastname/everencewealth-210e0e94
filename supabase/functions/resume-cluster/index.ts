import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RUNTIME = 4.5 * 60 * 1000; // 4.5 minutes
const ARTICLE_ESTIMATE = 60000; // 60 seconds per article

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const FUNCTION_START_TIME = Date.now();
  
  try {
    const { jobId } = await req.json();
    
    if (!jobId) {
      throw new Error('jobId is required');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log(`[Resume ${jobId}] 🔄 Starting resume generation`);

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('cluster_generations')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error('Job not found');
    }

    // Validate job can be resumed
    if (!job.article_structure) {
      throw new Error('Job missing article_structure - cannot resume. Please start a new generation.');
    }

    if (job.status === 'completed') {
      console.log(`[Resume ${jobId}] ✅ Job already completed`);
      return new Response(
        JSON.stringify({
          success: true,
          jobId,
          isComplete: true,
          message: 'Cluster already complete'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const articleStructures = job.article_structure;
    const totalArticles = job.total_articles || 6;

    // Find which articles are already generated
    const { data: existingArticles } = await supabase
      .from('blog_articles')
      .select('id, cluster_number')
      .eq('cluster_id', jobId)
      .order('cluster_number', { ascending: true });

    const existingNumbers = new Set(existingArticles?.map(a => a.cluster_number) || []);
    const remainingIndices = Array.from({ length: totalArticles }, (_, i) => i)
      .filter(i => !existingNumbers.has(i + 1));

    console.log(`[Resume ${jobId}] 📊 Progress: ${existingNumbers.size}/${totalArticles} articles`);
    console.log(`[Resume ${jobId}] 📝 Remaining indices:`, remainingIndices);

    if (remainingIndices.length === 0) {
      // Mark as completed
      await supabase
        .from('cluster_generations')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({
          success: true,
          jobId,
          isComplete: true,
          totalGenerated: totalArticles,
          message: 'Cluster complete - all articles generated'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to generating
    await supabase
      .from('cluster_generations')
      .update({ 
        status: 'generating',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Helper to check remaining time
    const remainingTime = () => MAX_RUNTIME - (Date.now() - FUNCTION_START_TIME);
    const hasTimeForAnother = () => remainingTime() > ARTICLE_ESTIMATE;

    let generatedInThisRun = 0;
    const savedArticleIds = existingArticles?.map(a => a.id) || [];

    // Process remaining articles
    for (const index of remainingIndices) {
      if (!hasTimeForAnother()) {
        console.log(`[Resume ${jobId}] ⏱️ Time limit approaching. Stopping. Generated ${generatedInThisRun} in this run.`);
        break;
      }

      const articleStructure = articleStructures[index];
      console.log(`[Resume ${jobId}] 📝 Generating article ${index + 1}/${totalArticles}: ${articleStructure.headline}`);

      try {
        // This would contain the full article generation logic
        // For now, just log that we would generate it
        // In production, copy the generation logic from generate-cluster
        
        console.log(`[Resume ${jobId}] ⚠️ Article generation logic not yet implemented in resume-cluster`);
        console.log(`[Resume ${jobId}] 💡 This function needs the full article generation code from generate-cluster`);
        
        // Placeholder: In real implementation, would call article generation here
        // const articleId = await generateArticle(job, articleStructure, index);
        // savedArticleIds.push(articleId);
        // generatedInThisRun++;
        
      } catch (error) {
        console.error(`[Resume ${jobId}] ❌ Error generating article ${index + 1}:`, error);
        // Continue to next article
      }

      // Update heartbeat
      await supabase
        .from('cluster_generations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', jobId);
    }

    // Determine final status
    const totalGenerated = existingNumbers.size + generatedInThisRun;
    const isComplete = totalGenerated >= totalArticles;
    const newStatus = isComplete ? 'completed' : 'partial';

    await supabase
      .from('cluster_generations')
      .update({
        status: newStatus,
        articles: savedArticleIds,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`[Resume ${jobId}] 📊 Resume complete: ${totalGenerated}/${totalArticles} articles`);

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        generatedInThisRun,
        totalGenerated,
        totalTarget: totalArticles,
        isComplete,
        remaining: totalArticles - totalGenerated,
        message: isComplete 
          ? `✅ Cluster complete! All ${totalArticles} articles generated.`
          : `⚠️ Partial: ${totalGenerated}/${totalArticles} articles. Resume again to continue.`,
        note: 'Article generation logic needs to be implemented. See generate-cluster for reference.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Resume cluster error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
