import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOGO_URL =
  "https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png";
const LOGIN_URL = "https://everencewealth.lovable.app/portal/login";

function brandedEmailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Everence Wealth Portal</title></head>
<body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1A4D3E;padding:28px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Everence Wealth" width="48" height="48" style="display:block;margin:0 auto 12px;" />
              <div style="color:#ffffff;font-size:20px;font-family:Georgia,serif;font-weight:bold;letter-spacing:0.5px;">Everence Wealth</div>
              <div style="color:#C5A059;font-size:13px;font-family:Georgia,serif;margin-top:4px;">Client Portal</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F0F2F1;padding:24px 40px;text-align:center;border-top:1px solid #e0e0e0;">
              <p style="color:#888;font-size:12px;font-family:Georgia,serif;margin:0 0 4px;">Everence Wealth Management</p>
              <p style="color:#aaa;font-size:11px;font-family:Arial,sans-serif;margin:0;">San Francisco, CA &nbsp;|&nbsp; <a href="${LOGIN_URL}" style="color:#1A4D3E;text-decoration:none;">Client Portal</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate JWT via anon client
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversation_id, message_content, sender_role } = await req.json();
    if (!conversation_id || !message_content || !sender_role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Service role client for DB lookups
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch conversation
    const { data: conv, error: convError } = await adminClient
      .from("portal_conversations")
      .select("advisor_id, client_id")
      .eq("id", conversation_id)
      .single();

    if (convError || !conv) {
      console.error("Conversation not found:", convError);
      return new Response(
        JSON.stringify({ success: false, error: "Conversation not found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine recipient and sender IDs
    const recipientId =
      sender_role === "advisor" ? conv.client_id : conv.advisor_id;
    const senderId =
      sender_role === "advisor" ? conv.advisor_id : conv.client_id;

    // Fetch both users
    const { data: users, error: usersError } = await adminClient
      .from("portal_users")
      .select("id, first_name, last_name, email")
      .in("id", [recipientId, senderId]);

    if (usersError || !users || users.length < 2) {
      console.error("Users not found:", usersError);
      return new Response(
        JSON.stringify({ success: false, error: "Users not found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const recipient = users.find((u) => u.id === recipientId);
    const sender = users.find((u) => u.id === senderId);

    if (!recipient?.email) {
      console.error("Recipient email not found");
      return new Response(
        JSON.stringify({ success: false, error: "Recipient email not found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const senderName = `${sender?.first_name ?? ""} ${sender?.last_name ?? ""}`.trim();
    const recipientFirstName = recipient.first_name ?? "there";
    const preview =
      message_content.length > 300
        ? message_content.slice(0, 300) + "..."
        : message_content;

    // Build email content
    let subject: string;
    let bodyContent: string;
    let ctaLabel: string;

    if (sender_role === "advisor") {
      subject = `${senderName} sent you a message — Everence Wealth Portal`;
      ctaLabel = "Login to Reply";
      bodyContent = `
        <p style="color:#333;font-size:16px;margin:0 0 20px;">Hi ${recipientFirstName},</p>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Your advisor, <strong style="color:#1A4D3E;">${senderName}</strong>, has sent you a new message:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td style="background:#f7f9f8;border-left:4px solid #1A4D3E;border-radius:4px;padding:20px 24px;">
              <p style="color:#333;font-size:15px;font-style:italic;line-height:1.7;margin:0;">&ldquo;${preview}&rdquo;</p>
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
          <tr>
            <td style="background-color:#1A4D3E;border-radius:6px;padding:14px 32px;">
              <a href="${LOGIN_URL}" style="color:#ffffff;font-size:15px;font-family:Georgia,serif;text-decoration:none;font-weight:bold;">${ctaLabel}</a>
            </td>
          </tr>
        </table>
        <p style="color:#aaa;font-size:12px;line-height:1.5;margin:0;">
          You received this because you have an active conversation in your Everence Wealth portal.
        </p>`;
    } else {
      subject = `${senderName} sent you a message — Everence Wealth Portal`;
      ctaLabel = "View Message";
      bodyContent = `
        <p style="color:#333;font-size:16px;margin:0 0 20px;">Hi ${recipientFirstName},</p>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Your client, <strong style="color:#1A4D3E;">${senderName}</strong>, has sent you a new message:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td style="background:#f7f9f8;border-left:4px solid #1A4D3E;border-radius:4px;padding:20px 24px;">
              <p style="color:#333;font-size:15px;font-style:italic;line-height:1.7;margin:0;">&ldquo;${preview}&rdquo;</p>
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
          <tr>
            <td style="background-color:#1A4D3E;border-radius:6px;padding:14px 32px;">
              <a href="${LOGIN_URL}" style="color:#ffffff;font-size:15px;font-family:Georgia,serif;text-decoration:none;font-weight:bold;">${ctaLabel}</a>
            </td>
          </tr>
        </table>
        <p style="color:#aaa;font-size:12px;line-height:1.5;margin:0;">
          You received this notification because a client sent a message through the Everence Wealth portal.
        </p>`;
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Everence Wealth Portal <portal@everencewealth.com>",
        to: [recipient.email],
        subject,
        html: brandedEmailWrapper(bodyContent),
      }),
    });

    if (!emailResponse.ok) {
      const errBody = await emailResponse.text();
      console.error("Resend error:", emailResponse.status, errBody);
      return new Response(
        JSON.stringify({ success: false, error: "Email delivery failed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `Message notification sent to ${recipient.email} (${sender_role} → ${sender_role === "advisor" ? "client" : "advisor"})`
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
