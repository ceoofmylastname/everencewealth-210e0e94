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

async function sendEmail(apiKey: string, to: string, subject: string, subtitle: string, innerHtml: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Everence Wealth <onboarding@everencewealth.com>",
      to: [to],
      subject,
      html: brandedEmailWrapper(subtitle, innerHtml),
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error(`Resend error: ${errBody}`);
  }
  return res;
}

function dashboardButton(label = "Go to Dashboard") {
  return `<div style="text-align:center;margin:32px 0;"><a href="${DASHBOARD_URL}" style="display:inline-block;background:#1A4D3E;color:#F0F2F1;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:Georgia,serif;">${label}</a></div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, stageName, stepTitle, message, stepId, managerName, managerEmail, bundleName } = await req.json();

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

    const { data: agent, error: agentErr } = await adminClient
      .from("contracting_agents")
      .select("id, first_name, last_name, email, manager_id")
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

    // ── step_completed ──
    if (stageName === "step_completed") {
      // Deactivate reminder for this step
      if (stepId) {
        await adminClient
          .from("contracting_reminders")
          .update({ is_active: false })
          .eq("agent_id", agentId)
          .eq("step_id", stepId);
      }

      // In-app notification
      await adminClient.from("contracting_notifications").insert({
        agent_id: agentId,
        title: "Step Completed ✅",
        message: `You completed "${stepTitle || "a step"}". Keep up the great work!`,
        notification_type: "step_completed",
        link: "/portal/advisor/contracting",
      });

      // Email to agent
      if (RESEND_API_KEY && agent.email) {
        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <div style="text-align:center;margin:24px 0;">
            <span style="display:inline-block;background:#E8F5E9;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">✅</span>
          </div>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;text-align:center;">
            <strong>Step Completed:</strong> ${stepTitle || "Your step"}
          </p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Great progress! Continue with your next steps to keep your onboarding moving forward.
          </p>
          ${dashboardButton("Continue Onboarding")}
        `;
        await sendEmail(RESEND_API_KEY, agent.email, `Step Completed: ${stepTitle || "Onboarding Step"}`, "Step Completed", innerHtml);
      }
    }

    // ── stage_changed ──
    if (stageName === "stage_changed") {
      const newStage = stepTitle; // repurpose stepTitle as the new stage name

      // Deactivate old reminders
      await adminClient
        .from("contracting_reminders")
        .update({ is_active: false })
        .eq("agent_id", agentId)
        .eq("is_active", true);

      // Create new reminders for required steps in the new stage
      if (newStage) {
        const { data: requiredSteps } = await adminClient
          .from("contracting_steps")
          .select("id")
          .eq("stage", newStage)
          .eq("is_required", true);

        if (requiredSteps && requiredSteps.length > 0) {
          // Check which steps agent already completed
          const { data: completedSteps } = await adminClient
            .from("contracting_agent_steps")
            .select("step_id")
            .eq("agent_id", agentId)
            .eq("status", "completed");

          const completedIds = new Set((completedSteps || []).map(s => s.step_id));

          const reminders = requiredSteps
            .filter(s => !completedIds.has(s.id))
            .map(s => ({
              agent_id: agentId,
              step_id: s.id,
              stage: newStage,
              reminder_count: 0,
              phase: "daily",
              next_send_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              is_active: true,
            }));

          if (reminders.length > 0) {
            await adminClient
              .from("contracting_reminders")
              .upsert(reminders, { onConflict: "agent_id,step_id" });
          }
        }
      }

      // In-app notification
      await adminClient.from("contracting_notifications").insert({
        agent_id: agentId,
        title: "Stage Updated",
        message: `Your contracting has advanced to: ${newStage || "next stage"}.`,
        notification_type: "stage_changed",
        link: "/portal/advisor/contracting",
      });

      // Email to agent
      if (RESEND_API_KEY && agent.email) {
        const stageLabel = (newStage || "").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Your contracting has advanced to a new stage:
          </p>
          <div style="background:#F8F9FA;border-left:4px solid #1A4D3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
            <p style="color:#1A4D3E;line-height:1.6;font-size:18px;margin:0;font-weight:700;">${stageLabel}</p>
          </div>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Log in to your dashboard to view what's needed for this stage.
          </p>
          ${dashboardButton()}
        `;
        await sendEmail(RESEND_API_KEY, agent.email, `Stage Update: ${stageLabel}`, "Stage Update", innerHtml);
      }

      // Also email manager if assigned
      if (RESEND_API_KEY && agent.manager_id) {
        const { data: manager } = await adminClient
          .from("contracting_agents")
          .select("first_name, email")
          .eq("id", agent.manager_id)
          .single();

        if (manager?.email) {
          const stageLabel = (newStage || "").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
          const innerHtml = `
            <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${manager.first_name},</p>
            <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
              Your recruit <strong>${agentName}</strong> has advanced to the <strong>${stageLabel}</strong> stage.
            </p>
            ${dashboardButton("View Pipeline")}
          `;
          await sendEmail(RESEND_API_KEY, manager.email, `Recruit Update: ${agentName} → ${stageLabel}`, "Recruit Stage Update", innerHtml);
        }
      }
    }

    // ── manager_assigned ──
    if (stageName === "manager_assigned") {
      await adminClient.from("contracting_notifications").insert({
        agent_id: agentId,
        title: "Manager Assigned",
        message: `${managerName || "Your manager"} has been assigned to support your onboarding.`,
        notification_type: "stage_changed",
        link: "/portal/advisor/contracting",
      });

      if (RESEND_API_KEY && agent.email) {
        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Great news! <strong>${managerName || "A manager"}</strong> has been assigned to guide you through the onboarding process.
          </p>
          ${managerEmail ? `<p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">Feel free to reach out to them at <a href="mailto:${managerEmail}" style="color:#1A4D3E;font-weight:600;">${managerEmail}</a> with any questions.</p>` : ""}
          ${dashboardButton()}
        `;
        await sendEmail(RESEND_API_KEY, agent.email, "Your Manager Has Been Assigned", "Manager Assigned", innerHtml);
      }
    }

    // ── bundle_selected ──
    if (stageName === "bundle_selected") {
      // Notify contracting team (existing behavior)
      const { data: teamMembers } = await adminClient
        .from("contracting_agents")
        .select("id")
        .in("contracting_role", ["contracting", "admin"]);

      if (teamMembers && teamMembers.length > 0) {
        const notifications = teamMembers
          .filter(m => m.id !== agentId)
          .map(m => ({
            agent_id: m.id,
            title: "Bundle Selected",
            message: `${agentName} has selected the "${bundleName || "a bundle"}" bundle.`,
            notification_type: "stage_changed",
            link: `/portal/advisor/contracting`,
          }));

        if (notifications.length > 0) {
          await adminClient.from("contracting_notifications").insert(notifications);
        }
      }

      // Agent confirmation notification
      await adminClient.from("contracting_notifications").insert({
        agent_id: agentId,
        title: "Bundle Selected ✅",
        message: `You selected the "${bundleName || "your"}" bundle. Next: choose your carriers.`,
        notification_type: "step_completed",
        link: "/portal/advisor/contracting",
      });

      // Email to agent
      if (RESEND_API_KEY && agent.email) {
        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            You've selected the <strong>${bundleName || "your"}</strong> carrier bundle. Great choice!
          </p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Your next step is to review and select the individual carriers you'd like to get appointed with.
          </p>
          ${dashboardButton("Select Carriers")}
        `;
        await sendEmail(RESEND_API_KEY, agent.email, `Bundle Selected: ${bundleName || "Your Bundle"}`, "Bundle Selected", innerHtml);
      }

      console.log(`Notified for bundle_selected - agent ${agentName}`);
    }

    // ── contracting_submitted ──
    if (stageName === "contracting_submitted") {
      const { data: teamMembers } = await adminClient
        .from("contracting_agents")
        .select("id")
        .in("contracting_role", ["contracting", "admin"]);

      if (teamMembers && teamMembers.length > 0) {
        const notifications = teamMembers
          .filter(m => m.id !== agentId)
          .map(m => ({
            agent_id: m.id,
            title: "Contracting Submitted",
            message: `${agentName} has reached the "Contracting Submitted" stage.${stepTitle ? ` Step: ${stepTitle}` : ""}`,
            notification_type: "stage_changed",
            link: `/portal/advisor/contracting`,
          }));

        if (notifications.length > 0) {
          await adminClient.from("contracting_notifications").insert(notifications);
        }
      }

      console.log(`Notified contracting team for contracting_submitted - agent ${agentName}`);
    }

    // ── contracting_approved → email agent + in-app notification ──
    if (stageName === "contracting_approved") {
      await adminClient.from("contracting_notifications").insert({
        agent_id: agentId,
        title: "Contracting Approved! 🎉",
        message: "Congratulations! Your contracting has been approved. You're now ready to start writing business.",
        notification_type: "stage_changed",
        link: "/portal/advisor/contracting",
      });

      // Deactivate all reminders
      await adminClient
        .from("contracting_reminders")
        .update({ is_active: false })
        .eq("agent_id", agentId);

      if (RESEND_API_KEY && agent.email) {
        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${agent.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            <strong>Congratulations!</strong> Your contracting has been approved. You're now ready to start writing business with Everence Wealth.
          </p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
            Log in to your dashboard to view your carrier appointments and get started.
          </p>
          ${dashboardButton()}
        `;
        await sendEmail(RESEND_API_KEY, agent.email, "🎉 Your Contracting Has Been Approved!", "Contracting Approved", innerHtml);
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
          ${dashboardButton()}
        `;
        await sendEmail(RESEND_API_KEY, agent.email, "Action Required: Additional Information Needed", "Information Requested", innerHtml);
      }

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
