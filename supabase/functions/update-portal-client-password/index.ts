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

    // Verify caller identity
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

    // Verify caller is an advisor
    const { data: callerPortal } = await anonClient
      .from("portal_users")
      .select("id, role")
      .eq("auth_user_id", caller.id)
      .eq("is_active", true)
      .single();

    if (!callerPortal || callerPortal.role !== "advisor") {
      return new Response(JSON.stringify({ error: "Advisor access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the caller's advisor record
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: advisor } = await adminClient
      .from("advisors")
      .select("id")
      .eq("portal_user_id", callerPortal.id)
      .single();

    if (!advisor) {
      return new Response(JSON.stringify({ error: "Advisor record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { client_auth_user_id, new_password } = await req.json();

    if (!client_auth_user_id || !new_password) {
      return new Response(JSON.stringify({ error: "client_auth_user_id and new_password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new_password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the target client belongs to this advisor
    const { data: clientPortal } = await adminClient
      .from("portal_users")
      .select("id, auth_user_id, advisor_id")
      .eq("auth_user_id", client_auth_user_id)
      .eq("role", "client")
      .single();

    if (!clientPortal) {
      return new Response(JSON.stringify({ error: "Client not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (clientPortal.advisor_id !== advisor.id) {
      return new Response(JSON.stringify({ error: "You can only set passwords for your own clients" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Set the password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(client_auth_user_id, {
      password: new_password,
    });

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update password: " + updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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
