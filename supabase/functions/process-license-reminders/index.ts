import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

const DASHBOARD_URL = "https://everencewealth.lovable.app/portal/advisor/contracting";

function getNextSendAt(reminderCount: number): { nextSendAt: Date; phase: string } {
  const now = new Date();
  if (reminderCount < 5) {
    // Phase 1: every 3 days
    return { nextSendAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), phase: "every_3_days" };
  } else if (reminderCount < 10) {
    // Phase 2: weekly
    return { nextSendAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), phase: "weekly" };
  } else {
    // Phase 3: biweekly
    return { nextSendAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), phase: "biweekly" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query unlicensed agents whose reminder is due
    const { data: agents, error: fetchErr } = await adminClient
      .from("contracting_agents")
      .select("id, first_name, last_name, email, manager_id, license_reminder_count")
      .eq("is_licensed", false)
      .not("license_reminder_next_at", "is", null)
      .lte("license_reminder_next_at", new Date().toISOString())
      .limit(50);

    if (fetchErr) {
      console.error("Error fetching agents:", fetchErr);
      return new Response(JSON.stringify({ error: "Failed to fetch agents" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!agents || agents.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;

    for (const agent of agents) {
      const newCount = (agent.license_reminder_count || 0) + 1;

      // Max 15 reminders reached — notify manager and stop
      if (newCount > 15) {
        await adminClient
          .from("contracting_agents")
          .update({
            license_reminder_count: newCount,
            license_reminder_next_at: null,
          })
          .eq("id", agent.id);

        if (agent.manager_id) {
          // Look up manager from portal_users (manager_id references portal_users.id)
          const { data: manager } = await adminClient
            .from("portal_users")
            .select("id, full_name, email")
            .eq("id", agent.manager_id)
            .single();

          if (manager?.email) {
            const managerFirstName = manager.full_name?.split(" ")[0] || "Manager";
            const agentName = `${agent.first_name} ${agent.last_name}`;

            const innerHtml = `
              <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${managerFirstName},</p>
              <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
                <strong>${agentName}</strong> has not yet obtained their insurance license after 15 reminder attempts over approximately 10 weeks.
              </p>
              <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
                Please reach out to them directly or take appropriate action.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${DASHBOARD_URL}" style="display:inline-block;background:#1A4D3E;color:#F0F2F1;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:Georgia,serif;">View Pipeline</a>
              </div>
            `;

            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Everence Wealth <onboarding@everencewealth.com>",
                to: [manager.email],
                subject: `License Pending: ${agentName}`,
                html: brandedEmailWrapper("Agent Requires Attention", innerHtml),
              }),
            });
          }

          // Portal notification to manager
          await adminClient.from("portal_notifications").insert({
            user_id: agent.manager_id,
            title: "Agent License Overdue",
            message: `${agent.first_name} ${agent.last_name} has not obtained their insurance license after 15 reminders.`,
            notification_type: "contracting",
            link: "/portal/advisor/contracting",
          });
        }

        continue;
      }

      // Send reminder email to agent
      if (agent.email) {
        const phaseLabel = newCount <= 5 ? "Every 3 Days" : newCount <= 10 ? "Weekly" : "Biweekly";
        const agentName = `${agent.first_name} ${agent.last_name}`;

        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            We wanted to check in — have you gotten your insurance license yet?
          </p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Once you pass your licensing exam, you can upload your license document to your dashboard and immediately continue with the onboarding process.
          </p>
          <div style="background:#FFF8E1;border-left:4px solid #C5A059;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
            <p style="color:#1A4D3E;line-height:1.6;font-size:16px;margin:0;font-weight:700;">Upload your license to continue onboarding</p>
          </div>
          <p style="color:#888;font-size:13px;margin:0 0 24px;">Reminder ${newCount} of 15 &middot; ${phaseLabel} schedule</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${DASHBOARD_URL}" style="display:inline-block;background:#1A4D3E;color:#F0F2F1;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:Georgia,serif;">Upload My License</a>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Everence Wealth <onboarding@everencewealth.com>",
            to: [agent.email],
            subject: "Have you gotten your license yet?",
            html: brandedEmailWrapper("License Check-In", innerHtml),
          }),
        });
      }

      // Update reminder state
      const { nextSendAt, phase } = getNextSendAt(newCount);
      await adminClient
        .from("contracting_agents")
        .update({
          license_reminder_count: newCount,
          license_reminder_next_at: nextSendAt.toISOString(),
        })
        .eq("id", agent.id);

      processed++;
    }

    console.log(`Processed ${processed} license reminders`);

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in process-license-reminders:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
