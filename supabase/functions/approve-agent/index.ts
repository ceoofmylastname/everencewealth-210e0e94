import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller identity
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user: callerUser }, error: authError } = await adminClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
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

    // Fetch the agent record
    const { data: agent, error: agentError } = await adminClient
      .from("contracting_agents")
      .select("id, first_name, last_name, email, auth_user_id, manager_id")
      .eq("id", agent_id)
      .single();

    if (agentError || !agent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is manager, admin, or contracting admin
    const { data: callerPortalUser } = await adminClient
      .from("portal_users")
      .select("id, role")
      .eq("auth_user_id", callerUser.id)
      .maybeSingle();

    // Also check contracting_agents for contracting admin role
    const { data: callerContracting } = await adminClient
      .from("contracting_agents")
      .select("contracting_role")
      .eq("auth_user_id", callerUser.id)
      .maybeSingle();

    const isManager = callerPortalUser && agent.manager_id === callerPortalUser.id;
    const isPortalAdmin = callerPortalUser?.role === "admin";
    const isContractingAdmin = callerContracting?.contracting_role === "admin";

    if (!isManager && !isPortalAdmin && !isContractingAdmin) {
      return new Response(JSON.stringify({ error: "You are not authorized to approve this agent" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if portal_users record exists
    const { data: existingPortalUser } = await adminClient
      .from("portal_users")
      .select("id")
      .eq("auth_user_id", agent.auth_user_id)
      .maybeSingle();

    let portalError;
    if (existingPortalUser) {
      // Record exists — activate it
      const { error } = await adminClient
        .from("portal_users")
        .update({ is_active: true })
        .eq("auth_user_id", agent.auth_user_id);
      portalError = error;
    } else {
      // Record missing — create it
      const { error } = await adminClient
        .from("portal_users")
        .insert({
          auth_user_id: agent.auth_user_id,
          first_name: agent.first_name,
          last_name: agent.last_name,
          email: agent.email,
          role: "advisor",
          is_active: true,
        });
      portalError = error;
    }

    if (portalError) {
      return new Response(JSON.stringify({ error: "Failed to activate agent: " + portalError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log activity
    await adminClient.from("contracting_activity_logs").insert({
      agent_id: agent.id,
      activity_type: "stage_changed",
      description: `${agent.first_name} ${agent.last_name} approved by manager`,
    });

    // Send approval email
    let emailSent = false;
    if (resendApiKey && agent.email) {
      try {
        const resend = new Resend(resendApiKey);
        const siteUrl = "https://everencewealth.lovable.app";

        const { error: emailError } = await resend.emails.send({
          from: "Everence Wealth <onboarding@everencewealth.com>",
          to: [agent.email],
          subject: "Your Account Has Been Approved – Everence Wealth",
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:40px auto;padding:32px 24px;">
    <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" style="height:48px;margin-bottom:32px;" />
    <h1 style="font-size:26px;color:#1a1a1a;margin:0 0 16px;">You're Approved, ${agent.first_name}!</h1>
    <p style="font-size:16px;color:#555;line-height:1.6;margin:0 0 24px;">
      Your manager has approved your account. You can now log in to your onboarding dashboard and continue your contracting process.
    </p>
    <a href="${siteUrl}/portal/login" style="display:inline-block;background:#2d6a4f;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:bold;">
      Log In Now
    </a>
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
    <p style="font-size:12px;color:#aaa;">© ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
  </div>
</body>
</html>`,
        });

        if (!emailError) emailSent = true;
        else console.error("Email error:", emailError);
      } catch (emailErr) {
        console.error("Email sending error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, email_sent: emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
