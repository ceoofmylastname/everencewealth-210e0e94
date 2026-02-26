import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Verify caller is an admin
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

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("portal_users")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { advisor_id } = await req.json();
    if (!advisor_id) {
      return new Response(JSON.stringify({ error: "advisor_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Deleting portal advisor:", advisor_id);

    // 1. Get the advisor record to find auth_user_id and portal_user_id
    const { data: advisor, error: advisorFetchErr } = await supabaseAdmin
      .from("advisors")
      .select("id, auth_user_id, portal_user_id, email")
      .eq("id", advisor_id)
      .single();

    if (advisorFetchErr || !advisor) {
      return new Response(JSON.stringify({ error: "Advisor not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Delete client_invitations referencing this advisor
    await supabaseAdmin.from("client_invitations").delete().eq("advisor_id", advisor_id);

    // 3. Delete carrier_contracts
    await supabaseAdmin.from("carrier_contracts").delete().eq("advisor_id", advisor_id);

    // 3. Delete advisor_performance records
    await supabaseAdmin.from("advisor_performance").delete().eq("advisor_id", advisor_id);

    // 4. Delete the advisor record
    const { error: deleteAdvisorErr } = await supabaseAdmin
      .from("advisors")
      .delete()
      .eq("id", advisor_id);

    if (deleteAdvisorErr) {
      console.error("Error deleting advisor:", deleteAdvisorErr);
      return new Response(JSON.stringify({ error: deleteAdvisorErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Delete portal_user record
    if (advisor.portal_user_id) {
      await supabaseAdmin.from("portal_users").delete().eq("id", advisor.portal_user_id);
    }

    // 6. Delete auth user (fully removes the account so email can be re-invited)
    if (advisor.auth_user_id) {
      const { error: authDeleteErr } = await supabaseAdmin.auth.admin.deleteUser(advisor.auth_user_id);
      if (authDeleteErr) {
        console.error("Error deleting auth user:", authDeleteErr);
        // Non-fatal — advisor data is already deleted
      }
    }

    console.log("Portal agent fully deleted:", advisor_id);

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
