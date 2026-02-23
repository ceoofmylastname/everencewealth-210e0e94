import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registration_id } = await req.json();
    if (!registration_id) {
      return new Response(JSON.stringify({ error: "Missing registration_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get registration with workshop and advisor info
    const { data: reg, error: regErr } = await adminClient
      .from("workshop_registrations")
      .select(`
        *,
        workshops!inner(title, description, workshop_date, workshop_time, zoom_join_url, zoom_passcode, max_attendees),
        advisors!inner(first_name, last_name, email, phone, photo_url)
      `)
      .eq("id", registration_id)
      .single();

    if (regErr || !reg) {
      console.error("Registration not found:", regErr);
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const workshop = reg.workshops;
    const advisor = reg.advisors;
    const workshopDate = new Date(workshop.workshop_date);
    const formattedDate = workshopDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const zoomSection = workshop.zoom_join_url
      ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="margin:0 0 8px;font-weight:600;color:#1A4D3E;font-size:15px;">📹 Zoom Meeting Details</p>
          <p style="margin:0 0 4px;color:#4A5565;font-size:14px;">Join URL: <a href="${workshop.zoom_join_url}" style="color:#1A4D3E;text-decoration:underline;">${workshop.zoom_join_url}</a></p>
          ${workshop.zoom_passcode ? `<p style="margin:0;color:#4A5565;font-size:14px;">Passcode: <strong>${workshop.zoom_passcode}</strong></p>` : ""}
        </div>`
      : `<p style="color:#9ca3af;font-size:13px;margin:16px 0;">Zoom details will be shared before the event.</p>`;

    const innerHtml = `
      <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${reg.first_name},</p>
      <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 8px;">
        🎉 <strong>You're confirmed!</strong> You've been registered for:
      </p>
      <h2 style="color:#1A4D3E;font-size:20px;margin:16px 0 8px;font-family:Georgia,serif;">${workshop.title}</h2>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">📅 <strong>Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px;color:#4A5565;font-size:14px;">🕐 <strong>Time:</strong> ${workshop.workshop_time || "TBD"}</p>
        <p style="margin:0;color:#4A5565;font-size:14px;">👤 <strong>Hosted by:</strong> ${advisor.first_name} ${advisor.last_name}</p>
      </div>
      ${zoomSection}
      <p style="color:#4A5565;line-height:1.6;font-size:14px;margin:24px 0 0;">
        We'll send you reminders before the event so you don't miss it. Looking forward to seeing you there!
      </p>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Everence Wealth <notifications@everencewealth.com>",
        to: [reg.email],
        subject: `You're registered: ${workshop.title}`,
        html: brandedEmailWrapper("Workshop Registration Confirmed", innerHtml),
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark welcome email as sent
    await adminClient
      .from("workshop_registrations")
      .update({
        welcome_email_sent: true,
        welcome_email_sent_at: new Date().toISOString(),
      })
      .eq("id", registration_id);

    console.log(`Confirmation email sent to ${reg.email} for workshop ${workshop.title}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
