import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Auto-resume stalled translate-cluster jobs.
 *
 * A "stalled" translation job is one where:
 *   - status IN ('generating', 'partial')
 *   - updated_at older than `stalledThresholdMinutes` (default 5)
 *   - has fewer Spanish articles than English articles for that cluster
 *
 * For each stalled job we fire a (non-blocking) invocation of `translate-cluster`
 * with the jobId. translate-cluster is idempotent — it skips already-translated
 * cluster_numbers and resumes from the next one.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { stalledThresholdMinutes = 5, dryRun = false } = body;

    console.log(
      `[AutoResumeTranslate] Checking for stalled translation jobs (threshold: ${stalledThresholdMinutes} mins, dryRun: ${dryRun})`
    );

    const thresholdTime = new Date(
      Date.now() - stalledThresholdMinutes * 60 * 1000
    ).toISOString();

    // Candidate jobs: still in flight ('generating' or 'partial') but no recent heartbeat.
    const { data: candidates, error: fetchError } = await supabase
      .from('cluster_generations')
      .select('id, status, updated_at, language, languages_queue, completed_languages, progress')
      .in('status', ['generating', 'partial'])
      .lt('updated_at', thresholdTime);

    if (fetchError) {
      console.error('[AutoResumeTranslate] Error fetching candidates:', fetchError);
      throw fetchError;
    }

    if (!candidates || candidates.length === 0) {
      console.log('[AutoResumeTranslate] No stalled jobs');
      return new Response(
        JSON.stringify({ success: true, message: 'No stalled jobs', resumed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AutoResumeTranslate] Found ${candidates.length} candidate(s)`);

    const results: any[] = [];

    for (const job of candidates) {
      // Count source-language (English) articles
      const sourceLanguage = job.language || 'en';
      const { count: sourceCount } = await supabase
        .from('blog_articles')
        .select('*', { count: 'exact', head: true })
        .eq('cluster_id', job.id)
        .eq('language', sourceLanguage);

      const expected = sourceCount || 0;
      if (expected === 0) {
        // Nothing to translate from
        results.push({ jobId: job.id, status: 'skipped_no_source' });
        continue;
      }

      // Determine the next target language that is incomplete
      const queue: string[] = job.languages_queue || ['es'];
      const targetLanguages = queue.filter((l) => l !== sourceLanguage);

      let nextLanguage: string | null = null;
      let nextCount = 0;
      for (const lang of targetLanguages) {
        const { count } = await supabase
          .from('blog_articles')
          .select('*', { count: 'exact', head: true })
          .eq('cluster_id', job.id)
          .eq('language', lang);
        if ((count || 0) < expected) {
          nextLanguage = lang;
          nextCount = count || 0;
          break;
        }
      }

      if (!nextLanguage) {
        // All target languages already complete — nothing to resume.
        results.push({ jobId: job.id, status: 'already_complete' });
        continue;
      }

      const ageSec = Math.round(
        (Date.now() - new Date(job.updated_at).getTime()) / 1000
      );
      console.log(
        `[AutoResumeTranslate] Resuming job ${job.id}: ${nextLanguage} ${nextCount}/${expected}, stale ${ageSec}s`
      );

      if (dryRun) {
        results.push({
          jobId: job.id,
          status: 'dry_run',
          nextLanguage,
          progress: `${nextCount}/${expected}`,
          ageSec,
        });
        continue;
      }

      // Fire-and-forget invocation of translate-cluster.
      // We don't await the body; translate-cluster does its own bookkeeping.
      try {
        supabase.functions
          .invoke('translate-cluster', {
            body: { jobId: job.id, targetLanguage: nextLanguage },
          })
          .catch((err: any) => {
            console.error(
              `[AutoResumeTranslate] Background invoke error for ${job.id}:`,
              err
            );
          });

        results.push({
          jobId: job.id,
          status: 'resumed',
          nextLanguage,
          progress: `${nextCount}/${expected}`,
          ageSec,
        });
      } catch (err) {
        console.error(`[AutoResumeTranslate] Failed to invoke for ${job.id}:`, err);
        results.push({
          jobId: job.id,
          status: 'invoke_failed',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const resumedCount = results.filter((r) => r.status === 'resumed').length;
    console.log(
      `[AutoResumeTranslate] Complete. Resumed ${resumedCount} / ${candidates.length} candidates`
    );

    return new Response(
      JSON.stringify({
        success: true,
        candidates: candidates.length,
        resumed: resumedCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AutoResumeTranslate] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});