import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import {
  Users, Download, Plus, Package, Trash2, Edit2, Save, X, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

const BRAND = "#1A4D3E";

const STAGES = ["intake_submitted", "agreement_pending", "surelc_setup", "bundle_selected", "carrier_selection", "contracting_submitted", "contracting_approved", "completed"];
const STATUSES = ["in_progress", "completed", "on_hold", "rejected"];

interface AgentRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  pipeline_stage: string;
  status: string;
  contracting_role: string;
  manager_id: string | null;
  created_at: string;
  started_at: string;
  carrier_count?: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  carrier_ids: string[];
  product_types: string[];
  is_active: boolean;
}

export default function ContractingAdmin() {
  const { canManage, loading: authLoading } = useContractingAuth();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [allAgents, setAllAgents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [newBundle, setNewBundle] = useState({ name: "", description: "", product_types: "" });
  const [showNewBundle, setShowNewBundle] = useState(false);

  useEffect(() => {
    if (!authLoading && canManage) fetchData();
    else if (!authLoading && !canManage) setLoading(false);
  }, [authLoading, canManage]);

  async function fetchData() {
    try {
      const [agentsRes, bundlesRes, selectionsRes] = await Promise.all([
        supabase.from("contracting_agents").select("*").order("created_at", { ascending: false }),
        supabase.from("contracting_bundles").select("*").order("name"),
        supabase.from("contracting_carrier_selections").select("agent_id"),
      ]);

      // Count carrier selections per agent
      const selCounts = new Map<string, number>();
      if (selectionsRes.data) {
        for (const s of selectionsRes.data) {
          selCounts.set(s.agent_id, (selCounts.get(s.agent_id) || 0) + 1);
        }
      }

      if (agentsRes.data) {
        const rows = agentsRes.data.map((a: any) => ({
          ...a,
          carrier_count: selCounts.get(a.id) || 0,
        }));
        setAgents(rows);
        setAllAgents(rows.map((a: any) => ({ id: a.id, name: `${a.first_name} ${a.last_name}` })));
      }
      if (bundlesRes.data) setBundles(bundlesRes.data as Bundle[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateAgent(id: string, field: string, value: string) {
    try {
      const { error } = await supabase.from("contracting_agents").update({ [field]: value }).eq("id", id);
      if (error) throw error;
      setAgents(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
      toast.success("Updated");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  }

  async function createBundle() {
    try {
      const { error } = await supabase.from("contracting_bundles").insert({
        name: newBundle.name,
        description: newBundle.description || null,
        product_types: newBundle.product_types.split(",").map(s => s.trim()).filter(Boolean),
      });
      if (error) throw error;
      toast.success("Bundle created");
      setShowNewBundle(false);
      setNewBundle({ name: "", description: "", product_types: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create bundle");
    }
  }

  async function deleteBundle(id: string) {
    try {
      await supabase.from("contracting_bundles").delete().eq("id", id);
      setBundles(prev => prev.filter(b => b.id !== id));
      toast.success("Bundle deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  }

  function exportCSV() {
    const headers = ["Name", "Email", "Stage", "Status", "Role", "Carriers", "Days Active", "Started"];
    const rows = agents.map(a => [
      `${a.first_name} ${a.last_name}`,
      a.email,
      a.pipeline_stage,
      a.status,
      a.contracting_role,
      a.carrier_count || 0,
      differenceInDays(new Date(), new Date(a.started_at || a.created_at)),
      format(new Date(a.started_at || a.created_at), "yyyy-MM-dd"),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contracting-agents-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Access restricted to admin and contracting roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">{agents.length} agents in pipeline</p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents" className="gap-1.5"><Users className="h-4 w-4" /> Agents</TabsTrigger>
          <TabsTrigger value="bundles" className="gap-1.5"><Package className="h-4 w-4" /> Bundles</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Carriers</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Manager</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map(agent => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <Link to={`/portal/advisor/contracting/agent/${agent.id}`} className="text-sm font-medium hover:underline" style={{ color: BRAND }}>
                          {agent.first_name} {agent.last_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{agent.email}</TableCell>
                      <TableCell>
                        <Select value={agent.pipeline_stage} onValueChange={v => updateAgent(agent.id, "pipeline_stage", v)}>
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={agent.status} onValueChange={v => updateAgent(agent.id, "status", v)}>
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 text-center">{agent.carrier_count}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {differenceInDays(new Date(), new Date(agent.started_at || agent.created_at))}d
                      </TableCell>
                      <TableCell>
                        <Select
                          value={agent.manager_id || "none"}
                          onValueChange={v => updateAgent(agent.id, "manager_id", v === "none" ? "" : v)}
                        >
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {allAgents.filter(a => a.id !== agent.id).map(a => (
                              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bundles">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowNewBundle(true)} style={{ background: BRAND }} className="text-white hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" /> New Bundle
              </Button>
            </div>

            {showNewBundle && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Create Bundle</h3>
                <Input placeholder="Bundle name" value={newBundle.name} onChange={e => setNewBundle(p => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Description (optional)" value={newBundle.description} onChange={e => setNewBundle(p => ({ ...p, description: e.target.value }))} />
                <Input placeholder="Product types (comma-separated)" value={newBundle.product_types} onChange={e => setNewBundle(p => ({ ...p, product_types: e.target.value }))} />
                <div className="flex gap-2">
                  <Button onClick={createBundle} disabled={!newBundle.name.trim()} style={{ background: BRAND }} className="text-white">
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button variant="ghost" onClick={() => setShowNewBundle(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {bundles.map(bundle => (
                <div key={bundle.id} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{bundle.name}</h3>
                    {bundle.description && <p className="text-xs text-gray-500 mt-1">{bundle.description}</p>}
                    {bundle.product_types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bundle.product_types.map(pt => (
                          <span key={pt} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${BRAND}15`, color: BRAND }}>
                            {pt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteBundle(bundle.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {bundles.length === 0 && !showNewBundle && (
                <div className="text-center py-8 text-gray-400 text-sm">No bundles yet</div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
