import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_URL = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionData {
  assigned_advisor_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  marital_status: string;
  street_address?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  income_range: string;
  wants_free_consultation: boolean;
  meeting_topics: string[];
  best_contact_times: string[];
  availability?: string;
  comments?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    );

    const { submission } = (await req.json()) as { submission: SubmissionData };

    // Look up agent email
    const { data: advisor, error: advError } = await supabaseClient
      .from("advisors")
      .select("email, first_name, last_name")
      .eq("id", submission.assigned_advisor_id)
      .single();

    if (advError || !advisor?.email) {
      console.error("Could not find advisor email:", advError);
      return new Response(JSON.stringify({ error: "Advisor not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const address = [
      submission.street_address,
      submission.address_line_2,
      [submission.city, submission.state, submission.zip_code].filter(Boolean).join(", "),
    ].filter(Boolean).join("<br>");

    const contactTimes = submission.best_contact_times?.length
      ? submission.best_contact_times.join(", ")
      : "Not specified";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1A4D3E 0%, #2A6D5E 100%); color: #fff; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px; }
    .field { margin-bottom: 18px; }
    .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { color: #333; font-size: 15px; }
    .highlight { background: #C5A059; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 13px; }
    .footer { background: #f9f9f9; padding: 20px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; }
    .topics li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 New Response Card Submission</h1>
      <p>A new lead has been assigned to you</p>
    </div>
    <div class="content">
      <div class="field"><div class="label">Name</div><div class="value">${submission.first_name} ${submission.last_name}</div></div>
      <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${submission.email}">${submission.email}</a></div></div>
      <div class="field"><div class="label">Phone</div><div class="value"><a href="tel:${submission.phone}">${submission.phone}</a></div></div>
      <div class="field"><div class="label">Marital Status</div><div class="value">${submission.marital_status}</div></div>
      ${address ? `<div class="field"><div class="label">Address</div><div class="value">${address}</div></div>` : ""}
      <div class="field"><div class="label">Income Range</div><div class="value">${submission.income_range}</div></div>
      <div class="field"><div class="label">Free Consultation</div><div class="value">${submission.wants_free_consultation ? "Yes" : "No"}</div></div>
      <div class="field"><div class="label">Best Contact Times</div><div class="value"><span class="highlight">${contactTimes}</span></div></div>
      ${submission.meeting_topics?.length ? `
      <div class="field">
        <div class="label">Meeting Topics</div>
        <ul class="topics" style="margin:4px 0;padding-left:18px;color:#333;font-size:14px;">
          ${submission.meeting_topics.map((t) => `<li>${t}</li>`).join("")}
        </ul>
      </div>` : ""}
      ${submission.availability ? `<div class="field"><div class="label">Availability</div><div class="value">${submission.availability}</div></div>` : ""}
      ${submission.comments ? `<div class="field"><div class="label">Comments</div><div class="value">${submission.comments}</div></div>` : ""}
    </div>
    <div class="footer">This is an automated notification from Everence Wealth</div>
  </div>
</body>
</html>`;

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: "Everence Wealth <noreply@everencewealth.com>",
        to: advisor.email,
        subject: `📋 New Response Card Lead — ${submission.first_name} ${submission.last_name}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
