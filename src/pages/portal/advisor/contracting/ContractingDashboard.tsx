import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import {
  Users, Clock, CheckCircle2, PauseCircle, AlertTriangle,
  ArrowRight, Plus, BarChart3, Activity, User, Mail, Phone, Calendar,
  CheckCircle, Circle, ChevronDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

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

// ─── Shared types ────────────────────────────────────────────────────

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

interface StepRow {
  id: string;
  title: string;
  description: string | null;
  stage: string;
  step_order: number;
  is_required: boolean;
}

interface AgentStepRow {
  id: string;
  step_id: string;
  status: string;
  completed_at: string | null;
}

// ─── Agent Personal View ─────────────────────────────────────────────

function AgentDashboard({ agentId, firstName, lastName, email, pipelineStage, status, createdAt }: {
  agentId: string;
  firstName: string;
  lastName: string;
  email: string;
  pipelineStage: string;
  status: string;
  createdAt: string;
}) {
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [agentSteps, setAgentSteps] = useState<AgentStepRow[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const [stepsRes, agentStepsRes, logsRes] = await Promise.all([
          supabase.from("contracting_steps").select("id, title, description, stage, step_order, is_required").order("step_order"),
          supabase.from("contracting_agent_steps").select("id, step_id, status, completed_at").eq("agent_id", agentId),
          supabase.from("contracting_activity_logs").select("id, action, description, created_at, agent_id").eq("agent_id", agentId).order("created_at", { ascending: false }).limit(10),
        ]);
        if (stepsRes.data) setSteps(stepsRes.data);
        if (agentStepsRes.data) setAgentSteps(agentStepsRes.data);
        if (logsRes.data) setActivities(logsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agentId]);

  const completedStepIds = new Set(agentSteps.filter(s => s.status === "completed").map(s => s.step_id));
  const totalSteps = steps.length;
  const completedCount = completedStepIds.size;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const currentStageObj = PIPELINE_STAGES.find(s => s.key === pipelineStage) || PIPELINE_STAGES[0];
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.key === pipelineStage);

  const stageGroups = PIPELINE_STAGES.map(stage => ({
    ...stage,
    steps: steps.filter(s => s.stage === stage.key),
  }));

  const toggleStage = (key: string) => setExpandedStages(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background: BRAND }}>
            {firstName?.[0]}{lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full text-white" style={{ background: currentStageObj.color }}>
                {currentStageObj.label}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                status === "completed" ? "bg-green-100 text-green-700" :
                status === "on_hold" ? "bg-yellow-100 text-yellow-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {status === "in_progress" ? "In Progress" : status === "completed" ? "Completed" : status === "on_hold" ? "On Hold" : status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Onboarding Progress</h2>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1">
            <Progress value={progressPct} className="h-3" />
          </div>
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{completedCount} / {totalSteps} steps</span>
        </div>
        <p className="text-sm text-gray-500">{progressPct}% complete</p>
      </div>

      {/* Current Stage Checklist */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Stage: {currentStageObj.label}</h2>
        <div className="space-y-2">
          {stageGroups.find(g => g.key === pipelineStage)?.steps.map(step => {
            const done = completedStepIds.has(step.id);
            return (
              <div key={step.id} className="flex items-start gap-3 py-2">
                {done ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`text-sm ${done ? "text-gray-400 line-through" : "text-gray-700"}`}>{step.title}</p>
                  {step.description && <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>}
                </div>
              </div>
            );
          })}
          {(stageGroups.find(g => g.key === pipelineStage)?.steps.length ?? 0) === 0 && (
            <p className="text-sm text-gray-400">No steps for this stage yet.</p>
          )}
        </div>
      </div>

      {/* Upcoming Stages */}
      {currentStageIndex < PIPELINE_STAGES.length - 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Stages</h2>
          <div className="space-y-1">
            {stageGroups.slice(currentStageIndex + 1).map(group => (
              <div key={group.key}>
                <button
                  onClick={() => toggleStage(group.key)}
                  className="flex items-center gap-2 w-full py-2 text-left hover:bg-gray-50 rounded-lg px-2 transition-colors"
                >
                  {expandedStages[group.key] ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: group.color }} />
                  <span className="text-sm font-medium text-gray-700">{group.label}</span>
                  <span className="text-xs text-gray-400 ml-auto">{group.steps.length} steps</span>
                </button>
                {expandedStages[group.key] && group.steps.length > 0 && (
                  <div className="ml-9 space-y-1 pb-2">
                    {group.steps.map(step => (
                      <p key={step.id} className="text-xs text-gray-500 py-0.5">{step.title}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Info</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">{email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Started {format(new Date(createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* My Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Activity</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.map(log => (
                <div key={log.id} className="flex items-start gap-3 py-1">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${BRAND}15` }}>
                    <Activity className="h-3.5 w-3.5" style={{ color: BRAND }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700">{log.description}</p>
                    <p className="text-xs text-gray-400">{format(new Date(log.created_at), "MMM d 'at' h:mm a")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin / Manager View ────────────────────────────────────────────

function ManagerDashboard({ canManage, portalUserId, isManagerOnly }: { canManage: boolean; portalUserId: string | null; isManagerOnly: boolean }) {
  const [stats, setStats] = useState<Stats>({ total: 0, inProgress: 0, completed: 0, onHold: 0, stageCounts: {} });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [portalUserId, isManagerOnly]);

  async function fetchData() {
    try {
      let agentsQuery = supabase.from("contracting_agents").select("id, status, pipeline_stage");
      if (isManagerOnly && portalUserId) {
        agentsQuery = agentsQuery.eq("manager_id", portalUserId);
      }
      const { data: agents } = await agentsQuery;
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

      let logsQuery = supabase
        .from("contracting_activity_logs")
        .select("id, action, description, created_at, agent_id")
        .order("created_at", { ascending: false })
        .limit(10);
      if (isManagerOnly && agents) {
        const agentIds = agents.map(a => a.id);
        if (agentIds.length > 0) {
          logsQuery = logsQuery.in("agent_id", agentIds);
        } else {
          logsQuery = logsQuery.eq("agent_id", "none");
        }
      }
      const { data: logs } = await logsQuery;
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

  if (loading) {
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

// ─── Main Router ─────────────────────────────────────────────────────

export default function ContractingDashboard() {
  const { contractingAgent, contractingRole, canManage, portalUser, loading } = useContractingAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  // Agent role → personal dashboard
  if (contractingRole === "agent" && contractingAgent) {
    return (
      <AgentDashboard
        agentId={contractingAgent.id}
        firstName={contractingAgent.first_name}
        lastName={contractingAgent.last_name}
        email={contractingAgent.email}
        pipelineStage={contractingAgent.pipeline_stage}
        status={contractingAgent.status}
        createdAt={contractingAgent.created_at || new Date().toISOString()}
      />
    );
  }

  // Manager / Contracting / Admin → overview dashboard
  const isManagerOnly = contractingRole === "manager";
  return <ManagerDashboard canManage={canManage} portalUserId={portalUser?.id || null} isManagerOnly={isManagerOnly} />;
}
