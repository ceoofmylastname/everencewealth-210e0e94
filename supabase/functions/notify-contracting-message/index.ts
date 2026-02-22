import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

const MESSAGES_URL = "https://everencewealth.lovable.app/portal/advisor/contracting/messages";

async function sendEmail(apiKey: string, to: string, subject: string, subtitle: string, innerHtml: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Everence Wealth <onboarding@everencewealth.com>",
      to: [to],
      subject,
      html: brandedEmailWrapper(subtitle, innerHtml),
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error(`Resend error for ${to}: ${errBody}`);
  }
  return res;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thread_id, sender_id, message_content, recipients } = await req.json();

    if (!thread_id || !sender_id || !message_content || !recipients?.length) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up sender name
    const { data: sender } = await adminClient
      .from("contracting_agents")
      .select("first_name, last_name")
      .eq("id", sender_id)
      .single();

    const senderName = sender ? `${sender.first_name} ${sender.last_name}` : "Someone";

    // Look up all recipient emails
    const { data: recipientAgents } = await adminClient
      .from("contracting_agents")
      .select("id, first_name, email")
      .in("id", recipients);

    if (!recipientAgents?.length) {
      console.log("No recipients found for IDs:", recipients);
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const preview = message_content.length > 300
      ? message_content.slice(0, 300) + "..."
      : message_content;

    let sentCount = 0;
    for (let i = 0; i < recipientAgents.length; i++) {
      const recipient = recipientAgents[i];
      if (!recipient.email) continue;

      const innerHtml = `
        <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;">Hi ${recipient.first_name},</p>
        <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">
          <strong>${senderName}</strong> sent you a message:
        </p>
        <div style="background:#F8F9FA;border-left:4px solid #1A4D3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
          <p style="color:#1A4D3E;line-height:1.6;font-size:16px;margin:0;font-style:italic;">"${preview}"</p>
        </div>
        <div style="text-align:center;margin:32px 0;">
          <a href="${MESSAGES_URL}" style="display:inline-block;background:#1A4D3E;color:#F0F2F1;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:Georgia,serif;">View Messages</a>
        </div>
      `;

      await sendEmail(RESEND_API_KEY, recipient.email, `New Message from ${senderName}`, "Contracting Messages", innerHtml);
      sentCount++;

      // Wait 2 seconds between sends
      if (i < recipientAgents.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log(`Sent ${sentCount} message notification emails for thread ${thread_id}`);

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in notify-contracting-message:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
