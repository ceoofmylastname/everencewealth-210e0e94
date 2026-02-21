import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import {
  Users, Clock, CheckCircle2, PauseCircle, AlertTriangle,
  ArrowRight, Plus, BarChart3, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const BRAND = "#1A4D3E";
const ACCENT = "#EBD975";

const PIPELINE_STAGES = [
  { key: "application", label: "Application", color: "#3B82F6" },
  { key: "background_check", label: "Background Check", color: "#8B5CF6" },
  { key: "licensing", label: "Licensing", color: "#F59E0B" },
  { key: "carrier_appointments", label: "Carrier Appts", color: "#10B981" },
  { key: "training", label: "Training", color: "#6366F1" },
  { key: "active", label: "Active", color: BRAND },
];

interface Stats {
  total: number;
  inProgress: number;
  completed: number;
  onHold: number;
  stageCounts: Record<string, number>;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  created_at: string;
  agent_id: string;
}

export default function ContractingDashboard() {
  const { canManage, loading: authLoading } = useContractingAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, inProgress: 0, completed: 0, onHold: 0, stageCounts: {} });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: agents } = await supabase.from("contracting_agents").select("id, status, pipeline_stage");
      if (agents) {
        const stageCounts: Record<string, number> = {};
        PIPELINE_STAGES.forEach(s => stageCounts[s.key] = 0);
        agents.forEach(a => {
          if (stageCounts[a.pipeline_stage] !== undefined) stageCounts[a.pipeline_stage]++;
        });
        setStats({
          total: agents.length,
          inProgress: agents.filter(a => a.status === "in_progress").length,
          completed: agents.filter(a => a.status === "completed").length,
          onHold: agents.filter(a => a.status === "on_hold").length,
          stageCounts,
        });
      }

      const { data: logs } = await supabase
        .from("contracting_activity_logs")
        .select("id, action, description, created_at, agent_id")
        .order("created_at", { ascending: false })
        .limit(10);
      if (logs) setActivities(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Total Agents", value: stats.total, icon: Users, color: BRAND },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "#3B82F6" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "#10B981" },
    { label: "On Hold", value: stats.onHold, icon: PauseCircle, color: "#F59E0B" },
  ];

  const maxStageCount = Math.max(...Object.values(stats.stageCounts), 1);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracting Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track onboarding progress across all agents</p>
        </div>
        <div className="flex gap-3">
          {canManage && (
            <Button asChild style={{ background: BRAND }} className="text-white hover:opacity-90">
              <Link to="/portal/advisor/contracting/pipeline">
                <Plus className="h-4 w-4 mr-2" /> Add Agent
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/portal/advisor/contracting/pipeline">
              <BarChart3 className="h-4 w-4 mr-2" /> View Pipeline
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5 transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Breakdown</h2>
        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage) => {
            const count = stats.stageCounts[stage.key] || 0;
            const pct = maxStageCount > 0 ? (count / maxStageCount) * 100 : 0;
            return (
              <div key={stage.key} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-32 shrink-0">{stage.label}</span>
                <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{ width: `${Math.max(pct, 8)}%`, background: stage.color }}
                  >
                    <span className="text-xs font-bold text-white">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${BRAND}15` }}>
                  <Activity className="h-4 w-4" style={{ color: BRAND }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">{log.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
