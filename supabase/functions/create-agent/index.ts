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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is a portal admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check portal admin role
    const { data: callerPortal } = await anonClient
      .from("portal_users")
      .select("role")
      .eq("auth_user_id", caller.id)
      .eq("is_active", true)
      .single();

    if (!callerPortal || callerPortal.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      agency_id,
      license_number,
      specializations,
      send_invitation,
    } = body;

    if (!first_name || !last_name || !email) {
      return new Response(
        JSON.stringify({ error: "first_name, last_name, and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Create auth user
    const tempPassword = crypto.randomUUID() + "!Aa1";
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: "Failed to create auth user: " + authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authUserId = authUser.user.id;

    // 2. Create portal_users record
    const { data: portalUser, error: puError } = await adminClient
      .from("portal_users")
      .insert({
        auth_user_id: authUserId,
        role: "advisor",
        first_name,
        last_name,
        email,
        phone: phone || null,
        is_active: true,
      })
      .select("id")
      .single();

    if (puError) {
      // Cleanup: delete the auth user we just created
      await adminClient.auth.admin.deleteUser(authUserId);
      return new Response(
        JSON.stringify({ error: "Failed to create portal user: " + puError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Create advisors record
    const { error: advError } = await adminClient.from("advisors").insert({
      auth_user_id: authUserId,
      portal_user_id: portalUser.id,
      first_name,
      last_name,
      email,
      phone: phone || null,
      agency_id: agency_id || null,
      license_number: license_number || null,
      specializations: specializations
        ? specializations.split(",").map((s: string) => s.trim())
        : null,
      is_active: true,
    });

    if (advError) {
      // Cleanup
      await adminClient.from("portal_users").delete().eq("id", portalUser.id);
      await adminClient.auth.admin.deleteUser(authUserId);
      return new Response(
        JSON.stringify({ error: "Failed to create advisor: " + advError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Send invitation via password reset if requested
    let invitation_sent = false;
    let invitation_error: string | null = null;

    if (send_invitation) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        invitation_error = "RESEND_API_KEY not configured";
        console.error(invitation_error);
      } else {
        try {
          const appUrl = "https://id-preview--29324b25-4616-48ca-967b-28e362789bf6.lovable.app";

          const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
              redirectTo: `${appUrl}/portal/reset-password`,
            },
          });

          if (linkError) {
            invitation_error = "Failed to generate reset link: " + linkError.message;
            console.error(invitation_error);
          } else {
            const resetLink = linkData?.properties?.action_link;

            const resendRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Everence Wealth <portal@everencewealth.com>",
                to: [email],
                subject: "Welcome to Everence Wealth Portal — Set Your Password",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #1A4D3E; padding: 24px; text-align: center;">
                      <h1 style="color: #F0F2F1; margin: 0; font-size: 24px;">Everence Wealth</h1>
                    </div>
                    <div style="padding: 32px 24px;">
                      <p>Hi ${first_name},</p>
                      <p>You've been invited to join the Everence Wealth advisor portal. Please set your password to get started:</p>
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetLink}" style="background-color: #1A4D3E; color: #F0F2F1; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                          Set Your Password
                        </a>
                      </div>
                      <p style="color: #4A5565; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                      <p style="color: #4A5565; font-size: 12px; word-break: break-all;">${resetLink}</p>
                    </div>
                    <div style="background-color: #F0F2F1; padding: 16px 24px; text-align: center; font-size: 12px; color: #4A5565;">
                      455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105
                    </div>
                  </div>
                `,
              }),
            });

            const resendBody = await resendRes.json();
            console.log("Resend API response:", JSON.stringify(resendBody), "status:", resendRes.status);

            if (!resendRes.ok) {
              invitation_error = resendBody?.message || resendBody?.error || `Resend returned ${resendRes.status}`;
              console.error("Resend email failed:", invitation_error);
            } else {
              invitation_sent = true;
            }
          }
        } catch (e) {
          invitation_error = e.message || "Unknown email error";
          console.error("Failed to send invitation email:", e);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, portal_user_id: portalUser.id, invitation_sent, invitation_error }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
