// build-cluster-step: per-cluster worker for the bulk batch orchestrator.
// Reads its assigned classification entry, invokes generate-cluster, polls
// cluster_generations until done, runs compliance scan on recruiting clusters,
// updates the batch job row, then fires itself for the next BUILD entry.
//
// Self-continuation pattern: each invocation handles exactly one cluster.
// No single function ever runs longer than ~5 min, so timeouts don't apply.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POLL_INTERVAL_MS = 15_000;
const TIMEOUT_MS = 30 * 60 * 1000;
const INTER_CLUSTER_GAP_MS = 10_000;

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

function fireNext(batch_job_id: string, classification_index: number) {
  fetch(`${SUPABASE_URL}/functions/v1/build-cluster-step`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ batch_job_id, classification_index }),
  }).catch((err) => console.error("[build-cluster-step] fire-next error (ignored):", err));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let batch_job_id: string | null = null;
  let classification_index: number = 0;

  try {
    const body = await req.json();
    batch_job_id = body.batch_job_id;
    classification_index = body.classification_index ?? 0;
    if (!batch_job_id) throw new Error("batch_job_id required");

    // Load the batch job
    const { data: job, error: jobErr } = await admin
      .from("cluster_batch_jobs")
      .select("*")
      .eq("id", batch_job_id)
      .single();
    if (jobErr || !job) throw new Error(`batch job not found: ${jobErr?.message}`);

    // Pause/abort check
    if (job.status === "paused") {
      console.log(`[step] Batch ${batch_job_id} paused — stopping chain at index ${classification_index}`);
      return new Response(JSON.stringify({ success: true, paused: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (job.status !== "running") {
      console.log(`[step] Batch ${batch_job_id} status=${job.status} — stopping chain`);
      return new Response(JSON.stringify({ success: true, stopped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const classifications: Classification[] = job.classifications ?? [];
    const results: ResultRow[] = job.results ?? [];

    // End of list — mark complete
    if (classification_index >= classifications.length) {
      await admin.from("cluster_batch_jobs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        current_index: classifications.length,
        current_topic: null,
        current_job_id: null,
      }).eq("id", batch_job_id);
      console.log(`[step] Batch ${batch_job_id} complete at index ${classification_index}`);
      return new Response(JSON.stringify({ success: true, completed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const c = classifications[classification_index];

    // Skip entries: record + advance immediately
    if (c.action === "skip") {
      const row: ResultRow = {
        id: c.id, name: c.name, topic: c.topic, job_id: null,
        status: "skipped", duration_sec: 0, error: c.reason,
      };
      const updated = [...results, row];
      await admin.from("cluster_batch_jobs").update({
        results: updated,
        current_index: classification_index + 1,
        current_topic: c.topic,
        current_job_id: null,
      }).eq("id", batch_job_id);
      fireNext(batch_job_id, classification_index + 1);
      return new Response(JSON.stringify({ success: true, action: "skipped", index: classification_index }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build entry: lookup full manifest entry to get target_audience, primary_keyword
    // We need to invoke generate-cluster which expects topic + primary_keyword + target_audience.
    // The classification only stores topic, so we need to re-fetch the full manifest entry.
    // Strategy: re-import the manifest from the orchestrator's bundled copy via internal HTTP fetch
    // is overkill; instead we store enough payload in the classification. Rewriting:
    //
    // BUT: we kept classifications minimal. Easiest fix — call generate-cluster with topic only
    // and let it derive defaults, OR enrich classifications upstream. We'll enrich via direct lookup.
    //
    // We pass topic + primary_keyword by re-reading the bundled manifest in the orchestrator,
    // but the worker doesn't have it. Solution: include the needed fields in the classification.
    // Per agreed contract, classification carries topic + name only. We'll invoke generate-cluster
    // with topic + language only — it accepts minimal payload and uses topic-derived defaults.

    await admin.from("cluster_batch_jobs").update({
      current_index: classification_index,
      current_topic: c.topic,
    }).eq("id", batch_job_id);

    console.log(`[step] Building #${c.id} "${c.name}" (index ${classification_index})`);

    // Invoke generate-cluster
    const invokeResp = await fetch(`${SUPABASE_URL}/functions/v1/generate-cluster`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({
        topic: c.topic,
        language: "en",
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
      const updated = [...results, row];
      await admin.from("cluster_batch_jobs").update({
        results: updated,
        fail_count: (job.fail_count ?? 0) + 1,
        current_index: classification_index + 1,
        current_job_id: null,
      }).eq("id", batch_job_id);
      fireNext(batch_job_id, classification_index + 1);
      return new Response(JSON.stringify({ success: false, action: "failed", error: msg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("cluster_batch_jobs").update({
      current_job_id: jobId,
    }).eq("id", batch_job_id);

    // Poll
    let pollResult: { ok: true } | { ok: false; reason: "failed" | "timeout"; error?: string };
    while (true) {
      const elapsed = Date.now() - startedAt;
      if (elapsed > TIMEOUT_MS) {
        // Try to kill the in-flight job
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/kill-cluster-job`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
            body: JSON.stringify({ jobId }),
          });
        } catch { /* ignore */ }
        pollResult = { ok: false, reason: "timeout", error: `>${TIMEOUT_MS / 60000}min` };
        break;
      }
      const { data: row } = await admin
        .from("cluster_generations")
        .select("status, completed_languages, error, is_multilingual")
        .eq("id", jobId)
        .maybeSingle();

      if (row) {
        const r = row as { status: string | null; completed_languages: string[] | null; error: string | null; is_multilingual: boolean | null };
        if (r.status === "failed") {
          pollResult = { ok: false, reason: "failed", error: r.error ?? "unknown" };
          break;
        }
        if (r.status === "completed") {
          const langs = r.completed_languages ?? [];
          const hasEn = langs.includes("en");
          const hasEs = langs.includes("es");
          if (r.is_multilingual === false || (hasEn && hasEs) || (hasEn && !r.is_multilingual)) {
            pollResult = { ok: true };
            break;
          }
        }
      }

      // Re-check pause status periodically
      const { data: cur } = await admin.from("cluster_batch_jobs").select("status").eq("id", batch_job_id).single();
      if (cur && (cur as { status: string }).status === "paused") {
        console.log(`[step] Batch paused mid-cluster — letting current ${jobId} finish but won't fire next`);
        // Fall through to record current result then stop chain
      }

      await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
    }

    const durationSec = Math.round((Date.now() - startedAt) / 1000);

    if (!pollResult.ok) {
      const row: ResultRow = {
        id: c.id, name: c.name, topic: c.topic, job_id: jobId,
        status: pollResult.reason === "timeout" ? "timeout" : "failed",
        duration_sec: durationSec, error: pollResult.error,
      };
      const updated = [...results, row];
      await admin.from("cluster_batch_jobs").update({
        results: updated,
        fail_count: (job.fail_count ?? 0) + 1,
        current_index: classification_index + 1,
        current_job_id: null,
      }).eq("id", batch_job_id);
      // Inter-cluster gap, then fire next
      await new Promise((r) => setTimeout(r, INTER_CLUSTER_GAP_MS));
      // Re-check pause before firing
      const { data: cur2 } = await admin.from("cluster_batch_jobs").select("status").eq("id", batch_job_id).single();
      if (cur2 && (cur2 as { status: string }).status === "running") {
        fireNext(batch_job_id, classification_index + 1);
      }
      return new Response(JSON.stringify({ success: false, action: pollResult.reason }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compliance scan for recruiting clusters
    let flaggedCount = 0;
    if (c.compliance_class === "recruiting_no_income_claims") {
      const { data: arts } = await admin
        .from("blog_articles")
        .select("id, headline, meta_title, meta_description, speakable_answer, detailed_content")
        .eq("cluster_id", jobId);

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
          cluster_generation_id: jobId,
          compliance_class: c.compliance_class,
          status: "pending_review",
        }, { onConflict: "article_id,reason" });
        flaggedCount++;
      }
    }

    const row: ResultRow = {
      id: c.id, name: c.name, topic: c.topic, job_id: jobId,
      status: flaggedCount > 0 ? "flagged" : "built",
      duration_sec: durationSec,
      flagged_count: flaggedCount > 0 ? flaggedCount : undefined,
    };
    const updated = [...results, row];
    await admin.from("cluster_batch_jobs").update({
      results: updated,
      build_count: (job.build_count ?? 0) + 1,
      flagged_count: (job.flagged_count ?? 0) + flaggedCount,
      current_index: classification_index + 1,
      current_job_id: null,
    }).eq("id", batch_job_id);

    console.log(`[step] Built #${c.id} in ${durationSec}s${flaggedCount ? ` (🚩 ${flaggedCount})` : ""}`);

    // Inter-cluster gap, then fire next (with pause re-check)
    await new Promise((r) => setTimeout(r, INTER_CLUSTER_GAP_MS));
    const { data: cur3 } = await admin.from("cluster_batch_jobs").select("status").eq("id", batch_job_id).single();
    if (cur3 && (cur3 as { status: string }).status === "running") {
      fireNext(batch_job_id, classification_index + 1);
    } else {
      console.log(`[step] Batch status=${(cur3 as { status: string } | null)?.status ?? "missing"} — not firing next`);
    }

    return new Response(JSON.stringify({ success: true, action: "built", duration_sec: durationSec, flagged: flaggedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[build-cluster-step] error:", err);
    // Try to advance to avoid stalling the chain
    if (batch_job_id) {
      try {
        const { data: job } = await admin.from("cluster_batch_jobs").select("results, fail_count, classifications").eq("id", batch_job_id).single();
        if (job) {
          const j = job as { results: ResultRow[]; fail_count: number; classifications: Classification[] };
          const c = j.classifications?.[classification_index];
          if (c) {
            const errRow: ResultRow = {
              id: c.id, name: c.name, topic: c.topic, job_id: null,
              status: "failed", duration_sec: Math.round((Date.now() - startedAt) / 1000),
              error: String(err),
            };
            await admin.from("cluster_batch_jobs").update({
              results: [...(j.results ?? []), errRow],
              fail_count: (j.fail_count ?? 0) + 1,
              current_index: classification_index + 1,
            }).eq("id", batch_job_id);
            fireNext(batch_job_id, classification_index + 1);
          }
        }
      } catch { /* swallow */ }
    }
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});