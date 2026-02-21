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
    // Phase 1: daily
    return { nextSendAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), phase: "daily" };
  } else if (reminderCount < 10) {
    // Phase 2: every 3 days
    return { nextSendAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), phase: "every_3_days" };
  } else {
    // Phase 3: weekly
    return { nextSendAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), phase: "weekly" };
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

    // Get due reminders
    const { data: dueReminders, error: fetchErr } = await adminClient
      .from("contracting_reminders")
      .select("*, contracting_steps(title), contracting_agents(first_name, last_name, email, manager_id)")
      .eq("is_active", true)
      .lte("next_send_at", new Date().toISOString())
      .order("next_send_at", { ascending: true })
      .limit(50);

    if (fetchErr) {
      console.error("Error fetching reminders:", fetchErr);
      return new Response(JSON.stringify({ error: "Failed to fetch reminders" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dueReminders || dueReminders.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;

    for (const reminder of dueReminders) {
      const agent = reminder.contracting_agents;
      const step = reminder.contracting_steps;
      const stepTitle = step?.title || "Incomplete Step";
      const agentName = `${agent?.first_name || ""} ${agent?.last_name || ""}`.trim();

      // Safety check: is the step already completed?
      const { data: agentStep } = await adminClient
        .from("contracting_agent_steps")
        .select("status")
        .eq("agent_id", reminder.agent_id)
        .eq("step_id", reminder.step_id)
        .single();

      if (agentStep?.status === "completed") {
        // Step done — deactivate reminder
        await adminClient
          .from("contracting_reminders")
          .update({ is_active: false })
          .eq("id", reminder.id);
        continue;
      }

      const newCount = reminder.reminder_count + 1;

      // Max 15 reminders reached
      if (newCount > 15) {
        await adminClient
          .from("contracting_reminders")
          .update({ is_active: false, reminder_count: newCount })
          .eq("id", reminder.id);

        // Notify manager that agent is unresponsive
        if (agent?.manager_id) {
          const { data: manager } = await adminClient
            .from("contracting_agents")
            .select("first_name, email")
            .eq("id", agent.manager_id)
            .single();

          if (manager?.email) {
            const innerHtml = `
              <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${manager.first_name},</p>
              <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
                <strong>${agentName}</strong> has not completed the step "<strong>${stepTitle}</strong>" after 15 reminder attempts over approximately 7 weeks.
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
                subject: `Unresponsive Agent: ${agentName}`,
                html: brandedEmailWrapper("Agent Requires Attention", innerHtml),
              }),
            });
          }
        }

        continue;
      }

      // Send reminder email to agent
      if (agent?.email) {
        const phaseLabel = newCount <= 5 ? "Daily" : newCount <= 10 ? "Every 3 Days" : "Weekly";
        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            This is a friendly reminder to complete the following step in your onboarding:
          </p>
          <div style="background:#FFF8E1;border-left:4px solid #C5A059;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
            <p style="color:#1A4D3E;line-height:1.6;font-size:18px;margin:0;font-weight:700;">📋 ${stepTitle}</p>
          </div>
          <p style="color:#888;font-size:13px;margin:0 0 24px;">Reminder ${newCount} of 15 · ${phaseLabel} schedule</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Log in to your dashboard to complete this step and keep your contracting on track.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${DASHBOARD_URL}" style="display:inline-block;background:#1A4D3E;color:#F0F2F1;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:Georgia,serif;">Complete Step</a>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Everence Wealth <onboarding@everencewealth.com>",
            to: [agent.email],
            subject: `Reminder: Complete "${stepTitle}"`,
            html: brandedEmailWrapper("Onboarding Reminder", innerHtml),
          }),
        });
      }

      // Update reminder record
      const { nextSendAt, phase } = getNextSendAt(newCount);
      await adminClient
        .from("contracting_reminders")
        .update({
          reminder_count: newCount,
          last_sent_at: new Date().toISOString(),
          next_send_at: nextSendAt.toISOString(),
          phase,
        })
        .eq("id", reminder.id);

      processed++;
    }

    console.log(`Processed ${processed} reminders`);

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in process-contracting-reminders:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
