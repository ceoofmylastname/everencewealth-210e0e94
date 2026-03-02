import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CategoryScores {
  savings: number;
  tax: number;
  protection: number;
  timeline: number;
}

interface Recommendation {
  service: string;
  title: string;
  description: string;
  priority: "high" | "medium";
}

interface AssessmentResultsRequest {
  email: string;
  first_name: string;
  overall_score: number;
  category_scores: CategoryScores;
  tier: string;
  tier_label: string;
  tier_description: string;
  recommendations: Recommendation[];
}

const TIER_COLORS: Record<string, string> = {
  excellent: "#10B981",
  good: "#C5A059",
  fair: "#F59E0B",
  needs_attention: "#EF4444",
};

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  savings: { label: "Savings & Preparedness", color: "#10B981" },
  tax: { label: "Tax Efficiency", color: "#C5A059" },
  protection: { label: "Risk & Protection", color: "#3B82F6" },
  timeline: { label: "Retirement Timeline", color: "#8B5CF6" },
};

function buildCategoryBarsHtml(scores: CategoryScores): string {
  return (["savings", "tax", "protection", "timeline"] as const)
    .map((key) => {
      const { label, color } = CATEGORY_META[key];
      const score = scores[key];
      return `
      <tr>
        <td style="padding:8px 0;color:#4A5565;font-size:14px;font-weight:600;width:40%;">${label}</td>
        <td style="padding:8px 0;width:45%;vertical-align:middle;">
          <div style="background:#E5E7EB;border-radius:10px;height:12px;overflow:hidden;">
            <div style="background:${color};height:12px;border-radius:10px;width:${score}%;"></div>
          </div>
        </td>
        <td style="padding:8px 0 8px 12px;color:#1A4D3E;font-weight:bold;font-size:14px;text-align:right;width:15%;">${score}%</td>
      </tr>`;
    })
    .join("");
}

function buildRecommendationsHtml(recommendations: Recommendation[]): string {
  return recommendations
    .map((rec) => {
      const borderColor = rec.priority === "high" ? "#C5A059" : "#10B981";
      return `
      <div style="background:#f9fafb;border-left:4px solid ${borderColor};border-radius:8px;padding:16px;margin:12px 0;">
        <p style="margin:0 0 4px;font-weight:bold;color:#1A4D3E;font-size:15px;font-family:Georgia,serif;">${rec.title}</p>
        <p style="margin:0;color:#4A5565;font-size:14px;line-height:1.5;">${rec.description}</p>
      </div>`;
    })
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = (await req.json()) as AssessmentResultsRequest;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const tierColor = TIER_COLORS[data.tier] || "#C5A059";

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#F0F2F1;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F1;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background-color:#1A4D3E;padding:28px 24px;text-align:center;">
          <h1 style="margin:0;color:#F0F2F1;font-size:22px;font-weight:700;font-family:Georgia,serif;">Your Retirement Readiness Results</h1>
          <p style="margin:6px 0 0;color:#C5A059;font-size:14px;font-family:Georgia,serif;">Everence Wealth Assessment</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 28px;">

          <!-- Greeting -->
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 20px;">Hi ${data.first_name},</p>
          <p style="color:#4A5565;line-height:1.6;font-size:16px;margin:0 0 24px;">Thank you for completing your Retirement Readiness Assessment. Here are your personalized results:</p>

          <!-- Score Circle -->
          <div style="text-align:center;margin:24px 0;">
            <div style="display:inline-block;width:120px;height:120px;border-radius:60px;border:8px solid ${tierColor};text-align:center;line-height:104px;">
              <span style="font-size:36px;font-weight:bold;color:#1A4D3E;font-family:Georgia,serif;">${data.overall_score}</span>
            </div>
            <p style="margin:12px 0 4px;font-size:20px;font-weight:bold;color:${tierColor};font-family:Georgia,serif;">${data.tier_label}</p>
            <p style="margin:0;color:#6B7280;font-size:14px;max-width:400px;display:inline-block;">${data.tier_description}</p>
          </div>

          <!-- Category Breakdown -->
          <h3 style="color:#1A4D3E;font-size:18px;margin:28px 0 12px;font-family:Georgia,serif;">Category Breakdown</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            ${buildCategoryBarsHtml(data.category_scores)}
          </table>

          <!-- Recommendations -->
          <h3 style="color:#1A4D3E;font-size:18px;margin:24px 0 12px;font-family:Georgia,serif;">Your Personalized Recommendations</h3>
          ${buildRecommendationsHtml(data.recommendations)}

          <!-- CTA -->
          <div style="text-align:center;margin:32px 0 16px;">
            <a href="https://everencewealth.com/en/contact" style="display:inline-block;background-color:#1A4D3E;color:#F0F2F1;padding:16px 32px;border-radius:8px;font-weight:bold;font-size:16px;text-decoration:none;font-family:Georgia,serif;">
              Schedule Your Free Strategy Session
            </a>
          </div>
          <p style="text-align:center;color:#9CA3AF;font-size:12px;margin:0;">No pressure. No obligation. Just a conversation about your future.</p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#F0F2F1;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#4A5565;font-family:Georgia,serif;">&copy; ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Everence Wealth <noreply@everencewealth.com>",
        to: data.email,
        subject: `Your Retirement Readiness Score: ${data.overall_score}/100 - ${data.tier_label}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Results email sent" }),
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
