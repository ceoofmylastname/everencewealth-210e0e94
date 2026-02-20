import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Download, DollarSign, Users, TrendingUp, TrendingDown, Trophy, Target, Activity, Crown, Medal, Award } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "#C9A84C";
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

// Calendar boundary helpers
function getWeekStart() {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() - now.getDay()); // Sunday
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getYearStart() {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
}

interface SaleEntry {
  id: string;
  advisor_id: string;
  carrier: string;
  product_type: string;
  premium_mode: string;
  monthly_premium: number | null;
  annual_premium: number;
  client_name: string | null;
  notes: string | null;
  submitted_at: string;
  created_at: string;
}

interface GoalEntry {
  id: string;
  advisor_id: string;
  title: string;
  target_amount: number;
  target_date: string | null;
  created_at: string;
}

interface LeaderboardEntry {
  advisorId: string;
  name: string;
  totalPremium: number;
  policyCount: number;
}

export default function PerformanceTracker() {
  const { portalUser } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Activity log (existing)
  const [entries, setEntries] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split("T")[0], lead_type: "", leads_purchased: 0, leads_worked: 0,
    dials_made: 0, appointments_set: 0, appointments_held: 0, clients_closed: 0, revenue: 0, cost_per_lead: 0, discount_percent: 0, notes: "",
  });

  // Sales
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [newSale, setNewSale] = useState({ carrier: "", product_type: "", premium_mode: "annual" as "monthly" | "annual", premium_amount: 0, client_name: "", notes: "" });

  // Goals
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", target_amount: 0, target_date: "" });

  // Leaderboard
  const [allSales, setAllSales] = useState<any[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    if (!portalUser) return;
    supabase.from("advisors").select("id").eq("portal_user_id", portalUser.id).maybeSingle().then(({ data }) => {
      if (data) {
        setAdvisorId(data.id);
        loadAll(data.id);
      } else setLoading(false);
    });
  }, [portalUser]);

  async function loadAll(aid: string) {
    setLoading(true);
    await Promise.all([loadEntries(aid), loadSales(aid), loadGoals(aid), loadAllSales()]);
    setLoading(false);
  }

  async function loadEntries(aid: string) {
    const { data } = await supabase.from("advisor_performance").select("*").eq("advisor_id", aid).order("entry_date", { ascending: false }).limit(50);
    setEntries(data ?? []);
  }

  async function loadSales(aid: string) {
    const { data } = await supabase.from("advisor_sales").select("*").eq("advisor_id", aid).order("submitted_at", { ascending: false });
    setSales((data as SaleEntry[]) ?? []);
  }

  async function loadGoals(aid: string) {
    const { data } = await supabase.from("advisor_goals").select("*").eq("advisor_id", aid).order("created_at", { ascending: false });
    setGoals((data as GoalEntry[]) ?? []);
  }

  async function loadAllSales() {
    const { data } = await supabase
      .from("advisor_sales")
      .select("advisor_id, annual_premium, submitted_at, advisors!inner(first_name, last_name)");
    setAllSales(data ?? []);
  }

  // Realtime subscription for leaderboard
  useEffect(() => {
    const channel = supabase
      .channel("advisor_sales_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "advisor_sales" }, () => {
        loadAllSales();
        if (advisorId) loadSales(advisorId);
        toast.info("🏆 Leaderboard updated!");
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [advisorId]);

  // Sales income stats
  const salesStats = useMemo(() => {
    const weekStart = getWeekStart();
    const monthStart = getMonthStart();
    const yearStart = getYearStart();
    const weekly = sales.filter(s => new Date(s.submitted_at) >= weekStart).reduce((sum, s) => sum + Number(s.annual_premium), 0);
    const monthly = sales.filter(s => new Date(s.submitted_at) >= monthStart).reduce((sum, s) => sum + Number(s.annual_premium), 0);
    const ytd = sales.filter(s => new Date(s.submitted_at) >= yearStart).reduce((sum, s) => sum + Number(s.annual_premium), 0);
    return { weekly, monthly, ytd };
  }, [sales]);

  // Leaderboard
  const leaderboard = useMemo((): LeaderboardEntry[] => {
    const periodStart = leaderboardPeriod === "week" ? getWeekStart() : leaderboardPeriod === "month" ? getMonthStart() : getYearStart();
    const filtered = allSales.filter(s => new Date(s.submitted_at) >= periodStart);
    const map = new Map<string, LeaderboardEntry>();
    filtered.forEach(s => {
      const advisors = s.advisors as any;
      const firstName = advisors?.first_name || "";
      const lastName = advisors?.last_name || "";
      const name = `${firstName} ${lastName.charAt(0)}.`;
      const existing = map.get(s.advisor_id);
      if (existing) {
        existing.totalPremium += Number(s.annual_premium);
        existing.policyCount += 1;
      } else {
        map.set(s.advisor_id, { advisorId: s.advisor_id, name, totalPremium: Number(s.annual_premium), policyCount: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalPremium - a.totalPremium);
  }, [allSales, leaderboardPeriod]);

  // Activity log stats
  const activityStats = useMemo(() => {
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

  // Handlers
  async function handleSaleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!advisorId) return;
    const annual = newSale.premium_mode === "monthly" ? newSale.premium_amount * 12 : newSale.premium_amount;
    const monthlyVal = newSale.premium_mode === "monthly" ? newSale.premium_amount : null;
    const { error } = await supabase.from("advisor_sales").insert({
      advisor_id: advisorId,
      carrier: newSale.carrier,
      product_type: newSale.product_type,
      premium_mode: newSale.premium_mode,
      monthly_premium: monthlyVal,
      annual_premium: annual,
      client_name: newSale.client_name || null,
      notes: newSale.notes || null,
    });
    if (error) { toast.error("Failed to log sale"); return; }
    toast.success("Sale logged successfully!");
    setShowSaleDialog(false);
    setNewSale({ carrier: "", product_type: "", premium_mode: "annual", premium_amount: 0, client_name: "", notes: "" });
    loadSales(advisorId);
    loadAllSales();
  }

  async function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!advisorId) return;
    const { error } = await supabase.from("advisor_goals").insert({
      advisor_id: advisorId,
      title: newGoal.title,
      target_amount: newGoal.target_amount,
      target_date: newGoal.target_date || null,
    });
    if (error) { toast.error("Failed to create goal"); return; }
    toast.success("Goal created!");
    setShowGoalDialog(false);
    setNewGoal({ title: "", target_amount: 0, target_date: "" });
    loadGoals(advisorId);
  }

  async function handleDeleteGoal(goalId: string) {
    const { error } = await supabase.from("advisor_goals").delete().eq("id", goalId);
    if (error) { toast.error("Failed to delete goal"); return; }
    toast.success("Goal deleted");
    if (advisorId) loadGoals(advisorId);
  }

  async function handleActivitySubmit(e: React.FormEvent) {
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

  const funnelPct = (val: number) => activityStats.totalLeadsWorked > 0 ? (val / activityStats.totalLeadsWorked) * 100 : 0;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5" style={{ color: GOLD }} />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Tracking</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track sales, set goals, and compete on the leaderboard.</p>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="sales" className="data-[state=active]:bg-white gap-2"><DollarSign className="h-4 w-4" /> Sales</TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-white gap-2"><Target className="h-4 w-4" /> Goals</TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white gap-2"><Trophy className="h-4 w-4" /> Leaderboard</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-white gap-2"><Activity className="h-4 w-4" /> Activity</TabsTrigger>
        </TabsList>

        {/* ===================== SALES TAB ===================== */}
        <TabsContent value="sales" className="space-y-6">
          {/* Income Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "This Week", value: salesStats.weekly },
              { label: "This Month", value: salesStats.monthly },
              { label: "Year to Date", value: salesStats.ytd },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">${s.value.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Annual Premium</p>
              </div>
            ))}
          </div>

          {/* Log a Sale button */}
          <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                <Plus className="h-4 w-4" /> Log a Sale
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white">
              <DialogHeader><DialogTitle className="text-gray-900">Log a Policy Sale</DialogTitle></DialogHeader>
              <form onSubmit={handleSaleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div><Label className="text-gray-600 text-sm">Carrier</Label><Input className={inputCls} value={newSale.carrier} onChange={e => setNewSale({ ...newSale, carrier: e.target.value })} placeholder="e.g. Nationwide" required /></div>
                <div><Label className="text-gray-600 text-sm">Product Type</Label><Input className={inputCls} value={newSale.product_type} onChange={e => setNewSale({ ...newSale, product_type: e.target.value })} placeholder="e.g. IUL, Annuity" required /></div>
                <div>
                  <Label className="text-gray-600 text-sm">Premium Mode</Label>
                  <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" value={newSale.premium_mode} onChange={e => setNewSale({ ...newSale, premium_mode: e.target.value as "monthly" | "annual" })}>
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-600 text-sm">{newSale.premium_mode === "monthly" ? "Monthly Premium ($)" : "Annual Premium ($)"}</Label>
                  <Input type="number" className={inputCls} value={newSale.premium_amount || ""} onChange={e => setNewSale({ ...newSale, premium_amount: Number(e.target.value) })} required min={0} />
                  {newSale.premium_mode === "monthly" && newSale.premium_amount > 0 && (
                    <p className="text-xs text-gray-400 mt-1">Annual: ${(newSale.premium_amount * 12).toLocaleString()}</p>
                  )}
                </div>
                <div><Label className="text-gray-600 text-sm">Client Name (optional)</Label><Input className={inputCls} value={newSale.client_name} onChange={e => setNewSale({ ...newSale, client_name: e.target.value })} /></div>
                <div><Label className="text-gray-600 text-sm">Notes (optional)</Label><Input className={inputCls} value={newSale.notes} onChange={e => setNewSale({ ...newSale, notes: e.target.value })} /></div>
                <div className="col-span-2">
                  <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>Submit Sale</button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Recent Sales */}
          {sales.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Recent Sales</h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">
                      {["Date", "Carrier", "Product", "Mode", "Annual Premium", "Client"].map(h => (
                        <TableHead key={h} className="text-gray-500 whitespace-nowrap font-semibold text-xs uppercase tracking-wide">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.slice(0, 15).map(s => (
                      <TableRow key={s.id} className="border-gray-100 hover:bg-gray-50">
                        <TableCell className="text-gray-600 whitespace-nowrap">{new Date(s.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-gray-600">{s.carrier}</TableCell>
                        <TableCell className="text-gray-600">{s.product_type}</TableCell>
                        <TableCell className="text-gray-600 capitalize">{s.premium_mode}</TableCell>
                        <TableCell className="font-semibold text-gray-900">${Number(s.annual_premium).toLocaleString()}</TableCell>
                        <TableCell className="text-gray-600">{s.client_name || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===================== GOALS TAB ===================== */}
        <TabsContent value="goals" className="space-y-6">
          <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                <Plus className="h-4 w-4" /> Create Goal
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader><DialogTitle className="text-gray-900">Set an Income Goal</DialogTitle></DialogHeader>
              <form onSubmit={handleGoalSubmit} className="space-y-4 mt-2">
                <div><Label className="text-gray-600 text-sm">Goal Title</Label><Input className={inputCls} value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="e.g. Q1 Income Target" required /></div>
                <div><Label className="text-gray-600 text-sm">Target Amount ($)</Label><Input type="number" className={inputCls} value={newGoal.target_amount || ""} onChange={e => setNewGoal({ ...newGoal, target_amount: Number(e.target.value) })} required min={1} /></div>
                <div><Label className="text-gray-600 text-sm">Target Date (optional)</Label><Input type="date" className={inputCls} value={newGoal.target_date} onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })} /></div>
                <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>Create Goal</button>
              </form>
            </DialogContent>
          </Dialog>

          {goals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No goals yet. Create one to start tracking your progress!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map(goal => {
                const progress = Math.min((salesStats.ytd / Number(goal.target_amount)) * 100, 100);
                return (
                  <div key={goal.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        {goal.target_date && <p className="text-xs text-gray-400">Due: {new Date(goal.target_date).toLocaleDateString()}</p>}
                      </div>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Remove</button>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-500">${salesStats.ytd.toLocaleString()} / ${Number(goal.target_amount).toLocaleString()}</span>
                        <span className="font-semibold" style={{ color: BRAND_GREEN }}>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===================== LEADERBOARD TAB ===================== */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
                  <Trophy className="h-5 w-5" style={{ color: GOLD }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Global Leaderboard</h2>
                  <p className="text-xs text-gray-400">Real-time rankings by annual premium</p>
                </div>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(["week", "month", "year"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setLeaderboardPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${leaderboardPeriod === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {p === "week" ? "This Week" : p === "month" ? "This Month" : "Year to Date"}
                  </button>
                ))}
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No sales recorded for this period yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide w-16">Rank</TableHead>
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Agent</TableHead>
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide text-right">Total Premium</TableHead>
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide text-right">Policies</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const isMe = entry.advisorId === advisorId;
                    return (
                      <TableRow key={entry.advisorId} className={`border-gray-100 ${isMe ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                        <TableCell className="text-center">{getRankIcon(rank)}</TableCell>
                        <TableCell className={`font-medium ${isMe ? "text-emerald-700" : "text-gray-900"}`}>
                          {entry.name} {isMe && <span className="text-xs font-normal text-emerald-500 ml-1">(You)</span>}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900">${entry.totalPremium.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-gray-600">{entry.policyCount}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* ===================== ACTIVITY TAB ===================== */}
        <TabsContent value="activity" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Lead Activity Log</h2>
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
                  <form onSubmit={handleActivitySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Total Revenue", value: `$${(activityStats.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: GOLD },
              { label: "Clients Closed", value: activityStats.totalClientsClosed, icon: Users, color: BRAND_GREEN },
              { label: "Avg Close Rate", value: `${activityStats.avgCloseRate.toFixed(1)}%`, icon: TrendingUp, color: BRAND_GREEN },
              { label: "Avg ROI", value: `${activityStats.avgROI.toFixed(1)}%`, icon: activityStats.avgROI >= 0 ? TrendingUp : TrendingDown, color: activityStats.avgROI >= 0 ? "#10B981" : "#EF4444" },
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
              { label: "Leads Worked", value: activityStats.totalLeadsWorked, pct: 100 },
              { label: "Appointments Set", value: activityStats.totalApptsSet, pct: funnelPct(activityStats.totalApptsSet) },
              { label: "Appointments Held", value: activityStats.totalApptsHeld, pct: funnelPct(activityStats.totalApptsHeld) },
              { label: "Clients Closed", value: activityStats.totalClientsClosed, pct: funnelPct(activityStats.totalClientsClosed) },
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
          {entries.length > 0 && (
            <>
              <div className="md:hidden space-y-3">
                <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
                {entries.slice(0, 10).map((e: any) => {
                  const roi = (e.total_lead_cost || 0) > 0 ? ((e.revenue - e.total_lead_cost) / e.total_lead_cost * 100) : 0;
                  return (
                    <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{e.entry_date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{e.lead_type || "—"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-xs text-gray-400">Leads</p><p className="text-sm font-semibold text-gray-900">{e.leads_worked}</p></div>
                        <div><p className="text-xs text-gray-400">Closed</p><p className="text-sm font-semibold text-gray-900">{e.clients_closed}</p></div>
                        <div><p className="text-xs text-gray-400">Revenue</p><p className="text-sm font-semibold text-gray-900">${Number(e.revenue).toLocaleString()}</p></div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-xs text-gray-400">ROI</span>
                        <span className="text-sm font-bold" style={{ color: roi >= 0 ? "#10B981" : "#EF4444" }}>{roi.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
