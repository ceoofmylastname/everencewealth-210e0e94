import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

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
    const body = await req.json();

    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      referral_source,
      
      state,
      address,
      is_licensed,
      manager_id,
    } = body;

    if (!first_name || !last_name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
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

    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
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
        pipeline_stage: "intake_submitted",
        status: "in_progress",
        referral_source: referral_source || null,
        
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

    // Create portal_users record so the recruit can log in
    const { error: portalError } = await adminClient.from("portal_users").insert({
      auth_user_id: authUserId,
      email: email.toLowerCase(),
      full_name: `${first_name} ${last_name}`,
      role: "advisor",
      is_active: false,
    });

    if (portalError) {
      console.error("Failed to create portal user:", portalError);
    }

    // Log activity
    await adminClient.from("contracting_activity_logs").insert({
      agent_id: agent.id,
      activity_type: "stage_changed",
      description: `New application submitted by ${first_name} ${last_name}`,
    });

    // Notify the selected manager
    if (manager_id) {
      const { error: notifError } = await adminClient.from("portal_notifications").insert({
        user_id: manager_id,
        title: "New Agent Assigned to You",
        message: `${first_name} ${last_name} has submitted an application and needs your approval to access the portal.`,
        notification_type: "contracting",
        link: "/portal/advisor/contracting/dashboard",
      });
      if (notifError) {
        console.error("Failed to notify manager:", notifError);
      }
    }

    // Send welcome confirmation email (no recovery link needed since user set their password)
    let emailSent = false;
    try {
      const siteUrl = "https://everencewealth.lovable.app";

      if (resendApiKey) {
        const resend = new Resend(resendApiKey);

        const { error: emailError } = await resend.emails.send({
          from: "Everence Wealth <onboarding@everencewealth.com>",
          to: [email],
          subject: "Welcome to Everence Wealth – Your Application is Received",
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:40px auto;padding:32px 24px;">
    <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" style="height:48px;margin-bottom:32px;" />
    <h1 style="font-size:26px;color:#1a1a1a;margin:0 0 16px;">Welcome, ${first_name}!</h1>
    <p style="font-size:16px;color:#555;line-height:1.6;margin:0 0 24px;">
      Your application has been received. You can now log in to your onboarding dashboard using the email and password you created during your application.
    </p>
    <a href="${siteUrl}/portal/login" style="display:inline-block;background:#2d6a4f;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:bold;">
      Go to Login
    </a>
    <p style="font-size:14px;color:#888;line-height:1.5;margin:32px 0 0;">
      If you didn't apply to Everence Wealth, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
    <p style="font-size:12px;color:#aaa;">© ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
  </div>
</body>
</html>`,
        });

        if (emailError) {
          console.error("Failed to send welcome email:", emailError);
        } else {
          emailSent = true;
        }
      }
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, agent_id: agent.id, email_sent: emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
