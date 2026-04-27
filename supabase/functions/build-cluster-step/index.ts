// build-cluster-step: idempotent single-tick worker for the bulk batch orchestrator.
//
// Architecture: each invocation does ONE pass — check state, advance one step, return.
// No internal polling loop. pg_cron (via tick-cluster-batches dispatcher) fires us
// every 60 sec until the batch is no longer 'running'.
//
// Concurrency: a Postgres transaction-scoped advisory lock keyed on batch_job_id
// prevents double-fires. If the lock is held, we log 'lock_held' and return fast.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WORKER_TIMEOUT_MIN = 20;

const INCOME_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\$\s?\d[\d,.]*\s*(per|a|each|every)?\s*(year|month|week|hour|day|annually|annual)/i, label: "dollar_per_period" },
  { pattern: /\bearn(ing|s|ed)?\s+\$\s?\d/i, label: "earn_dollars" },
  { pattern: /\bincome\s+(potential|of\s+\$|up\s+to|range)/i, label: "income_phrasing" },
  { pattern: /\bmak(e|ing)\s+(money|\$\s?\d)/i, label: "make_money" },
  { pattern: /\b(salary|commission|compensation)\s+(range|of\s+\$|up\s+to|structure\s+example)/i, label: "salary_commission_range" },
  { pattern: /\b(average|typical|median)\s+(compensation|earnings|income|salary)/i, label: "average_compensation" },
  { pattern: /\btop[-\s]?(earner|earning|paid|paying)\b/i, label: "top_earner" },
  { pattern: /\b(highest|best)[-\s]?(paid|paying)\b/i, label: "best_paying" },
  { pattern: /\b\$\s?\d[\d,.]*\s*(k|m|million|grand)\b/i, label: "dollar_shorthand" },
];

function scanText(text: string): { pattern: string; excerpt: string } | null {
  for (const { pattern, label } of INCOME_PATTERNS) {
    const m = text.match(pattern);
    if (m && typeof m.index === "number") {
      const start = Math.max(0, m.index - 60);
      const end = Math.min(text.length, m.index + m[0].length + 60);
      return { pattern: label, excerpt: text.slice(start, end).replace(/\s+/g, " ").trim() };
    }
  }
  return null;
}

interface Classification {
  id: number;
  name: string;
  topic: string;
  action: "build" | "skip";
  reason?: string;
  money: string;
  compliance_class: "wealth_standard" | "recruiting_no_income_claims";
  primary_keyword: string;
  target_audience: string;
}

