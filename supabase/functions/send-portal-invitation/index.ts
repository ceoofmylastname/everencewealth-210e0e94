import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invitation_id } = await req.json();
    if (!invitation_id) {
      return new Response(JSON.stringify({ error: "Missing invitation_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to read invitation
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: invitation, error: invError } = await adminClient
      .from("client_invitations")
      .select("*, advisors!inner(first_name, last_name)")
      .eq("id", invitation_id)
      .single();

    if (invError || !invitation) {
      return new Response(JSON.stringify({ error: "Invitation not found" }), {
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

    // Build a simpler URL using the origin from the request
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "";
    const portalSignupUrl = `${origin}/portal/signup?token=${invitation.invitation_token}`;

    const advisorName = invitation.advisors
      ? `${invitation.advisors.first_name} ${invitation.advisors.last_name}`
      : "Your advisor";

    const emailHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="https://everencewealth.com/logo-icon.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom: 12px;" />
          <h1 style="color: #1A4D3E; font-size: 28px; margin: 0;">Everence Wealth</h1>
          <p style="color: #666; font-size: 14px; margin-top: 4px;">Client & Advisor Portal</p>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1A4D3E; margin-top: 0;">You're Invited!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${invitation.first_name},
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            ${advisorName} has invited you to join the Everence Wealth client portal. 
            You'll be able to view your policies, access documents, and communicate directly with your advisor.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${portalSignupUrl}" 
               style="display: inline-block; background: #1A4D3E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Create Your Account
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 13px; text-align: center;">
            This invitation expires in 7 days.
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          © ${new Date().getFullYear()} Everence Wealth. All rights reserved.<br/>
          455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Everence Wealth <notifications@everencewealth.com>",
        to: [invitation.email],
        subject: `${advisorName} has invited you to Everence Wealth Portal`,
        html: emailHtml,
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

    // Update invitation sent_at
    await adminClient
      .from("client_invitations")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", invitation_id);

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
