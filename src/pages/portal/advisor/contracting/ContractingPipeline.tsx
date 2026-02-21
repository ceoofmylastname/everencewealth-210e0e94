import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import {
  Users, LayoutGrid, Table as TableIcon, ChevronRight, Clock,
  Filter, Plus, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { differenceInDays, format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const BRAND = "#1A4D3E";

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

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  pipeline_stage: string;
  status: string;
  started_at: string;
  updated_at: string;
  contracting_role: string;
}

interface AgentStep {
  agent_id: string;
  status: string;
}

export default function ContractingPipeline() {
  const { canManage, canViewAll, portalUser, contractingRole } = useContractingAuth();
  const isManagerOnly = contractingRole === "manager";
  const [agents, setAgents] = useState<Agent[]>([]);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [view, setView] = useState<"board" | "table">("board");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [portalUser?.id, isManagerOnly]);

  async function fetchData() {
    try {
      let agentsQuery = supabase.from("contracting_agents").select("*").order("created_at", { ascending: false });
      if (isManagerOnly && portalUser?.id) {
        agentsQuery = agentsQuery.eq("manager_id", portalUser.id);
      }
      const [agentsRes, stepsRes, totalRes] = await Promise.all([
        agentsQuery,
        supabase.from("contracting_agent_steps").select("agent_id, status"),
        supabase.from("contracting_steps").select("id"),
      ]);
      if (agentsRes.data) setAgents(agentsRes.data as Agent[]);
      if (stepsRes.data) setSteps(stepsRes.data as AgentStep[]);
      if (totalRes.data) setTotalSteps(totalRes.data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getProgress(agentId: string) {
    if (totalSteps === 0) return 0;
    const completed = steps.filter(s => s.agent_id === agentId && s.status === "completed").length;
    return Math.round((completed / totalSteps) * 100);
  }

  const filtered = agents.filter(a =>
    `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddAgent() {
    if (!newAgent.first_name || !newAgent.last_name || !newAgent.email) {
      toast.error("First name, last name, and email are required");
      return;
    }
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the agent (auth_user_id will be the current user for now — admin creates on behalf)
      const { data, error } = await supabase.from("contracting_agents").insert({
        auth_user_id: user.id,
        first_name: newAgent.first_name,
        last_name: newAgent.last_name,
        email: newAgent.email,
        phone: newAgent.phone || null,
        contracting_role: "agent",
        pipeline_stage: "application",
        status: "in_progress",
      }).select().single();

      if (error) throw error;

      // Create agent_steps for all contracting_steps
      const { data: allSteps } = await supabase.from("contracting_steps").select("id");
      if (allSteps && data) {
        const agentSteps = allSteps.map(s => ({
          agent_id: data.id,
          step_id: s.id,
          status: "pending",
        }));
        await supabase.from("contracting_agent_steps").insert(agentSteps);
      }

      // Log agent added
      if (data) {
        supabase.from("contracting_activity_logs").insert({
          agent_id: data.id,
          performed_by: data.id,
          action: "agent_added",
          activity_type: "agent_added",
          description: `New agent added: ${newAgent.first_name} ${newAgent.last_name}`,
          metadata: { email: newAgent.email },
        }).then(null, err => console.error("Activity log error:", err));
      }
      toast.success("Agent added successfully");
      setAddOpen(false);
      setNewAgent({ first_name: "", last_name: "", email: "", phone: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add agent");
    } finally {
      setAdding(false);
    }
  }

  async function moveStage(agentId: string, newStage: string) {
    try {
      await supabase.from("contracting_agents").update({ pipeline_stage: newStage }).eq("id", agentId);
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, pipeline_stage: newStage } : a));
      // Log stage change
      supabase.from("contracting_activity_logs").insert({
        agent_id: agentId,
        performed_by: agentId,
        action: "stage_changed",
        activity_type: "stage_changed",
        description: `Stage changed to ${newStage.replace(/_/g, " ")}`,
        metadata: { new_stage: newStage },
      }).then(null, err => console.error("Activity log error:", err));
      toast.success("Stage updated");
    } catch {
      toast.error("Failed to update stage");
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">{agents.length} agents in pipeline</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("board")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "board" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>
          {canManage && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button style={{ background: BRAND }} className="text-white hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" /> Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Agent</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input value={newAgent.first_name} onChange={e => setNewAgent(p => ({ ...p, first_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input value={newAgent.last_name} onChange={e => setNewAgent(p => ({ ...p, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={newAgent.email} onChange={e => setNewAgent(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={newAgent.phone} onChange={e => setNewAgent(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <Button onClick={handleAddAgent} disabled={adding} className="w-full" style={{ background: BRAND }}>
                    {adding ? "Adding..." : "Add Agent"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Board View */}
      {view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageAgents = filtered.filter(a => a.pipeline_stage === stage.key);
            return (
              <div key={stage.key} className="min-w-[260px] w-[260px] shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="h-3 w-3 rounded-full" style={{ background: stage.color }} />
                  <span className="text-sm font-semibold text-gray-700">{stage.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 ml-auto">{stageAgents.length}</span>
                </div>
                <div className="space-y-3">
                  {stageAgents.map((agent) => {
                    const progress = getProgress(agent.id);
                    const daysInStage = differenceInDays(new Date(), new Date(agent.updated_at));
                    return (
                      <Link
                        key={agent.id}
                        to={`/portal/advisor/contracting/agent/${agent.id}`}
                        className="block bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-4 transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: BRAND }}>
                            {agent.first_name[0]}{agent.last_name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{agent.first_name} {agent.last_name}</p>
                            <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>{progress}% complete</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{daysInStage}d</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: stage.color }} />
                        </div>
                        {canManage && (
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {PIPELINE_STAGES.filter(s => s.key !== stage.key).slice(0, 2).map(s => (
                              <button
                                key={s.key}
                                onClick={(e) => { e.preventDefault(); moveStage(agent.id, s.key); }}
                                className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                              >
                                → {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                  {stageAgents.length === 0 && (
                    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                      <p className="text-xs text-gray-400">No agents</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Days Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((agent) => {
                const progress = getProgress(agent.id);
                const daysActive = differenceInDays(new Date(), new Date(agent.started_at));
                const stage = PIPELINE_STAGES.find(s => s.key === agent.pipeline_stage);
                return (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.first_name} {agent.last_name}</TableCell>
                    <TableCell className="text-gray-500">{agent.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${stage?.color}15`, color: stage?.color }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: stage?.color }} />
                        {stage?.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        agent.status === "completed" ? "bg-green-50 text-green-700" :
                        agent.status === "on_hold" ? "bg-yellow-50 text-yellow-700" :
                        agent.status === "rejected" ? "bg-red-50 text-red-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        {agent.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: stage?.color }} />
                        </div>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{daysActive}d</TableCell>
                    <TableCell>
                      <Link to={`/portal/advisor/contracting/agent/${agent.id}`}>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No agents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
