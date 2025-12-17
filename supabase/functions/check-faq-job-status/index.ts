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
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(JSON.stringify({ error: 'jobId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: job, error } = await supabase
      .from('faq_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (error) throw error;

    if (!job) {
      return new Response(JSON.stringify({
        status: 'not_found',
        error: 'Job not found',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get generated FAQ pages if completed
    let faqPages: any[] = [];
    if (job.status === 'completed' && job.results?.length > 0) {
      const faqPageIds = job.results
        .filter((r: any) => r.faq_page_id)
        .map((r: any) => r.faq_page_id);

      if (faqPageIds.length > 0) {
        const { data } = await supabase
          .from('faq_pages')
          .select('*')
          .in('id', faqPageIds);
        faqPages = data || [];
      }
    }

    const progress = job.total_faq_pages > 0
      ? Math.round((job.generated_faq_pages / job.total_faq_pages) * 100)
      : 0;

    return new Response(JSON.stringify({
      status: job.status,
      progress,
      processedArticles: job.processed_articles,
      totalArticles: job.total_articles,
      generatedFaqPages: job.generated_faq_pages,
      totalFaqPages: job.total_faq_pages,
      results: job.results,
      faqPages,
      error: job.error,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-faq-job-status:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
