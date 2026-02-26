import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is admin or contracting_admin via portal_users
    const { data: callerPortal } = await supabaseAdmin
      .from("portal_users")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

    const { data: callerContracting } = await supabaseAdmin
      .from("contracting_agents")
      .select("contracting_role")
      .eq("auth_user_id", user.id)
      .single();

    const isAdmin = callerPortal?.role === "admin";
    const isContractingAdmin = callerContracting?.contracting_role === "admin";

    if (!isAdmin && !isContractingAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { agent_id } = await req.json();
    if (!agent_id) {
      return new Response(JSON.stringify({ error: "agent_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Deleting contracting agent:", agent_id);

    // Get the agent record
    const { data: agent, error: agentErr } = await supabaseAdmin
      .from("contracting_agents")
      .select("id, auth_user_id, email, first_name, last_name")
      .eq("id", agent_id)
      .single();

    if (agentErr || !agent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete related records in order to avoid FK violations
    await supabaseAdmin.from("contracting_notifications").delete().eq("agent_id", agent_id);
    await supabaseAdmin.from("contracting_activity_logs").delete().eq("agent_id", agent_id);
    await supabaseAdmin.from("contracting_documents").delete().eq("agent_id", agent_id);
    await supabaseAdmin.from("contracting_carrier_selections").delete().eq("agent_id", agent_id);
    await supabaseAdmin.from("contracting_agent_steps").delete().eq("agent_id", agent_id);

    // Delete the contracting agent record
    const { error: deleteErr } = await supabaseAdmin
      .from("contracting_agents")
      .delete()
      .eq("id", agent_id);

    if (deleteErr) {
      console.error("Error deleting contracting agent:", deleteErr);
      return new Response(JSON.stringify({ error: deleteErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Contracting agent fully deleted:", agent_id, agent.email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
