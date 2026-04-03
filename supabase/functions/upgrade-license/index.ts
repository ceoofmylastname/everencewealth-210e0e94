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

    // Verify caller identity (the agent themselves)
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

    const { agentId, fileName, filePath, fileSize } = await req.json();
    if (!agentId) {
      return new Response(JSON.stringify({ error: "agentId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the agent record
    const { data: agent, error: agentError } = await adminClient
      .from("contracting_agents")
      .select("id, first_name, last_name, email, auth_user_id, manager_id, is_licensed")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the calling user owns this agent record
    if (agent.auth_user_id !== callerUser.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency: already licensed
    if (agent.is_licensed === true) {
      return new Response(JSON.stringify({ success: true, already_licensed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Update is_licensed to true and advance pipeline stage
    const { error: updateErr } = await adminClient
      .from("contracting_agents")
      .update({
        is_licensed: true,
        pipeline_stage: "agreement_pending",
        license_reminder_count: 0,
        license_reminder_next_at: null,
      })
      .eq("id", agentId);

    if (updateErr) throw updateErr;

    // 2. Insert document record
    if (fileName && filePath) {
      await adminClient.from("contracting_documents").insert({
        agent_id: agentId,
        step_id: null,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize || null,
        uploaded_by: agentId,
      });
    }

    // 3. Log activity
    await adminClient.from("contracting_activity_logs").insert({
      agent_id: agentId,
      activity_type: "stage_changed",
      description: `${agent.first_name} ${agent.last_name} uploaded their license and was upgraded to licensed status`,
    });

    // 4. Notify manager via portal_notifications
    if (agent.manager_id) {
      await adminClient.from("portal_notifications").insert({
        user_id: agent.manager_id,
        title: "Agent Licensed",
        message: `${agent.first_name} ${agent.last_name} has obtained their insurance license and been upgraded to the licensed onboarding path.`,
        notification_type: "contracting",
        link: "/portal/advisor/contracting",
      });
    }

    // 5. Send confirmation email to agent
    let emailSent = false;
    if (resendApiKey && agent.email) {
      try {
        const resend = new Resend(resendApiKey);
        const siteUrl = "https://everencewealth.lovable.app";

        const { error: emailError } = await resend.emails.send({
          from: "Everence Wealth <onboarding@everencewealth.com>",
          to: [agent.email],
          subject: "License Received — Continue Your Onboarding",
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:40px auto;padding:32px 24px;">
    <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" style="height:48px;margin-bottom:32px;" />
    <h1 style="font-size:26px;color:#1a1a1a;margin:0 0 16px;">Congratulations, ${agent.first_name}!</h1>
    <p style="font-size:16px;color:#555;line-height:1.6;margin:0 0 24px;">
      Your insurance license has been received. You've been upgraded to the licensed agent onboarding path.
    </p>
    <p style="font-size:16px;color:#555;line-height:1.6;margin:0 0 24px;">
      Your next step is to review and sign the Agent Agreement. Log in to continue your onboarding.
    </p>
    <a href="${siteUrl}/portal/login" style="display:inline-block;background:#2d6a4f;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:bold;">
      Continue Onboarding
    </a>
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
    <p style="font-size:12px;color:#aaa;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
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
    console.error("Error in upgrade-license:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
