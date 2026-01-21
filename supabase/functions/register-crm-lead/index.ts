import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadPayload {
  // Contact info
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  countryPrefix?: string;
  
  // Source tracking
  leadSource: string;
  leadSourceDetail?: string;
  pageUrl?: string;
  pageType?: string;
  pageTitle?: string;
  referrer?: string;
  language: string;
  
  // Emma-specific
  questionsAnswered?: number;
  qaPairs?: Array<{ question: string; answer: string }>;
  intakeComplete?: boolean;
  exitPoint?: string;
  conversationDuration?: string;
  
  // Form-specific
  propertyRef?: string;
  propertyPrice?: string;
  cityName?: string;
  message?: string;
  
  // Property criteria
  locationPreference?: string[];
  seaViewImportance?: string;
  budgetRange?: string;
  bedroomsDesired?: string;
  propertyType?: string[];
  propertyPurpose?: string;
  timeframe?: string;
}

// Calculate lead score based on criteria
function calculateLeadScore(payload: LeadPayload): number {
  let score = 0;

  // Budget (0-30 points)
  const budget = payload.budgetRange?.toLowerCase() || "";
  if (budget.includes("2m") || budget.includes("2,000,000") || budget.includes("€2")) score += 30;
  else if (budget.includes("1m") || budget.includes("1,000,000") || budget.includes("€1")) score += 25;
  else if (budget.includes("500k") || budget.includes("500,000")) score += 20;
  else if (budget.includes("300k") || budget.includes("300,000")) score += 15;
  else score += 10;

  // Timeframe (0-25 points)
  const timeframe = payload.timeframe?.toLowerCase() || "";
  if (timeframe.includes("6_month") || timeframe.includes("immediate")) score += 25;
  else if (timeframe.includes("1_year") || timeframe.includes("12_month")) score += 20;
  else if (timeframe.includes("2_year")) score += 15;
  else score += 5;

  // Emma completion (0-20 points)
  if (payload.intakeComplete) score += 20;
  else if ((payload.questionsAnswered || 0) >= 3) score += 15;
  else if ((payload.questionsAnswered || 0) >= 1) score += 10;

  // Location specificity (0-15 points)
  const locCount = payload.locationPreference?.length || 0;
  if (locCount >= 2) score += 15;
  else if (locCount === 1) score += 10;
  else score += 5;

  // Property criteria completeness (0-10 points)
  let criteriaCount = 0;
  if (payload.propertyType?.length) criteriaCount++;
  if (payload.propertyPurpose) criteriaCount++;
  if (payload.bedroomsDesired) criteriaCount++;
  if (payload.seaViewImportance) criteriaCount++;
  score += criteriaCount * 2.5;

  return Math.min(Math.round(score), 100);
}

// Calculate lead segment based on score
function calculateSegment(score: number): string {
  if (score >= 80) return "Hot";
  if (score >= 60) return "Warm";
  if (score >= 40) return "Cool";
  return "Cold";
}

// Calculate priority
function calculatePriority(score: number, timeframe?: string): string {
  const tf = timeframe?.toLowerCase() || "";
  if (score >= 80 || tf.includes("6_month") || tf.includes("immediate")) return "urgent";
  if (score >= 60 || tf.includes("1_year")) return "high";
  if (score >= 40) return "medium";
  return "low";
}

