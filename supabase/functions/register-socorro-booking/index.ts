import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/htr97zzmRc1NMujHbL9R/webhook-trigger/38dde57c-be77-4ed2-82ab-bd8a153f557e";

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">Official Vendor | Socorro Independent School District</p></td></tr></table></td></tr></table></body></html>`;
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

        const {
            advisor_id,
            availability_slot_id,
            first_name,
            last_name,
            email,
            phone,
            selected_date,
            selected_time,
            advisor_name,
        } = await req.json();

        if (!advisor_id || !availability_slot_id || !first_name || !last_name || !email) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Verify slot is still available
        const { data: slot, error: slotError } = await supabase
            .from("socorro_advisor_availability")
            .select("*")
            .eq("id", availability_slot_id)
            .eq("is_booked", false)
            .single();

        if (slotError || !slot) {
            return new Response(
                JSON.stringify({ error: "This time slot is no longer available. Please select another." }),
                { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Mark slot as booked
        const { error: updateError } = await supabase
            .from("socorro_advisor_availability")
            .update({ is_booked: true })
            .eq("id", availability_slot_id)
            .eq("is_booked", false);

        if (updateError) {
            console.error("Error marking slot booked:", updateError);
            return new Response(JSON.stringify({ error: "Failed to reserve slot" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Insert registration
        const { data: registration, error: insertError } = await supabase
            .from("socorro_workshop_registrations")
            .insert([{
                advisor_id,
                availability_slot_id,
                first_name,
                last_name,
                email,
                phone: phone || null,
                selected_date,
                selected_time,
            }])
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting registration:", insertError);
            // Rollback: unbook the slot
            await supabase
                .from("socorro_advisor_availability")
                .update({ is_booked: false })
                .eq("id", availability_slot_id);
            return new Response(JSON.stringify({ error: insertError.message }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Send confirmation email via Resend
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        let emailSent = false;
        if (RESEND_API_KEY) {
            const advisorDisplay = advisor_name || "your advisor";
            const innerHtml = `
                <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${first_name},</p>
                <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">
                    You're all set for your discovery session at the Everence Wealth Workshop.
                </p>
                <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:24px 0;border-left:4px solid #1A4D3E;">
                    <h2 style="color:#1A4D3E;font-size:18px;margin:0 0 12px;font-family:Georgia,serif;">Your Session Details</h2>
                    <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">👤 <strong>Advisor:</strong> ${advisorDisplay}</p>
                    <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">📅 <strong>Date:</strong> ${selected_date}</p>
                    <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">🕐 <strong>Time:</strong> ${selected_time}</p>
                    <p style="margin:0;color:#4A5565;font-size:14px;">📍 <strong>Location:</strong> Socorro ISD Campus</p>
                </div>
                <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">
                    Your advisor will meet with you at your scheduled time. This is a 5-minute session
                    designed to give you a clear picture of your retirement options as an SISD employee.
                </p>
                <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0;">
                    Questions? Reply to this email.<br/><strong>— Everence Wealth</strong>
                </p>
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
                        to: [email],
                        subject: `You're confirmed — Everence Wealth Workshop`,
                        html: brandedEmailWrapper("Workshop Session Confirmation", innerHtml),
                    }),
                });
                emailSent = emailRes.ok;
            } catch (emailErr) {
                console.error("Failed to send confirmation email:", emailErr);
            }
        }

        // POST to GHL webhook
        let ghlSent = false;
        try {
            const ghlRes = await fetch(GHL_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event: "workshop_registration",
                    source: "socorro_isd_workshop_march2025",
                    first_name,
                    last_name,
                    email,
                    phone: phone || "",
                    advisor_id,
                    advisor_name: advisor_name || "",
                    selected_date,
                    selected_time,
                    timestamp: new Date().toISOString(),
                }),
            });
            ghlSent = ghlRes.ok;
        } catch (ghlErr) {
            console.error("Failed to send GHL webhook:", ghlErr);
        }

        // Update flags
        if (registration?.id) {
            await supabase
                .from("socorro_workshop_registrations")
                .update({ email_sent: emailSent, ghl_webhook_sent: ghlSent })
                .eq("id", registration.id);
        }

        return new Response(JSON.stringify({ success: true, registration }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err: any) {
        console.error("Error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
