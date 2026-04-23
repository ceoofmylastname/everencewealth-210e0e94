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

function brandedEmailWrapper(subtitle: string, innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;"><img src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" alt="Everence Wealth" width="48" height="48" style="margin-bottom:10px;"/><h1 style="margin:0;color:#F0F2F1;font-size:24px;font-weight:700;font-family:Georgia,serif;">Everence Wealth</h1><p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">${subtitle}</p></td></tr><tr><td style="padding:32px 28px;">${innerHtml}</td></tr><tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p><p style="margin:4px 0 0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105</p></td></tr></table></td></tr></table></body></html>`;
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

    // Look up advisor email
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

    const fieldRow = (label: string, value: string) =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;font-family:Georgia,serif;">${label}</span><br><span style="font-size:15px;color:#1A4D3E;font-family:Georgia,serif;">${value}</span></td></tr>`;

    const topicsHtml = submission.meeting_topics?.length
      ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;font-family:Georgia,serif;">Meeting Topics</span><ul style="margin:6px 0 0;padding-left:18px;color:#1A4D3E;font-size:14px;font-family:Georgia,serif;">${submission.meeting_topics.map((t) => `<li style="margin-bottom:4px;">${t}</li>`).join("")}</ul></td></tr>`
      : "";

    const innerHtml = `
      <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 16px;font-family:Georgia,serif;">Hi ${advisor.first_name},</p>
      <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;font-family:Georgia,serif;">
        📋 A new response card lead has been assigned to you. Here are the details:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${fieldRow("Client Name", `${submission.first_name} ${submission.last_name}`)}
        ${fieldRow("Email", `<a href="mailto:${submission.email}" style="color:#1A4D3E;text-decoration:underline;">${submission.email}</a>`)}
        ${fieldRow("Phone", `<a href="tel:${submission.phone}" style="color:#1A4D3E;text-decoration:underline;">${submission.phone}</a>`)}
        ${fieldRow("Marital Status", submission.marital_status)}
        ${address ? fieldRow("Address", address) : ""}
        ${fieldRow("Income Range", submission.income_range)}
        ${fieldRow("Free Consultation", submission.wants_free_consultation ? "✅ Yes" : "No")}
        <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;font-family:Georgia,serif;">Best Contact Times</span><br><span style="display:inline-block;margin-top:4px;background:#C5A059;color:#fff;padding:4px 12px;border-radius:4px;font-weight:600;font-size:13px;font-family:Georgia,serif;">${contactTimes}</span></td></tr>
        ${topicsHtml}
        ${submission.availability ? fieldRow("Availability", submission.availability) : ""}
        ${submission.comments ? fieldRow("Comments", submission.comments) : ""}
      </table>
      <p style="color:#9ca3af;line-height:1.5;font-size:13px;margin:0;font-family:Georgia,serif;">
        Please reach out to this lead at your earliest convenience.
      </p>
    `;

    const emailHtml = brandedEmailWrapper("New Response Card Lead", innerHtml);

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: "Everence Wealth <notifications@everencewealth.com>",
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
