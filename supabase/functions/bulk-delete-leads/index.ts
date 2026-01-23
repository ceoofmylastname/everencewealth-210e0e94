import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role to bypass RLS for cascading deletes
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { leadIds, adminId } = await req.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "leadIds array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[bulk-delete-leads] Deleting ${leadIds.length} leads by admin ${adminId}`);

    // Get leads with their current agents to decrement counts
    const { data: leads } = await supabase
      .from("crm_leads")
      .select("id, assigned_agent_id")
      .in("id", leadIds);

    // Collect agents to decrement
    const agentCounts = new Map<string, number>();
    leads?.forEach((l: any) => {
      if (l.assigned_agent_id) {
        agentCounts.set(
          l.assigned_agent_id,
          (agentCounts.get(l.assigned_agent_id) || 0) + 1
        );
      }
    });

    // Decrement agent lead counts
    for (const [agentId, count] of agentCounts) {
      const { data: agent } = await supabase
        .from("crm_agents")
        .select("current_lead_count")
        .eq("id", agentId)
        .single();

      if (agent) {
        const newCount = Math.max(0, (agent.current_lead_count || 0) - count);
        await supabase
          .from("crm_agents")
          .update({ current_lead_count: newCount })
          .eq("id", agentId);
      }
    }

    // Delete related reminders first
    const { error: reminderError } = await supabase
      .from("crm_reminders")
      .delete()
      .in("lead_id", leadIds);
    
    if (reminderError) {
      console.log("[bulk-delete-leads] Reminder delete error (may not exist):", reminderError.message);
    }

    // Delete related activities
    const { error: activityError } = await supabase
      .from("crm_activities")
      .delete()
      .in("lead_id", leadIds);
    
    if (activityError) {
      console.error("[bulk-delete-leads] Activity delete error:", activityError);
      throw new Error(`Failed to delete activities: ${activityError.message}`);
    }

    // Delete related notes
    const { error: noteError } = await supabase
      .from("crm_lead_notes")
      .delete()
      .in("lead_id", leadIds);
    
    if (noteError) {
      console.error("[bulk-delete-leads] Note delete error:", noteError);
      throw new Error(`Failed to delete notes: ${noteError.message}`);
    }

    // Delete related notifications
    const { error: notificationError } = await supabase
      .from("crm_notifications")
      .delete()
      .in("lead_id", leadIds);
    
    if (notificationError) {
      console.error("[bulk-delete-leads] Notification delete error:", notificationError);
      throw new Error(`Failed to delete notifications: ${notificationError.message}`);
    }

    // Delete the leads
    const { error: leadError } = await supabase
      .from("crm_leads")
      .delete()
      .in("id", leadIds);

    if (leadError) {
      console.error("[bulk-delete-leads] Lead delete error:", leadError);
      throw new Error(`Failed to delete leads: ${leadError.message}`);
    }

    console.log(`[bulk-delete-leads] Successfully deleted ${leadIds.length} leads`);

    return new Response(
      JSON.stringify({ success: true, count: leadIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[bulk-delete-leads] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
