import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import {
  Users, Clock, CheckCircle2, PauseCircle, AlertTriangle,
  ArrowRight, Plus, BarChart3, Activity, User, Mail, Phone, Calendar,
  CheckCircle, Circle, ChevronDown, ChevronRight, MessageSquare, Send,
  LayoutGrid, Table as TableIcon, MessageSquareWarning, Upload, Loader2, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import AgentWelcome from "./AgentWelcome";
import SureLCSetup from "./SureLCSetup";
import ViewSignedAgreement from "./ViewSignedAgreement";

const BRAND = "#1A4D3E";
const ACCENT = "#EBD975";

const PIPELINE_STAGES = [
  { key: "intake_submitted", label: "Intake Submitted", color: "#3B82F6" },
  { key: "agreement_pending", label: "Agreement Pending", color: "#8B5CF6" },
  { key: "surelc_setup", label: "SureLC Setup", color: "#F59E0B" },
  { key: "bundle_selected", label: "Bundle Selected", color: "#EC4899" },
  { key: "carrier_selection", label: "Carrier Selection", color: "#10B981" },
  { key: "contracting_submitted", label: "Contracting Submitted", color: "#6366F1" },
  { key: "contracting_approved", label: "Contracting Approved", color: "#14B8A6" },
  { key: "completed", label: "Completed", color: BRAND },
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
  requires_upload?: boolean;
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
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Map<string, string>>(new Map()); // stepId -> fileName
  const [showViewAgreement, setShowViewAgreement] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ id: string; sender_id: string; content: string; created_at: string; sender_name?: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [senderNames, setSenderNames] = useState<Map<string, string>>(new Map());
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [stepsRes, agentStepsRes, logsRes] = await Promise.all([
          supabase.from("contracting_steps").select("id, title, description, stage, step_order, is_required, requires_upload").order("step_order"),
          supabase.from("contracting_agent_steps").select("id, step_id, status, completed_at").eq("agent_id", agentId),
          supabase.from("contracting_activity_logs").select("id, action, description, created_at, agent_id").eq("agent_id", agentId).order("created_at", { ascending: false }).limit(10),
        ]);
        if (stepsRes.data) setSteps(stepsRes.data);
        if (agentStepsRes.data) setAgentSteps(agentStepsRes.data);
        if (logsRes.data) setActivities(logsRes.data);

        // Fetch uploaded documents for this agent
        const { data: docs } = await supabase
          .from("contracting_documents")
          .select("step_id, file_name")
          .eq("agent_id", agentId);
        if (docs) {
          const docMap = new Map<string, string>();
          docs.forEach(d => { if (d.step_id) docMap.set(d.step_id, d.file_name); });
          setUploadedDocs(docMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agentId]);

  // Fetch chat messages
  useEffect(() => {
    async function fetchChat() {
      const { data } = await supabase
        .from("contracting_messages")
        .select("id, sender_id, content, created_at")
        .eq("thread_id", agentId)
        .order("created_at");
      if (data) {
        const ids = new Set(data.map(m => m.sender_id));
        const { data: agents } = await supabase
          .from("contracting_agents")
          .select("id, first_name, last_name")
          .in("id", Array.from(ids));
        const nameMap = new Map<string, string>();
        if (agents) agents.forEach(a => nameMap.set(a.id, `${a.first_name} ${a.last_name}`));
        setSenderNames(nameMap);
        setChatMessages(data.map(m => ({ ...m, sender_name: nameMap.get(m.sender_id) || "Unknown" })));
      }
    }
    fetchChat();
  }, [agentId]);

  // Realtime chat subscription
  useEffect(() => {
    const channel = supabase
      .channel("agent-dashboard-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contracting_messages" }, (payload) => {
        const msg = payload.new as any;
        if (msg.thread_id === agentId) {
          setChatMessages(prev => [...prev, {
            id: msg.id, sender_id: msg.sender_id, content: msg.content,
            created_at: msg.created_at, sender_name: senderNames.get(msg.sender_id) || "Unknown",
          }]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [agentId, senderNames]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleSendMessage() {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await supabase.from("contracting_messages").insert({
        thread_id: agentId,
        sender_id: agentId,
        content: newMessage.trim(),
      });
      // Log message sent
      supabase.from("contracting_activity_logs").insert({
        agent_id: agentId,
        performed_by: agentId,
        action: "message_sent",
        activity_type: "message_sent",
        description: "Sent a message",
      }).then(null, err => console.error("Activity log error:", err));
      setNewMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function handleStepUpload(stepId: string, file: File) {
    setUploading(true);
    try {
      const filePath = `${agentId}/surelc/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("contracting-documents")
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      await supabase.from("contracting_documents").insert({
        agent_id: agentId,
        step_id: stepId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        uploaded_by: agentId,
      });

      await supabase.from("contracting_agent_steps").upsert({
        agent_id: agentId,
        step_id: stepId,
        status: "completed",
        completed_at: new Date().toISOString(),
        completed_by: agentId,
      }, { onConflict: "agent_id,step_id" });

      await supabase.from("contracting_activity_logs").insert({
        agent_id: agentId,
        action: "document_uploaded",
        activity_type: "document_uploaded",
        description: "SureLC profile completed",
        performed_by: agentId,
      });

      setAgentSteps(prev => [...prev.filter(s => s.step_id !== stepId), { id: crypto.randomUUID(), step_id: stepId, status: "completed", completed_at: new Date().toISOString() }]);
      setUploadedDocs(prev => new Map(prev).set(stepId, file.name));
      toast.success("SureLC screenshot uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  }

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
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            style={{ color: BRAND, borderColor: BRAND }}
            onClick={() => setShowViewAgreement(true)}
          >
            <FileText className="h-4 w-4" />
            View Agreement
          </Button>
        </div>
      </div>
      <ViewSignedAgreement agentId={agentId} open={showViewAgreement} onOpenChange={setShowViewAgreement} />

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
            const docName = uploadedDocs.get(step.id);
            return (
              <div key={step.id} className="flex items-start gap-3 py-2">
                {done ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${done ? "text-gray-400 line-through" : "text-gray-700"}`}>{step.title}</p>
                  {step.description && <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>}
                  {docName && (
                    <div className="flex items-center gap-1 mt-1">
                      <FileText className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs text-green-700">{docName}</span>
                    </div>
                  )}
                </div>
                {step.requires_upload && !done && (
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleStepUpload(step.id, file);
                      }}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: BRAND }}>
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                      </div>
                    )}
                  </label>
                )}
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

      {/* Chat Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] flex flex-col" style={{ height: 400 }}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" style={{ color: BRAND }} />
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No messages yet. Say hello to your manager!</p>
              </div>
            </div>
          ) : (
            chatMessages.map(msg => {
              const isOwn = msg.sender_id === agentId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isOwn ? "text-white" : "bg-gray-100 text-gray-800"}`} style={isOwn ? { background: BRAND } : undefined}>
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-0.5" style={{ color: BRAND }}>{msg.sender_name}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-gray-400"}`}>
                      {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} style={{ background: BRAND }} className="text-white">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin / Manager View ────────────────────────────────────────────

// ─── Enhanced Types ──────────────────────────────────────────────────

interface EnhancedAgent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  pipeline_stage: string;
  status: string;
  progress_pct: number | null;
  manager_id: string | null;
  updated_at: string;
  created_at: string;
  portal_is_active?: boolean;
}

interface ManagerDashboardProps {
  canManage: boolean;
  canApprove: boolean;
  portalUserId: string | null;
  isManagerOnly: boolean;
}

function ManagerDashboard({ canManage, canApprove, portalUserId, isManagerOnly }: ManagerDashboardProps) {
  const [agents, setAgents] = useState<EnhancedAgent[]>([]);
  const [managerNames, setManagerNames] = useState<Map<string, string>>(new Map());
  const [bundleMap, setBundleMap] = useState<Map<string, string[]>>(new Map()); // agentId -> bundle names
  const [carrierCounts, setCarrierCounts] = useState<Map<string, number>>(new Map()); // agentId -> count
  const [lastActivityMap, setLastActivityMap] = useState<Map<string, string>>(new Map()); // agentId -> date
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [agentStepsMap, setAgentStepsMap] = useState<Map<string, AgentStepRow[]>>(new Map()); // agentId -> steps
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"board" | "table">("table");
  const [completingStep, setCompletingStep] = useState<string | null>(null);
  const [needsInfoAgent, setNeedsInfoAgent] = useState<EnhancedAgent | null>(null);
  const [needsInfoMessage, setNeedsInfoMessage] = useState("");
  const [sendingNeedsInfo, setSendingNeedsInfo] = useState(false);
  const [approvingAgent, setApprovingAgent] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [portalUserId, isManagerOnly]);

  async function fetchAll() {
    try {
      // 1. Agents
      let agentsQuery = supabase.from("contracting_agents").select("id, first_name, last_name, email, pipeline_stage, status, progress_pct, manager_id, updated_at, created_at");
      if (isManagerOnly && portalUserId) {
        agentsQuery = agentsQuery.eq("manager_id", portalUserId);
      }
      const { data: agentsData } = await agentsQuery;
      const agentsList = (agentsData || []) as EnhancedAgent[];

      // Fetch portal_users active status for these agents
      const authUserIds = agentsList.map(a => a.id); // we need auth_user_ids but we don't have them here
      // Instead, fetch portal active status via auth_user_id from contracting_agents
      const { data: agentsWithAuth } = await supabase
        .from("contracting_agents")
        .select("id, auth_user_id")
        .in("id", agentsList.map(a => a.id));
      
      const authIdMap = new Map<string, string>();
      (agentsWithAuth || []).forEach((a: any) => authIdMap.set(a.id, a.auth_user_id));
      
      const authIds = [...new Set(Array.from(authIdMap.values()).filter(Boolean))];
      let portalActiveMap = new Map<string, boolean>();
      if (authIds.length > 0) {
        const { data: portalUsers } = await supabase
          .from("portal_users")
          .select("auth_user_id, is_active")
          .in("auth_user_id", authIds);
        if (portalUsers) {
          portalUsers.forEach((pu: any) => portalActiveMap.set(pu.auth_user_id, pu.is_active));
        }
      }
      
      // Attach portal_is_active to agents
      agentsList.forEach(a => {
        const authId = authIdMap.get(a.id);
        // If no portal_users record found (undefined in map), treat as inactive (needs approval)
        a.portal_is_active = authId ? portalActiveMap.get(authId) ?? false : false;
      });

      setAgents(agentsList);

      const agentIds = agentsList.map(a => a.id);
      const managerIds = [...new Set(agentsList.map(a => a.manager_id).filter(Boolean))] as string[];

      // 2. Parallel queries
      const [managersRes, selectionsRes, bundlesRes, stepsRes, agentStepsRes, activityRes] = await Promise.all([
        managerIds.length > 0
          ? supabase.from("portal_users").select("id, first_name, last_name").in("id", managerIds)
          : Promise.resolve({ data: [] }),
        agentIds.length > 0
          ? supabase.from("contracting_carrier_selections").select("agent_id, bundle_id, carrier_id").in("agent_id", agentIds)
          : Promise.resolve({ data: [] }),
        supabase.from("contracting_bundles").select("id, name"),
        supabase.from("contracting_steps").select("id, title, description, stage, step_order, is_required").order("step_order"),
        agentIds.length > 0
          ? supabase.from("contracting_agent_steps").select("id, agent_id, step_id, status, completed_at").in("agent_id", agentIds)
          : Promise.resolve({ data: [] }),
        agentIds.length > 0
          ? supabase.from("contracting_activity_logs").select("agent_id, created_at").in("agent_id", agentIds).order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);

      // Manager names
      const mNames = new Map<string, string>();
      (managersRes.data || []).forEach((m: any) => mNames.set(m.id, `${m.first_name} ${m.last_name}`));
      setManagerNames(mNames);

      // Bundle name lookup
      const bundleLookup = new Map<string, string>();
      (bundlesRes.data || []).forEach((b: any) => bundleLookup.set(b.id, b.name));

      // Carrier selections → bundle names & carrier counts per agent
      const bMap = new Map<string, Set<string>>();
      const cMap = new Map<string, number>();
      (selectionsRes.data || []).forEach((s: any) => {
        if (!bMap.has(s.agent_id)) bMap.set(s.agent_id, new Set());
        if (s.bundle_id && bundleLookup.has(s.bundle_id)) {
          bMap.get(s.agent_id)!.add(bundleLookup.get(s.bundle_id)!);
        }
        cMap.set(s.agent_id, (cMap.get(s.agent_id) || 0) + 1);
      });
      const bMapFinal = new Map<string, string[]>();
      bMap.forEach((v, k) => bMapFinal.set(k, [...v]));
      setBundleMap(bMapFinal);
      setCarrierCounts(cMap);

      // Steps
      if (stepsRes.data) setSteps(stepsRes.data);

      // Agent steps grouped by agent
      const asMap = new Map<string, AgentStepRow[]>();
      (agentStepsRes.data || []).forEach((as: any) => {
        if (!asMap.has(as.agent_id)) asMap.set(as.agent_id, []);
        asMap.get(as.agent_id)!.push(as);
      });
      setAgentStepsMap(asMap);

      // Last activity per agent (first occurrence since sorted desc)
      const laMap = new Map<string, string>();
      (activityRes.data || []).forEach((log: any) => {
        if (!laMap.has(log.agent_id)) laMap.set(log.agent_id, log.created_at);
      });
      setLastActivityMap(laMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── Checkbox automation ──
  async function handleStepComplete(agentId: string) {
    if (completingStep) return;
    setCompletingStep(agentId);
    try {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;
      // Find the current stage's first incomplete required step
      const stageSteps = steps.filter(s => s.stage === agent.pipeline_stage && s.is_required);
      const agentStepsList = agentStepsMap.get(agentId) || [];
      const completedIds = new Set(agentStepsList.filter(s => s.status === "completed").map(s => s.step_id));
      const nextStep = stageSteps.find(s => !completedIds.has(s.id));
      if (!nextStep) return;

      // Check if agent_step row exists
      const existing = agentStepsList.find(as => as.step_id === nextStep.id);
      if (existing) {
        await supabase.from("contracting_agent_steps").update({
          status: "completed",
          completed_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("contracting_agent_steps").insert({
          agent_id: agentId,
          step_id: nextStep.id,
          status: "completed",
          completed_at: new Date().toISOString(),
        });
      }

      // Log activity
      await supabase.from("contracting_activity_logs").insert({
        agent_id: agentId,
        action: "step_completed",
        performed_by: agentId,
        description: `Step "${nextStep.title}" marked complete by manager`,
      });

      // Fire-and-forget notification
      supabase.functions.invoke("notify-contracting-step", {
        body: { agentId, stageName: agent.pipeline_stage, stepTitle: nextStep.title },
      }).catch(err => console.error("Notification error:", err));

      toast.success(`Step "${nextStep.title}" completed`);

      // Refetch
      await fetchAll();
    } catch (err) {
      console.error("Step completion error:", err);
      toast.error("Failed to complete step");
    } finally {
      setCompletingStep(null);
    }
  }

  // ── Needs Info handler ──
  async function handleSendNeedsInfo() {
    if (!needsInfoAgent || !needsInfoMessage.trim() || sendingNeedsInfo) return;
    setSendingNeedsInfo(true);
    try {
      await supabase.functions.invoke("notify-contracting-step", {
        body: {
          agentId: needsInfoAgent.id,
          stageName: "needs_info",
          message: needsInfoMessage.trim(),
        },
      });
      // Log needs info sent
      const { data: { user } } = await supabase.auth.getUser();
      const { data: performer } = await supabase.from("contracting_agents").select("id").eq("auth_user_id", user!.id).maybeSingle();
      supabase.from("contracting_activity_logs").insert({
        agent_id: needsInfoAgent.id,
        performed_by: performer?.id || needsInfoAgent.id,
        action: "needs_info_sent",
        activity_type: "needs_info_sent",
        description: "Information request sent",
        metadata: { message: needsInfoMessage.trim() },
      }).then(null, err => console.error("Activity log error:", err));
      toast.success(`Information request sent to ${needsInfoAgent.first_name}`);
      setNeedsInfoAgent(null);
      setNeedsInfoMessage("");
    } catch (err) {
      console.error("Needs info error:", err);
      toast.error("Failed to send request");
    } finally {
      setSendingNeedsInfo(false);
    }
  }

  // ── Approve agent handler ──
  async function handleApproveAgent(agentId: string) {
    setApprovingAgent(agentId);
    try {
      const { data, error } = await supabase.functions.invoke("approve-agent", {
        body: { agent_id: agentId },
      });
      if (error) throw error;
      toast.success("Agent approved! They can now log in.");
      await fetchAll();
    } catch (err: any) {
      console.error("Approve error:", err);
      toast.error("Failed to approve agent: " + (err.message || "Unknown error"));
    } finally {
      setApprovingAgent(null);
    }
  }

  // ── Computed stats ──
  const now = new Date();
  const stuckAgents = agents.filter(a => a.status === "in_progress" && differenceInDays(now, new Date(a.updated_at)) > 7);
  const statCards = [
    { label: "Total Agents", value: agents.length, icon: Users, color: BRAND },
    { label: "Active Onboarding", value: agents.filter(a => a.status === "in_progress").length, icon: Clock, color: "#3B82F6" },
    { label: "Completed", value: agents.filter(a => a.status === "completed").length, icon: CheckCircle2, color: "#10B981" },
    { label: "Stuck Agents", value: stuckAgents.length, icon: AlertTriangle, color: "#EF4444" },
  ];

  // ── Helper: get next incomplete step for agent ──
  function getNextStep(agent: EnhancedAgent) {
    const stageSteps = steps.filter(s => s.stage === agent.pipeline_stage && s.is_required);
    const completedIds = new Set((agentStepsMap.get(agent.id) || []).filter(s => s.status === "completed").map(s => s.step_id));
    return stageSteps.find(s => !completedIds.has(s.id)) || null;
  }

  function isStageFullyComplete(agent: EnhancedAgent) {
    const stageSteps = steps.filter(s => s.stage === agent.pipeline_stage && s.is_required);
    const completedIds = new Set((agentStepsMap.get(agent.id) || []).filter(s => s.status === "completed").map(s => s.step_id));
    return stageSteps.length > 0 && stageSteps.every(s => completedIds.has(s.id));
  }

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
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("board")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "board" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "table" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/portal/advisor/contracting/analytics">
              <BarChart3 className="h-4 w-4 mr-2" /> Analytics
            </Link>
          </Button>
          {canManage && (
            <Button asChild style={{ background: BRAND }} className="text-white hover:opacity-90">
              <Link to="/portal/advisor/contracting/pipeline">
                <Plus className="h-4 w-4 mr-2" /> Add Agent
              </Link>
            </Button>
          )}
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

      {/* Pipeline Board View */}
      {view === "board" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: PIPELINE_STAGES.length * 240 }}>
            {PIPELINE_STAGES.map(stage => {
              const stageAgents = agents.filter(a => a.pipeline_stage === stage.key);
              return (
                <div key={stage.key} className="w-60 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="h-3 w-3 rounded-full" style={{ background: stage.color }} />
                    <span className="text-sm font-semibold text-gray-700">{stage.label}</span>
                    <span className="ml-auto text-xs font-bold rounded-full px-2 py-0.5 text-white" style={{ background: stage.color }}>
                      {stageAgents.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stageAgents.map(agent => {
                      const days = differenceInDays(now, new Date(agent.updated_at));
                      return (
                        <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: BRAND }}>
                              {agent.first_name?.[0]}{agent.last_name?.[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{agent.first_name} {agent.last_name}</p>
                              <p className="text-xs text-gray-400">{days}d in stage</p>
                            </div>
                          </div>
                          <Progress value={agent.progress_pct || 0} className="h-1.5" />
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">{agent.progress_pct || 0}%</span>
                            {days > 7 && agent.status === "in_progress" && (
                              <span className="text-xs text-red-500 font-medium">Stuck</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {stageAgents.length === 0 && (
                      <div className="text-center py-6 text-gray-300 text-xs">No agents</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spreadsheet Table View */}
      {view === "table" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Agent</TableHead>
                <TableHead className="font-semibold text-gray-700">Manager</TableHead>
                <TableHead className="font-semibold text-gray-700">Stage</TableHead>
                <TableHead className="font-semibold text-gray-700">Progress</TableHead>
                <TableHead className="font-semibold text-gray-700">Bundle</TableHead>
                <TableHead className="font-semibold text-gray-700">Carriers</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Last Activity</TableHead>
                <TableHead className="font-semibold text-gray-700">Days Stuck</TableHead>
                {(canManage || canApprove) && <TableHead className="font-semibold text-gray-700">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={(canManage || canApprove) ? 10 : 9} className="text-center py-12 text-gray-400">
                    No agents found
                  </TableCell>
                </TableRow>
              ) : (
                agents.map(agent => {
                  const stageObj = PIPELINE_STAGES.find(s => s.key === agent.pipeline_stage) || PIPELINE_STAGES[0];
                  const days = differenceInDays(now, new Date(agent.updated_at));
                  const isStuck = agent.status === "in_progress" && days > 7;
                  const lastAct = lastActivityMap.get(agent.id);
                  const bundles = bundleMap.get(agent.id) || [];
                  const carriers = carrierCounts.get(agent.id) || 0;
                  const nextStep = getNextStep(agent);
                  const stageComplete = isStageFullyComplete(agent);

                  return (
                    <TableRow key={agent.id} className={isStuck ? "bg-red-50/40" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0" style={{ background: BRAND }}>
                            {agent.first_name?.[0]}{agent.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{agent.first_name} {agent.last_name}</p>
                            <p className="text-xs text-gray-400">{agent.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {agent.manager_id ? managerNames.get(agent.manager_id) || "—" : "—"}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ background: stageObj.color }}>
                          {stageObj.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={agent.progress_pct || 0} className="h-2 flex-1" />
                          <span className="text-xs text-gray-500 whitespace-nowrap">{agent.progress_pct || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {bundles.length > 0 ? bundles.join(", ") : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 text-center">{carriers || "—"}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          agent.status === "completed" ? "bg-green-100 text-green-700" :
                          agent.status === "on_hold" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {agent.status === "in_progress" ? "In Progress" : agent.status === "completed" ? "Completed" : agent.status === "on_hold" ? "On Hold" : agent.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {lastAct ? format(new Date(lastAct), "MMM d, h:mm a") : "—"}
                      </TableCell>
                      <TableCell>
                        {agent.status === "in_progress" ? (
                          <span className={`text-sm font-bold ${isStuck ? "text-red-600" : "text-gray-500"}`}>
                            {days}d
                          </span>
                        ) : "—"}
                      </TableCell>
                      {(canManage || canApprove) && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {agent.portal_is_active === false ? (
                              <Button
                                size="sm"
                                onClick={() => handleApproveAgent(agent.id)}
                                disabled={approvingAgent === agent.id}
                                style={{ background: BRAND }}
                                className="text-white text-xs h-7"
                              >
                                {approvingAgent === agent.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                              </Button>
                            ) : canManage && nextStep && !stageComplete ? (
                              <>
                                <Checkbox
                                  disabled={completingStep === agent.id}
                                  onCheckedChange={() => handleStepComplete(agent.id)}
                                />
                                <span className="text-xs text-gray-500 max-w-[100px] truncate" title={nextStep.title}>
                                  {nextStep.title}
                                </span>
                              </>
                            ) : canManage && stageComplete ? (
                              <span className="text-xs text-green-600 font-medium">✓ Stage done</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                                <CheckCircle className="h-3.5 w-3.5" /> Approved
                              </span>
                            )}
                            {canManage && (
                              <button
                                onClick={() => { setNeedsInfoAgent(agent); setNeedsInfoMessage(""); }}
                                className="ml-auto p-1 rounded hover:bg-amber-50 text-amber-600 hover:text-amber-700 transition-colors"
                                title="Request info from agent"
                              >
                                <MessageSquareWarning className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Needs Info Dialog */}
      <Dialog open={!!needsInfoAgent} onOpenChange={(open) => { if (!open) setNeedsInfoAgent(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Information</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Send an email to <strong>{needsInfoAgent?.first_name} {needsInfoAgent?.last_name}</strong> requesting additional information.
          </p>
          <Textarea
            value={needsInfoMessage}
            onChange={(e) => setNeedsInfoMessage(e.target.value)}
            placeholder="Describe what information is needed..."
            rows={4}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSendNeedsInfo}
              disabled={!needsInfoMessage.trim() || sendingNeedsInfo}
              style={{ background: BRAND }}
              className="text-white"
            >
              {sendingNeedsInfo ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

  // Agent role → welcome page for new agents, or personal dashboard
  if (contractingRole === "agent" && contractingAgent) {
    const stage = contractingAgent.pipeline_stage;
    if (stage === "intake_submitted" || stage === "agreement_pending") {
      return <AgentWelcome firstName={contractingAgent.first_name} agentId={contractingAgent.id} fullName={`${contractingAgent.first_name} ${contractingAgent.last_name}`} />;
    }
    if (stage === "surelc_setup") {
      return <SureLCSetup agentId={contractingAgent.id} firstName={contractingAgent.first_name} />;
    }
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
  const canApprove = canManage || contractingRole === "manager";
  return <ManagerDashboard canManage={canManage} canApprove={canApprove} portalUserId={portalUser?.id || null} isManagerOnly={isManagerOnly} />;
}
