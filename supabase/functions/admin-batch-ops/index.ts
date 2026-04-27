// admin-batch-ops: one-shot admin operations on cluster_batch_jobs / cluster_generations.
// Service-role only, used by Lovable agent for state ops the sandbox role can't perform.
// Auth: must present SUPABASE_SERVICE_ROLE_KEY as Bearer token.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth: accept either (a) service-role bearer for internal calls,
  // or (b) a logged-in admin user (verified via user_roles.role='admin').
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const auth = req.headers.get("Authorization") || "";
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (auth !== `Bearer ${SERVICE_KEY}`) {
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const token = auth.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", claims.claims.sub)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const body = await req.json();
    const op: string = body.op;

    if (op === "pause_batch") {
      const { batch_job_id, generation_id, generation_error } = body;
      const out: Record<string, unknown> = {};
      if (batch_job_id) {
        const { data, error } = await admin.from("cluster_batch_jobs")
          .update({ status: "paused", updated_at: new Date().toISOString() })
          .eq("id", batch_job_id).select("id, status").single();
        if (error) throw error;
        out.batch = data;
      }
      if (generation_id) {
        const { data, error } = await admin.from("cluster_generations")
          .update({
            status: "failed",
            error: generation_error ?? "aborted by admin",
            updated_at: new Date().toISOString(),
          })
          .eq("id", generation_id).select("id, status, error").single();
        if (error) throw error;
        out.generation = data;
      }
      return new Response(JSON.stringify({ ok: true, ...out }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (op === "resume_batch") {
      const { batch_job_id, reset_current_job_id } = body;
      const update: Record<string, unknown> = {
        status: "running",
        updated_at: new Date().toISOString(),
      };
      if (reset_current_job_id) {
        update.current_job_id = null;
        update.entry_started_at = null;
      }
      const { data, error } = await admin.from("cluster_batch_jobs")
        .update(update).eq("id", batch_job_id)
        .select("id, status, current_index, current_topic, current_job_id").single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, batch: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (op === "install_cron") {
      // No-op placeholder — cron install must happen via SQL editor / migration.
      return new Response(JSON.stringify({ ok: false, error: "use migration for cron" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `unknown op '${op}'` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
