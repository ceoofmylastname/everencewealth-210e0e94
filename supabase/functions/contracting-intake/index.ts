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
      phone,
      referral_source,
      
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

    // Generate password recovery link and send welcome email
    let emailSent = false;
    try {
      const siteUrl = "https://everencewealth.lovable.app";

      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${siteUrl}/portal/login`,
        },
      });

      if (linkError) {
        console.error("Failed to generate recovery link:", linkError.message);
      } else if (resendApiKey && linkData?.properties?.action_link) {
        const recoveryUrl = linkData.properties.action_link;
        const resend = new Resend(resendApiKey);

        const { error: emailError } = await resend.emails.send({
          from: "Everence Wealth <onboarding@everencewealth.com>",
          to: [email],
          subject: "Welcome to Everence Wealth – Set Your Password",
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:40px auto;padding:32px 24px;">
    <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" style="height:48px;margin-bottom:32px;" />
    <h1 style="font-size:26px;color:#1a1a1a;margin:0 0 16px;">Welcome, ${first_name}!</h1>
    <p style="font-size:16px;color:#555;line-height:1.6;margin:0 0 24px;">
      Your application has been received. To access your onboarding dashboard, please set your password by clicking the button below.
    </p>
    <a href="${recoveryUrl}" style="display:inline-block;background:#2d6a4f;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:bold;">
      Set Your Password
    </a>
    <p style="font-size:14px;color:#888;line-height:1.5;margin:32px 0 0;">
      This link will expire in 24 hours. If you didn't apply to Everence Wealth, you can safely ignore this email.
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
