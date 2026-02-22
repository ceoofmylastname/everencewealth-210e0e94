import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Loader2, CheckCircle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

const PIPELINE_STAGES = [
  "intake_submitted",
  "agreement_pending",
  "surelc_setup",
  "bundle_selected",
  "carrier_selection",
  "contracting_submitted",
  "contracting_approved",
  "completed",
];

const STATUS_OPTIONS = ["in_progress", "completed", "on_hold", "rejected"];

const stageBadgeColor = (stage: string) => {
  if (stage === "completed") return "bg-green-100 text-green-800";
  if (stage === "contracting_approved") return "bg-emerald-100 text-emerald-700";
  if (stage === "contracting_submitted") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed": return "default" as const;
    case "on_hold": return "secondary" as const;
    case "rejected": return "destructive" as const;
    default: return "outline" as const;
  }
};

interface AgentRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  pipeline_stage: string;
  status: string;
  created_at: string;
  progress_pct?: number;
  manager_name?: string;
  portal_is_active?: boolean;
}

export default function ContractingAgents() {
  const { contractingRole, canManage, loading: authLoading } = useContractingAuth();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [approvingAgent, setApprovingAgent] = useState<string | null>(null);

  useEffect(() => {
  async function fetchAgents() {
      setLoading(true);
      const { data, error } = await supabase
        .from("contracting_agents")
        .select("id, first_name, last_name, email, pipeline_stage, status, created_at, progress_pct, manager_id, auth_user_id");

      if (error) {
        console.error("Error fetching agents:", error);
        setLoading(false);
        return;
      }

      // Fetch manager names
      const managerIds = [...new Set((data || []).map(a => a.manager_id).filter(Boolean))];
      let managerMap: Record<string, string> = {};
      if (managerIds.length > 0) {
        const { data: managers } = await supabase
          .from("portal_users")
          .select("id, first_name, last_name")
          .in("id", managerIds);
        if (managers) {
          managerMap = Object.fromEntries(
            managers.map(m => [m.id, `${m.first_name} ${m.last_name}`])
          );
        }
      }

      // Fetch portal active status
      const authUserIds = [...new Set((data || []).map(a => a.auth_user_id).filter(Boolean))];
      let portalActiveMap: Record<string, boolean> = {};
      if (authUserIds.length > 0) {
        const { data: portalUsers } = await supabase
          .from("portal_users")
          .select("auth_user_id, is_active")
          .in("auth_user_id", authUserIds);
        if (portalUsers) {
          portalActiveMap = Object.fromEntries(
            portalUsers.map(pu => [pu.auth_user_id, pu.is_active])
          );
        }
      }

      setAgents(
        (data || []).map(a => ({
          ...a,
          manager_name: a.manager_id ? managerMap[a.manager_id] || "—" : "—",
          portal_is_active: a.auth_user_id ? portalActiveMap[a.auth_user_id] ?? true : true,
        }))
      );
      setLoading(false);
    }
    if (!authLoading) fetchAgents();
  }, [authLoading]);

  async function handleApproveAgent(agentId: string) {
    setApprovingAgent(agentId);
    try {
      const { error } = await supabase.functions.invoke("approve-agent", {
        body: { agent_id: agentId },
      });
      if (error) throw error;
      toast.success("Agent approved!");
      // Refresh
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, portal_is_active: true } : a));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to approve: " + (err.message || "Unknown error"));
    } finally {
      setApprovingAgent(null);
    }
  }

  const filtered = useMemo(() => {
    return agents.filter(a => {
      const matchesSearch = !search ||
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesStage = stageFilter === "all" || a.pipeline_stage === stageFilter;
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [agents, search, statusFilter, stageFilter]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-[#1A4D3E]" />
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
        <span className="text-sm text-muted-foreground">({agents.length})</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {PIPELINE_STAGES.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Days</TableHead>
              <TableHead className="text-right">Progress</TableHead>
              {canManage && <TableHead>Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 9 : 8} className="text-center text-muted-foreground py-10">
                  No agents found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(agent => (
                <TableRow key={agent.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell>
                    <Link
                      to={`/portal/advisor/contracting/agent/${agent.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {agent.first_name} {agent.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${stageBadgeColor(agent.pipeline_stage)}`}>
                      {agent.pipeline_stage.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(agent.status)} className="capitalize">
                      {agent.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {agent.portal_is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{agent.manager_name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {differenceInDays(new Date(), new Date(agent.created_at))}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {agent.progress_pct ?? 0}%
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      {agent.portal_is_active === false ? (
                        <Button
                          size="sm"
                          onClick={() => handleApproveAgent(agent.id)}
                          disabled={approvingAgent === agent.id}
                          className="text-xs h-7 bg-[#1A4D3E] text-white hover:bg-[#1A4D3E]/90"
                        >
                          {approvingAgent === agent.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