interface ResultRow {
  id: number;
  name: string;
  topic: string;
  job_id: string | null;
  status: "built" | "skipped" | "failed" | "timeout" | "flagged";
  duration_sec: number;
  flagged_count?: number;
  error?: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type AdminClient = ReturnType<typeof createClient>;

async function logStep(
  admin: AdminClient,
  batch_job_id: string,
  current_index: number | null,
  current_topic: string | null,
  current_job_id: string | null,
  cluster_generations_status: string | null,
  action_taken: string,
  detail: Record<string, unknown> | null = null,
) {
  await admin.from("cluster_step_logs").insert({
    batch_job_id,
    current_index,
    current_topic,
    current_job_id,
    cluster_generations_status,
    action_taken,
    detail,
  });
}

// Concurrency control: CAS-based "tick in progress" flag on the batch row,
// implemented via the public.try_lock_batch_tick / release_batch_tick_lock
// RPCs (defined in the cluster_step_logs migration). Stale locks (>5 min)
// auto-expire so a crashed worker can't permanently block a batch.
async function tryAcquireLock(admin: AdminClient, batch_job_id: string): Promise<boolean> {
  const { data, error } = await admin.rpc("try_lock_batch_tick", {
    _batch_job_id: batch_job_id,
  });
  if (error) {
    console.error("[step] try_lock_batch_tick error:", error);
    return false; // fail closed
  }
  return data === true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let batch_job_id: string | null = null;

  try {
    // Accept batch_job_id from body OR query string (for cron via dispatcher).
    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* may be empty */ }
    const url = new URL(req.url);
    batch_job_id = (body.batch_job_id as string | undefined) ?? url.searchParams.get("batch_job_id");
    if (!batch_job_id) {
      return new Response(JSON.stringify({ error: "batch_job_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== Concurrency lock =====
    const locked = await tryAcquireLock(admin, batch_job_id);
    if (!locked) {
      await logStep(admin, batch_job_id, null, null, null, null, "lock_held",
        { skipped: true });
      return new Response(JSON.stringify({ ok: true, skipped: "lock_held" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Lock acquired — every return path below MUST call releaseLock().

    // Load the batch job
    const { data: job, error: jobErr } = await admin
      .from("cluster_batch_jobs")
      .select("*")
      .eq("id", batch_job_id)
      .single();

    if (jobErr || !job) {
      await releaseLock(admin, batch_job_id);
      throw new Error(`batch job not found: ${jobErr?.message}`);
    }

    // Pause/abort check
    if (job.status !== "running") {
      await logStep(admin, batch_job_id, job.current_index, job.current_topic,
        job.current_job_id, null,
        job.status === "paused" ? "stopped_paused" : "idle",
        { batch_status: job.status });
      await releaseLock(admin, batch_job_id);
      return new Response(JSON.stringify({ ok: true, stopped: true, batch_status: job.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const classifications: Classification[] = job.classifications ?? [];
    const results: ResultRow[] = job.results ?? [];
    const idx: number = job.current_index ?? 0;

    // ----- 1. End of list -----
    if (idx >= classifications.length) {
      await admin.from("cluster_batch_jobs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        current_index: classifications.length,
        current_topic: null,
        current_job_id: null,
        entry_started_at: null,
      }).eq("id", batch_job_id);
      await logStep(admin, batch_job_id, idx, null, null, null, "completed_batch", null);
      await releaseLock(admin, batch_job_id);
      return new Response(JSON.stringify({ ok: true, completed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const c = classifications[idx];

    // ----- 2. Skip entry -----
    if (c.action === "skip") {
      const row: ResultRow = {
        id: c.id, name: c.name, topic: c.topic, job_id: null,
        status: "skipped", duration_sec: 0, error: c.reason,
      };
      await admin.from("cluster_batch_jobs").update({
        results: [...results, row],
        current_index: idx + 1,
        current_topic: c.topic,
        current_job_id: null,
        entry_started_at: null,
      }).eq("id", batch_job_id);
      await logStep(admin, batch_job_id, idx, c.topic, null, null, "advanced_skip",
        { reason: c.reason });
      await releaseLock(admin, batch_job_id);
      return new Response(JSON.stringify({ ok: true, action: "skipped", index: idx }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ----- 3. Build entry: branch on whether generate-cluster has been kicked off -----
    if (!job.current_job_id) {
      // First tick for this entry — fire generate-cluster
      const invokeResp = await fetch(`${SUPABASE_URL}/functions/v1/generate-cluster`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({
          topic: c.topic,
          language: "en",
          targetAudience: c.target_audience,
          primaryKeyword: c.primary_keyword,
        }),
      });
      const invokeJson = await invokeResp.json().catch(() => ({}));
      const jobId: string | null = invokeJson?.jobId ?? invokeJson?.job_id ?? null;

      if (!invokeResp.ok || !jobId) {
        const msg = invokeJson?.error ?? `generate-cluster failed (${invokeResp.status})`;
        const row: ResultRow = {
          id: c.id, name: c.name, topic: c.topic, job_id: null,
          status: "failed", duration_sec: Math.round((Date.now() - startedAt) / 1000), error: msg,
        };
        await admin.from("cluster_batch_jobs").update({
          results: [...results, row],
          fail_count: (job.fail_count ?? 0) + 1,
          current_index: idx + 1,
          current_topic: c.topic,
          current_job_id: null,
          entry_started_at: null,
        }).eq("id", batch_job_id);
        await logStep(admin, batch_job_id, idx, c.topic, null, null, "advanced_failed",
          { error: msg });
        await releaseLock(admin, batch_job_id);
        return new Response(JSON.stringify({ ok: false, action: "failed", error: msg }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await admin.from("cluster_batch_jobs").update({
        current_job_id: jobId,
        current_topic: c.topic,
        entry_started_at: new Date().toISOString(),
      }).eq("id", batch_job_id);
      await logStep(admin, batch_job_id, idx, c.topic, jobId, null, "fired_generate",
        { jobId, name: c.name });
      await releaseLock(admin, batch_job_id);
      return new Response(JSON.stringify({ ok: true, action: "fired_generate", jobId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ----- 4. Already kicked off — poll cluster_generations -----
    const { data: gen } = await admin
      .from("cluster_generations")
      .select("id, status, completed_languages, is_multilingual, error, updated_at, progress")
      .eq("id", job.current_job_id)
      .maybeSingle();

    if (!gen) {
      // Generation row vanished — treat as failed and advance
      const row: ResultRow = {
        id: c.id, name: c.name, topic: c.topic, job_id: job.current_job_id,
        status: "failed", duration_sec: 0, error: "cluster_generations row missing",
      };
      await admin.from("cluster_batch_jobs").update({
        results: [...results, row],
        fail_count: (job.fail_count ?? 0) + 1,
        current_index: idx + 1,
        current_job_id: null,
        entry_started_at: null,
      }).eq("id", batch_job_id);
      await logStep(admin, batch_job_id, idx, c.topic, job.current_job_id, null,
        "advanced_failed", { error: "cluster_generations row missing" });
      await releaseLock(admin, batch_job_id);
      return new Response(JSON.stringify({ ok: false, action: "failed", error: "missing_gen_row" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const g = gen as {
      id: string; status: string | null;
      completed_languages: string[] | null;
      is_multilingual: boolean | null;
      error: string | null;
      updated_at: string;
      progress: any;
    };

    // 4a. Completed
    const langs = g.completed_languages ?? [];
    const hasEn = langs.includes("en");
    const hasEs = langs.includes("es");
    const completionOk = g.status === "completed" &&
      (g.is_multilingual === false || (hasEn && hasEs) || (hasEn && !g.is_multilingual));

    if (completionOk) {
      const entryStartedAt = job.entry_started_at ? new Date(job.entry_started_at).getTime() : startedAt;
      const durationSec = Math.round((Date.now() - entryStartedAt) / 1000);

      // FIX B — Read partial-failure signal from progress JSONB.
      // generate-cluster-chunk now writes progress.partial=true and progress.partial_failures
      // when some articles saved but not all. We surface this in the batch result row
      // as status='flagged' (alongside compliance flags) so the batch report shows it.
      const progress = (g.progress && typeof g.progress === "object") ? g.progress : {};
      const isPartial = progress.partial === true;
      const partialFailures: any[] = Array.isArray(progress.partial_failures) ? progress.partial_failures : [];
      const verifiedCount = typeof progress.verified_count === "number" ? progress.verified_count : null;
      const expectedCount = typeof progress.expected_count === "number" ? progress.expected_count : null;

      // Compliance scan for recruiting clusters
      let flaggedCount = 0;
      if (c.compliance_class === "recruiting_no_income_claims") {
        const { data: arts } = await admin
          .from("blog_articles")
          .select("id, headline, meta_title, meta_description, speakable_answer, detailed_content")
          .eq("cluster_id", g.id);

        for (const a of (arts ?? []) as Array<{
          id: string; headline?: string | null; meta_title?: string | null;
          meta_description?: string | null; speakable_answer?: string | null;
          detailed_content?: string | null;
        }>) {
          const fields = [a.headline, a.meta_title, a.meta_description, a.speakable_answer, a.detailed_content];
          let hit: { pattern: string; excerpt: string } | null = null;
          for (const t of fields) {
            if (typeof t === "string" && t.length) {
              const h = scanText(t);
              if (h) { hit = h; break; }
            }
          }
          if (!hit) continue;
          await admin.from("blog_articles").update({ status: "draft" }).eq("id", a.id);
          await admin.from("flagged_articles").upsert({
            article_id: a.id,
            reason: "income_claim_detected",
            matched_pattern: hit.pattern,
            matched_excerpt: hit.excerpt,
            cluster_generation_id: g.id,
            compliance_class: c.compliance_class,
            status: "pending_review",
          }, { onConflict: "article_id,reason" });
          flaggedCount++;
        }
      }

      const row: ResultRow = {
        id: c.id, name: c.name, topic: c.topic, job_id: g.id,
        status: (flaggedCount > 0 || isPartial) ? "flagged" : "built",
        duration_sec: durationSec,
        flagged_count: flaggedCount > 0 ? flaggedCount : undefined,
        ...(isPartial && {
          partial: true,
          partial_failures: partialFailures,
          verified_count: verifiedCount,
          expected_count: expectedCount,
        }),
      };
      await admin.from("cluster_batch_jobs").update({
        results: [...results, row],
        build_count: (job.build_count ?? 0) + 1,
        flagged_count: (job.flagged_count ?? 0) + flaggedCount,
        current_index: idx + 1,
        current_job_id: null,
        entry_started_at: null,
      }).eq("id", batch_job_id);
      await logStep(admin, batch_job_id, idx, c.topic, g.id, g.status,
        isPartial ? "advanced_built_partial" : "advanced_built",
        {
          flagged_count: flaggedCount,
          duration_sec: durationSec,
          ...(isPartial && {
            partial: true,
            verified_count: verifiedCount,
            expected_count: expectedCount,
            partial_failures_count: partialFailures.length,
          }),
        });
      await releaseLock(admin, batch_job_id);
      return new Response(JSON.stringify({
        ok: true,
        action: isPartial ? "built_partial" : "built",
        duration_sec: durationSec,
        flagged: flaggedCount,
        ...(isPartial && { partial: true, verified_count: verifiedCount, expected_count: expectedCount }),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4b. Failed
    if (g.status === "failed") {
      const row: ResultRow = {
        id: c.id, name: c.name, topic: c.topic, job_id: g.id,
        status: "failed",
        duration_sec: Math.round((Date.now() - (job.entry_started_at ? new Date(job.entry_started_at).getTime() : startedAt)) / 1000),
        error: g.error ?? "unknown",
      };
      await admin.from("cluster_batch_jobs").update({
        results: [...results, row],
        fail_count: (job.fail_count ?? 0) + 1,
        current_index: idx + 1,
        current_job_id: null,
        entry_started_at: null,
      }).eq("id", batch_job_id);
      await logStep(admin, batch_job_id, idx, c.topic, g.id, g.status,
        "advanced_failed", { error: g.error });
      await releaseLock(admin, batch_job_id);
      return new Response(JSON.stringify({ ok: false, action: "failed", error: g.error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4c. Worker timeout — > WORKER_TIMEOUT_MIN since entry_started_at AND no recent gen update
    const entryStarted = job.entry_started_at ? new Date(job.entry_started_at).getTime() : Date.now();
    const ageMin = (Date.now() - entryStarted) / 60000;
    const lastGenUpdate = new Date(g.updated_at).getTime();
    const genStaleMin = (Date.now() - lastGenUpdate) / 60000;

    if (ageMin > WORKER_TIMEOUT_MIN && genStaleMin > 5) {
      // Mark generation row failed
      await admin.from("cluster_generations").update({
        status: "failed",
        error: `aborted: ${WORKER_TIMEOUT_MIN}min worker timeout`,
        updated_at: new Date().toISOString(),
      }).eq("id", g.id);

      const row: ResultRow = {
        id: c.id, name: c.name, topic: c.topic, job_id: g.id,
        status: "timeout",
        duration_sec: Math.round((Date.now() - entryStarted) / 1000),
        error: `>${WORKER_TIMEOUT_MIN}min no progress`,
      };
      await admin.from("cluster_batch_jobs").update({
        results: [...results, row],
        fail_count: (job.fail_count ?? 0) + 1,
        current_index: idx + 1,
        current_job_id: null,
        entry_started_at: null,
      }).eq("id", batch_job_id);
      await logStep(admin, batch_job_id, idx, c.topic, g.id, g.status,
        "advanced_timeout", { age_min: ageMin, gen_stale_min: genStaleMin });
      await releaseLock(admin, batch_job_id);
      return new Response(JSON.stringify({ ok: false, action: "timeout", age_min: ageMin }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4d. Still generating — wait for next cron tick
    await logStep(admin, batch_job_id, idx, c.topic, g.id, g.status, "polled",
      { age_min: ageMin, gen_stale_min: genStaleMin, completed_languages: langs });
    await releaseLock(admin, batch_job_id);
    return new Response(JSON.stringify({
      ok: true, action: "polled", status: g.status, age_min: ageMin, gen_stale_min: genStaleMin,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("[build-cluster-step] error:", err);
    if (batch_job_id) {
      try {
        await logStep(admin, batch_job_id, null, null, null, null, "error",
          { error: String(err) });
      } catch { /* ignore */ }
      try { await releaseLock(admin, batch_job_id); } catch { /* ignore */ }
    }
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function releaseLock(admin: AdminClient, batch_job_id: string) {
  await admin.rpc("release_batch_tick_lock", { _batch_job_id: batch_job_id });
}
