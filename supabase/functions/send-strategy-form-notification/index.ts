import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_URL = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StrategyFormSubmission {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  income_range?: string;
  form_source: string;
  page_url?: string;
  created_at: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface NotificationRequest {
  submission: StrategyFormSubmission;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { submission } = await req.json() as NotificationRequest;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Get admin emails from settings or use defaults
    const { data: adminSettings } = await supabaseClient
      .from('recruit_settings')
      .select('value')
      .eq('key', 'admin_emails')
      .single();

    const adminEmails = adminSettings?.value
      ? JSON.parse(adminSettings.value)
      : ["info@everencewealth.com"];

    // Format email content
    const formattedDate = new Date(submission.created_at).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1A4D3E 0%, #2A6D5E 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .value { color: #333; font-size: 16px; }
            .highlight { background-color: #C5A059; color: white; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
            .footer { background-color: #f9f9f9; padding: 20px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; }
            .button { display: inline-block; background-color: #1A4D3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Strategy Form Submission</h1>
              <p>Form Source: <span class="highlight">${submission.form_source}</span></p>
            </div>

            <div class="content">
              <div class="field">
                <div class="label">Full Name</div>
                <div class="value">${submission.full_name}</div>
              </div>

              <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${submission.email}">${submission.email}</a></div>
              </div>

              ${submission.phone ? `
              <div class="field">
                <div class="label">Phone</div>
                <div class="value"><a href="tel:${submission.phone}">${submission.phone}</a></div>
              </div>
              ` : ''}

              ${submission.income_range ? `
              <div class="field">
                <div class="label">Income Range</div>
                <div class="value">${submission.income_range}</div>
              </div>
              ` : ''}

              <div class="field">
                <div class="label">Submitted</div>
                <div class="value">${formattedDate} PT</div>
              </div>

              ${submission.page_url ? `
              <div class="field">
                <div class="label">Page URL</div>
                <div class="value"><a href="${submission.page_url}">${submission.page_url}</a></div>
              </div>
              ` : ''}

              ${submission.utm_source || submission.utm_medium || submission.utm_campaign ? `
              <div class="field">
                <div class="label">UTM Tracking</div>
                <div class="value">
                  ${submission.utm_source ? `Source: ${submission.utm_source}<br>` : ''}
                  ${submission.utm_medium ? `Medium: ${submission.utm_medium}<br>` : ''}
                  ${submission.utm_campaign ? `Campaign: ${submission.utm_campaign}` : ''}
                </div>
              </div>
              ` : ''}
            </div>

            <div class="footer">
              Submission ID: ${submission.id}<br>
              This is an automated notification from Everence Wealth
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to all admin emails
    for (const adminEmail of adminEmails) {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Everence Wealth <noreply@everencewealth.com>",
          to: adminEmail,
          subject: `🎯 New ${submission.form_source} Form Submission - ${submission.full_name}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to send email to ${adminEmail}:`, error);
      }

      // Rate limit protection (Resend has 2 req/sec limit)
      await new Promise(resolve => setTimeout(resolve, 550));
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
