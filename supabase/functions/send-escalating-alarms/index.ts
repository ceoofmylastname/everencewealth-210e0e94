import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") || "https://www.everencewealth.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

// Level-specific styling configuration
const ALARM_CONFIG: Record<number, { 
  emoji: string; text: string; color: string;
  subjectTemplate: (lang: string) => string;
}> = {
  1: { emoji: "⏰", text: "1 MIN PASSED", color: "#EAB308", subjectTemplate: (lang) => `CRM_NEW_LEAD_${lang}_T1 | Reminder 1 – lead not claimed (1 min)` },
  2: { emoji: "⚠️", text: "2 MIN PASSED", color: "#F97316", subjectTemplate: (lang) => `CRM_NEW_LEAD_${lang}_T2 | Reminder 2 – SLA running (2 min)` },
  3: { emoji: "🚨", text: "3 MIN PASSED", color: "#EA580C", subjectTemplate: (lang) => `CRM_NEW_LEAD_${lang}_T3 | Reminder 3 – URGENT (3 min)` },
  4: { emoji: "🔥", text: "4 MIN PASSED - FINAL WARNING", color: "#DC2626", subjectTemplate: (lang) => `CRM_NEW_LEAD_${lang}_T4 | FINAL reminder – fallback in 1 minute` },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("[send-escalating-alarms] Starting escalating alarm check...");

    const now = new Date();
    const alarmsToSend: Array<{ lead: any; targetLevel: number; agents: any[] }> = [];

    for (let level = 1; level <= 4; level++) {
      const minutesSinceCreation = level;
      const targetTime = new Date(now.getTime() - minutesSinceCreation * 60 * 1000);

      const { data: leads, error } = await supabase
        .from("crm_leads")
        .select("*")
        .eq("lead_claimed", false)
        .eq("claim_sla_breached", false)
        .eq("archived", false)
        .eq("last_alarm_level", level - 1)
        .not("claim_timer_started_at", "is", null)
        .lte("claim_timer_started_at", targetTime.toISOString());

      if (error) { console.error(`[send-escalating-alarms] Error querying level ${level}:`, error); continue; }
      if (!leads || leads.length === 0) { continue; }

      console.log(`[send-escalating-alarms] Found ${leads.length} leads needing alarm level ${level}`);

      for (const lead of leads) {
        const language = (lead.language || "en").toLowerCase();
        const { data: config, error: configError } = await supabase
          .from("crm_round_robin_config")
          .select("agent_ids")
          .eq("language", language)
          .single();

        if (configError || !config?.agent_ids?.length) { continue; }

        const { data: allAgents, error: agentsError } = await supabase
          .from("crm_agents")
          .select("id, email, first_name, last_name, role")
          .in("id", config.agent_ids)
          .eq("is_active", true);

        if (agentsError || !allAgents?.length) {
          await supabase.from("crm_leads").update({ last_alarm_level: level }).eq("id", lead.id);
          continue;
        }

        const nonAdminAgents = allAgents.filter((a) => a.role !== 'admin');
        const agents = nonAdminAgents.length > 0 ? nonAdminAgents : allAgents;
        alarmsToSend.push({ lead, targetLevel: level, agents });
      }
    }

    if (alarmsToSend.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No alarms needed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ lead_id: string; level: number; success: boolean }> = [];

    for (const { lead, targetLevel, agents } of alarmsToSend) {
      const config = ALARM_CONFIG[targetLevel];
      const agentEmails = agents.map((a) => a.email).filter(Boolean);
      if (agentEmails.length === 0) continue;

      const langCode = (lead.language || "EN").toUpperCase();
      const subject = config.subjectTemplate(langCode);

      const createdAt = new Date(lead.created_at);
      const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
      const remainingMinutes = Math.max(0, 5 - elapsedMinutes);

      const finalWarningBanner = targetLevel === 4 ? `
        <div style="margin:16px 0;padding:16px;background:#FEF2F2;border:2px solid #DC2626;border-radius:8px;">
          <p style="margin:0;color:#DC2626;font-size:14px;font-weight:700;text-align:center;">⚠️ FINAL WARNING - If not claimed within 1 minute, this lead will be escalated to admin!</p>
        </div>
      ` : '';

      const innerHtml = `
        <div style="background:${config.color};border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${config.emoji} ${config.text}</p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Lead still unclaimed after ${elapsedMinutes} minute${elapsedMinutes !== 1 ? 's' : ''}!</p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:0 0 16px;">
          <tr><td style="padding:20px;">
            <p style="margin:0 0 12px;font-weight:700;color:#1A4D3E;font-size:16px;">Lead Information</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:100px;">Language:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${lead.language ? lead.language.toUpperCase() : 'Unknown'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Country:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${lead.country_flag || '🌍'} ${lead.country_name || 'Not specified'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Time Elapsed:</td><td style="padding:6px 0;font-weight:700;color:${config.color};font-size:14px;">${elapsedMinutes} minute${elapsedMinutes !== 1 ? 's' : ''}</td></tr>
            </table>
          </td></tr>
        </table>

        <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
          <p style="margin:0;color:#92400E;font-size:13px;font-weight:600;">🔒 Claim this lead to see full contact details.</p>
        </div>

        ${finalWarningBanner}

        <div style="text-align:center;margin:24px 0;">
          <a href="${APP_URL}/crm/agent/leads/${lead.id}/claim" 
             style="display:inline-block;padding:14px 32px;background-color:${config.color};color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;border-radius:8px;font-family:Georgia,serif;">
            CLAIM THIS LEAD NOW
          </a>
        </div>

        <p style="margin:0;text-align:center;color:#6b7280;font-size:14px;">
          Time remaining: <strong style="color:${config.color};">${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}</strong>
        </p>
      `;

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "CRM Alerts <crm@notifications.everencewealth.com>",
            to: agentEmails,
            subject: subject,
            html: brandedEmailWrapper(`Escalating Alarm — Level ${targetLevel}`, innerHtml),
            headers: { "X-Priority": targetLevel >= 3 ? "1" : "2" },
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error(`[send-escalating-alarms] Resend error for lead ${lead.id} level ${targetLevel}:`, errorText);
          results.push({ lead_id: lead.id, level: targetLevel, success: false });
          continue;
        }

        const emailResult = await emailResponse.json();
        console.log(`[send-escalating-alarms] Level ${targetLevel} alarm for lead ${lead.id}: Resend ID=${emailResult.id}`);

        // Log to crm_email_logs
        const emailLogEntries = agents.map(agent => ({
          lead_id: lead.id, agent_id: agent.id, recipient_email: agent.email,
          recipient_name: `${agent.first_name || ''} ${agent.last_name || ''}`.trim() || null,
          subject, template_type: `escalating_alarm_t${targetLevel}`,
          triggered_by: 'system', trigger_reason: `Escalating alarm level ${targetLevel} - ${config.text}`,
          status: 'sent', resend_message_id: emailResult.id, sent_at: now.toISOString(),
        }));

        const { error: logError } = await supabase.from("crm_email_logs").insert(emailLogEntries);
        if (logError) console.error(`[send-escalating-alarms] Email log insert failed:`, logError);

      } catch (emailError) {
        console.error(`[send-escalating-alarms] Email error for lead ${lead.id}:`, emailError);
        results.push({ lead_id: lead.id, level: targetLevel, success: false });
        continue;
      }

      await supabase.from("crm_leads").update({ last_alarm_level: targetLevel }).eq("id", lead.id);

      const activityAgentId = agents[0]?.id;
      if (activityAgentId) {
        await supabase.from("crm_activities").insert({
          lead_id: lead.id, agent_id: activityAgentId, activity_type: "note",
          notes: `${config.emoji} Escalating alarm level ${targetLevel} sent - ${config.text} - lead still unclaimed`,
          created_at: now.toISOString(),
        });
      }

      results.push({ lead_id: lead.id, level: targetLevel, success: true });
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`[send-escalating-alarms] Completed - ${successCount}/${results.length} alarms sent`);

    return new Response(
      JSON.stringify({ processed: results.length, success_count: successCount, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[send-escalating-alarms] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});