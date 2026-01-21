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

const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  de: "🇩🇪",
  fr: "🇫🇷",
  nl: "🇳🇱",
  ru: "🇷🇺",
  sv: "🇸🇪",
  no: "🇳🇴",
  da: "🇩🇰",
  fi: "🇫🇮",
};

const REMINDER_TYPE_ICONS: Record<string, string> = {
  callback: "📞",
  follow_up: "🔄",
  viewing: "🏠",
  meeting: "👥",
  appointment: "📅",
  deadline: "⏰",
};

function getTimeUntil(datetime: string): { minutes: number; display: string } {
  const now = new Date();
  const reminderTime = new Date(datetime);
  const diffMs = reminderTime.getTime() - now.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 0) {
    return { minutes, display: `${Math.abs(minutes)} minutes overdue` };
  } else if (minutes < 60) {
    return { minutes, display: `in ${minutes} minutes` };
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return { minutes, display: `in ${hours} hour${hours > 1 ? "s" : ""}` };
  } else {
    const days = Math.floor(minutes / 1440);
    return { minutes, display: `in ${days} day${days > 1 ? "s" : ""}` };
  }
}

function getUrgencyColor(minutes: number): { bg: string; text: string; border: string } {
  if (minutes < 0) return { bg: "#FEE2E2", text: "#DC2626", border: "#DC2626" }; // Overdue - red
  if (minutes < 30) return { bg: "#FFEDD5", text: "#EA580C", border: "#EA580C" }; // Critical - orange
  if (minutes < 60) return { bg: "#FEF3C7", text: "#D97706", border: "#D97706" }; // Urgent - amber
  return { bg: "#FEF9C3", text: "#CA8A04", border: "#CA8A04" }; // Soon - yellow
}

function generateEmailHtml(
  reminder: Reminder,
  agent: Agent,
  lead: Lead | null,
  crmUrl: string
): string {
  const timeUntil = getTimeUntil(reminder.reminder_datetime);
  const urgencyColors = getUrgencyColor(timeUntil.minutes);
  const typeIcon = REMINDER_TYPE_ICONS[reminder.reminder_type] || "🔔";
  const reminderDate = new Date(reminder.reminder_datetime);
  const formattedDate = reminderDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = reminderDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const leadSection = lead
    ? `
    <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin-top: 16px;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #6B7280;">Lead Details</h3>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #D4AF37 0%, #F5D675 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">
          ${lead.first_name[0]}${lead.last_name[0]}
        </div>
        <div>
          <p style="margin: 0; font-weight: 600; color: #111827;">${lead.first_name} ${lead.last_name}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #6B7280;">
            ${LANGUAGE_FLAGS[lead.language || "en"] || "🌍"} ${lead.lead_segment || "New Lead"} 
            ${lead.phone_number ? `• ${lead.phone_number}` : ""}
          </p>
        </div>
      </div>
    </div>
  `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: ${reminder.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Gold Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #B8963F 100%); padding: 24px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">🔔</div>
              <h1 style="margin: 0; color: white; font-size: 20px; font-weight: 600;">Reminder</h1>
              <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Del Sol Prime Homes CRM</p>
            </td>
          </tr>
          
          <!-- Urgency Alert Bar -->
          <tr>
            <td style="background: ${urgencyColors.bg}; padding: 12px 24px; border-bottom: 2px solid ${urgencyColors.border};">
              <p style="margin: 0; color: ${urgencyColors.text}; font-weight: 600; font-size: 14px; text-align: center;">
                ⏰ ${timeUntil.display.charAt(0).toUpperCase() + timeUntil.display.slice(1)}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">Hi ${agent.first_name},</p>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 15px;">You have an upcoming ${reminder.reminder_type.replace("_", " ")}:</p>
              
              <!-- Reminder Card -->
              <div style="background: #FEFCE8; border: 1px solid #FDE68A; border-left: 4px solid #D4AF37; border-radius: 8px; padding: 16px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="font-size: 24px;">${typeIcon}</div>
                  <div style="flex: 1;">
                    <h2 style="margin: 0; font-size: 16px; color: #111827; font-weight: 600;">${reminder.title}</h2>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #6B7280;">
                      📅 ${formattedDate}<br>
                      🕐 ${formattedTime}
                    </p>
                    ${reminder.description ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #374151;">${reminder.description}</p>` : ""}
                  </div>
                </div>
              </div>
              
              ${leadSection}
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 24px;">
                <a href="${crmUrl}/crm/agent/calendar" 
                   style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8963F 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);">
                  View in CRM Calendar
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #F9FAFB; padding: 16px 24px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                Del Sol Prime Homes • Agent CRM System<br>
                You received this because you have email reminders enabled.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get CRM URL from environment or use default
    const crmUrl = Deno.env.get("CRM_URL") || "https://blog-knowledge-vault.lovable.app";

    // Find reminders due within the next 60 minutes that haven't been emailed
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    console.log(`Checking for reminders between ${now.toISOString()} and ${oneHourFromNow.toISOString()}`);

    const { data: reminders, error: remindersError } = await supabase
      .from("crm_reminders")
      .select("*")
      .eq("send_email", true)
      .eq("email_sent", false)
      .eq("is_completed", false)
      .gte("reminder_datetime", now.toISOString())
      .lte("reminder_datetime", oneHourFromNow.toISOString())
      .order("reminder_datetime", { ascending: true });

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} reminders to process`);

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No reminders to send", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each reminder
    for (const reminder of reminders) {
      try {
        // Get agent info
        const { data: agent, error: agentError } = await supabase
          .from("crm_agents")
          .select("id, email, first_name, last_name")
          .eq("id", reminder.agent_id)
          .single();

        if (agentError || !agent) {
          console.error(`Agent not found for reminder ${reminder.id}`);
          results.failed++;
          results.errors.push(`Agent not found for reminder ${reminder.id}`);
          continue;
        }

        // Get lead info if available
        let lead: Lead | null = null;
        if (reminder.lead_id) {
          const { data: leadData } = await supabase
            .from("crm_leads")
            .select("id, first_name, last_name, phone_number, email, lead_segment, language")
            .eq("id", reminder.lead_id)
            .single();
          lead = leadData;
        }

        // Generate email HTML
        const html = generateEmailHtml(reminder, agent, lead, crmUrl);

        // Send email via Resend
        const { error: emailError } = await resend.emails.send({
          from: "Del Sol Prime Homes <crm@notifications.delsolprimehomes.com>",
          to: [agent.email],
          subject: `🔔 Reminder: ${reminder.title}`,
          html,
        });

        if (emailError) {
          console.error(`Failed to send email for reminder ${reminder.id}:`, emailError);
          results.failed++;
          results.errors.push(`Failed to send for ${reminder.id}: ${emailError.message}`);
          continue;
        }

        // Mark as sent
        await supabase
          .from("crm_reminders")
          .update({
            email_sent: true,
            notification_sent_at: new Date().toISOString(),
          })
          .eq("id", reminder.id);

        console.log(`Email sent for reminder ${reminder.id} to ${agent.email}`);
        results.sent++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error processing reminder ${reminder.id}:`, err);
        results.failed++;
        results.errors.push(`Error for ${reminder.id}: ${errorMessage}`);
      }
    }

    console.log(`Completed: ${results.sent} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-reminder-emails:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
