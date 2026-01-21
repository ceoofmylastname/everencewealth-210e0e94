import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface TeamActivity {
  id: string;
  lead_id: string;
  agent_id: string;
  activity_type: string;
  outcome: string | null;
  call_duration: number | null;
  notes: string | null;
  created_at: string;
  callback_datetime: string | null;
  callback_completed: boolean;
  agent: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    language: string;
  } | null;
}

export interface TeamActivityFilters {
  agentId?: string;
  activityType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

export function useTeamActivity(filters: TeamActivityFilters = {}) {
  const queryClient = useQueryClient();
  const limit = filters.limit || 50;

  const query = useQuery({
    queryKey: ["team-activity", filters],
    queryFn: async () => {
      let query = supabase
        .from("crm_activities")
        .select(`
          *,
          agent:crm_agents!crm_activities_agent_id_fkey(
            id, first_name, last_name, email
          ),
          lead:crm_leads!crm_activities_lead_id_fkey(
            id, first_name, last_name, language
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filters.agentId) {
        query = query.eq("agent_id", filters.agentId);
      }

      if (filters.activityType && filters.activityType !== "all") {
        query = query.eq("activity_type", filters.activityType);
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as TeamActivity[];
    },
  });

  // Real-time subscription for new activities
  useEffect(() => {
    const channel = supabase
      .channel("team-activity-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "crm_activities" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["team-activity"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// Get today's activity count
export function useTodayActivityCount() {
  return useQuery({
    queryKey: ["today-activity-count"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("crm_activities")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      if (error) throw error;
      return count || 0;
    },
  });
}

// Get activity type icon
export function getActivityTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    call: "📞",
    email: "📧",
    whatsapp: "💬",
    note: "📝",
    meeting: "🤝",
    viewing: "🏠",
    callback: "🔔",
    status_change: "🔄",
    assignment: "👤",
  };
  return icons[type] || "📌";
}

// Get activity type label
export function getActivityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    call: "Call",
    email: "Email",
    whatsapp: "WhatsApp",
    note: "Note",
    meeting: "Meeting",
    viewing: "Viewing",
    callback: "Callback",
    status_change: "Status Change",
    assignment: "Assignment",
  };
  return labels[type] || type;
}

// Format call outcome
export function formatCallOutcome(outcome: string | null): { label: string; color: string } {
  if (!outcome) return { label: "", color: "" };

  const outcomes: Record<string, { label: string; color: string }> = {
    connected: { label: "Connected", color: "text-green-600" },
    answered: { label: "Answered", color: "text-green-600" },
    voicemail: { label: "Voicemail", color: "text-amber-600" },
    no_answer: { label: "No Answer", color: "text-red-600" },
    busy: { label: "Busy", color: "text-orange-600" },
    wrong_number: { label: "Wrong Number", color: "text-red-700" },
    callback_scheduled: { label: "Callback Scheduled", color: "text-blue-600" },
    not_interested: { label: "Not Interested", color: "text-gray-600" },
  };

  return outcomes[outcome] || { label: outcome, color: "text-muted-foreground" };
}
