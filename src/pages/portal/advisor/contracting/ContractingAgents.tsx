import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Users, Loader2, CheckCircle, ExternalLink, ShieldCheck, ShieldX,
  Clock, UserCheck, AlertTriangle, Filter,
} from "lucide-react";
import { differenceInDays, formatDistanceToNow } from "date-fns";
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

const STAGE_COLORS: Record<string, string> = {
  intake_submitted: "bg-slate-100 text-slate-700 border-slate-200",
  agreement_pending: "bg-amber-50 text-amber-700 border-amber-200",
  surelc_setup: "bg-sky-50 text-sky-700 border-sky-200",
  bundle_selected: "bg-violet-50 text-violet-700 border-violet-200",
  carrier_selection: "bg-indigo-50 text-indigo-700 border-indigo-200",
  contracting_submitted: "bg-blue-50 text-blue-700 border-blue-200",
  contracting_approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-green-50 text-green-800 border-green-200",
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
  phone: string | null;
  state: string | null;
  is_licensed: boolean | null;
  referral_source: string | null;
  pipeline_stage: string;
  status: string;
  progress_pct: number | null;
  created_at: string;
  updated_at: string;
  manager_name: string;
  last_activity: string | null;
  portal_is_active: boolean;
}

export default function ContractingAgents() {
  const { contractingRole, canManage, loading: authLoading } = useContractingAuth();
  const canApprove = canManage || contractingRole === "manager";
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [licensedFilter, setLicensedFilter] = useState("all");
  const [approvingAgent, setApprovingAgent] = useState<string | null>(null);

  async function fetchAgents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contracting_agents")
      .select("id, first_name, last_name, email, phone, state, is_licensed, referral_source, pipeline_stage, status, created_at, updated_at, progress_pct, manager_id, auth_user_id");

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

    // Fetch last activity per agent
    const agentIds = (data || []).map(a => a.id);
    let activityMap: Record<string, string> = {};
    if (agentIds.length > 0) {
      const { data: logs } = await supabase
        .from("contracting_activity_logs")
        .select("agent_id, created_at")
        .in("agent_id", agentIds)
        .order("created_at", { ascending: false });
      if (logs) {
        for (const log of logs) {
          if (!activityMap[log.agent_id]) {
            activityMap[log.agent_id] = log.created_at;
          }
        }
      }
    }

    setAgents(
      (data || []).map(a => ({
        id: a.id,
        first_name: a.first_name,
        last_name: a.last_name,
        email: a.email,
        phone: a.phone,
        state: a.state,
        is_licensed: a.is_licensed,
        referral_source: a.referral_source,
        pipeline_stage: a.pipeline_stage,
        status: a.status,
        progress_pct: a.progress_pct,
        created_at: a.created_at,
        updated_at: a.updated_at,
        manager_name: a.manager_id ? managerMap[a.manager_id] || "—" : "—",
        last_activity: activityMap[a.id] || null,
        portal_is_active: a.auth_user_id ? portalActiveMap[a.auth_user_id] ?? false : false,
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    if (!authLoading) fetchAgents();
  }, [authLoading]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("contracting-agents-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contracting_agents" },
        () => {
          fetchAgents();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleApproveAgent(agentId: string) {
    setApprovingAgent(agentId);
    try {
      const { error } = await supabase.functions.invoke("approve-agent", {
        body: { agent_id: agentId },
      });
      if (error) throw error;
      toast.success("Agent approved!");
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
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone && a.phone.includes(search));
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesStage = stageFilter === "all" || a.pipeline_stage === stageFilter;
      const matchesLicensed = licensedFilter === "all" ||
        (licensedFilter === "licensed" && a.is_licensed === true) ||
        (licensedFilter === "unlicensed" && a.is_licensed !== true);
      return matchesSearch && matchesStatus && matchesStage && matchesLicensed;
    });
  }, [agents, search, statusFilter, stageFilter, licensedFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = agents.length;
    const licensed = agents.filter(a => a.is_licensed === true).length;
    const unlicensed = total - licensed;
    const completed = agents.filter(a => a.pipeline_stage === "completed").length;
    const stuck = agents.filter(a => {
      const lastDate = a.last_activity || a.updated_at;
      return differenceInDays(new Date(), new Date(lastDate)) >= 7 && a.pipeline_stage !== "completed";
    }).length;
    return { total, licensed, unlicensed, completed, stuck };
  }, [agents]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = (f: string, l: string) =>
    `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Agents</h1>
        <span className="text-sm text-muted-foreground">({agents.length})</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={<Users className="h-4 w-4" />} label="Total" value={stats.total} color="text-foreground" />
        <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Licensed" value={stats.licensed} color="text-emerald-600" />
        <StatCard icon={<ShieldX className="h-4 w-4" />} label="Unlicensed" value={stats.unlicensed} color="text-amber-600" />
        <StatCard icon={<UserCheck className="h-4 w-4" />} label="Completed" value={stats.completed} color="text-blue-600" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Stuck (7d+)" value={stats.stuck} color="text-red-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
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
            <SelectTrigger className="w-[170px] h-9 text-sm">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {PIPELINE_STAGES.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={licensedFilter} onValueChange={setLicensedFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Licensed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="licensed">Licensed</SelectItem>
              <SelectItem value="unlicensed">Unlicensed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Agent</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Contact</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">State</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Manager</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Licensed</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Referral</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Stage</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Progress</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Days</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Last Activity</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground py-16">
                    No agents found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((agent, idx) => {
                  const lastDate = agent.last_activity || agent.updated_at;
                  const daysInactive = differenceInDays(new Date(), new Date(lastDate));
                  const isStuck = daysInactive >= 7 && agent.pipeline_stage !== "completed";

                  return (
                    <TableRow
                      key={agent.id}
                      className={`text-sm ${isStuck ? "bg-red-50/50 dark:bg-red-950/10" : idx % 2 === 1 ? "bg-muted/20" : ""}`}
                    >
                      {/* Agent */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {initials(agent.first_name, agent.last_name)}
                          </div>
                          <Link
                            to={`/portal/advisor/contracting/agent/${agent.id}`}
                            className="font-medium text-foreground hover:underline whitespace-nowrap"
                          >
                            {agent.first_name} {agent.last_name}
                          </Link>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="py-2.5">
                        <div className="text-xs text-muted-foreground truncate max-w-[160px]">{agent.email}</div>
                        {agent.phone && <div className="text-xs text-muted-foreground">{agent.phone}</div>}
                      </TableCell>

                      {/* State */}
                      <TableCell className="py-2.5 text-xs text-muted-foreground">
                        {agent.state || "—"}
                      </TableCell>

                      {/* Manager */}
                      <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {agent.manager_name}
                      </TableCell>

                      {/* Licensed */}
                      <TableCell className="py-2.5">
                        {agent.is_licensed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                            <ShieldX className="h-3.5 w-3.5" /> No
                          </span>
                        )}
                      </TableCell>

                      {/* Referral */}
                      <TableCell className="py-2.5 text-xs text-muted-foreground">
                        {agent.referral_source || "—"}
                      </TableCell>

                      {/* Stage */}
                      <TableCell className="py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize border ${STAGE_COLORS[agent.pipeline_stage] || "bg-muted text-muted-foreground"}`}>
                          {agent.pipeline_stage.replace(/_/g, " ")}
                        </span>
                      </TableCell>

                      {/* Progress */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={agent.progress_pct ?? 0} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                            {agent.progress_pct ?? 0}%
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-2.5">
                        <Badge variant={statusBadgeVariant(agent.status)} className="capitalize text-[11px]">
                          {agent.status.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      {/* Days */}
                      <TableCell className="py-2.5 text-right">
                        <span className={`text-xs font-medium ${isStuck ? "text-red-600" : "text-muted-foreground"}`}>
                          {differenceInDays(new Date(), new Date(agent.created_at))}d
                        </span>
                      </TableCell>

                      {/* Last Activity */}
                      <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {agent.last_activity
                          ? formatDistanceToNow(new Date(agent.last_activity), { addSuffix: true })
                          : "—"}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Link to={`/portal/advisor/contracting/agent/${agent.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          {canApprove && !agent.portal_is_active && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveAgent(agent.id)}
                              disabled={approvingAgent === agent.id}
                              className="text-[11px] h-7 px-2"
                            >
                              {approvingAgent === agent.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                            </Button>
                          )}
                          {canApprove && agent.portal_is_active && (
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
                              <CheckCircle className="h-3 w-3" /> OK
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card className="shadow-none border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`${color}`}>{icon}</div>
        <div>
          <div className={`text-xl font-bold ${color}`}>{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
