// TEMPORARY: seeds vault.secrets entry "service_role_key" using the runtime
// SUPABASE_SERVICE_ROLE_KEY env var. Never logs, echoes, or returns the key.
// To be deleted immediately after a single successful invocation.

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!url || !key) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing env" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const rpcRes = await fetch(`${url}/rest/v1/rpc/_tmp_seed_vault_key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({ p_key: key }),
    });

    if (!rpcRes.ok) {
      const text = await rpcRes.text();
      // Strip any accidental key echoes defensively before returning.
      const safe = text.replaceAll(key, "[REDACTED]");
      return new Response(
        JSON.stringify({ ok: false, status: rpcRes.status, error: safe }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const action = await rpcRes.json();
    return new Response(
      JSON.stringify({ ok: true, action }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});