// Get language flag emoji
function getLanguageFlag(language: string): string {
  const flags: Record<string, string> = {
    fr: "🇫🇷", fi: "🇫🇮", pl: "🇵🇱", en: "🇬🇧", nl: "🇳🇱",
    de: "🇩🇪", es: "🇪🇸", sv: "🇸🇪", da: "🇩🇰", hu: "🇭🇺",
  };
  return flags[language?.toLowerCase()] || "🌍";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: LeadPayload = await req.json();
    console.log("[register-crm-lead] Received lead:", payload.firstName, payload.lastName);

    // Validate required fields
    if (!payload.firstName?.trim() || !payload.lastName?.trim() || !payload.phone?.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: firstName, lastName, phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const language = payload.language?.toLowerCase() || "en";
    const score = calculateLeadScore(payload);
    const segment = calculateSegment(score);
    const priority = calculatePriority(score, payload.timeframe);
    const claimWindowMinutes = 15;

    // 1. Create lead in database
    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .insert({
        first_name: payload.firstName.trim(),
        last_name: payload.lastName.trim(),
        phone_number: payload.phone.trim(),
        country_prefix: payload.countryPrefix || "",
        email: payload.email?.trim() || null,
        language,
        lead_source: payload.leadSource || "Website",
        lead_source_detail: payload.leadSourceDetail || null,
        page_url: payload.pageUrl || null,
        page_type: payload.pageType || null,
        referrer: payload.referrer || null,
        questions_answered: payload.questionsAnswered || 0,
        qa_pairs: payload.qaPairs || null,
        intake_complete: payload.intakeComplete || false,
        exit_point: payload.exitPoint || null,
        conversation_duration: payload.conversationDuration || null,
        property_ref: payload.propertyRef || null,
        message: payload.message || null,
        location_preference: payload.locationPreference || [],
        sea_view_importance: payload.seaViewImportance || null,
        budget_range: payload.budgetRange || null,
        bedrooms_desired: payload.bedroomsDesired || null,
        property_type: payload.propertyType || [],
        property_purpose: payload.propertyPurpose || null,
        timeframe: payload.timeframe || null,
        lead_segment: segment,
        initial_lead_score: score,
        current_lead_score: score,
        lead_priority: priority,
        lead_status: "new",
        lead_claimed: false,
        claim_window_expires_at: new Date(Date.now() + claimWindowMinutes * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (leadError) {
      console.error("[register-crm-lead] Error creating lead:", leadError);
      throw new Error(`Failed to create lead: ${leadError.message}`);
    }

    console.log("[register-crm-lead] Lead created:", lead.id);

    // 2. Find eligible agents (language match + active + accepting leads + under capacity)
    const { data: eligibleAgents, error: agentsError } = await supabase
      .from("crm_agents")
      .select("*")
      .contains("languages", [language])
      .eq("is_active", true)
      .eq("accepts_new_leads", true);

    if (agentsError) {
      console.error("[register-crm-lead] Error fetching agents:", agentsError);
    }

    // Filter agents who are under capacity
    const availableAgents = (eligibleAgents || []).filter(
      (agent: { current_lead_count: number; max_active_leads: number }) => 
        agent.current_lead_count < agent.max_active_leads
    );

    console.log(`[register-crm-lead] Found ${availableAgents.length} eligible agents for ${language}`);

    // 3. Create notifications for all eligible agents
    if (availableAgents.length > 0) {
      const notifications = availableAgents.map((agent: { id: string; first_name: string }) => ({
        agent_id: agent.id,
        lead_id: lead.id,
        notification_type: "new_lead_available",
        title: `${getLanguageFlag(language)} New ${language.toUpperCase()} Lead Available`,
        message: `${lead.first_name} ${lead.last_name} - ${segment} - ${payload.budgetRange || "Budget TBD"}`,
        action_url: `/crm/agent/leads/${lead.id}/claim`,
        read: false,
      }));

      const { error: notifError } = await supabase
        .from("crm_notifications")
        .insert(notifications);

      if (notifError) {
        console.error("[register-crm-lead] Error creating notifications:", notifError);
      } else {
        console.log(`[register-crm-lead] Created ${notifications.length} notifications`);
      }

      // 4. Send email notifications
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-lead-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            lead,
            agents: availableAgents,
            claimWindowMinutes,
          }),
        });
        console.log("[register-crm-lead] Email notifications triggered");
      } catch (emailError) {
        console.error("[register-crm-lead] Error triggering email notifications:", emailError);
      }
    } else {
      // No agents available - will need admin assignment
      console.log("[register-crm-lead] No eligible agents, lead will require admin assignment");
    }

    return new Response(
      JSON.stringify({
        success: true,
        leadId: lead.id,
        segment,
        score,
        broadcastTo: availableAgents.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[register-crm-lead] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
