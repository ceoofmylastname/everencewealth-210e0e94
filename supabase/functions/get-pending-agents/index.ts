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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify portal admin
    const { data: callerPortal } = await anonClient
      .from("portal_users")
      .select("role")
      .eq("auth_user_id", caller.id)
      .eq("is_active", true)
      .single();

    if (!callerPortal || callerPortal.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get all advisors
    const { data: advisors, error: advError } = await adminClient
      .from("advisors")
      .select("id, auth_user_id, first_name, last_name, email, created_at")
      .order("created_at", { ascending: false });

    if (advError) {
      return new Response(JSON.stringify({ error: advError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all auth users to check last_sign_in_at
    const { data: usersData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const authUsersMap = new Map<string, { last_sign_in_at: string | null }>();
    for (const u of usersData?.users || []) {
      authUsersMap.set(u.id, { last_sign_in_at: u.last_sign_in_at || null });
    }

    // Filter to pending (never logged in)
    const pendingAgents = (advisors || [])
      .filter((a) => {
        const authInfo = authUsersMap.get(a.auth_user_id);
        return !authInfo || !authInfo.last_sign_in_at;
      })
      .map((a) => ({
        id: a.id,
        auth_user_id: a.auth_user_id,
        first_name: a.first_name,
        last_name: a.last_name,
        email: a.email,
        created_at: a.created_at,
      }));

    return new Response(JSON.stringify({ agents: pendingAgents }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
