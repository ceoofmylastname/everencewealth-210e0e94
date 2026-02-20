import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const {
      applicant_age,
      spouse_age,
      combined_gross_income,
      combined_net_income,
      total_expenses,
      net_worth,
      total_assets,
      total_liabilities,
      retirement_age_goal,
      monthly_retirement_goal,
      risk_tolerance,
      smoking_status,
      goals,
      monthly_surplus,
    } = await req.json();

    const goalsText = goals && goals.length > 0 ? goals.join(", ") : "General financial planning";

    const systemPrompt = `You are a certified financial planner (CFP) analyzing a client's financial situation for Everence Wealth. Provide actionable, specific financial recommendations based on the data provided. Be conservative in projections and realistic in recommendations.`;

    const userPrompt = `Analyze this client's financial profile:

- Applicant Age: ${applicant_age || "Not provided"}
${spouse_age ? `- Spouse Age: ${spouse_age}` : ""}
- Combined Gross Monthly Income: $${combined_gross_income || 0}
- Combined Net Monthly Income: $${combined_net_income || 0}
- Total Monthly Expenses: $${total_expenses || 0}
- Monthly Surplus/Deficit: $${monthly_surplus || 0}
- Total Assets: $${total_assets || 0}
- Total Liabilities: $${total_liabilities || 0}
- Net Worth: $${net_worth || 0}
- Risk Tolerance: ${risk_tolerance || "moderate"}
- Smoking Status: ${smoking_status || "non_smoker"}
- Financial Goals: ${goalsText}
${retirement_age_goal ? `- Target Retirement Age: ${retirement_age_goal}` : ""}
${monthly_retirement_goal ? `- Target Monthly Retirement Income: $${monthly_retirement_goal}` : ""}

Provide a comprehensive financial analysis.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "financial_analysis",
                description:
                  "Return a structured financial analysis with retirement score, insurance gaps, and recommendations.",
                parameters: {
                  type: "object",
                  properties: {
                    retirement_score: {
                      type: "number",
                      description: "Retirement readiness score from 0 to 100",
                    },
                    projected_retirement_age: {
                      type: "number",
                      description: "Projected retirement age based on current trajectory",
                    },
                    projected_monthly_income: {
                      type: "number",
                      description: "Projected monthly retirement income",
                    },
                    retirement_gap: {
                      type: "number",
                      description: "Monthly gap between goal and projection (positive means shortfall)",
                    },
                    retirement_summary: {
                      type: "string",
                      description: "2-3 sentence summary of retirement readiness",
                    },
                    recommended_life_coverage: {
                      type: "number",
                      description: "Recommended life insurance coverage amount",
                    },
                    recommended_disability_coverage: {
                      type: "number",
                      description: "Recommended monthly disability coverage",
                    },
                    recommended_ltc_coverage: {
                      type: "number",
                      description: "Recommended long-term care coverage",
                    },
                    life_insurance_gap: {
                      type: "number",
                      description: "Gap in life insurance coverage",
                    },
                    risk_profile_summary: {
                      type: "string",
                      description: "2-3 sentence summary of risk profile and investment strategy",
                    },
                    recommended_allocation: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          value: { type: "number" },
                        },
                        required: ["name", "value"],
                        additionalProperties: false,
                      },
                      description: "Recommended asset allocation percentages",
                    },
                    key_recommendations: {
                      type: "array",
                      items: { type: "string" },
                      description: "Top 5 key recommendations",
                    },
                    action_steps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          priority: {
                            type: "string",
                            enum: ["high", "medium", "low"],
                          },
                          title: { type: "string" },
                          description: { type: "string" },
                          estimated_cost: { type: "string" },
                          timeline: { type: "string" },
                        },
                        required: ["priority", "title", "description"],
                        additionalProperties: false,
                      },
                      description: "Prioritized action steps",
                    },
                  },
                  required: [
                    "retirement_score",
                    "retirement_summary",
                    "risk_profile_summary",
                    "recommended_allocation",
                    "key_recommendations",
                    "action_steps",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "financial_analysis" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured output returned from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("financial-analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
