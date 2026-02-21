import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import {
  ArrowLeft, CheckCircle2, Circle, Clock, Upload, FileText,
  Activity, MessageSquare, AlertTriangle, User, Building2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { toast } from "sonner";

const BRAND = "#1A4D3E";
const ACCENT = "#EBD975";

const STAGE_LABELS: Record<string, string> = {
  intake_submitted: "Intake Submitted",
  agreement_pending: "Agreement Pending",
  surelc_setup: "SureLC Setup",
  bundle_selected: "Bundle Selected",
  carrier_selection: "Carrier Selection",
  contracting_submitted: "Contracting Submitted",
  contracting_approved: "Contracting Approved",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#9CA3AF",
  in_progress: "#3B82F6",
  completed: "#10B981",
  blocked: "#EF4444",
};

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  pipeline_stage: string;
  status: string;
  started_at: string;
  notes: string | null;
  contracting_role: string;
}

interface Step {
  id: string;
  title: string;
  description: string | null;
  stage: string;
  step_order: number;
  is_required: boolean;
  requires_upload: boolean;
}

interface AgentStep {
  id: string;
  agent_id: string;
  step_id: string;
  status: string;
  completed_at: string | null;
  notes: string | null;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

interface Doc {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  step_id: string | null;
}

interface CarrierSelection {
  id: string;
  carrier_id: string;
  carrier_name?: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Carrier {
  id: string;
  carrier_name: string;
}

export default function ContractingAgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { canManage } = useContractingAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [carrierSelections, setCarrierSelections] = useState<CarrierSelection[]>([]);
  const [allCarriers, setAllCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const [agentRes, stepsRes, agentStepsRes, activityRes, docsRes, selectionsRes, carriersRes] = await Promise.all([
        supabase.from("contracting_agents").select("*").eq("id", id!).single(),
        supabase.from("contracting_steps").select("*").order("stage").order("step_order"),
        supabase.from("contracting_agent_steps").select("*").eq("agent_id", id!),
        supabase.from("contracting_activity_logs").select("id, action, description, created_at").eq("agent_id", id!).order("created_at", { ascending: false }).limit(20),
        supabase.from("contracting_documents").select("*").eq("agent_id", id!).order("created_at", { ascending: false }),
        supabase.from("contracting_carrier_selections").select("*").eq("agent_id", id!),
        supabase.from("carriers").select("id, carrier_name").order("carrier_name"),
      ]);
      if (agentRes.data) setAgent(agentRes.data as Agent);
      if (stepsRes.data) setSteps(stepsRes.data as Step[]);
      if (agentStepsRes.data) setAgentSteps(agentStepsRes.data as AgentStep[]);
      if (activityRes.data) setActivities(activityRes.data as ActivityLog[]);
      if (docsRes.data) setDocs(docsRes.data as Doc[]);
      if (carriersRes.data) setAllCarriers(carriersRes.data as Carrier[]);

      // Map carrier names
      const carrierMap = new Map<string, string>();
      if (carriersRes.data) {
        for (const c of carriersRes.data) carrierMap.set(c.id, c.carrier_name);
      }
      if (selectionsRes.data) {
        setCarrierSelections((selectionsRes.data as any[]).map(s => ({
          ...s,
          carrier_name: carrierMap.get(s.carrier_id) || "Unknown",
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStep(stepId: string) {
    if (!canManage) return;
    const existing = agentSteps.find(as => as.step_id === stepId);
    const newStatus = existing?.status === "completed" ? "pending" : "completed";

    try {
      if (existing) {
        await supabase.from("contracting_agent_steps").update({
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        }).eq("id", existing.id);
      } else {
        await supabase.from("contracting_agent_steps").insert({
          agent_id: id!,
          step_id: stepId,
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        });
      }
      setAgentSteps(prev => {
        const idx = prev.findIndex(as => as.step_id === stepId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null };
          return updated;
        }
        return [...prev, { id: crypto.randomUUID(), agent_id: id!, step_id: stepId, status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null, notes: null }];
      });
      toast.success(newStatus === "completed" ? "Step completed" : "Step reopened");
    } catch {
      toast.error("Failed to update step");
    }
  }

  async function handleFileUpload(stepId: string, file: File) {
    try {
      const path = `${id}/${stepId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("contracting-documents").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();
      const { data: contractingAgent } = await supabase.from("contracting_agents").select("id").eq("auth_user_id", user!.id).maybeSingle();

      await supabase.from("contracting_documents").insert({
        agent_id: id!,
        step_id: stepId,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        uploaded_by: contractingAgent?.id || id!,
      });

      toast.success("Document uploaded");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Agent not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/portal/advisor/contracting/pipeline">Back to Pipeline</Link>
        </Button>
      </div>
    );
  }

  const completedCount = agentSteps.filter(s => s.status === "completed").length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  // Group steps by stage
  const stageGroups = Object.entries(STAGE_LABELS).map(([key, label]) => ({
    key,
    label,
    steps: steps.filter(s => s.stage === key),
  })).filter(g => g.steps.length > 0);

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link to="/portal/advisor/contracting/pipeline" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: BRAND }}>
              {agent.first_name[0]}{agent.last_name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{agent.first_name} {agent.last_name}</h1>
              <p className="text-sm text-gray-500">{agent.email}{agent.phone ? ` • ${agent.phone}` : ""}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            agent.status === "completed" ? "bg-green-50 text-green-700" :
            agent.status === "on_hold" ? "bg-yellow-50 text-yellow-700" :
            agent.status === "rejected" ? "bg-red-50 text-red-700" :
            "bg-blue-50 text-blue-700"
          }`}>
            {agent.status.replace("_", " ")}
          </span>
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: `${BRAND}15`, color: BRAND }}>
            {STAGE_LABELS[agent.pipeline_stage] || agent.pipeline_stage}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-2xl font-extrabold" style={{ color: BRAND }}>{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-xs text-gray-400 mt-2">{completedCount} of {steps.length} steps completed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist */}
        <div className="lg:col-span-2 space-y-4">
          {stageGroups.map((group) => (
            <div key={group.key} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{group.label}</h3>
              <div className="space-y-2">
                {group.steps.map((step) => {
                  const agentStep = agentSteps.find(as => as.step_id === step.id);
                  const isCompleted = agentStep?.status === "completed";
                  const stepDocs = docs.filter(d => d.step_id === step.id);

                  return (
                    <div key={step.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${isCompleted ? "bg-green-50/50" : "hover:bg-gray-50"}`}>
                      <button
                        onClick={() => toggleStep(step.id)}
                        disabled={!canManage}
                        className="mt-0.5 shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>
                          {step.title}
                          {step.is_required && <span className="text-red-400 ml-1">*</span>}
                        </p>
                        {step.description && <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>}
                        {stepDocs.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {stepDocs.map(d => (
                              <span key={d.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                <FileText className="h-3 w-3" />{d.file_name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {step.requires_upload && canManage && (
                        <label className="shrink-0 cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(step.id, file);
                            }}
                          />
                          <Upload className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Agent Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" /> Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">Role</dt>
                <dd className="text-gray-700 capitalize">{agent.contracting_role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Started</dt>
                <dd className="text-gray-700">{format(new Date(agent.started_at), "MMM d, yyyy")}</dd>
              </div>
              {agent.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <dt className="text-gray-400 mb-1">Notes</dt>
                  <dd className="text-gray-600 text-xs">{agent.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Carrier Appointments */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Carrier Appointments ({carrierSelections.length})
            </h3>
            {carrierSelections.length === 0 ? (
              <p className="text-xs text-gray-400">No carriers assigned</p>
            ) : (
              <div className="space-y-2">
                {carrierSelections.map(cs => (
                  <div key={cs.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700 font-medium">{cs.carrier_name}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      cs.status === "approved" ? "bg-green-50 text-green-700" :
                      cs.status === "rejected" ? "bg-red-50 text-red-700" :
                      cs.status === "submitted" ? "bg-blue-50 text-blue-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{cs.status}</span>
                  </div>
                ))}
              </div>
            )}
            {canManage && (
              <div className="mt-3">
                <select
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-600"
                  defaultValue=""
                  onChange={async (e) => {
                    const carrierId = e.target.value;
                    if (!carrierId) return;
                    try {
                      await supabase.from("contracting_carrier_selections").insert({ agent_id: id!, carrier_id: carrierId });
                      toast.success("Carrier added");
                      fetchData();
                    } catch { toast.error("Failed"); }
                    e.target.value = "";
                  }}
                >
                  <option value="">+ Add carrier...</option>
                  {allCarriers.filter(c => !carrierSelections.find(cs => cs.carrier_id === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.carrier_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documents ({docs.length})
            </h3>
            {docs.length === 0 ? (
              <p className="text-xs text-gray-400">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {docs.slice(0, 5).map(d => (
                  <div key={d.id} className="flex items-center gap-2 text-xs text-gray-600 py-1.5 border-b border-gray-50 last:border-0">
                    <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{d.file_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Activity
            </h3>
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 8).map(a => (
                  <div key={a.id} className="text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <p className="text-gray-600">{a.description}</p>
                    <p className="text-gray-400 mt-0.5">{format(new Date(a.created_at), "MMM d, h:mm a")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
