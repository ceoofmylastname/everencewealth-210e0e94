import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
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

        const { name, email, phone } = await req.json();

        if (!name || !email) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Insert into recruit_leads using a specific status to identify them
        const { data: lead, error: insertError } = await supabase
            .from("recruit_leads")
            .insert([
                {
                    name,
                    email,
                    phone: phone || "",
                    status: "March21Event",
                    audit_score: 0,
                    audit_answers: {
                        is_training_event: true,
                        reminder_10d_sent: false,
                        reminder_5d_sent: false,
                        reminder_24h_sent: false,
                        registered_at: new Date().toISOString()
                    },
                },
            ])
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting lead:", insertError);
            return new Response(JSON.stringify({ error: insertError.message }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Send the welcome email
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY) {
            const innerHtml = `
        <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${name.split(' ')[0]},</p>
        <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">
          Thank you for registering for the exclusive <strong>Everence Wealth Training Event</strong> on <strong>March 21st</strong>.
        </p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:24px 0;border-left:4px solid #1A4D3E;">
          <h2 style="color:#1A4D3E;font-size:18px;margin:0 0 8px;font-family:Georgia,serif;">Event Details</h2>
          <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">📅 <strong>Date:</strong> March 21st, 2026</p>
          <p style="margin:0;color:#4A5565;font-size:14px;">📍 <strong>Location:</strong> To Be Announced</p>
        </div>
        <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">
          We are preparing an incredible experience designed to elevate your business. You will receive further details and reminders as we get closer to the event.
        </p>
        <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0;">
          Best regards,<br/><strong>The Everence Wealth Team</strong>
        </p>
      `;

            try {
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${RESEND_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        from: "Everence Wealth <notifications@everencewealth.com>",
                        to: [email],
                        subject: "You're Registered: Everence Wealth Training Event",
                        html: brandedEmailWrapper("Training Event Confirmation", innerHtml),
                    }),
                });
            } catch (emailErr) {
                console.error("Failed to send welcome email:", emailErr);
            }
        }

        return new Response(JSON.stringify({ success: true, lead }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
