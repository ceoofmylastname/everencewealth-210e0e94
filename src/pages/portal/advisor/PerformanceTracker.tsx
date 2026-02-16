import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, TrendingUp } from "lucide-react";

export default function PerformanceTracker() {
  const { portalUser } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    lead_type: "", leads_purchased: 0, leads_worked: 0, dials_made: 0,
    appointments_set: 0, appointments_held: 0, clients_closed: 0,
    revenue: 0, cost_per_lead: 0, comp_level_percent: 100, advancement_percent: 75, notes: "",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!advisorId) return;
    const { error } = await supabase.from("advisor_performance").insert({
      advisor_id: advisorId,
      ...form,
      leads_purchased: Number(form.leads_purchased),
      leads_worked: Number(form.leads_worked),
      dials_made: Number(form.dials_made),
      appointments_set: Number(form.appointments_set),
      appointments_held: Number(form.appointments_held),
      clients_closed: Number(form.clients_closed),
      revenue: Number(form.revenue),
      cost_per_lead: Number(form.cost_per_lead),
      comp_level_percent: Number(form.comp_level_percent),
      advancement_percent: Number(form.advancement_percent),
    });
    if (error) { toast.error("Failed to save entry"); return; }
    toast.success("Performance entry saved");
    setShowForm(false);
    loadEntries(advisorId);
  }

  const ytdRevenue = entries.reduce((sum, e) => sum + (Number(e.revenue) || 0), 0);
  const ytdClosed = entries.reduce((sum, e) => sum + (Number(e.clients_closed) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Performance Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your daily activity and revenue.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />{showForm ? "Cancel" : "New Entry"}</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">YTD Revenue</p><p className="text-2xl font-bold text-foreground">${ytdRevenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">YTD Clients Closed</p><p className="text-2xl font-bold text-foreground">{ytdClosed}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Entries</p><p className="text-2xl font-bold text-foreground">{entries.length}</p></CardContent></Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">New Performance Entry</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><Label>Date</Label><Input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} required /></div>
              <div><Label>Lead Type</Label><Input value={form.lead_type} onChange={e => setForm({ ...form, lead_type: e.target.value })} placeholder="e.g. IUL, Retirement" /></div>
              <div><Label>Revenue ($)</Label><Input type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: Number(e.target.value) })} /></div>
              <div><Label>Leads Purchased</Label><Input type="number" value={form.leads_purchased} onChange={e => setForm({ ...form, leads_purchased: Number(e.target.value) })} /></div>
              <div><Label>Leads Worked</Label><Input type="number" value={form.leads_worked} onChange={e => setForm({ ...form, leads_worked: Number(e.target.value) })} /></div>
              <div><Label>Dials Made</Label><Input type="number" value={form.dials_made} onChange={e => setForm({ ...form, dials_made: Number(e.target.value) })} /></div>
              <div><Label>Appointments Set</Label><Input type="number" value={form.appointments_set} onChange={e => setForm({ ...form, appointments_set: Number(e.target.value) })} /></div>
              <div><Label>Appointments Held</Label><Input type="number" value={form.appointments_held} onChange={e => setForm({ ...form, appointments_held: Number(e.target.value) })} /></div>
              <div><Label>Clients Closed</Label><Input type="number" value={form.clients_closed} onChange={e => setForm({ ...form, clients_closed: Number(e.target.value) })} /></div>
              <div><Label>Comp Level (%)</Label><Input type="number" value={form.comp_level_percent} onChange={e => setForm({ ...form, comp_level_percent: Number(e.target.value) })} /></div>
              <div><Label>Advancement (%)</Label><Input type="number" value={form.advancement_percent} onChange={e => setForm({ ...form, advancement_percent: Number(e.target.value) })} /></div>
              <div><Label>Cost Per Lead ($)</Label><Input type="number" value={form.cost_per_lead} onChange={e => setForm({ ...form, cost_per_lead: Number(e.target.value) })} /></div>
              <div className="sm:col-span-2 lg:col-span-3"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="sm:col-span-2 lg:col-span-3"><Button type="submit" className="w-full sm:w-auto">Save Entry</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : entries.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No performance entries yet.</p>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Date", "Lead Type", "Revenue", "Closed", "Dials", "Appts", "Issue Pay", "Deferred"].map(h => (
                    <th key={h} className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e: any) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="p-3 whitespace-nowrap">{e.entry_date}</td>
                    <td className="p-3">{e.lead_type || "—"}</td>
                    <td className="p-3 font-medium">${Number(e.revenue).toLocaleString()}</td>
                    <td className="p-3">{e.clients_closed}</td>
                    <td className="p-3">{e.dials_made}</td>
                    <td className="p-3">{e.appointments_held}</td>
                    <td className="p-3 text-emerald-600">${Number(e.expected_issue_pay || 0).toLocaleString()}</td>
                    <td className="p-3 text-amber-600">${Number(e.expected_deferred_pay || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
