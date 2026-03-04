import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

// 2026-03-21T11:00:00 PST = 2026-03-21T18:00:00Z (PDT is UTC-7, PST is UTC-8. In March, daylight saving applies. Match 8th -> PDT. So UTC-7. 11+7=18)
const EVENT_DATETIME = new Date("2026-03-21T11:00:00-07:00").getTime();

const REMINDERS = [
    {
        key: "reminder_10d",
        flag: "reminder_10d_sent",
        timeBefore: 10 * 24 * 60 * 60 * 1000,
        subject: "10 Days to Event",
        urgency: "The countdown begins! Your training event is only 10 days away."
    },
    {
        key: "reminder_5d",
        flag: "reminder_5d_sent",
        timeBefore: 5 * 24 * 60 * 60 * 1000,
        subject: "5 Days to Event",
        urgency: "We are just 5 days out. Have you prepared?"
    },
    {
        key: "reminder_24h",
        flag: "reminder_24h_sent",
        timeBefore: 24 * 60 * 60 * 1000,
        subject: "Action Required: Workshop Tomorrow",
        urgency: "Your workshop starts tomorrow!"
    }
];

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const { data: leads, error: fetchErr } = await supabase
            .from("recruit_leads")
            .select("id, name, email, audit_answers")
            .eq("status", "March21Event");

        if (fetchErr) throw fetchErr;
        if (!leads || leads.length === 0) {
            return new Response(JSON.stringify({ message: "No leads" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const now = Date.now();
        let sentCount = 0;

        for (const lead of leads) {
            const answers = typeof lead.audit_answers === "string" ? JSON.parse(lead.audit_answers) : (lead.audit_answers || {});

            for (const reminder of REMINDERS) {
                // If event is approaching, and we haven't sent this reminder, and we're within the reminder time frame
                const timeRemaining = EVENT_DATETIME - now;

                // We trigger the reminder if the remaining time is Less Than the reminder trigger time + 24 hours (so we have a window)
                // And greater than 0
                if (timeRemaining <= reminder.timeBefore && timeRemaining > 0 && !answers[reminder.flag]) {
                    console.log(`Sending ${reminder.key} to ${lead.email}`);

                    const innerHtml = `
            <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${lead.name.split(' ')[0]},</p>
            <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 8px;">
              <strong>${reminder.urgency}</strong>
            </p>
            <h2 style="color:#1A4D3E;font-size:20px;margin:16px 0 8px;font-family:Georgia,serif;">March 21st Broker Training</h2>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">📅 <strong>Date:</strong> Saturday, March 21, 2026</p>
              <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">🕐 <strong>Time:</strong> 11:00 AM to 4:00 PM PST</p>
              <p style="margin:0;color:#4A5565;font-size:14px;">📍 <strong>Location:</strong> Andaz Napa</p>
            </div>
            <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Get ready for a focused, full-day program designed to deepen your expertise in values-based financial planning, strengthen client engagement strategies, and expand your knowledge.</p>
            <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0;">See you soon!</p>
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
                                to: [lead.email],
                                subject: `Reminder: ${reminder.subject}`,
                                html: brandedEmailWrapper("Training Event", innerHtml),
                            }),
                        });

                        if (emailRes.ok) {
                            answers[reminder.flag] = true;
                            await supabase
                                .from("recruit_leads")
                                .update({ audit_answers: answers })
                                .eq("id", lead.id);
                            sentCount++;
                            await sleep(500); // rate limiting
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }

        return new Response(JSON.stringify({ success: true, sent: sentCount }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
