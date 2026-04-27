// tick-cluster-batches: thin dispatcher fired by pg_cron every 60 sec.
// Selects all batches with status='running' and fires build-cluster-step
// for each (fire-and-forget). Returns immediately.
//
// Stop condition: when no batches are running, returns {ticked: 0} as a no-op.
// New batches are auto-picked-up on the next tick — no cron management needed.

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

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: rows, error } = await admin
      .from("cluster_batch_jobs")
      .select("id")
      .eq("status", "running");

    if (error) throw error;

    const batches = (rows ?? []) as { id: string }[];

    for (const r of batches) {
      // fire-and-forget — don't await; we want the dispatcher to return fast
      fetch(`${SUPABASE_URL}/functions/v1/build-cluster-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ batch_job_id: r.id }),
      }).catch((err) => console.error(`[tick] fire error for batch ${r.id}:`, err));
    }

    return new Response(JSON.stringify({ ok: true, ticked: batches.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[tick-cluster-batches] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
