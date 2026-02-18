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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("[check-contact-window-expiry] Starting check...");

    const { data: expiredLeads, error: queryError } = await supabase
      .from("crm_leads")
      .select("*")
      .lt("contact_timer_expires_at", new Date().toISOString())
      .eq("lead_claimed", true)
      .eq("first_action_completed", false)
      .eq("contact_sla_breached", false)
      .eq("archived", false);

    if (queryError) {
      console.error("[check-contact-window-expiry] Query error:", queryError);
      throw queryError;
    }

    if (!expiredLeads || expiredLeads.length === 0) {
      console.log("[check-contact-window-expiry] No expired contact windows found");
      return new Response(
        JSON.stringify({ processed: 0, message: "No expired contact windows" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[check-contact-window-expiry] Found ${expiredLeads.length} expired leads`);

    let processedCount = 0;
    let errorCount = 0;

    for (const lead of expiredLeads) {
      try {
        let agentName = "Unknown Agent";
        let agentEmail: string | null = null;

        if (lead.assigned_agent_id) {
          const { data: agent, error: agentError } = await supabase
            .from("crm_agents")
            .select("email, first_name, last_name")
            .eq("id", lead.assigned_agent_id)
            .single();

          if (!agentError && agent) {
            agentName = `${agent.first_name || ""} ${agent.last_name || ""}`.trim() || "Unknown Agent";
            agentEmail = agent.email;
          }
        }

        const { data: roundRobinConfig, error: configError } = await supabase
          .from("crm_round_robin_config")
          .select("fallback_admin_id")
          .eq("language", lead.language)
          .eq("is_active", true)
          .order("round_number", { ascending: false })
          .limit(1)
          .single();

        if (configError) {
          console.warn(`[check-contact-window-expiry] Config error for language ${lead.language}:`, configError);
        }

        const fallbackAdminId = roundRobinConfig?.fallback_admin_id;

        let adminEmail: string | null = null;
        let adminName: string | null = null;

        if (fallbackAdminId) {
          const { data: adminAgent, error: adminError } = await supabase
            .from("crm_agents")
            .select("email, first_name, last_name")
            .eq("id", fallbackAdminId)
            .single();

          if (!adminError && adminAgent) {
            adminEmail = adminAgent.email;
            adminName = adminAgent.first_name || "Admin";
          }
        }

        const { error: updateError } = await supabase
          .from("crm_leads")
          .update({ 
            contact_sla_breached: true,
            updated_at: new Date().toISOString()
          })
          .eq("id", lead.id);

        if (updateError) {
          console.error(`[check-contact-window-expiry] Update error for lead ${lead.id}:`, updateError);
          errorCount++;
          continue;
        }

        const claimedAt = lead.assigned_at ? new Date(lead.assigned_at) : new Date(lead.created_at);
        const now = new Date();
        const elapsedMinutes = Math.floor((now.getTime() - claimedAt.getTime()) / 60000);

        if (adminEmail && RESEND_API_KEY) {
          const innerHtml = `
            <p style="margin:0 0 16px;color:#4A5565;font-size:16px;line-height:1.6;">Hi ${adminName},</p>
            <p style="margin:0 0 24px;color:#4A5565;font-size:16px;line-height:1.6;">An agent claimed a lead but <strong>failed to make contact</strong> within the 5-minute window.</p>
            
            <div style="background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:8px;padding:16px;margin:0 0 24px;">
              <p style="margin:0;color:#B45309;font-weight:700;font-size:14px;">⚠️ Agent Failed to Make Contact</p>
              <p style="margin:6px 0 0;color:#92400E;font-size:13px;">Contact window expired — no call logged from Salestrail.</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:0 0 16px;">
              <tr><td style="padding:20px;">
                <p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:16px;">Lead Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:100px;">Name:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${lead.first_name} ${lead.last_name}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Phone:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${lead.phone_number || "Not provided"}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Email:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${lead.email || "Not provided"}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Language:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${lead.language?.toUpperCase()}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Source:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${lead.lead_source || "Unknown"}</td></tr>
                </table>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:0 0 24px;">
              <tr><td style="padding:20px;">
                <p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:16px;">Agent Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:100px;">Agent:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${agentName}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Email:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${agentEmail || "Not available"}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Claimed:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${elapsedMinutes} minutes ago</td></tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:0 0 24px;color:#4A5565;font-size:15px;"><strong>Action Required:</strong> Reassign this lead to another available agent immediately.</p>
            
            <div style="text-align:center;">
              <a href="${APP_URL}/crm/admin/leads" style="display:inline-block;background-color:#F59E0B;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;font-family:Georgia,serif;">View Leads &amp; Reassign</a>
            </div>
          `;

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "CRM Alerts <crm@notifications.everencewealth.com>",
              to: [adminEmail],
              subject: `CRM_ADMIN_CLAIMED_NOT_CALLED_${lead.language.toUpperCase()} | Lead claimed but not called (SLA breach)`,
              html: brandedEmailWrapper("CRM Alert — Contact SLA Breach", innerHtml),
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error(`[check-contact-window-expiry] Email send failed for lead ${lead.id}:`, errorText);
          } else {
            console.log(`[check-contact-window-expiry] Email sent to ${adminEmail} for lead ${lead.id}`);
          }
        } else {
          console.warn(`[check-contact-window-expiry] No admin email available for lead ${lead.id}`);
        }

        if (fallbackAdminId) {
          const { error: notifError } = await supabase
            .from("crm_notifications")
            .insert({
              agent_id: fallbackAdminId,
              lead_id: lead.id,
              notification_type: "contact_sla_breach",
              title: "⚠️ No Contact Made - Agent SLA Breach",
              message: `${agentName} claimed ${lead.first_name} ${lead.last_name} (${lead.language?.toUpperCase()}) but made no contact within 5 minutes - requires reassignment`,
              action_url: `/crm/admin/leads`,
              read: false,
            });

          if (notifError) {
            console.error(`[check-contact-window-expiry] Notification error for lead ${lead.id}:`, notifError);
          }
        }

        const { error: activityError } = await supabase
          .from("crm_activities")
          .insert({
            lead_id: lead.id,
            agent_id: lead.assigned_agent_id || fallbackAdminId,
            activity_type: "note",
            notes: `⚠️ CONTACT SLA BREACH: ${agentName} claimed this lead but made no contact within 5 minutes. Admin notified for reassignment.`,
            created_at: new Date().toISOString(),
          });

        if (activityError) {
          console.error(`[check-contact-window-expiry] Activity log error for lead ${lead.id}:`, activityError);
        }

        processedCount++;
        console.log(`[check-contact-window-expiry] Successfully processed lead ${lead.id}`);

      } catch (leadError) {
        console.error(`[check-contact-window-expiry] Error processing lead ${lead.id}:`, leadError);
        errorCount++;
      }
    }

    console.log(`[check-contact-window-expiry] Complete. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        processed: processedCount, 
        errors: errorCount,
        total: expiredLeads.length 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[check-contact-window-expiry] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});