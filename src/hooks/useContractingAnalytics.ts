import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, subDays, format } from "date-fns";

const PIPELINE_STAGES = [
  "intake_submitted", "agreement_pending", "surelc_setup",
  "bundle_selected", "carrier_selection", "contracting_submitted",
  "contracting_approved", "completed",
];

const STAGE_LABELS: Record<string, string> = {
  intake_submitted: "Intake",
  agreement_pending: "Agreement",
  surelc_setup: "SureLC",
  bundle_selected: "Bundle",
  carrier_selection: "Carriers",
  contracting_submitted: "Submitted",
  contracting_approved: "Approved",
  completed: "Completed",
};

export function useContractingAnalytics() {
  return useQuery({
    queryKey: ["contracting-analytics"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const [agentsRes, stepsRes, agentStepsRes, logsRes, remindersRes] = await Promise.all([
        supabase.from("contracting_agents").select("id, pipeline_stage, status, created_at, completed_at"),
        supabase.from("contracting_steps").select("id, title, stage, step_order, is_required"),
        supabase.from("contracting_agent_steps").select("id, agent_id, step_id, status, completed_at"),
        supabase.from("contracting_activity_logs").select("id, created_at").gte("created_at", thirtyDaysAgo),
        supabase.from("contracting_reminders").select("id, phase, is_active").eq("is_active", true),
      ]);

      const agents = agentsRes.data || [];
      const steps = stepsRes.data || [];
      const agentSteps = agentStepsRes.data || [];
      const logs = logsRes.data || [];
      const reminders = remindersRes.data || [];

      // KPI: Average onboarding time
      const completedAgents = agents.filter(a => a.completed_at && a.pipeline_stage === "completed");
      const avgOnboardingDays = completedAgents.length > 0
        ? Math.round(completedAgents.reduce((sum, a) => sum + differenceInDays(new Date(a.completed_at!), new Date(a.created_at)), 0) / completedAgents.length)
        : 0;

      // KPI: Completion rate
      const completionRate = agents.length > 0
        ? Math.round((completedAgents.length / agents.length) * 100)
        : 0;

      // Drop-off funnel
      const funnelData = PIPELINE_STAGES.map(stage => ({
        stage: STAGE_LABELS[stage] || stage,
        count: agents.filter(a => a.pipeline_stage === stage).length,
      }));

      // Average time per stage (estimate from completed agents' step completion dates)
      const stageTimeData = PIPELINE_STAGES.slice(0, -1).map(stage => {
        const stageSteps = steps.filter(s => s.stage === stage);
        const stepIds = new Set(stageSteps.map(s => s.id));
        
        const completions = agentSteps.filter(
          as => stepIds.has(as.step_id) && as.status === "completed" && as.completed_at
        );
        
        // Group by agent, find max completion time per stage
        const agentTimes = new Map<string, number>();
        for (const c of completions) {
          const agent = agents.find(a => a.id === c.agent_id);
          if (!agent) continue;
          const days = differenceInDays(new Date(c.completed_at!), new Date(agent.created_at));
          const existing = agentTimes.get(c.agent_id);
          if (!existing || days > existing) agentTimes.set(c.agent_id, days);
        }

        const times = Array.from(agentTimes.values());
        const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
        return { stage: STAGE_LABELS[stage] || stage, avgDays: avg };
      });

      // Reminder distribution
      const reminderPhases = reminders.reduce((acc, r) => {
        acc[r.phase] = (acc[r.phase] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const reminderData = Object.entries(reminderPhases).map(([phase, count]) => ({
        name: phase.replace(/_/g, " "),
        value: count,
      }));

      // Activity frequency (last 30 days)
      const activityByDay = logs.reduce((acc, log) => {
        const day = format(new Date(log.created_at), "MMM d");
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const activityData: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, "MMM d");
        activityData.push({ date: key, count: activityByDay[key] || 0 });
      }

      // Top drop-off steps
      const incompleteSteps = agentSteps.filter(as => as.status !== "completed");
      const stepCounts = incompleteSteps.reduce((acc, as) => {
        acc[as.step_id] = (acc[as.step_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dropOffSteps = Object.entries(stepCounts)
        .map(([stepId, count]) => {
          const step = steps.find(s => s.id === stepId);
          return { stepId, title: step?.title || "Unknown", stage: STAGE_LABELS[step?.stage || ""] || step?.stage || "", count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return {
        avgOnboardingDays,
        completionRate,
        activeReminders: reminders.length,
        totalActivityLogs: logs.length,
        funnelData,
        stageTimeData,
        reminderData,
        activityData,
        dropOffSteps,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
