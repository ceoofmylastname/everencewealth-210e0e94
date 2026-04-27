// bulk-build-clusters: orchestrator for unattended cluster generation runs.
// Parses the bundled manifest, builds a dedupe index from production tables,
// classifies each entry as build/skip, creates a cluster_batch_jobs row,
// and (for live mode) fires the first build-cluster-step worker.
//
// Returns immediately. Worker chains itself via self-continuation, so this
// function never runs longer than ~5 sec.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import manifest from "./manifest.json" with { type: "json" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MONEY_PAGE_WHITELIST = new Set([
  "/en/strategies/iul",
  "/en/strategies/whole-life",
  "/en/strategies/tax-free-retirement",
  "/en/strategies/asset-protection",
  "/en/strategies/",
  "/en/buyers-guide/",
  "/contracting/intake",
]);

const COMPLIANCE_CLASSES = new Set(["wealth_standard", "recruiting_no_income_claims"]);
const FIDUCIARY_BLOCK = /\bfiduciar/i;

interface ManifestEntry {
  id: number;
  name: string;
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetAudience: string;
  searchIntent: string;
  moneyPageTarget: string;
  compliance_class: "wealth_standard" | "recruiting_no_income_claims";
  tofu_titles: string[];
  mofu_titles: string[];
  bofu_title: string;
  internal_link_anchors: string[];
  language: "en";
  skip_by_default: boolean;
  skip_reason?: string;
}

interface Manifest {
  manifest_version: string;
  total_count: number;
  clusters: ManifestEntry[];
}

const normTheme = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

function validateEntry(e: ManifestEntry): string | null {
  if (e.language !== "en") return `language must be 'en' (got '${e.language}')`;
  if (!MONEY_PAGE_WHITELIST.has(e.moneyPageTarget))
    return `moneyPageTarget '${e.moneyPageTarget}' not in whitelist`;
  if (!COMPLIANCE_CLASSES.has(e.compliance_class))
    return `compliance_class '${e.compliance_class}' not allowed`;
  const blob = [
    e.name, e.topic, e.primaryKeyword, ...e.secondaryKeywords,
    ...e.tofu_titles, ...e.mofu_titles, e.bofu_title,
    ...e.internal_link_anchors,
  ].join(" | ");
  if (FIDUCIARY_BLOCK.test(blob)) return `fiduciary stem detected — blocked by compliance trigger`;
  return null;
}

async function buildDedupeIndex(supabase: ReturnType<typeof createClient>) {
  const themes = new Set<string>();
  const topics = new Set<string>();
  const primaryKws = new Set<string>();

  const { data: articles } = await supabase
    .from("blog_articles")
    .select("cluster_theme")
    .not("cluster_theme", "is", null);
  for (const r of (articles ?? []) as { cluster_theme: string }[]) {
    if (r.cluster_theme) themes.add(normTheme(r.cluster_theme));
  }

  const { data: gens } = await supabase
    .from("cluster_generations")
    .select("topic, primary_keyword")
    .eq("status", "completed");
  for (const r of (gens ?? []) as { topic: string; primary_keyword: string }[]) {
    if (r.topic) topics.add(normTheme(r.topic));
    if (r.primary_keyword) primaryKws.add(normTheme(r.primary_keyword));
  }

  return { themes, topics, primaryKws };
}

