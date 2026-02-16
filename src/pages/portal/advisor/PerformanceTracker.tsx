import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Download, DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react";

export default function PerformanceTracker() {
  const { portalUser } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    lead_type: "",
    leads_purchased: 0,
    leads_worked: 0,
    dials_made: 0,
    appointments_set: 0,
    appointments_held: 0,
    clients_closed: 0,
    revenue: 0,
    cost_per_lead: 0,
    discount_percent: 0,
    notes: "",
  });

  useEffect(() => {
    if (!portalUser) return;
    supabase.from("advisors").select("id").eq("portal_user_id", portalUser.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setAdvisorId(data.id); loadEntries(data.id); }
        else setLoading(false);
      });
  }, [portalUser]);

  async function loadEntries(aid: string) {
    const { data } = await supabase.from("advisor_performance")
      .select("*").eq("advisor_id", aid).order("entry_date", { ascending: false }).limit(50);
    setEntries(data ?? []);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const totalRevenue = entries.reduce((s, e) => s + (Number(e.revenue) || 0), 0);
    const totalClientsClosed = entries.reduce((s, e) => s + (Number(e.clients_closed) || 0), 0);
    const totalLeadsWorked = entries.reduce((s, e) => s + (Number(e.leads_worked) || 0), 0);
    const totalApptsSet = entries.reduce((s, e) => s + (Number(e.appointments_set) || 0), 0);
    const totalApptsHeld = entries.reduce((s, e) => s + (Number(e.appointments_held) || 0), 0);
    const totalLeadCost = entries.reduce((s, e) => s + (Number(e.total_lead_cost) || 0), 0);
    const avgCloseRate = totalApptsHeld > 0 ? (totalClientsClosed / totalApptsHeld) * 100 : 0;
    const avgROI = totalLeadCost > 0 ? ((totalRevenue - totalLeadCost) / totalLeadCost) * 100 : 0;
    return { totalRevenue, totalClientsClosed, totalLeadsWorked, totalApptsSet, totalApptsHeld, totalLeadCost, avgCloseRate, avgROI };
  }, [entries]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!advisorId) return;
    const total_lead_cost = Number(newEntry.leads_purchased) * Number(newEntry.cost_per_lead) * (1 - Number(newEntry.discount_percent) / 100);
    const { error } = await supabase.from("advisor_performance").insert({
      advisor_id: advisorId,
      entry_date: newEntry.entry_date,
      lead_type: newEntry.lead_type,
      leads_purchased: Number(newEntry.leads_purchased),
      leads_worked: Number(newEntry.leads_worked),
      dials_made: Number(newEntry.dials_made),
      appointments_set: Number(newEntry.appointments_set),
      appointments_held: Number(newEntry.appointments_held),
      clients_closed: Number(newEntry.clients_closed),
      revenue: Number(newEntry.revenue),
      cost_per_lead: Number(newEntry.cost_per_lead),
      discount_percent: Number(newEntry.discount_percent),
      total_lead_cost,
      notes: newEntry.notes,
    });
    if (error) { toast.error("Failed to save entry"); return; }
    toast.success("Performance entry saved");
    setShowAddDialog(false);
    setNewEntry({ entry_date: new Date().toISOString().split("T")[0], lead_type: "", leads_purchased: 0, leads_worked: 0, dials_made: 0, appointments_set: 0, appointments_held: 0, clients_closed: 0, revenue: 0, cost_per_lead: 0, discount_percent: 0, notes: "" });
    loadEntries(advisorId);
  }

  function exportCSV() {
    const headers = ["Date","Lead Type","Leads Purchased","Leads Worked","Dials Made","Appointments Set","Appointments Held","Clients Closed","Revenue","Lead Cost","ROI"];
    const rows = entries.map(e => {
      const roi = (e.total_lead_cost || 0) > 0 ? (((e.revenue || 0) - e.total_lead_cost) / e.total_lead_cost * 100).toFixed(1) + "%" : "N/A";
      return [e.entry_date, e.lead_type, e.leads_purchased, e.leads_worked, e.dials_made, e.appointments_set, e.appointments_held, e.clients_closed, e.revenue, e.total_lead_cost, roi].join(",");
    });
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `performance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  const funnelPct = (val: number) => stats.totalLeadsWorked > 0 ? (val / stats.totalLeadsWorked) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Performance Tracking</h1>
          <p className="text-muted-foreground mt-1">Track your lead activity, appointments, and revenue performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add Performance Entry</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-2">
                <div><Label>Entry Date</Label><Input type="date" value={newEntry.entry_date} onChange={e => setNewEntry({ ...newEntry, entry_date: e.target.value })} required /></div>
                <div><Label>Lead Type</Label><Input value={newEntry.lead_type} onChange={e => setNewEntry({ ...newEntry, lead_type: e.target.value })} placeholder="e.g. IUL, Retirement" /></div>
                <div><Label>Leads Purchased</Label><Input type="number" value={newEntry.leads_purchased} onChange={e => setNewEntry({ ...newEntry, leads_purchased: Number(e.target.value) })} /></div>
                <div><Label>Leads Worked</Label><Input type="number" value={newEntry.leads_worked} onChange={e => setNewEntry({ ...newEntry, leads_worked: Number(e.target.value) })} /></div>
                <div><Label>Dials Made</Label><Input type="number" value={newEntry.dials_made} onChange={e => setNewEntry({ ...newEntry, dials_made: Number(e.target.value) })} /></div>
                <div><Label>Appointments Set</Label><Input type="number" value={newEntry.appointments_set} onChange={e => setNewEntry({ ...newEntry, appointments_set: Number(e.target.value) })} /></div>
                <div><Label>Appointments Held</Label><Input type="number" value={newEntry.appointments_held} onChange={e => setNewEntry({ ...newEntry, appointments_held: Number(e.target.value) })} /></div>
                <div><Label>Clients Closed</Label><Input type="number" value={newEntry.clients_closed} onChange={e => setNewEntry({ ...newEntry, clients_closed: Number(e.target.value) })} /></div>
                <div><Label>Revenue ($)</Label><Input type="number" value={newEntry.revenue} onChange={e => setNewEntry({ ...newEntry, revenue: Number(e.target.value) })} /></div>
                <div><Label>Cost Per Lead ($)</Label><Input type="number" value={newEntry.cost_per_lead} onChange={e => setNewEntry({ ...newEntry, cost_per_lead: Number(e.target.value) })} /></div>
                <div className="col-span-2"><Label>Discount (%)</Label><Input type="number" value={newEntry.discount_percent} onChange={e => setNewEntry({ ...newEntry, discount_percent: Number(e.target.value) })} /></div>
                <div className="col-span-2"><Label>Notes</Label><Input value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} placeholder="Optional notes..." /></div>
                <div className="col-span-2"><Button type="submit" className="w-full">Save Entry</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold text-foreground">${(stats.totalRevenue / 1000).toFixed(1)}K</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">Clients Closed</p><p className="text-2xl font-bold text-foreground">{stats.totalClientsClosed}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">Avg Close Rate</p><p className="text-2xl font-bold text-foreground">{stats.avgCloseRate.toFixed(1)}%</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {stats.avgROI >= 0 ? <TrendingUp className="h-5 w-5 text-primary" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
          </div>
          <div><p className="text-sm text-muted-foreground">Avg ROI</p><p className={`text-2xl font-bold ${stats.avgROI >= 0 ? "text-emerald-600" : "text-destructive"}`}>{stats.avgROI.toFixed(1)}%</p></div>
        </CardContent></Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Conversion Funnel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Leads Worked", value: stats.totalLeadsWorked, pct: 100 },
            { label: "Appointments Set", value: stats.totalApptsSet, pct: funnelPct(stats.totalApptsSet) },
            { label: "Appointments Held", value: stats.totalApptsHeld, pct: funnelPct(stats.totalApptsHeld) },
            { label: "Clients Closed", value: stats.totalClientsClosed, pct: funnelPct(stats.totalClientsClosed) },
          ].map((step) => (
            <div key={step.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">{step.label}</span>
                <span className="text-muted-foreground">{step.value} ({step.pct.toFixed(1)}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(step.pct, 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : entries.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No performance entries yet.</p>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Date","Lead Type","Leads","Worked","Dials","Appts Set","Appts Held","Closed","Revenue","ROI"].map(h => (
                    <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.slice(0, 10).map((e: any) => {
                  const roi = (e.total_lead_cost || 0) > 0 ? ((e.revenue - e.total_lead_cost) / e.total_lead_cost * 100) : 0;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap">{e.entry_date}</TableCell>
                      <TableCell>{e.lead_type || "—"}</TableCell>
                      <TableCell>{e.leads_purchased}</TableCell>
                      <TableCell>{e.leads_worked}</TableCell>
                      <TableCell>{e.dials_made}</TableCell>
                      <TableCell>{e.appointments_set}</TableCell>
                      <TableCell>{e.appointments_held}</TableCell>
                      <TableCell>{e.clients_closed}</TableCell>
                      <TableCell className="font-medium">${Number(e.revenue).toLocaleString()}</TableCell>
                      <TableCell className={`font-medium ${roi >= 0 ? "text-emerald-600" : "text-destructive"}`}>{roi.toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
