import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Download, DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

function MeshOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${GOLD_BG} 0%, transparent 70%)`, filter: "blur(80px)" }} />
    </div>
  );
}

const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl";

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
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <MeshOrbs />
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>PERFORMANCE</span>
            </div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Performance Tracking</h1>
            <p className="text-white/50 mt-1 text-sm">Track your lead activity, appointments, and revenue performance.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-all"
              style={{ background: "hsla(0,0%,100%,0.05)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${GOLD_BG}`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}>
                  <Plus className="h-4 w-4" /> Add Entry
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: "#0c1a14", border: "1px solid hsla(0,0%,100%,0.08)" }}>
                <DialogHeader><DialogTitle className="text-white">Add Performance Entry</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-2">
                  <div><Label className="text-white/60">Entry Date</Label><Input type="date" className={inputCls} value={newEntry.entry_date} onChange={e => setNewEntry({ ...newEntry, entry_date: e.target.value })} required /></div>
                  <div><Label className="text-white/60">Lead Type</Label><Input className={inputCls} value={newEntry.lead_type} onChange={e => setNewEntry({ ...newEntry, lead_type: e.target.value })} placeholder="e.g. IUL" /></div>
                  <div><Label className="text-white/60">Leads Purchased</Label><Input type="number" className={inputCls} value={newEntry.leads_purchased} onChange={e => setNewEntry({ ...newEntry, leads_purchased: Number(e.target.value) })} /></div>
                  <div><Label className="text-white/60">Leads Worked</Label><Input type="number" className={inputCls} value={newEntry.leads_worked} onChange={e => setNewEntry({ ...newEntry, leads_worked: Number(e.target.value) })} /></div>
                  <div><Label className="text-white/60">Dials Made</Label><Input type="number" className={inputCls} value={newEntry.dials_made} onChange={e => setNewEntry({ ...newEntry, dials_made: Number(e.target.value) })} /></div>
                  <div><Label className="text-white/60">Appointments Set</Label><Input type="number" className={inputCls} value={newEntry.appointments_set} onChange={e => setNewEntry({ ...newEntry, appointments_set: Number(e.target.value) })} /></div>
                  <div><Label className="text-white/60">Appointments Held</Label><Input type="number" className={inputCls} value={newEntry.appointments_held} onChange={e => setNewEntry({ ...newEntry, appointments_held: Number(e.target.value) })} /></div>
                  <div><Label className="text-white/60">Clients Closed</Label><Input type="number" className={inputCls} value={newEntry.clients_closed} onChange={e => setNewEntry({ ...newEntry, clients_closed: Number(e.target.value) })} /></div>
                  <div><Label className="text-white/60">Revenue ($)</Label><Input type="number" className={inputCls} value={newEntry.revenue} onChange={e => setNewEntry({ ...newEntry, revenue: Number(e.target.value) })} /></div>
                  <div><Label className="text-white/60">Cost Per Lead ($)</Label><Input type="number" className={inputCls} value={newEntry.cost_per_lead} onChange={e => setNewEntry({ ...newEntry, cost_per_lead: Number(e.target.value) })} /></div>
                  <div className="col-span-2"><Label className="text-white/60">Discount (%)</Label><Input type="number" className={inputCls} value={newEntry.discount_percent} onChange={e => setNewEntry({ ...newEntry, discount_percent: Number(e.target.value) })} /></div>
                  <div className="col-span-2"><Label className="text-white/60">Notes</Label><Input className={inputCls} value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} placeholder="Optional..." /></div>
                  <div className="col-span-2">
                    <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>Save Entry</button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign },
            { label: "Clients Closed", value: stats.totalClientsClosed, icon: Users },
            { label: "Avg Close Rate", value: `${stats.avgCloseRate.toFixed(1)}%`, icon: TrendingUp },
            { label: "Avg ROI", value: `${stats.avgROI.toFixed(1)}%`, icon: stats.avgROI >= 0 ? TrendingUp : TrendingDown, roiNegative: stats.avgROI < 0 },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 flex items-center gap-4" style={GLASS}>
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: GOLD_BG }}>
                <s.icon className="h-5 w-5" style={{ color: s.roiNegative ? "hsla(0,70%,70%,1)" : GOLD }} />
              </div>
              <div>
                <p className="text-sm text-white/40">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.roiNegative ? "hsla(0,70%,70%,1)" : GOLD }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Funnel */}
        <div className="rounded-2xl p-5 space-y-4" style={GLASS}>
          <h2 className="text-lg font-semibold text-white">Conversion Funnel</h2>
          {[
            { label: "Leads Worked", value: stats.totalLeadsWorked, pct: 100 },
            { label: "Appointments Set", value: stats.totalApptsSet, pct: funnelPct(stats.totalApptsSet) },
            { label: "Appointments Held", value: stats.totalApptsHeld, pct: funnelPct(stats.totalApptsHeld) },
            { label: "Clients Closed", value: stats.totalClientsClosed, pct: funnelPct(stats.totalClientsClosed) },
          ].map(step => (
            <div key={step.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-white/80">{step.label}</span>
                <span className="text-white/40">{step.value} ({step.pct.toFixed(1)}%)</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "hsla(0,0%,100%,0.06)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(step.pct, 100)}%`, background: `linear-gradient(90deg, ${GOLD}, hsla(51,78%,65%,0.5))` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} /></div>
        ) : entries.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={GLASS}>
            <div className="p-5 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    {["Date", "Lead Type", "Leads", "Worked", "Dials", "Appts Set", "Appts Held", "Closed", "Revenue", "ROI"].map(h => (
                      <TableHead key={h} className="text-white/40 whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 10).map((e: any) => {
                    const roi = (e.total_lead_cost || 0) > 0 ? ((e.revenue - e.total_lead_cost) / e.total_lead_cost * 100) : 0;
                    return (
                      <TableRow key={e.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                        <TableCell className="text-white/60 whitespace-nowrap">{e.entry_date}</TableCell>
                        <TableCell className="text-white/60">{e.lead_type || "—"}</TableCell>
                        <TableCell className="text-white/60">{e.leads_purchased}</TableCell>
                        <TableCell className="text-white/60">{e.leads_worked}</TableCell>
                        <TableCell className="text-white/60">{e.dials_made}</TableCell>
                        <TableCell className="text-white/60">{e.appointments_set}</TableCell>
                        <TableCell className="text-white/60">{e.appointments_held}</TableCell>
                        <TableCell className="text-white/60">{e.clients_closed}</TableCell>
                        <TableCell className="font-medium text-white">${Number(e.revenue).toLocaleString()}</TableCell>
                        <TableCell className="font-medium" style={{ color: roi >= 0 ? "hsla(160,60%,65%,1)" : "hsla(0,70%,70%,1)" }}>{roi.toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
