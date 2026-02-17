import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAgentRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  languages: string[];
  max_active_leads: number;
  email_notifications: boolean;
  timezone: string;
}

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://everencewealth.com/logo-icon.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
}

function generateWelcomeEmailHtml(data: {
  firstName: string;
  email: string;
  password: string;
  loginUrl: string;
  languages: string[];
  role: string;
}): string {
  const languageNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
  };
  
  const formattedLanguages = data.languages
    .map(code => languageNames[code] || code.toUpperCase())
    .join(", ");

  const isAdmin = data.role === 'admin';
  const roleLabel = isAdmin ? '👑 Administrator' : '👤 Agent';
  const roleMessage = isAdmin 
    ? 'Your CRM <strong>administrator</strong> account has been created! You have full access to manage agents, leads, and system settings.'
    : 'Your CRM <strong>agent</strong> account has been created! You can now log in and start managing leads assigned to you.';
  
  const nextSteps = isAdmin 
    ? `<ul style="color:#4A5565;line-height:1.8;padding-left:20px;">
            <li>Log in to your admin dashboard</li>
            <li>Review and configure system settings</li>
            <li>Add and manage team agents</li>
            <li>Monitor lead distribution and performance</li>
          </ul>`
    : `<ul style="color:#4A5565;line-height:1.8;padding-left:20px;">
            <li>Log in to your dashboard</li>
            <li>Review your notification preferences</li>
            <li>Wait for new leads to be assigned based on your language skills</li>
            <li>Claim leads quickly - you have a 15-minute window!</li>
          </ul>`;

  const roleBadgeColor = isAdmin ? '#805ad5' : '#1A4D3E';

  const innerHtml = `
    <p style="margin:0 0 16px;color:#4A5565;font-size:16px;line-height:1.6;">Hi ${data.firstName},</p>
    <p style="margin:0 0 24px;color:#4A5565;font-size:16px;line-height:1.6;">${roleMessage}</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:0 0 24px;">
      <tr><td style="padding:20px;">
        <p style="margin:0 0 12px;font-weight:700;color:#1A4D3E;font-size:16px;">🔐 Your Login Credentials</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Email:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${data.email}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Password:</td><td style="padding:6px 0;font-weight:600;color:#111827;font-size:14px;">${data.password}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Role:</td><td style="padding:6px 0;"><span style="display:inline-block;background:${roleBadgeColor};color:white;padding:4px 12px;border-radius:12px;font-size:13px;font-weight:600;">${roleLabel}</span></td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Languages:</td><td style="padding:6px 0;color:#111827;font-size:14px;">${formattedLanguages}</td></tr>
        </table>
      </td></tr>
    </table>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="${data.loginUrl}" style="display:inline-block;background-color:#1A4D3E;color:#F0F2F1;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;font-family:Georgia,serif;">Log In to CRM Dashboard</a>
    </div>
    
    <div style="background:#FFFBEB;border-left:4px solid #C5A059;padding:16px;border-radius:8px;margin:0 0 24px;">
      <p style="margin:0;color:#92400E;font-size:14px;"><strong>🔒 Security Reminder:</strong> Please change your password after your first login.</p>
    </div>
    
    <p style="margin:0 0 8px;font-weight:700;color:#1A4D3E;font-size:16px;">What's Next?</p>
    ${nextSteps}
  `;

  return brandedEmailWrapper("CRM Account Created", innerHtml);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc("is_admin", { _user_id: caller.id });
    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Only admins can create agents" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CreateAgentRequest = await req.json();
    console.log("Creating agent with email:", body.email);

    if (!body.email || !body.password || !body.first_name || !body.last_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check existing agent
    const { data: existingAgent } = await supabaseAdmin
      .from("crm_agents")
      .select("id, is_active")
      .eq("email", body.email)
      .single();

    if (existingAgent) {
      if (existingAgent.is_active) {
        return new Response(
          JSON.stringify({ error: "An agent with this email already exists" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Reactivate inactive agent
      console.log("Reactivating inactive agent:", existingAgent.id);
      
      await supabaseAdmin.auth.admin.updateUserById(existingAgent.id, { password: body.password });
      
      const { data: reactivatedAgent, error: reactivateError } = await supabaseAdmin
        .from("crm_agents")
        .update({
          first_name: body.first_name, last_name: body.last_name,
          phone: body.phone || null, role: body.role || "agent",
          languages: body.languages || ["en"], max_active_leads: body.max_active_leads || 50,
          email_notifications: body.email_notifications ?? true,
          timezone: body.timezone || "Europe/Madrid",
          is_active: true, accepts_new_leads: true,
        })
        .eq("id", existingAgent.id)
        .select()
        .single();
      
      if (reactivateError) {
        return new Response(
          JSON.stringify({ error: reactivateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Send welcome email
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      let emailSent = false;
      if (resendApiKey) {
        try {
          const appUrl = Deno.env.get("APP_URL") || "https://www.everencewealth.com";
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
            body: JSON.stringify({
              from: "Everence Wealth CRM <crm@notifications.everencewealth.com>",
              to: [body.email],
              subject: body.role === 'admin' 
                ? "Welcome Back to Everence Wealth CRM - Your Admin Account is Reactivated"
                : "Welcome Back to Everence Wealth CRM - Your Account is Reactivated",
              html: generateWelcomeEmailHtml({
                firstName: body.first_name, email: body.email, password: body.password,
                loginUrl: `${appUrl}/crm/login`, languages: body.languages || ["en"], role: body.role || "agent",
              }),
            }),
          });
          emailSent = emailResponse.ok;
        } catch (emailError) {
          console.error("Failed to send reactivation email:", emailError);
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, agent: reactivatedAgent, agentId: reactivatedAgent.id, emailSent, reactivated: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new agent
    let userId: string;
    let authUserCreated = false;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email, password: body.password, email_confirm: true,
    });

    if (authError) {
      if (authError.message?.includes("already been registered") || authError.message?.includes("email_exists") || authError.message?.includes("already exists")) {
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listError) return new Response(JSON.stringify({ error: "Failed to find existing user" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const existingAuthUser = usersData.users.find((u) => u.email?.toLowerCase() === body.email.toLowerCase());
        if (!existingAuthUser) return new Response(JSON.stringify({ error: "Could not find existing user with this email" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        userId = existingAuthUser.id;
        await supabaseAdmin.auth.admin.updateUserById(userId, { password: body.password });
      } else {
        return new Response(JSON.stringify({ error: authError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else {
      if (!authData.user) return new Response(JSON.stringify({ error: "Failed to create auth user" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      userId = authData.user.id;
      authUserCreated = true;
    }

    const { data: agent, error: agentError } = await supabaseAdmin
      .from("crm_agents")
      .insert({
        id: userId, email: body.email, first_name: body.first_name, last_name: body.last_name,
        phone: body.phone || null, role: body.role || "agent", languages: body.languages || ["en"],
        max_active_leads: body.max_active_leads || 50, email_notifications: body.email_notifications ?? true,
        timezone: body.timezone || "Europe/Madrid", is_active: true, accepts_new_leads: true, current_lead_count: 0,
      })
      .select()
      .single();

    if (agentError) {
      if (authUserCreated) await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: agentError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;
    if (resendApiKey) {
      try {
        const appUrl = Deno.env.get("APP_URL") || "https://www.everencewealth.com";
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
          body: JSON.stringify({
            from: "Everence Wealth CRM <crm@notifications.everencewealth.com>",
            to: [body.email],
            subject: body.role === 'admin'
              ? "Welcome to Everence Wealth CRM - Your Admin Account is Ready"
              : "Welcome to Everence Wealth CRM - Your Account is Ready",
            html: generateWelcomeEmailHtml({
              firstName: body.first_name, email: body.email, password: body.password,
              loginUrl: `${appUrl}/crm/login`, languages: body.languages || ["en"], role: body.role || "agent",
            }),
          }),
        });
        emailSent = emailResponse.ok;
        const emailResult = await emailResponse.json();
        console.log("Welcome email result:", emailSent ? "sent" : "failed", emailResult);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, agent, agentId: agent.id, emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});