import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

interface ReminderWindow {
  key: "24h" | "4h" | "1h" | "10m";
  label: string;
  minutesBefore: number;
  sentCol: string;
  sentAtCol: string;
  subject: string;
  urgency: string;
  emoji: string;
}

const REMINDER_WINDOWS: ReminderWindow[] = [
  { key: "24h", label: "24 hours", minutesBefore: 1440, sentCol: "reminder_24h_sent", sentAtCol: "reminder_24h_sent_at", subject: "Tomorrow", urgency: "Get ready — your workshop is tomorrow!", emoji: "📅" },
  { key: "4h",  label: "4 hours",  minutesBefore: 240,  sentCol: "reminder_4h_sent",  sentAtCol: "reminder_4h_sent_at",  subject: "In 4 Hours", urgency: "Your workshop starts in just 4 hours!", emoji: "⏰" },
  { key: "1h",  label: "1 hour",   minutesBefore: 60,   sentCol: "reminder_1h_sent",  sentAtCol: "reminder_1h_sent_at",  subject: "In 1 Hour", urgency: "Your workshop starts in 1 hour — time to get ready!", emoji: "🔔" },
  { key: "10m", label: "10 minutes", minutesBefore: 10, sentCol: "reminder_10m_sent", sentAtCol: "reminder_10m_sent_at", subject: "Starting Now", urgency: "Your workshop is about to begin — join now!", emoji: "🚀" },
];

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
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    let totalSent = 0;
    const errors: string[] = [];

    // Process each reminder window
    for (const window of REMINDER_WINDOWS) {
      // Find registrations that need this reminder
      // Workshop is within the window AND reminder not yet sent
      const windowStart = new Date(now.getTime());
      const windowEnd = new Date(now.getTime() + window.minutesBefore * 60 * 1000);

      // Get workshops happening within the reminder window
      const { data: registrations, error: fetchErr } = await adminClient
        .from("workshop_registrations")
        .select(`
          id, first_name, email,
          workshops!inner(id, title, workshop_date, workshop_time, zoom_join_url, zoom_passcode),
          advisors!inner(first_name, last_name)
        `)
        .eq(window.sentCol, false)
        .eq("lead_status", "registered");

      if (fetchErr) {
        console.error(`Error fetching for ${window.key}:`, fetchErr);
        errors.push(`${window.key}: ${fetchErr.message}`);
        continue;
      }

      if (!registrations || registrations.length === 0) continue;

      // Filter to registrations where workshop is within the reminder window
      const eligible = registrations.filter((reg) => {
        const ws = reg.workshops;
        // Combine date + time into a proper datetime
        let workshopDateTime: Date;
        if (ws.workshop_time) {
          workshopDateTime = new Date(`${ws.workshop_date}T${ws.workshop_time}`);
        } else {
          workshopDateTime = new Date(ws.workshop_date);
        }

        const timeDiffMinutes = (workshopDateTime.getTime() - now.getTime()) / 60000;
        
        // Send if workshop is within the window range
        // For 24h: send when 0 < diff <= 1440 (but not if < next window's threshold)
        // We send if time remaining is <= window minutes AND > 0 (not past)
        return timeDiffMinutes > 0 && timeDiffMinutes <= window.minutesBefore;
      });

      for (const reg of eligible) {
        const ws = reg.workshops;
        const advisor = reg.advisors;
        const workshopDate = new Date(ws.workshop_date);
        const formattedDate = workshopDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const zoomButton = ws.zoom_join_url
          ? `<div style="text-align:center;margin:24px 0;">
              <a href="${ws.zoom_join_url}" 
                 style="display:inline-block;background:#1A4D3E;color:#F0F2F1;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:Georgia,serif;">
                Join Workshop Now
              </a>
              ${ws.zoom_passcode ? `<p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Passcode: ${ws.zoom_passcode}</p>` : ""}
            </div>`
          : "";

        const innerHtml = `
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${reg.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 8px;">
            ${window.emoji} <strong>${window.urgency}</strong>
          </p>
          <h2 style="color:#1A4D3E;font-size:20px;margin:16px 0 8px;font-family:Georgia,serif;">${ws.title}</h2>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">📅 <strong>Date:</strong> ${formattedDate}</p>
            <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">🕐 <strong>Time:</strong> ${ws.workshop_time || "TBD"}</p>
            <p style="margin:0;color:#4A5565;font-size:14px;">👤 <strong>Host:</strong> ${advisor.first_name} ${advisor.last_name}</p>
          </div>
          ${zoomButton}
        `;

        try {
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Everence Wealth <notifications@everencewealth.com>",
              to: [reg.email],
              subject: `Workshop Reminder — ${ws.title} ${window.subject}`,
              html: brandedEmailWrapper(`Workshop ${window.subject}`, innerHtml),
            }),
          });

          if (!emailRes.ok) {
            const errBody = await emailRes.text();
            console.error(`Resend error for ${reg.email} (${window.key}):`, errBody);
            errors.push(`${reg.email}/${window.key}: ${errBody}`);
            continue;
          }

          // Mark reminder as sent
          await adminClient
            .from("workshop_registrations")
            .update({
              [window.sentCol]: true,
              [window.sentAtCol]: new Date().toISOString(),
            })
            .eq("id", reg.id);

          totalSent++;
          console.log(`${window.key} reminder sent to ${reg.email} for "${ws.title}"`);
        } catch (sendErr) {
          console.error(`Error sending ${window.key} to ${reg.email}:`, sendErr);
          errors.push(`${reg.email}/${window.key}: ${String(sendErr)}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, emails_sent: totalSent, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
