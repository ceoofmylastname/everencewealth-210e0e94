import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Reminder {
  id: string;
  agent_id: string;
  lead_id: string | null;
  title: string;
  description: string | null;
  reminder_type: string;
  reminder_datetime: string;
  send_email: boolean;
  email_sent: boolean;
  email_10min_sent: boolean;
  notification_sent_at: string | null;
}

interface Agent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string | null;
  lead_segment: string | null;
  language: string | null;
}

const LANGUAGE_FLAGS: Record<string, string> = { en: "🇺🇸", es: "🇪🇸" };

const REMINDER_TYPE_ICONS: Record<string, string> = {
  callback: "📞", follow_up: "🔄", viewing: "📊", meeting: "👥", appointment: "📅", deadline: "⏰",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://everencewealth.com/logo-icon.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

function getTimeUntil(datetime: string): { minutes: number; display: string } {
  const now = new Date();
  const reminderTime = new Date(datetime);
  const diffMs = reminderTime.getTime() - now.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 0) return { minutes, display: `${Math.abs(minutes)} minutes overdue` };
  if (minutes < 60) return { minutes, display: `in ${minutes} minutes` };
  if (minutes < 1440) { const hours = Math.floor(minutes / 60); return { minutes, display: `in ${hours} hour${hours > 1 ? "s" : ""}` }; }
  const days = Math.floor(minutes / 1440);
  return { minutes, display: `in ${days} day${days > 1 ? "s" : ""}` };
}

function getUrgencyColor(minutes: number, isUrgent: boolean = false): { bg: string; text: string; border: string } {
  if (minutes < 0) return { bg: "#FEE2E2", text: "#DC2626", border: "#DC2626" };
  if (isUrgent || minutes <= 10) return { bg: "#FEE2E2", text: "#DC2626", border: "#DC2626" };
  if (minutes < 30) return { bg: "#FFEDD5", text: "#EA580C", border: "#EA580C" };
  if (minutes < 60) return { bg: "#FEF3C7", text: "#D97706", border: "#D97706" };
  return { bg: "#FEF9C3", text: "#CA8A04", border: "#CA8A04" };
}

