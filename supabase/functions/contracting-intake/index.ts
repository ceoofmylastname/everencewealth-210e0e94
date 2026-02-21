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
    const body = await req.json();

    const {
      first_name,
      last_name,
      email,
      phone,
      referral_source,
      referring_director,
      state,
      address,
      is_licensed,
      manager_id,
    } = body;

    if (!first_name || !last_name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if email already exists in contracting_agents
    const { data: existing } = await adminClient
      .from("contracting_agents")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "An application with this email already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create or find auth user
    let authUserId: string;
    const tempPassword = crypto.randomUUID() + "!Aa1";

    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    });

    if (authError) {
      if (authError.message?.includes("already been registered")) {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const existingUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (!existingUser) {
          return new Response(
            JSON.stringify({ error: "User exists but could not be found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        authUserId = existingUser.id;
      } else {
        return new Response(
          JSON.stringify({ error: "Failed to create user: " + authError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      authUserId = authUser.user.id;
    }

    // Create contracting_agents record
    const { data: agent, error: agentError } = await adminClient
      .from("contracting_agents")
      .insert({
        auth_user_id: authUserId,
        first_name,
        last_name,
        email: email.toLowerCase(),
        phone: phone || null,
        contracting_role: "agent",
        pipeline_stage: "application",
        status: "in_progress",
        referral_source: referral_source || null,
        referring_director: referring_director || null,
        state: state || null,
        address: address || null,
        is_licensed: is_licensed ?? false,
        manager_id: manager_id || null,
      })
      .select("id")
      .single();

    if (agentError) {
      return new Response(
        JSON.stringify({ error: "Failed to create application: " + agentError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log activity
    await adminClient.from("contracting_activity_logs").insert({
      agent_id: agent.id,
      activity_type: "stage_changed",
      description: `New application submitted by ${first_name} ${last_name}`,
    });

    return new Response(
      JSON.stringify({ success: true, agent_id: agent.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
