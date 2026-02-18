import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Download, DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";

const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

export default function PerformanceTracker() {
  const { portalUser } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split("T")[0], lead_type: "", leads_purchased: 0, leads_worked: 0,
    dials_made: 0, appointments_set: 0, appointments_held: 0, clients_closed: 0, revenue: 0, cost_per_lead: 0, discount_percent: 0, notes: "",
  });

  useEffect(() => {
    if (!portalUser) return;
    supabase.from("advisors").select("id").eq("portal_user_id", portalUser.id).maybeSingle().then(({ data }) => {
      if (data) { setAdvisorId(data.id); loadEntries(data.id); } else setLoading(false);
    });
  }, [portalUser]);

  async function loadEntries(aid: string) {
    const { data } = await supabase.from("advisor_performance").select("*").eq("advisor_id", aid).order("entry_date", { ascending: false }).limit(50);
    setEntries(data ?? []); setLoading(false);
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
    const { error } = await supabase.from("advisor_performance").insert({ advisor_id: advisorId, ...newEntry, leads_purchased: Number(newEntry.leads_purchased), leads_worked: Number(newEntry.leads_worked), dials_made: Number(newEntry.dials_made), appointments_set: Number(newEntry.appointments_set), appointments_held: Number(newEntry.appointments_held), clients_closed: Number(newEntry.clients_closed), revenue: Number(newEntry.revenue), cost_per_lead: Number(newEntry.cost_per_lead), discount_percent: Number(newEntry.discount_percent), total_lead_cost });
    if (error) { toast.error("Failed to save entry"); return; }
    toast.success("Performance entry saved");
    setShowAddDialog(false);
    setNewEntry({ entry_date: new Date().toISOString().split("T")[0], lead_type: "", leads_purchased: 0, leads_worked: 0, dials_made: 0, appointments_set: 0, appointments_held: 0, clients_closed: 0, revenue: 0, cost_per_lead: 0, discount_percent: 0, notes: "" });
    loadEntries(advisorId);
  }

  function exportCSV() {
    const headers = ["Date", "Lead Type", "Leads Purchased", "Leads Worked", "Dials Made", "Appointments Set", "Appointments Held", "Clients Closed", "Revenue", "Lead Cost", "ROI"];
    const rows = entries.map(e => { const roi = (e.total_lead_cost || 0) > 0 ? (((e.revenue || 0) - e.total_lead_cost) / e.total_lead_cost * 100).toFixed(1) + "%" : "N/A"; return [e.entry_date, e.lead_type, e.leads_purchased, e.leads_worked, e.dials_made, e.appointments_set, e.appointments_held, e.clients_closed, e.revenue, e.total_lead_cost, roi].join(","); });
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `performance-${new Date().toISOString().split("T")[0]}.csv`; a.click();
  }

  const funnelPct = (val: number) => stats.totalLeadsWorked > 0 ? (val / stats.totalLeadsWorked) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your lead activity, appointments, and revenue performance.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                <Plus className="h-4 w-4" /> Add Entry
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader><DialogTitle className="text-gray-900">Add Performance Entry</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-2">
                <div><Label className="text-gray-600 text-sm">Entry Date</Label><Input type="date" className={inputCls} value={newEntry.entry_date} onChange={e => setNewEntry({ ...newEntry, entry_date: e.target.value })} required /></div>
                <div><Label className="text-gray-600 text-sm">Lead Type</Label><Input className={inputCls} value={newEntry.lead_type} onChange={e => setNewEntry({ ...newEntry, lead_type: e.target.value })} placeholder="e.g. IUL" /></div>
                <div><Label className="text-gray-600 text-sm">Leads Purchased</Label><Input type="number" className={inputCls} value={newEntry.leads_purchased} onChange={e => setNewEntry({ ...newEntry, leads_purchased: Number(e.target.value) })} /></div>
                <div><Label className="text-gray-600 text-sm">Leads Worked</Label><Input type="number" className={inputCls} value={newEntry.leads_worked} onChange={e => setNewEntry({ ...newEntry, leads_worked: Number(e.target.value) })} /></div>
                <div><Label className="text-gray-600 text-sm">Dials Made</Label><Input type="number" className={inputCls} value={newEntry.dials_made} onChange={e => setNewEntry({ ...newEntry, dials_made: Number(e.target.value) })} /></div>
                <div><Label className="text-gray-600 text-sm">Appointments Set</Label><Input type="number" className={inputCls} value={newEntry.appointments_set} onChange={e => setNewEntry({ ...newEntry, appointments_set: Number(e.target.value) })} /></div>
                <div><Label className="text-gray-600 text-sm">Appointments Held</Label><Input type="number" className={inputCls} value={newEntry.appointments_held} onChange={e => setNewEntry({ ...newEntry, appointments_held: Number(e.target.value) })} /></div>
                <div><Label className="text-gray-600 text-sm">Clients Closed</Label><Input type="number" className={inputCls} value={newEntry.clients_closed} onChange={e => setNewEntry({ ...newEntry, clients_closed: Number(e.target.value) })} /></div>
                <div><Label className="text-gray-600 text-sm">Revenue ($)</Label><Input type="number" className={inputCls} value={newEntry.revenue} onChange={e => setNewEntry({ ...newEntry, revenue: Number(e.target.value) })} /></div>
                <div><Label className="text-gray-600 text-sm">Cost Per Lead ($)</Label><Input type="number" className={inputCls} value={newEntry.cost_per_lead} onChange={e => setNewEntry({ ...newEntry, cost_per_lead: Number(e.target.value) })} /></div>
                <div className="col-span-2"><Label className="text-gray-600 text-sm">Discount (%)</Label><Input type="number" className={inputCls} value={newEntry.discount_percent} onChange={e => setNewEntry({ ...newEntry, discount_percent: Number(e.target.value) })} /></div>
                <div className="col-span-2"><Label className="text-gray-600 text-sm">Notes</Label><Input className={inputCls} value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} placeholder="Optional..." /></div>
                <div className="col-span-2">
                  <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>Save Entry</button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "#C9A84C" },
          { label: "Clients Closed", value: stats.totalClientsClosed, icon: Users, color: BRAND_GREEN },
          { label: "Avg Close Rate", value: `${stats.avgCloseRate.toFixed(1)}%`, icon: TrendingUp, color: BRAND_GREEN },
          { label: "Avg ROI", value: `${stats.avgROI.toFixed(1)}%`, icon: stats.avgROI >= 0 ? TrendingUp : TrendingDown, color: stats.avgROI >= 0 ? "#10B981" : "#EF4444" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Conversion Funnel</h2>
        {[
          { label: "Leads Worked", value: stats.totalLeadsWorked, pct: 100 },
          { label: "Appointments Set", value: stats.totalApptsSet, pct: funnelPct(stats.totalApptsSet) },
          { label: "Appointments Held", value: stats.totalApptsHeld, pct: funnelPct(stats.totalApptsHeld) },
          { label: "Clients Closed", value: stats.totalClientsClosed, pct: funnelPct(stats.totalClientsClosed) },
        ].map(step => (
          <div key={step.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">{step.label}</span>
              <span className="text-gray-400">{step.value} ({step.pct.toFixed(1)}%)</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-gray-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(step.pct, 100)}%`, background: BRAND_GREEN }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>
      ) : entries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">
                  {["Date", "Lead Type", "Leads", "Worked", "Dials", "Appts Set", "Appts Held", "Closed", "Revenue", "ROI"].map(h => (
                    <TableHead key={h} className="text-gray-500 whitespace-nowrap font-semibold text-xs uppercase tracking-wide">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.slice(0, 10).map((e: any) => {
                  const roi = (e.total_lead_cost || 0) > 0 ? ((e.revenue - e.total_lead_cost) / e.total_lead_cost * 100) : 0;
                  return (
                    <TableRow key={e.id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell className="text-gray-600 whitespace-nowrap">{e.entry_date}</TableCell>
                      <TableCell className="text-gray-600">{e.lead_type || "—"}</TableCell>
                      <TableCell className="text-gray-600">{e.leads_purchased}</TableCell>
                      <TableCell className="text-gray-600">{e.leads_worked}</TableCell>
                      <TableCell className="text-gray-600">{e.dials_made}</TableCell>
                      <TableCell className="text-gray-600">{e.appointments_set}</TableCell>
                      <TableCell className="text-gray-600">{e.appointments_held}</TableCell>
                      <TableCell className="text-gray-600">{e.clients_closed}</TableCell>
                      <TableCell className="font-semibold text-gray-900">${Number(e.revenue).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold" style={{ color: roi >= 0 ? "#10B981" : "#EF4444" }}>{roi.toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
