import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, stageName, stepTitle, message } = await req.json();

    if (!agentId || !stageName) {
      return new Response(JSON.stringify({ error: "Missing agentId or stageName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the agent's info
    const { data: agent, error: agentErr } = await adminClient
      .from("contracting_agents")
      .select("id, first_name, last_name, email")
      .eq("id", agentId)
      .single();

    if (agentErr || !agent) {
      console.error("Agent not found:", agentErr);
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const agentName = `${agent.first_name} ${agent.last_name}`;

    // ── contracting_submitted or bundle_selected → notify contracting team ──
    if (stageName === "contracting_submitted" || stageName === "bundle_selected") {
      // Find all contracting team members (contracting_role = 'contracting' or 'admin')
      const { data: teamMembers } = await adminClient
        .from("contracting_agents")
        .select("id")
        .in("contracting_role", ["contracting", "admin"]);

      if (teamMembers && teamMembers.length > 0) {
        const notifications = teamMembers
          .filter(m => m.id !== agentId)
          .map(m => ({
            agent_id: m.id,
            title: stageName === "contracting_submitted" ? "Contracting Submitted" : "Bundle Selected",
            message: `${agentName} has reached the "${stageName === "contracting_submitted" ? "Contracting Submitted" : "Bundle Selected"}" stage.${stepTitle ? ` Step: ${stepTitle}` : ""}`,
            notification_type: "stage_changed",
            link: `/portal/advisor/contracting`,
          }));

        if (notifications.length > 0) {
          await adminClient.from("contracting_notifications").insert(notifications);
        }
      }

      console.log(`Notified contracting team for ${stageName} - agent ${agentName}`);
    }

    // ── contracting_approved → email agent + in-app notification ──
    if (stageName === "contracting_approved") {
      // In-app notification for the agent
      await adminClient.from("contracting_notifications").insert({
        agent_id: agentId,
        title: "Contracting Approved! 🎉",
        message: "Congratulations! Your contracting has been approved. You're now ready to start writing business.",
        notification_type: "stage_changed",
        link: "/portal/advisor/contracting",
      });

      // Send congratulations email
      if (RESEND_API_KEY && agent.email) {
        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            <strong>Congratulations!</strong> Your contracting has been approved. You're now ready to start writing business with Everence Wealth.
          </p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Log in to your dashboard to view your carrier appointments and get started.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://everencewealth.lovable.app/portal/advisor/contracting"
               style="display:inline-block;background:#1A4D3E;color:#F0F2F1;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:Georgia,serif;">
              Go to Dashboard
            </a>
          </div>
        `;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Everence Wealth <onboarding@everencewealth.com>",
            to: [agent.email],
            subject: "🎉 Your Contracting Has Been Approved!",
            html: brandedEmailWrapper("Contracting Approved", innerHtml),
          }),
        });

        if (!emailRes.ok) {
          const errBody = await emailRes.text();
          console.error("Resend error (congratulations):", errBody);
        } else {
          console.log(`Congratulations email sent to ${agent.email}`);
        }
      }
    }

    // ── needs_info → email agent with custom message ──
    if (stageName === "needs_info") {
      if (RESEND_API_KEY && agent.email && message) {
        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Your contracting team needs additional information:
          </p>
          <div style="background:#F8F9FA;border-left:4px solid #1A4D3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
            <p style="color:#1A4D3E;line-height:1.6;font-size:16px;margin:0;font-style:italic;">${message}</p>
          </div>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Please log in to your dashboard to respond.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://everencewealth.lovable.app/portal/advisor/contracting"
               style="display:inline-block;background:#1A4D3E;color:#F0F2F1;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:Georgia,serif;">
              Go to Dashboard
            </a>
          </div>
        `;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Everence Wealth <onboarding@everencewealth.com>",
            to: [agent.email],
            subject: "Action Required: Additional Information Needed",
            html: brandedEmailWrapper("Information Requested", innerHtml),
          }),
        });

        if (!emailRes.ok) {
          const errBody = await emailRes.text();
          console.error("Resend error (needs info):", errBody);
        } else {
          console.log(`Needs info email sent to ${agent.email}`);
        }
      }

      // Also create in-app notification
      await adminClient.from("contracting_notifications").insert({
        agent_id: agentId,
        title: "Information Requested",
        message: message || "Your contracting team needs additional information. Please check your dashboard.",
        notification_type: "message",
        link: "/portal/advisor/contracting",
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in notify-contracting-step:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