function isDuplicate(
  e: ManifestEntry,
  idx: { themes: Set<string>; topics: Set<string>; primaryKws: Set<string> },
): { dup: boolean; matched?: string } {
  const candidates = [normTheme(e.name), normTheme(e.topic), normTheme(e.primaryKeyword)];
  for (const ex of idx.themes) {
    for (const c of candidates) {
      if (c && (c === ex || c.includes(ex) || ex.includes(c))) {
        return { dup: true, matched: `cluster_theme:${ex}` };
      }
    }
  }
  for (const c of candidates) {
    if (c && (idx.topics.has(c) || idx.primaryKws.has(c))) {
      return { dup: true, matched: `cluster_generations:${c}` };
    }
  }
  return { dup: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin (using their JWT)
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Admin role check
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode: "dry_run" | "live" = body.mode === "live" ? "live" : "dry_run";
    const limit_count: number | undefined = typeof body.limit === "number" ? body.limit : undefined;
    const start_from: number | undefined = typeof body.start_from === "number" ? body.start_from : undefined;
    const force_rebuild: boolean = !!body.force;

    const m = manifest as Manifest;
    if (!Array.isArray(m.clusters)) {
      return new Response(JSON.stringify({ error: "Manifest missing 'clusters' array" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate every entry
    const validationErrors: { id: number; name: string; reason: string }[] = [];
    for (const e of m.clusters) {
      const err = validateEntry(e);
      if (err) validationErrors.push({ id: e.id, name: e.name, reason: err });
    }
    if (validationErrors.length) {
      return new Response(JSON.stringify({ error: "validation_failed", errors: validationErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter range
    let entries = m.clusters.slice();
    if (start_from !== undefined) entries = entries.filter((e) => e.id >= start_from);
    if (limit_count !== undefined) entries = entries.slice(0, limit_count);

    // Dedupe index
    const idx = await buildDedupeIndex(admin);

    const classifications = entries.map((e) => {
      const prod = isDuplicate(e, idx);
      const skipManifest = e.skip_by_default && !force_rebuild;
      const skipProd = prod.dup && !force_rebuild;
      if (skipManifest || skipProd) {
        const reason = skipManifest
          ? `manifest skip_by_default${e.skip_reason ? `: ${e.skip_reason}` : ""}`
          : `prod overlap (${prod.matched})`;
        return {
          id: e.id, name: e.name, topic: e.topic, action: "skip" as const, reason,
          money: e.moneyPageTarget, compliance_class: e.compliance_class,
          primary_keyword: e.primaryKeyword, target_audience: e.targetAudience,
        };
      }
      return {
        id: e.id, name: e.name, topic: e.topic, action: "build" as const,
        money: e.moneyPageTarget, compliance_class: e.compliance_class,
        primary_keyword: e.primaryKeyword, target_audience: e.targetAudience,
      };
    });

    const buildList = classifications.filter((c) => c.action === "build");
    const skipCount = classifications.filter((c) => c.action === "skip").length;

    const dedupe_summary = {
      themes: idx.themes.size, topics: idx.topics.size, primary_keywords: idx.primaryKws.size,
    };

    // Create batch job row
    const { data: job, error: jobErr } = await admin
      .from("cluster_batch_jobs")
      .insert({
        manifest_path: "manifests/everencewealth-75-cluster-manifest.json",
        mode,
        limit_count: limit_count ?? null,
        start_from: start_from ?? null,
        force_rebuild,
        status: mode === "dry_run" ? "completed" : "running",
        total_entries: entries.length,
        build_count: 0,
        skip_count: skipCount,
        classifications,
        dedupe_summary,
        triggered_by: userId,
        started_at: new Date().toISOString(),
        completed_at: mode === "dry_run" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: "Failed to create batch job", details: jobErr?.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Dry run: return immediately with full plan
    if (mode === "dry_run") {
      return new Response(JSON.stringify({
        success: true,
        batch_job_id: job.id,
        mode: "dry_run",
        total_entries: entries.length,
        build_count: buildList.length,
        skip_count: skipCount,
        dedupe_summary,
        classifications,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Live: fire the worker for the first BUILD entry (workers skip nothing — orchestrator already classified)
    if (buildList.length === 0) {
      await admin.from("cluster_batch_jobs").update({
        status: "completed", completed_at: new Date().toISOString(),
      }).eq("id", job.id);
      return new Response(JSON.stringify({
        success: true, batch_job_id: job.id, mode: "live", build_count: 0, skip_count: skipCount,
        message: "No buildable entries after dedupe — nothing to do.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fire-and-forget first tick so the user doesn't wait up to 60 sec for cron.
    // Cron (tick-cluster-batches) handles every tick after this one. The worker
    // reads current_index from the DB row, so no index is passed in the body.
    fetch(`${SUPABASE_URL}/functions/v1/build-cluster-step`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ batch_job_id: job.id }),
    }).catch((err) => console.error("[bulk-build-clusters] fire-and-forget error (ignored):", err));

    return new Response(JSON.stringify({
      success: true,
      batch_job_id: job.id,
      mode: "live",
      total_entries: entries.length,
      build_count: buildList.length,
      skip_count: skipCount,
      dedupe_summary,
      message: "Live batch started. pg_cron will tick the worker every 60 sec until completion.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("[bulk-build-clusters] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});