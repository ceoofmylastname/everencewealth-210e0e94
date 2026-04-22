import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[kill-cluster-job] step:start");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.warn("[kill-cluster-job] missing/invalid auth header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    console.log("[kill-cluster-job] step:env_loaded", {
      hasUrl: !!SUPABASE_URL,
      hasAnon: !!SUPABASE_ANON_KEY,
      hasService: !!SUPABASE_SERVICE_ROLE_KEY,
    });

    // Service-role client for privileged ops
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log("[kill-cluster-job] step:admin_client_created");

    // Verify caller via JWT using getUser (reliable across supabase-js versions)
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    console.log("[kill-cluster-job] step:getUser_done", {
      hasUser: !!userData?.user,
      userEmail: userData?.user?.email ?? null,
      err: userErr?.message ?? null,
    });
    if (userErr || !userData?.user) {
      console.error("[kill-cluster-job] auth.getUser failed:", userErr);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const userEmail = userData.user.email ?? "";

    // Admin gate: email whitelist (matches project admin policy)
    const ADMIN_EMAIL = "jrmenterprisegroup@gmail.com";
    const { data: isAdminRpc, error: roleErr } = await admin.rpc("is_admin", { _user_id: userId });
    if (roleErr) {
      console.warn("[kill-cluster-job] is_admin rpc failed:", roleErr.message);
    }
    const isAdmin = isAdminRpc === true || userEmail.toLowerCase() === ADMIN_EMAIL;
    console.log("[kill-cluster-job] step:admin_check", { isAdminRpc, userEmail, isAdmin });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const jobId: string | undefined = body?.jobId;
    console.log("[kill-cluster-job] step:body_parsed", { jobId });
    if (!jobId || typeof jobId !== "string") {
      return new Response(JSON.stringify({ error: "Missing jobId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: updated, error: updateErr } = await admin
      .from("cluster_generations")
      .update({
        status: "failed",
        error: "killed_by_user",
        timeout_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: {
          last_heartbeat: "killed_by_user",
          ts: new Date().toISOString(),
          message: "Job killed by admin via kill button.",
        },
      })
      .eq("id", jobId)
      .in("status", ["generating", "partial"])
      .select("id, status")
      .maybeSingle();
    console.log("[kill-cluster-job] step:update_done", {
      updated,
      err: updateErr?.message ?? null,
    });

    if (updateErr) {
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!updated) {
      return new Response(
        JSON.stringify({ success: false, error: "Job not found or already finished" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true, jobId: updated.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[kill-cluster-job] FATAL:", err instanceof Error ? err.stack : String(err));
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});