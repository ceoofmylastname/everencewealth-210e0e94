import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") || "https://www.everencewealth.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const { lead_id, to_agent_id, reason, notes, reassigned_by_id } = await req.json();

    console.log(`[reassign-lead] Reassigning lead ${lead_id} to agent ${to_agent_id}, reason: ${reason}`);

    if (!lead_id || !to_agent_id || !reason || !reassigned_by_id) {
      console.error("[reassign-lead] Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: lead_id, to_agent_id, reason, reassigned_by_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .select("*, assigned_agent:crm_agents!assigned_agent_id(id, email, first_name, last_name)")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      console.error("[reassign-lead] Lead not found:", leadError);
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromAgentId = lead.assigned_agent_id;
    const fromAgentName = lead.assigned_agent 
      ? `${lead.assigned_agent.first_name} ${lead.assigned_agent.last_name}` 
      : "Unassigned";

    const { data: toAgent, error: toAgentError } = await supabase
      .from("crm_agents")
      .select("*")
      .eq("id", to_agent_id)
      .single();

    if (toAgentError || !toAgent) {
      console.error("[reassign-lead] Target agent not found:", toAgentError);
      return new Response(
        JSON.stringify({ error: "Target agent not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toAgentName = `${toAgent.first_name} ${toAgent.last_name}`;

    const now = new Date();
    const contactWindowExpiry = new Date(now.getTime() + 5 * 60 * 1000);

    const leadUpdate: Record<string, unknown> = {
      assigned_agent_id: to_agent_id,
      previous_agent_id: fromAgentId,
      reassignment_count: (lead.reassignment_count || 0) + 1,
      reassignment_reason: reason,
      reassigned_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (reason === 'unclaimed') {
      leadUpdate.lead_claimed = true;
      leadUpdate.assigned_at = now.toISOString();
      leadUpdate.assignment_method = 'admin_reassignment';
      leadUpdate.claim_timer_expires_at = null;
      leadUpdate.claim_sla_breached = true;
      leadUpdate.contact_timer_started_at = now.toISOString();
      leadUpdate.contact_timer_expires_at = contactWindowExpiry.toISOString();
      leadUpdate.contact_sla_breached = false;
      leadUpdate.first_action_completed = false;
    } else if (reason === 'no_contact') {
      leadUpdate.contact_timer_started_at = now.toISOString();
      leadUpdate.contact_timer_expires_at = contactWindowExpiry.toISOString();
      leadUpdate.contact_sla_breached = false;
      leadUpdate.first_action_completed = false;
      leadUpdate.assigned_at = now.toISOString();
      leadUpdate.assignment_method = 'admin_reassignment';
    } else {
      leadUpdate.contact_timer_started_at = now.toISOString();
      leadUpdate.contact_timer_expires_at = contactWindowExpiry.toISOString();
      leadUpdate.contact_sla_breached = false;
      leadUpdate.first_action_completed = false;
      leadUpdate.assigned_at = now.toISOString();
      leadUpdate.assignment_method = 'admin_reassignment';
    }

    const { error: updateError } = await supabase
      .from("crm_leads")
      .update(leadUpdate)
      .eq("id", lead_id);

    if (updateError) {
      console.error("[reassign-lead] Failed to update lead:", updateError);
      throw updateError;
    }

    const stageMap: Record<string, string> = {
      'unclaimed': 'claim_window',
      'no_contact': 'contact_window',
      'manual': 'manual'
    };

    const { error: reassignmentError } = await supabase
      .from("crm_lead_reassignments")
      .insert({
        lead_id,
        from_agent_id: fromAgentId,
        to_agent_id,
        reassigned_by: reassigned_by_id,
        reason,
        stage: stageMap[reason] || 'manual',
        notes: notes || null,
      });

    if (reassignmentError) {
      console.error("[reassign-lead] Failed to insert reassignment record:", reassignmentError);
    }

    if (fromAgentId) {
      const { error: decrementError } = await supabase.rpc('decrement_agent_lead_count', { p_agent_id: fromAgentId });
      if (decrementError) console.error("[reassign-lead] Failed to decrement old agent count:", decrementError);
    }

    const { error: incrementError } = await supabase.rpc('increment_agent_lead_count', { p_agent_id: to_agent_id });
    if (incrementError) console.error("[reassign-lead] Failed to increment new agent count:", incrementError);

    if (fromAgentId) {
      await supabase
        .from("crm_notifications")
        .update({ read: true, read_at: now.toISOString() })
        .eq("lead_id", lead_id)
        .eq("agent_id", fromAgentId);
    }

    const { error: notifError } = await supabase.from("crm_notifications").insert({
      agent_id: to_agent_id,
      lead_id,
      notification_type: "lead_reassigned",
      title: "🔄 Lead Reassigned to You",
      message: `Admin reassigned ${lead.first_name} ${lead.last_name} to you - ${reason.replace('_', ' ')}`,
      action_url: `/crm/agent/leads/${lead_id}`,
      read: false,
    });
    if (notifError) console.error("[reassign-lead] Failed to create notification:", notifError);

    const reasonDescriptions: Record<string, string> = {
      'unclaimed': 'Lead was unclaimed within SLA window',
      'no_contact': 'Previous agent did not make contact within SLA window',
      'manual': 'Manual reassignment by admin'
    };

    const { error: activityError } = await supabase.from("crm_activities").insert({
      lead_id,
      agent_id: to_agent_id,
      activity_type: "note",
      notes: `Lead reassigned from ${fromAgentName} to ${toAgentName}. Reason: ${reasonDescriptions[reason] || reason}${notes ? '. Admin notes: ' + notes : ''}`,
      created_at: now.toISOString(),
    });
    if (activityError) console.error("[reassign-lead] Failed to log activity:", activityError);

    // Send branded email to new agent
    const timerWarning = reason !== 'manual' 
      ? `<div style="background:#FFFBEB;border-left:4px solid #F59E0B;padding:16px;margin:0 0 24px;border-radius:8px;">
          <p style="margin:0;color:#92400E;font-weight:700;font-size:14px;">⏱️ Contact Timer Active</p>
          <p style="margin:6px 0 0;color:#92400E;font-size:13px;">You have <strong>5 minutes</strong> to call this lead!</p>
        </div>`
      : '';

    const innerHtml = `
      <p style="margin:0 0 16px;color:#4A5565;font-size:16px;line-height:1.6;">Hi ${toAgent.first_name},</p>
      <p style="margin:0 0 24px;color:#4A5565;font-size:16px;line-height:1.6;">A lead has been reassigned to you by admin.</p>
      
      ${timerWarning}
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:0 0 16px;">
        <tr><td style="padding:20px;">
          <p style="margin:0 0 12px;font-weight:700;color:#1A4D3E;font-size:16px;">Lead Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:100px;">Name:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${lead.first_name} ${lead.last_name}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Phone:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${lead.phone_number}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Email:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${lead.email || "Not provided"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Language:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${lead.language?.toUpperCase() || "N/A"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Source:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${lead.lead_source || "N/A"}</td></tr>
          </table>
        </td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:0 0 24px;">
        <tr><td style="padding:20px;">
          <p style="margin:0 0 12px;font-weight:700;color:#1A4D3E;font-size:16px;">Reassignment Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Previous Agent:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${fromAgentName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Reason:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${reasonDescriptions[reason] || reason}</td></tr>
            ${notes ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Admin Notes:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${notes}</td></tr>` : ''}
          </table>
        </td></tr>
      </table>
      
      <div style="text-align:center;">
        <a href="${APP_URL}/crm/agent/leads/${lead_id}" 
           style="display:inline-block;background-color:#1A4D3E;color:#F0F2F1;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;font-family:Georgia,serif;">
          View Lead &amp; Take Action
        </a>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CRM Assignments <crm@notifications.everencewealth.com>",
        to: [toAgent.email],
        subject: `CRM_LEAD_REASSIGNED_${(lead.language || 'en').toUpperCase()} | Lead reassigned to you`,
        html: brandedEmailWrapper("Lead Reassignment", innerHtml),
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error("[reassign-lead] Failed to send email:", emailError);
    } else {
      console.log("[reassign-lead] Email sent to new agent");
    }

    console.log(`[reassign-lead] Successfully reassigned lead ${lead_id} to ${toAgentName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Lead reassigned to ${toAgentName}`,
        lead_id,
        from_agent: fromAgentName,
        to_agent: toAgentName,
        reason,
        timer_reset: reason !== 'manual',
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[reassign-lead] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
