import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Eye, KeyRound, RefreshCw, Trash2 } from "lucide-react";
import { SetAgentPasswordDialog } from "@/components/portal/admin/SetAgentPasswordDialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface AgentRow {
  id: string;
  portal_user_id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  clientCount: number;
  policyCount: number;
  role: string;
}

interface PendingAgent {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

export default function AdminAgents() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([]);
  const [contractingAccess, setContractingAccess] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [passwordAgent, setPasswordAgent] = useState<PendingAgent | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<AgentRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingAccess, setTogglingAccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
    fetchPendingAgents();
  }, []);

  async function fetchAgents() {
    setLoading(true);
    const { data: advisors } = await supabase
      .from("advisors")
      .select("id, portal_user_id, auth_user_id, first_name, last_name, email, is_active, portal_users:portal_user_id(role)")
      .order("first_name");

    if (!advisors) { setLoading(false); return; }

    const portalUserIds = advisors.map((a) => a.portal_user_id);
    const authUserIds = advisors.map((a) => a.auth_user_id);
    
    const [clientsRes, policiesRes, contractingRes] = await Promise.all([
      (supabase
        .from("portal_users")
        .select("id, advisor_id")
        .eq("role", "client") as any)
        .in("advisor_id", portalUserIds),
      (supabase.from("policies") as any)
        .select("id, advisor_id")
        .eq("status", "active")
        .in("advisor_id", advisors.map((a: any) => a.id)),
      supabase
        .from("contracting_agents")
        .select("auth_user_id, dashboard_access_granted")
        .in("auth_user_id", authUserIds),
    ]);

    const clientCounts: Record<string, number> = {};
    (clientsRes.data ?? []).forEach((c: any) => {
      clientCounts[c.advisor_id] = (clientCounts[c.advisor_id] || 0) + 1;
    });

    const policyCounts: Record<string, number> = {};
    (policiesRes.data ?? []).forEach((p: any) => {
      policyCounts[p.advisor_id] = (policyCounts[p.advisor_id] || 0) + 1;
    });

    const accessMap: Record<string, boolean> = {};
    (contractingRes.data ?? []).forEach((c: any) => {
      accessMap[c.auth_user_id] = c.dashboard_access_granted ?? false;
    });
    setContractingAccess(accessMap);

    setAgents(
      advisors.map((a: any) => ({
        id: a.id,
        portal_user_id: a.portal_user_id,
        auth_user_id: a.auth_user_id,
        first_name: a.first_name,
        last_name: a.last_name,
        email: a.email,
        is_active: a.is_active,
        clientCount: clientCounts[a.portal_user_id] || 0,
        policyCount: policyCounts[a.id] || 0,
        role: a.portal_users?.role || "advisor",
      }))
    );
    setLoading(false);
  }

  async function fetchPendingAgents() {
    setPendingLoading(true);
    try {
      const res = await supabase.functions.invoke("get-pending-agents");
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);
      setPendingAgents(res.data?.agents || []);
    } catch (err: any) {
      console.error("Failed to fetch pending agents:", err);
    } finally {
      setPendingLoading(false);
    }
  }

  async function handleResendInvite(agent: PendingAgent) {
    setResendingId(agent.id);
    try {
      const res = await supabase.functions.invoke("create-agent", {
        body: {
          first_name: agent.first_name,
          last_name: agent.last_name,
          email: agent.email,
          send_invitation: true,
        },
      });
      if (res.data?.invitation_sent) {
        toast({ title: "Invitation Sent", description: `Invitation re-sent to ${agent.email}` });
      } else if (res.data?.invitation_error) {
        toast({ title: "Warning", description: res.data.invitation_error, variant: "destructive" });
      } else if (res.data?.error?.includes("already exists")) {
        toast({ title: "Note", description: "Agent already exists. Use 'Set Password' to provide login credentials.", variant: "destructive" });
      } else {
        toast({ title: "Sent", description: "Invitation process completed" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to resend invitation", variant: "destructive" });
    } finally {
      setResendingId(null);
    }
  }

  async function handleDeleteAgent() {
    if (!deleteAgent) return;
    setDeleting(true);
    try {
      const res = await supabase.functions.invoke("delete-portal-agent", {
        body: { advisor_id: deleteAgent.id },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Agent deleted", description: `${deleteAgent.first_name} ${deleteAgent.last_name} has been permanently removed. Their email can be re-invited.` });
      setDeleteAgent(null);
      fetchAgents();
    } catch (err: any) {
      toast({ title: "Error deleting agent", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleDashboardAccess(agent: AgentRow, granted: boolean) {
    setTogglingAccess(agent.auth_user_id);
    try {
      const { error } = await supabase
        .from("contracting_agents")
        .update({ dashboard_access_granted: granted })
        .eq("auth_user_id", agent.auth_user_id);
      if (error) throw error;
      setContractingAccess((prev) => ({ ...prev, [agent.auth_user_id]: granted }));
      toast({ title: granted ? "Full access granted" : "Access reverted", description: `${agent.first_name} ${agent.last_name} ${granted ? "now has full dashboard access" : "follows standard contracting rules"}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTogglingAccess(null);
    }
  }

  const filtered = agents.filter((a) => {
    const matchSearch =
      !search ||
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && a.is_active) ||
      (statusFilter === "inactive" && !a.is_active);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your advisor agents and their access</p>
        </div>
        <Link to="/portal/admin/agents/new">
          <Button className="bg-[#1A4D3E] hover:bg-[#143d30] text-white rounded-lg gap-2">
            <Plus className="h-4 w-4" />Add New Agent
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-[#1A4D3E] data-[state=active]:shadow-sm rounded-md">
            All Agents
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-[#1A4D3E] data-[state=active]:shadow-sm rounded-md gap-2">
            Pending Invitations
            {pendingAgents.length > 0 && (
              <span className="ml-1 h-5 min-w-5 px-1.5 text-xs bg-[#1A4D3E] text-white rounded-full inline-flex items-center justify-center">
                {pendingAgents.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] mt-4">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-4 border-[#1A4D3E] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">Clients</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">Active Policies</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">Dashboard</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                        No agents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((a) => (
                      <TableRow key={a.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="font-medium text-gray-900">{a.first_name} {a.last_name}</TableCell>
                        <TableCell className="text-gray-500">{a.email}</TableCell>
                        <TableCell>
                          {a.role === "admin" ? (
                            <span className="inline-flex items-center bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs px-2.5 py-0.5 font-medium">Admin</span>
                          ) : (
                            <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs px-2.5 py-0.5 font-medium">Advisor</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {a.is_active ? (
                            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs px-2.5 py-0.5 font-medium">Active</span>
                          ) : (
                            <span className="inline-flex items-center bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs px-2.5 py-0.5 font-medium">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-gray-700">{a.clientCount}</TableCell>
                        <TableCell className="text-center text-gray-700">{a.policyCount}</TableCell>
                        <TableCell className="text-center">
                          {a.auth_user_id in contractingAccess ? (
                            <Switch
                              checked={contractingAccess[a.auth_user_id] ?? false}
                              onCheckedChange={(val) => handleToggleDashboardAccess(a, val)}
                              disabled={togglingAccess === a.auth_user_id}
                            />
                          ) : (
                            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs px-2.5 py-0.5 font-medium">Full</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link to={`/portal/admin/agents/${a.id}`}>
                              <Button variant="ghost" size="sm" className="text-[#1A4D3E] hover:bg-[#F0F5F3]">
                                <Eye className="h-4 w-4 mr-1" />View
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteAgent(a)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] mt-4">
            {pendingLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-4 border-[#1A4D3E] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pendingAgents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No pending invitations
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Invited</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAgents.map((a) => (
                    <TableRow key={a.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">{a.first_name} {a.last_name}</TableCell>
                      <TableCell className="text-gray-500">{a.email}</TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(a.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#1A4D3E] text-[#1A4D3E] hover:bg-[#F0F5F3]"
                            onClick={() => setPasswordAgent(a)}
                          >
                            <KeyRound className="h-4 w-4 mr-1" />Set Password
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-900"
                            disabled={resendingId === a.id}
                            onClick={() => handleResendInvite(a)}
                          >
                            <RefreshCw className={`h-4 w-4 mr-1 ${resendingId === a.id ? "animate-spin" : ""}`} />
                            Resend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <SetAgentPasswordDialog
        open={!!passwordAgent}
        onOpenChange={(open) => !open && setPasswordAgent(null)}
        agent={passwordAgent}
      />

      <AlertDialog open={!!deleteAgent} onOpenChange={(open) => !open && setDeleteAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteAgent?.first_name} {deleteAgent?.last_name}</strong> ({deleteAgent?.email}) and remove all their data. Their email address will be freed so they can be re-invited fresh in the future.
              <br /><br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleDeleteAgent}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Yes, Delete Agent"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