function generateEmailHtml(
  reminder: Reminder, agent: Agent, lead: Lead | null, crmUrl: string, isUrgentReminder: boolean = false
): string {
  const timeUntil = getTimeUntil(reminder.reminder_datetime);
  const urgencyColors = getUrgencyColor(timeUntil.minutes, isUrgentReminder);
  const typeIcon = REMINDER_TYPE_ICONS[reminder.reminder_type] || "🔔";
  const reminderDate = new Date(reminder.reminder_datetime);
  const formattedDate = reminderDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const formattedTime = reminderDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const urgentBanner = isUrgentReminder
    ? `<div style="background:#DC2626;padding:10px 16px;text-align:center;border-radius:8px;margin:0 0 20px;">
        <p style="margin:0;color:white;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">🚨 STARTING SOON - 10 MINUTES 🚨</p>
       </div>`
    : "";

  const leadSection = lead
    ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0 0;border:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:14px;color:#6B7280;font-weight:600;">Lead Details</p>
        <p style="margin:0;font-weight:600;color:#111827;font-size:15px;">${lead.first_name} ${lead.last_name}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">
          ${LANGUAGE_FLAGS[lead.language || "en"] || "🌍"} ${lead.lead_segment || "New Lead"} 
          ${lead.phone_number ? `• ${lead.phone_number}` : ""}
        </p>
      </div>`
    : "";

  const subtitleText = isUrgentReminder ? "Urgent Reminder" : "Calendar Reminder";
  const accentColor = isUrgentReminder ? "#DC2626" : "#C5A059";

  const innerHtml = `
    ${urgentBanner}

    <div style="background:${urgencyColors.bg};padding:12px 16px;border-radius:8px;border:1px solid ${urgencyColors.border};margin:0 0 20px;">
      <p style="margin:0;color:${urgencyColors.text};font-weight:600;font-size:14px;text-align:center;">
        ⏰ ${timeUntil.display.charAt(0).toUpperCase() + timeUntil.display.slice(1)}
      </p>
    </div>

    <p style="margin:0 0 8px;color:#6B7280;font-size:14px;">Hi ${agent.first_name},</p>
    <p style="margin:0 0 20px;color:#4A5565;font-size:15px;">${isUrgentReminder ? "Your" : "You have an upcoming"} ${reminder.reminder_type.replace("_", " ")}${isUrgentReminder ? " is about to start" : ""}:</p>
    
    <div style="background:${isUrgentReminder ? "#FEE2E2" : "#FFFBEB"};border:1px solid ${isUrgentReminder ? "#FECACA" : "#FDE68A"};border-left:4px solid ${accentColor};border-radius:8px;padding:16px;">
      <p style="margin:0;font-size:24px;">${typeIcon}</p>
      <p style="margin:8px 0 0;font-size:16px;color:#111827;font-weight:600;">${reminder.title}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">
        📅 ${formattedDate}<br>🕐 ${formattedTime}
      </p>
      ${reminder.description ? `<p style="margin:12px 0 0;font-size:14px;color:#4A5565;">${reminder.description}</p>` : ""}
    </div>
    
    ${leadSection}
    
    <div style="text-align:center;margin:24px 0;">
      <a href="${crmUrl}/crm/agent/calendar" 
         style="display:inline-block;background-color:${isUrgentReminder ? "#DC2626" : "#1A4D3E"};color:#F0F2F1;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;font-family:Georgia,serif;">
        View in CRM Calendar
      </a>
    </div>
  `;

  return brandedEmailWrapper(subtitleText, innerHtml);
}

async function processReminders(
  supabase: ReturnType<typeof createClient>,
  crmUrl: string,
  windowType: "1hour" | "10min"
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const now = new Date();
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  let startTime: Date;
  let endTime: Date;
  let emailSentColumn: string;
  let isUrgent: boolean;

  if (windowType === "1hour") {
    startTime = new Date(now.getTime() + 55 * 60 * 1000);
    endTime = new Date(now.getTime() + 65 * 60 * 1000);
    emailSentColumn = "email_sent";
    isUrgent = false;
  } else {
    startTime = new Date(now.getTime() + 5 * 60 * 1000);
    endTime = new Date(now.getTime() + 15 * 60 * 1000);
    emailSentColumn = "email_10min_sent";
    isUrgent = true;
  }

  const { data: reminders, error: remindersError } = await supabase
    .from("crm_reminders")
    .select("*")
    .eq("send_email", true)
    .eq(emailSentColumn, false)
    .eq("is_completed", false)
    .gte("reminder_datetime", startTime.toISOString())
    .lte("reminder_datetime", endTime.toISOString())
    .order("reminder_datetime", { ascending: true });

  if (remindersError) throw remindersError;
  if (!reminders || reminders.length === 0) return results;

  for (const reminder of reminders) {
    try {
      const { data: agent, error: agentError } = await supabase
        .from("crm_agents")
        .select("id, email, first_name, last_name")
        .eq("id", reminder.agent_id)
        .single();

      if (agentError || !agent) { results.failed++; continue; }

      let lead: Lead | null = null;
      if (reminder.lead_id) {
        const { data: leadData } = await supabase
          .from("crm_leads")
          .select("id, first_name, last_name, phone_number, email, lead_segment, language")
          .eq("id", reminder.lead_id)
          .single();
        lead = leadData;
      }

      const html = generateEmailHtml(reminder, agent, lead, crmUrl, isUrgent);
      const subject = isUrgent ? `🚨 STARTING SOON: ${reminder.title}` : `🔔 Reminder: ${reminder.title}`;

      const { error: emailError } = await resend.emails.send({
        from: "Everence Wealth <crm@notifications.everencewealth.com>",
        to: [agent.email],
        subject,
        html,
        headers: isUrgent ? { "X-Priority": "1" } : undefined,
      });

      if (emailError) {
        results.failed++;
        results.errors.push(`Failed for ${reminder.id}: ${emailError.message}`);
        continue;
      }

      const updateData: Record<string, unknown> = { notification_sent_at: new Date().toISOString() };
      if (windowType === "1hour") updateData.email_sent = true;
      else updateData.email_10min_sent = true;

      await supabase.from("crm_reminders").update(updateData).eq("id", reminder.id);
      console.log(`[${windowType.toUpperCase()}] Email sent for reminder ${reminder.id} to ${agent.email}`);
      results.sent++;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      results.failed++;
      results.errors.push(`Error for ${reminder.id}: ${errorMessage}`);
    }
  }

  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const crmUrl = Deno.env.get("CRM_URL") || "https://blog-knowledge-vault.lovable.app";

    const [hourResults, tenMinResults] = await Promise.all([
      processReminders(supabase, crmUrl, "1hour"),
      processReminders(supabase, crmUrl, "10min"),
    ]);

    const combinedResults = {
      hour_reminders: hourResults,
      ten_min_reminders: tenMinResults,
      total_sent: hourResults.sent + tenMinResults.sent,
      total_failed: hourResults.failed + tenMinResults.failed,
    };

    return new Response(
      JSON.stringify({ success: true, ...combinedResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});