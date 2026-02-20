import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus, Download, DollarSign, Users, TrendingUp, TrendingDown, Trophy, Target, Activity,
  Crown, Medal, Award, BarChart3, Wallet, CreditCard, PiggyBank, Landmark, Search, Trash2, ArrowUpDown
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const BRAND = "#1A4D3E";
const GOLD = "#C9A84C";
const RED = "#EF4444";
const GREEN = "#10B981";
const CHART_COLORS = ["#1A4D3E", "#C9A84C", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#06B6D4", "#84CC16"];
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

function getWeekStart() { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; }
function getMonthStart() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); }
function getYearStart() { const n = new Date(); return new Date(n.getFullYear(), 0, 1); }
function get7dAgo() { const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d; }

interface SaleEntry { id: string; advisor_id: string; carrier: string; product_type: string; premium_mode: string; monthly_premium: number | null; annual_premium: number; client_name: string | null; notes: string | null; submitted_at: string; created_at: string; }
interface GoalEntry { id: string; advisor_id: string; title: string; target_amount: number; target_date: string | null; created_at: string; }
interface TransactionEntry { id: string; advisor_id: string; type: string; amount: number; category: string; account_name: string; memo: string; transaction_date: string; created_at: string; }
interface DebtEntry { id: string; advisor_id: string; name: string; current_balance: number; apr: number; minimum_payment: number; target_payoff_date: string | null; is_paid_off: boolean; created_at: string; }
interface AccountEntry { id: string; advisor_id: string; account_name: string; account_type: string; balance: number; created_at: string; updated_at: string; }
interface LeaderboardEntry { advisorId: string; name: string; totalPremium: number; policyCount: number; }

function StatCard({ label, value, sub, icon: Icon, color = BRAND }: { label: string; value: string; sub?: string; icon: any; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function PerformanceTracker() {
  const { portalUser } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Existing data
  const [entries, setEntries] = useState<any[]>([]);
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [allSales, setAllSales] = useState<any[]>([]);

  // New data
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [debts, setDebts] = useState<DebtEntry[]>([]);
  const [accounts, setAccounts] = useState<AccountEntry[]>([]);

  // Dialogs
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTxnDialog, setShowTxnDialog] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  // Form state
  const [newSale, setNewSale] = useState({ carrier: "", product_type: "", premium_mode: "annual" as "monthly"|"annual", premium_amount: 0, client_name: "", notes: "" });
  const [newGoal, setNewGoal] = useState({ title: "", target_amount: 0, target_date: "" });
  const [newTxn, setNewTxn] = useState({ type: "income" as "income"|"expense", amount: 0, category: "", account_name: "", memo: "", transaction_date: new Date().toISOString().split("T")[0] });
  const [newDebt, setNewDebt] = useState({ name: "", current_balance: 0, apr: 0, minimum_payment: 0, target_payoff_date: "" });
  const [newAccount, setNewAccount] = useState({ account_name: "", account_type: "checking", balance: 0 });
  const [newEntry, setNewEntry] = useState({ entry_date: new Date().toISOString().split("T")[0], lead_type: "", leads_purchased: 0, leads_worked: 0, dials_made: 0, appointments_set: 0, appointments_held: 0, clients_closed: 0, revenue: 0, cost_per_lead: 0, discount_percent: 0, notes: "" });

  // Filters
  const [txnFilter, setTxnFilter] = useState<"all"|"income"|"expense">("all");
  const [txnSearch, setTxnSearch] = useState("");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"week"|"month"|"year">("week");
  const [debtStrategy, setDebtStrategy] = useState<"snowball"|"avalanche">("snowball");

  useEffect(() => {
    if (!portalUser) return;
    supabase.from("advisors").select("id").eq("portal_user_id", portalUser.id).maybeSingle().then(({ data }) => {
      if (data) { setAdvisorId(data.id); loadAll(data.id); }
      else setLoading(false);
    });
  }, [portalUser]);

  async function loadAll(aid: string) {
    setLoading(true);
    await Promise.all([loadEntries(aid), loadSales(aid), loadGoals(aid), loadAllSales(), loadTransactions(aid), loadDebts(aid), loadAccounts(aid)]);
    setLoading(false);
  }

  async function loadEntries(aid: string) { const { data } = await supabase.from("advisor_performance").select("*").eq("advisor_id", aid).order("entry_date", { ascending: false }).limit(50); setEntries(data ?? []); }
  async function loadSales(aid: string) { const { data } = await supabase.from("advisor_sales").select("*").eq("advisor_id", aid).order("submitted_at", { ascending: false }); setSales((data as SaleEntry[]) ?? []); }
  async function loadGoals(aid: string) { const { data } = await supabase.from("advisor_goals").select("*").eq("advisor_id", aid).order("created_at", { ascending: false }); setGoals((data as GoalEntry[]) ?? []); }
  async function loadAllSales() { const { data } = await supabase.from("advisor_sales").select("advisor_id, annual_premium, submitted_at, advisors!inner(first_name, last_name)"); setAllSales(data ?? []); }
  async function loadTransactions(aid: string) { const { data } = await supabase.from("advisor_transactions").select("*").eq("advisor_id", aid).order("transaction_date", { ascending: false }).limit(200); setTransactions((data as TransactionEntry[]) ?? []); }
  async function loadDebts(aid: string) { const { data } = await supabase.from("advisor_debts").select("*").eq("advisor_id", aid).order("created_at", { ascending: false }); setDebts((data as DebtEntry[]) ?? []); }
  async function loadAccounts(aid: string) { const { data } = await supabase.from("advisor_accounts").select("*").eq("advisor_id", aid).order("created_at", { ascending: false }); setAccounts((data as AccountEntry[]) ?? []); }

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("perf_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "advisor_sales" }, () => { loadAllSales(); if (advisorId) loadSales(advisorId); toast.info("🏆 Leaderboard updated!"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "advisor_transactions" }, () => { if (advisorId) loadTransactions(advisorId); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [advisorId]);

  // ============ COMPUTED METRICS ============
  const salesStats = useMemo(() => {
    const ws = getWeekStart(), ms = getMonthStart(), ys = getYearStart();
    const weekly = sales.filter(s => new Date(s.submitted_at) >= ws).reduce((a, s) => a + Number(s.annual_premium), 0);
    const monthly = sales.filter(s => new Date(s.submitted_at) >= ms).reduce((a, s) => a + Number(s.annual_premium), 0);
    const ytd = sales.filter(s => new Date(s.submitted_at) >= ys).reduce((a, s) => a + Number(s.annual_premium), 0);
    return { weekly, monthly, ytd };
  }, [sales]);

  const finStats = useMemo(() => {
    const d7 = get7dAgo(), ms = getMonthStart(), ys = getYearStart();
    const inc7d = transactions.filter(t => t.type === "income" && new Date(t.transaction_date) >= d7).reduce((a, t) => a + Number(t.amount), 0);
    const exp7d = transactions.filter(t => t.type === "expense" && new Date(t.transaction_date) >= d7).reduce((a, t) => a + Number(t.amount), 0);
    const incMtd = transactions.filter(t => t.type === "income" && new Date(t.transaction_date) >= ms).reduce((a, t) => a + Number(t.amount), 0);
    const expMtd = transactions.filter(t => t.type === "expense" && new Date(t.transaction_date) >= ms).reduce((a, t) => a + Number(t.amount), 0);
    const incYtd = transactions.filter(t => t.type === "income" && new Date(t.transaction_date) >= ys).reduce((a, t) => a + Number(t.amount), 0);
    const expYtd = transactions.filter(t => t.type === "expense" && new Date(t.transaction_date) >= ys).reduce((a, t) => a + Number(t.amount), 0);
    const totalAssets = accounts.reduce((a, ac) => a + Number(ac.balance), 0);
    const totalDebt = debts.filter(d => !d.is_paid_off).reduce((a, d) => a + Number(d.current_balance), 0);
    const netWorth = totalAssets - totalDebt;
    const taxSetAside = incYtd * 0.2;
    const minPayments = debts.filter(d => !d.is_paid_off).reduce((a, d) => a + Number(d.minimum_payment), 0);
    const debtCount = debts.filter(d => !d.is_paid_off).length;
    return { inc7d, exp7d, net7d: inc7d - exp7d, incMtd, expMtd, netMtd: incMtd - expMtd, incYtd, expYtd, netYtd: incYtd - expYtd, netWorth, totalAssets, totalDebt, taxSetAside, minPayments, debtCount };
  }, [transactions, accounts, debts]);

  // Weekly trend (last 8 weeks)
  const weeklyTrend = useMemo(() => {
    const weeks: { label: string; net: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - (i + 1) * 7); start.setHours(0,0,0,0);
      const end = new Date(); end.setDate(end.getDate() - i * 7); end.setHours(0,0,0,0);
      const inc = transactions.filter(t => t.type === "income" && new Date(t.transaction_date) >= start && new Date(t.transaction_date) < end).reduce((a, t) => a + Number(t.amount), 0);
      const exp = transactions.filter(t => t.type === "expense" && new Date(t.transaction_date) >= start && new Date(t.transaction_date) < end).reduce((a, t) => a + Number(t.amount), 0);
      weeks.push({ label: `W${8 - i}`, net: inc - exp });
    }
    return weeks;
  }, [transactions]);

  // Income vs Expenses MTD by week
  const incVsExpMtd = useMemo(() => {
    const ms = getMonthStart();
    const now = new Date();
    const weeks: { label: string; income: number; expenses: number }[] = [];
    let weekStart = new Date(ms);
    let w = 1;
    while (weekStart < now) {
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
      const inc = transactions.filter(t => t.type === "income" && new Date(t.transaction_date) >= weekStart && new Date(t.transaction_date) < weekEnd).reduce((a, t) => a + Number(t.amount), 0);
      const exp = transactions.filter(t => t.type === "expense" && new Date(t.transaction_date) >= weekStart && new Date(t.transaction_date) < weekEnd).reduce((a, t) => a + Number(t.amount), 0);
      weeks.push({ label: `W${w}`, income: inc, expenses: exp });
      weekStart = weekEnd;
      w++;
    }
    return weeks;
  }, [transactions]);

  // Commission by carrier
  const carrierData = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach(s => map.set(s.carrier, (map.get(s.carrier) || 0) + Number(s.annual_premium)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [sales]);

  // Sorted debts
  const sortedDebts = useMemo(() => {
    const active = debts.filter(d => !d.is_paid_off);
    return debtStrategy === "snowball"
      ? [...active].sort((a, b) => Number(a.current_balance) - Number(b.current_balance))
      : [...active].sort((a, b) => Number(b.apr) - Number(a.apr));
  }, [debts, debtStrategy]);

  // Filtered transactions
  const filteredTxns = useMemo(() => {
    let list = transactions;
    if (txnFilter !== "all") list = list.filter(t => t.type === txnFilter);
    if (txnSearch) list = list.filter(t => t.category.toLowerCase().includes(txnSearch.toLowerCase()) || t.memo.toLowerCase().includes(txnSearch.toLowerCase()) || t.account_name.toLowerCase().includes(txnSearch.toLowerCase()));
    return list;
  }, [transactions, txnFilter, txnSearch]);

  // Leaderboard
  const leaderboard = useMemo((): LeaderboardEntry[] => {
    const ps = leaderboardPeriod === "week" ? getWeekStart() : leaderboardPeriod === "month" ? getMonthStart() : getYearStart();
    const filtered = allSales.filter(s => new Date(s.submitted_at) >= ps);
    const map = new Map<string, LeaderboardEntry>();
    filtered.forEach(s => {
      const a = s.advisors as any;
      const name = `${a?.first_name || ""} ${(a?.last_name || "").charAt(0)}.`;
      const e = map.get(s.advisor_id);
      if (e) { e.totalPremium += Number(s.annual_premium); e.policyCount++; }
      else map.set(s.advisor_id, { advisorId: s.advisor_id, name, totalPremium: Number(s.annual_premium), policyCount: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.totalPremium - a.totalPremium);
  }, [allSales, leaderboardPeriod]);

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

  // ============ HANDLERS ============
  async function handleSaleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!advisorId) return;
    const annual = newSale.premium_mode === "monthly" ? newSale.premium_amount * 12 : newSale.premium_amount;
    const monthlyVal = newSale.premium_mode === "monthly" ? newSale.premium_amount : null;
    const { error } = await supabase.from("advisor_sales").insert({ advisor_id: advisorId, carrier: newSale.carrier, product_type: newSale.product_type, premium_mode: newSale.premium_mode, monthly_premium: monthlyVal, annual_premium: annual, client_name: newSale.client_name || null, notes: newSale.notes || null });
    if (error) { toast.error("Failed to log sale"); return; }
    // Auto-create income transaction from commission
    const commissionAmount = newSale.premium_mode === "monthly" ? annual * 0.75 : annual;
    const { error: txnError } = await supabase.from("advisor_transactions").insert({
      advisor_id: advisorId, type: "income", amount: commissionAmount, category: "Commission",
      account_name: newSale.carrier,
      memo: `Auto: ${newSale.carrier} - ${newSale.product_type} (${newSale.premium_mode})`,
      transaction_date: new Date().toISOString().split("T")[0],
    });
    if (txnError) { console.error("Commission transaction failed:", txnError.message); }
    toast.success("Sale logged!"); setShowSaleDialog(false);
    setNewSale({ carrier: "", product_type: "", premium_mode: "annual", premium_amount: 0, client_name: "", notes: "" });
    loadSales(advisorId); loadAllSales(); loadTransactions(advisorId);
  }

  async function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!advisorId) return;
    const { error } = await supabase.from("advisor_goals").insert({ advisor_id: advisorId, title: newGoal.title, target_amount: newGoal.target_amount, target_date: newGoal.target_date || null });
    if (error) { toast.error("Failed to create goal"); return; }
    toast.success("Goal created!"); setShowGoalDialog(false);
    setNewGoal({ title: "", target_amount: 0, target_date: "" }); loadGoals(advisorId);
  }

  async function handleDeleteGoal(goalId: string) {
    const { error } = await supabase.from("advisor_goals").delete().eq("id", goalId);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Goal deleted"); if (advisorId) loadGoals(advisorId);
  }

  async function handleTxnSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!advisorId) return;
    const { error } = await supabase.from("advisor_transactions").insert({ advisor_id: advisorId, type: newTxn.type, amount: newTxn.amount, category: newTxn.category, account_name: newTxn.account_name, memo: newTxn.memo, transaction_date: newTxn.transaction_date });
    if (error) { toast.error("Failed to add transaction"); return; }
    toast.success("Transaction added!"); setShowTxnDialog(false);
    setNewTxn({ type: "income", amount: 0, category: "", account_name: "", memo: "", transaction_date: new Date().toISOString().split("T")[0] });
    loadTransactions(advisorId);
  }

  async function handleDeleteTxn(id: string) {
    const { error } = await supabase.from("advisor_transactions").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted"); if (advisorId) loadTransactions(advisorId);
  }

  async function handleDebtSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!advisorId) return;
    const { error } = await supabase.from("advisor_debts").insert({ advisor_id: advisorId, name: newDebt.name, current_balance: newDebt.current_balance, apr: newDebt.apr, minimum_payment: newDebt.minimum_payment, target_payoff_date: newDebt.target_payoff_date || null });
    if (error) { toast.error("Failed to add debt"); return; }
    toast.success("Debt added!"); setShowDebtDialog(false);
    setNewDebt({ name: "", current_balance: 0, apr: 0, minimum_payment: 0, target_payoff_date: "" }); loadDebts(advisorId);
  }

  async function handleDeleteDebt(id: string) {
    const { error } = await supabase.from("advisor_debts").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted"); if (advisorId) loadDebts(advisorId);
  }

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!advisorId) return;
    const { error } = await supabase.from("advisor_accounts").insert({ advisor_id: advisorId, account_name: newAccount.account_name, account_type: newAccount.account_type, balance: newAccount.balance });
    if (error) { toast.error("Failed to add account"); return; }
    toast.success("Account added!"); setShowAccountDialog(false);
    setNewAccount({ account_name: "", account_type: "checking", balance: 0 }); loadAccounts(advisorId);
  }

  async function handleDeleteAccount(id: string) {
    const { error } = await supabase.from("advisor_accounts").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted"); if (advisorId) loadAccounts(advisorId);
  }

  async function handleActivitySubmit(e: React.FormEvent) {
    e.preventDefault(); if (!advisorId) return;
    const total_lead_cost = Number(newEntry.leads_purchased) * Number(newEntry.cost_per_lead) * (1 - Number(newEntry.discount_percent) / 100);
    const { error } = await supabase.from("advisor_performance").insert({ advisor_id: advisorId, ...newEntry, leads_purchased: Number(newEntry.leads_purchased), leads_worked: Number(newEntry.leads_worked), dials_made: Number(newEntry.dials_made), appointments_set: Number(newEntry.appointments_set), appointments_held: Number(newEntry.appointments_held), clients_closed: Number(newEntry.clients_closed), revenue: Number(newEntry.revenue), cost_per_lead: Number(newEntry.cost_per_lead), discount_percent: Number(newEntry.discount_percent), total_lead_cost });
    if (error) { toast.error("Failed to save entry"); return; }
    toast.success("Entry saved!"); setShowAddDialog(false);
    setNewEntry({ entry_date: new Date().toISOString().split("T")[0], lead_type: "", leads_purchased: 0, leads_worked: 0, dials_made: 0, appointments_set: 0, appointments_held: 0, clients_closed: 0, revenue: 0, cost_per_lead: 0, discount_percent: 0, notes: "" });
    loadEntries(advisorId);
  }

  function exportCSV() {
    const headers = ["Date","Lead Type","Leads Purchased","Leads Worked","Dials Made","Appointments Set","Appointments Held","Clients Closed","Revenue","Lead Cost","ROI"];
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
  const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toLocaleString()}` : `$${n.toLocaleString()}`;

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: "transparent" }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Command Center</h1>
        <p className="text-sm text-gray-500 mt-0.5">Dashboard · Data · Commissions · Leaderboard · Activity</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 flex-wrap">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white gap-1.5"><BarChart3 className="h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-white gap-1.5"><Wallet className="h-4 w-4" /> Data</TabsTrigger>
          <TabsTrigger value="commissions" className="data-[state=active]:bg-white gap-1.5"><DollarSign className="h-4 w-4" /> Commissions</TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white gap-1.5"><Trophy className="h-4 w-4" /> Leaderboard</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-white gap-1.5"><Activity className="h-4 w-4" /> Activity</TabsTrigger>
        </TabsList>

        {/* ===== DASHBOARD ===== */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* 9 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard label="Net Income (7d)" value={fmt(finStats.net7d)} icon={TrendingUp} color={finStats.net7d >= 0 ? GREEN : RED} />
            <StatCard label="Net Income (MTD)" value={fmt(finStats.netMtd)} icon={TrendingUp} color={finStats.netMtd >= 0 ? GREEN : RED} />
            <StatCard label="Net Income (YTD)" value={fmt(finStats.netYtd)} icon={TrendingUp} color={finStats.netYtd >= 0 ? GREEN : RED} />
            <StatCard label="Income (7d)" value={fmt(finStats.inc7d)} icon={DollarSign} color={GREEN} />
            <StatCard label="Income (MTD)" value={fmt(finStats.incMtd)} icon={DollarSign} color={GREEN} />
            <StatCard label="Expenses (MTD)" value={fmt(finStats.expMtd)} icon={CreditCard} color={RED} />
            <StatCard label="Net Worth" value={fmt(finStats.netWorth)} icon={Landmark} color={BRAND} />
            <StatCard label="Tax Set-Aside (YTD)" value={fmt(finStats.taxSetAside)} sub="20% of YTD income" icon={PiggyBank} color={GOLD} />
            <StatCard label="Total Debt" value={fmt(finStats.totalDebt)} sub={`${finStats.debtCount} active`} icon={CreditCard} color={RED} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weekly Net Income Trend */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Net Income Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Net Income"]} />
                  <Line type="monotone" dataKey="net" stroke={BRAND} strokeWidth={2.5} dot={{ fill: BRAND, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Income vs Expenses MTD */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Income vs Expenses (MTD)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={incVsExpMtd}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="income" fill={GREEN} radius={[4,4,0,0]} name="Income" />
                  <Bar dataKey="expenses" fill={RED} radius={[4,4,0,0]} name="Expenses" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goals progress + Debt strategy side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Goals */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Goals Progress</h3>
                <span className="text-xs text-gray-400">{goals.length} goals</span>
              </div>
              {goals.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No goals set yet.</p> : goals.slice(0, 4).map(g => {
                const pct = Math.min((salesStats.ytd / Number(g.target_amount)) * 100, 100);
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium truncate">{g.title}</span><span style={{ color: BRAND }} className="font-semibold">{pct.toFixed(0)}%</span></div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>

            {/* Debt Payoff Strategy */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Debt Payoff Strategy</h3>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  {(["snowball", "avalanche"] as const).map(s => (
                    <button key={s} onClick={() => setDebtStrategy(s)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${debtStrategy === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>{s === "snowball" ? "Snowball" : "Avalanche"}</button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400">{debtStrategy === "snowball" ? "Pay smallest balance first for quick wins." : "Pay highest APR first to save on interest."}</p>
              {sortedDebts.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No debts tracked.</p> : sortedDebts.slice(0, 5).map((d, i) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: i === 0 ? BRAND : "#9CA3AF" }}>{i + 1}</span><span className="text-gray-700">{d.name}</span></div>
                  <div className="text-right"><span className="font-semibold text-gray-900">${Number(d.current_balance).toLocaleString()}</span><span className="text-xs text-gray-400 ml-2">{Number(d.apr)}% APR</span></div>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                <div className="text-center"><p className="text-xs text-gray-400">Total Debt</p><p className="text-sm font-bold text-gray-900">${finStats.totalDebt.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-xs text-gray-400">Min/Mo</p><p className="text-sm font-bold text-gray-900">${finStats.minPayments.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-xs text-gray-400">Debts</p><p className="text-sm font-bold text-gray-900">{finStats.debtCount}</p></div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ===== DATA MANAGEMENT ===== */}
        <TabsContent value="data" className="space-y-4">
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="transactions" className="data-[state=active]:bg-white text-xs gap-1"><DollarSign className="h-3.5 w-3.5" /> Transactions</TabsTrigger>
              <TabsTrigger value="sales" className="data-[state=active]:bg-white text-xs gap-1"><TrendingUp className="h-3.5 w-3.5" /> Sales</TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-white text-xs gap-1"><Target className="h-3.5 w-3.5" /> Goals</TabsTrigger>
              <TabsTrigger value="debts" className="data-[state=active]:bg-white text-xs gap-1"><CreditCard className="h-3.5 w-3.5" /> Debts</TabsTrigger>
              <TabsTrigger value="accounts" className="data-[state=active]:bg-white text-xs gap-1"><Landmark className="h-3.5 w-3.5" /> Accounts</TabsTrigger>
            </TabsList>

            {/* --- Transactions --- */}
            <TabsContent value="transactions" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input className={`${inputCls} pl-9 w-48`} placeholder="Search..." value={txnSearch} onChange={e => setTxnSearch(e.target.value)} /></div>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                    {(["all","income","expense"] as const).map(f => <button key={f} onClick={() => setTxnFilter(f)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${txnFilter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>{f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
                  </div>
                </div>
                <Dialog open={showTxnDialog} onOpenChange={setShowTxnDialog}>
                  <DialogTrigger asChild><button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}><Plus className="h-4 w-4" /> Add Transaction</button></DialogTrigger>
                  <DialogContent className="max-w-md bg-white">
                    <DialogHeader><DialogTitle className="text-gray-900">Add Transaction</DialogTitle></DialogHeader>
                    <form onSubmit={handleTxnSubmit} className="space-y-4 mt-2">
                      <div><Label className="text-gray-600 text-sm">Type</Label><select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" value={newTxn.type} onChange={e => setNewTxn({ ...newTxn, type: e.target.value as "income"|"expense" })}><option value="income">Income</option><option value="expense">Expense</option></select></div>
                      <div><Label className="text-gray-600 text-sm">Amount ($)</Label><Input type="number" className={inputCls} value={newTxn.amount || ""} onChange={e => setNewTxn({ ...newTxn, amount: Number(e.target.value) })} required min={0.01} step="0.01" /></div>
                      <div><Label className="text-gray-600 text-sm">Date</Label><Input type="date" className={inputCls} value={newTxn.transaction_date} onChange={e => setNewTxn({ ...newTxn, transaction_date: e.target.value })} required /></div>
                      <div><Label className="text-gray-600 text-sm">Category</Label><Input className={inputCls} value={newTxn.category} onChange={e => setNewTxn({ ...newTxn, category: e.target.value })} placeholder="e.g. Commissions, Leads, Gas" required /></div>
                      <div><Label className="text-gray-600 text-sm">Account</Label><Input className={inputCls} value={newTxn.account_name} onChange={e => setNewTxn({ ...newTxn, account_name: e.target.value })} placeholder="e.g. Chase Checking" /></div>
                      <div><Label className="text-gray-600 text-sm">Memo</Label><Input className={inputCls} value={newTxn.memo} onChange={e => setNewTxn({ ...newTxn, memo: e.target.value })} placeholder="Optional note" /></div>
                      <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}>Add Transaction</button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredTxns.length === 0 ? <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"><DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No transactions yet.</p></div> : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">{["Date","Type","Amount","Category","Account","Memo",""].map(h => <TableHead key={h} className="text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</TableHead>)}</TableRow></TableHeader>
                      <TableBody>
                        {filteredTxns.slice(0, 30).map(t => (
                          <TableRow key={t.id} className="border-gray-100 hover:bg-gray-50">
                            <TableCell className="text-gray-600 whitespace-nowrap">{new Date(t.transaction_date).toLocaleDateString()}</TableCell>
                            <TableCell><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{t.type}</span></TableCell>
                            <TableCell className="font-semibold text-gray-900">${Number(t.amount).toLocaleString()}</TableCell>
                            <TableCell className="text-gray-600">{t.category}</TableCell>
                            <TableCell className="text-gray-600">{t.account_name || "—"}</TableCell>
                            <TableCell className="text-gray-500 text-sm max-w-[200px] truncate">{t.memo || "—"}</TableCell>
                            <TableCell><button onClick={() => handleDeleteTxn(t.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* --- Sales sub-tab --- */}
            <TabsContent value="sales" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[{ label: "This Week", value: salesStats.weekly }, { label: "This Month", value: salesStats.monthly }, { label: "Year to Date", value: salesStats.ytd }].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"><p className="text-sm text-gray-500">{s.label}</p><p className="text-3xl font-bold text-gray-900 mt-1">${s.value.toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Annual Premium</p></div>
                ))}
              </div>
              <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
                <DialogTrigger asChild><button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}><Plus className="h-4 w-4" /> Log a Sale</button></DialogTrigger>
                <DialogContent className="max-w-lg bg-white">
                  <DialogHeader><DialogTitle className="text-gray-900">Log a Policy Sale</DialogTitle></DialogHeader>
                  <form onSubmit={handleSaleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div><Label className="text-gray-600 text-sm">Carrier</Label><Input className={inputCls} value={newSale.carrier} onChange={e => setNewSale({ ...newSale, carrier: e.target.value })} placeholder="e.g. Nationwide" required /></div>
                    <div><Label className="text-gray-600 text-sm">Product Type</Label><Input className={inputCls} value={newSale.product_type} onChange={e => setNewSale({ ...newSale, product_type: e.target.value })} placeholder="e.g. IUL, Annuity" required /></div>
                    <div><Label className="text-gray-600 text-sm">Premium Mode</Label><select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" value={newSale.premium_mode} onChange={e => setNewSale({ ...newSale, premium_mode: e.target.value as "monthly"|"annual" })}><option value="annual">Annual</option><option value="monthly">Monthly</option></select></div>
                    <div><Label className="text-gray-600 text-sm">{newSale.premium_mode === "monthly" ? "Monthly Premium ($)" : "Annual Premium ($)"}</Label><Input type="number" className={inputCls} value={newSale.premium_amount || ""} onChange={e => setNewSale({ ...newSale, premium_amount: Number(e.target.value) })} required min={0} />{newSale.premium_mode === "monthly" && newSale.premium_amount > 0 && <p className="text-xs text-gray-400 mt-1">Annual: ${(newSale.premium_amount * 12).toLocaleString()}</p>}</div>
                    <div><Label className="text-gray-600 text-sm">Client Name (optional)</Label><Input className={inputCls} value={newSale.client_name} onChange={e => setNewSale({ ...newSale, client_name: e.target.value })} /></div>
                    <div><Label className="text-gray-600 text-sm">Notes (optional)</Label><Input className={inputCls} value={newSale.notes} onChange={e => setNewSale({ ...newSale, notes: e.target.value })} /></div>
                    <div className="col-span-2"><button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}>Submit Sale</button></div>
                  </form>
                </DialogContent>
              </Dialog>
              {sales.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Recent Sales</h2></div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">{["Date","Carrier","Product","Mode","Annual Premium","Client"].map(h => <TableHead key={h} className="text-gray-500 whitespace-nowrap font-semibold text-xs uppercase tracking-wide">{h}</TableHead>)}</TableRow></TableHeader>
                      <TableBody>{sales.slice(0,15).map(s => <TableRow key={s.id} className="border-gray-100 hover:bg-gray-50"><TableCell className="text-gray-600 whitespace-nowrap">{new Date(s.submitted_at).toLocaleDateString()}</TableCell><TableCell className="text-gray-600">{s.carrier}</TableCell><TableCell className="text-gray-600">{s.product_type}</TableCell><TableCell className="text-gray-600 capitalize">{s.premium_mode}</TableCell><TableCell className="font-semibold text-gray-900">${Number(s.annual_premium).toLocaleString()}</TableCell><TableCell className="text-gray-600">{s.client_name || "—"}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* --- Goals sub-tab --- */}
            <TabsContent value="goals" className="space-y-4">
              <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                <DialogTrigger asChild><button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}><Plus className="h-4 w-4" /> Create Goal</button></DialogTrigger>
                <DialogContent className="max-w-md bg-white">
                  <DialogHeader><DialogTitle className="text-gray-900">Set an Income Goal</DialogTitle></DialogHeader>
                  <form onSubmit={handleGoalSubmit} className="space-y-4 mt-2">
                    <div><Label className="text-gray-600 text-sm">Goal Title</Label><Input className={inputCls} value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="e.g. Q1 Income Target" required /></div>
                    <div><Label className="text-gray-600 text-sm">Target Amount ($)</Label><Input type="number" className={inputCls} value={newGoal.target_amount || ""} onChange={e => setNewGoal({ ...newGoal, target_amount: Number(e.target.value) })} required min={1} /></div>
                    <div><Label className="text-gray-600 text-sm">Target Date (optional)</Label><Input type="date" className={inputCls} value={newGoal.target_date} onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })} /></div>
                    <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}>Create Goal</button>
                  </form>
                </DialogContent>
              </Dialog>
              {goals.length === 0 ? <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"><Target className="h-12 w-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No goals yet.</p></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map(g => { const pct = Math.min((salesStats.ytd / Number(g.target_amount)) * 100, 100); return (
                    <div key={g.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                      <div className="flex items-start justify-between"><div><h3 className="font-semibold text-gray-900">{g.title}</h3>{g.target_date && <p className="text-xs text-gray-400">Due: {new Date(g.target_date).toLocaleDateString()}</p>}</div><button onClick={() => handleDeleteGoal(g.id)} className="text-xs text-gray-400 hover:text-red-500">Remove</button></div>
                      <div><div className="flex justify-between text-sm mb-1.5"><span className="text-gray-500">${salesStats.ytd.toLocaleString()} / ${Number(g.target_amount).toLocaleString()}</span><span className="font-semibold" style={{ color: BRAND }}>{pct.toFixed(0)}%</span></div><Progress value={pct} className="h-2.5" /></div>
                    </div>
                  ); })}
                </div>
              )}
            </TabsContent>

            {/* --- Debts sub-tab --- */}
            <TabsContent value="debts" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Total Debt" value={fmt(finStats.totalDebt)} icon={CreditCard} color={RED} />
                  <StatCard label="Min Payments/Mo" value={fmt(finStats.minPayments)} icon={ArrowUpDown} color={GOLD} />
                  <StatCard label="Active Debts" value={String(finStats.debtCount)} icon={CreditCard} color={BRAND} />
                </div>
              </div>
              <Dialog open={showDebtDialog} onOpenChange={setShowDebtDialog}>
                <DialogTrigger asChild><button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}><Plus className="h-4 w-4" /> Add Debt</button></DialogTrigger>
                <DialogContent className="max-w-md bg-white">
                  <DialogHeader><DialogTitle className="text-gray-900">Add Debt</DialogTitle></DialogHeader>
                  <form onSubmit={handleDebtSubmit} className="space-y-4 mt-2">
                    <div><Label className="text-gray-600 text-sm">Debt Name</Label><Input className={inputCls} value={newDebt.name} onChange={e => setNewDebt({ ...newDebt, name: e.target.value })} placeholder="e.g. Student Loan" required /></div>
                    <div><Label className="text-gray-600 text-sm">Current Balance ($)</Label><Input type="number" className={inputCls} value={newDebt.current_balance || ""} onChange={e => setNewDebt({ ...newDebt, current_balance: Number(e.target.value) })} required min={0} step="0.01" /></div>
                    <div><Label className="text-gray-600 text-sm">APR (%)</Label><Input type="number" className={inputCls} value={newDebt.apr || ""} onChange={e => setNewDebt({ ...newDebt, apr: Number(e.target.value) })} required min={0} step="0.01" /></div>
                    <div><Label className="text-gray-600 text-sm">Minimum Payment ($)</Label><Input type="number" className={inputCls} value={newDebt.minimum_payment || ""} onChange={e => setNewDebt({ ...newDebt, minimum_payment: Number(e.target.value) })} required min={0} step="0.01" /></div>
                    <div><Label className="text-gray-600 text-sm">Target Payoff Date (optional)</Label><Input type="date" className={inputCls} value={newDebt.target_payoff_date} onChange={e => setNewDebt({ ...newDebt, target_payoff_date: e.target.value })} /></div>
                    <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}>Add Debt</button>
                  </form>
                </DialogContent>
              </Dialog>
              {debts.filter(d => !d.is_paid_off).length === 0 ? <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"><CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No debts tracked.</p></div> : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader><TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">{["Name","Balance","APR","Min Payment","Target Date",""].map(h => <TableHead key={h} className="text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</TableHead>)}</TableRow></TableHeader>
                    <TableBody>{debts.filter(d => !d.is_paid_off).map(d => <TableRow key={d.id} className="border-gray-100 hover:bg-gray-50"><TableCell className="font-medium text-gray-900">{d.name}</TableCell><TableCell className="text-gray-600">${Number(d.current_balance).toLocaleString()}</TableCell><TableCell className="text-gray-600">{Number(d.apr)}%</TableCell><TableCell className="text-gray-600">${Number(d.minimum_payment).toLocaleString()}</TableCell><TableCell className="text-gray-600">{d.target_payoff_date ? new Date(d.target_payoff_date).toLocaleDateString() : "—"}</TableCell><TableCell><button onClick={() => handleDeleteDebt(d.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></TableCell></TableRow>)}</TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* --- Accounts sub-tab --- */}
            <TabsContent value="accounts" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <StatCard label="Total Balance" value={fmt(finStats.totalAssets)} icon={Landmark} color={GREEN} />
                <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
                  <DialogTrigger asChild><button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}><Plus className="h-4 w-4" /> Add Account</button></DialogTrigger>
                  <DialogContent className="max-w-md bg-white">
                    <DialogHeader><DialogTitle className="text-gray-900">Add Account</DialogTitle></DialogHeader>
                    <form onSubmit={handleAccountSubmit} className="space-y-4 mt-2">
                      <div><Label className="text-gray-600 text-sm">Account Name</Label><Input className={inputCls} value={newAccount.account_name} onChange={e => setNewAccount({ ...newAccount, account_name: e.target.value })} placeholder="e.g. Chase Checking" required /></div>
                      <div><Label className="text-gray-600 text-sm">Type</Label><select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" value={newAccount.account_type} onChange={e => setNewAccount({ ...newAccount, account_type: e.target.value })}><option value="checking">Checking</option><option value="savings">Savings</option><option value="investment">Investment</option><option value="other">Other</option></select></div>
                      <div><Label className="text-gray-600 text-sm">Balance ($)</Label><Input type="number" className={inputCls} value={newAccount.balance || ""} onChange={e => setNewAccount({ ...newAccount, balance: Number(e.target.value) })} required step="0.01" /></div>
                      <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}>Add Account</button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {accounts.length === 0 ? <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"><Landmark className="h-12 w-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No accounts yet.</p></div> : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader><TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">{["Account","Type","Balance",""].map(h => <TableHead key={h} className="text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</TableHead>)}</TableRow></TableHeader>
                    <TableBody>{accounts.map(a => <TableRow key={a.id} className="border-gray-100 hover:bg-gray-50"><TableCell className="font-medium text-gray-900">{a.account_name}</TableCell><TableCell className="text-gray-600 capitalize">{a.account_type}</TableCell><TableCell className="font-semibold text-gray-900">${Number(a.balance).toLocaleString()}</TableCell><TableCell><button onClick={() => handleDeleteAccount(a.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></TableCell></TableRow>)}</TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ===== COMMISSIONS ===== */}
        <TabsContent value="commissions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Commission Distribution by Carrier</h3>
              {carrierData.length === 0 ? <p className="text-gray-400 text-center py-8">No sales data yet.</p> : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={carrierData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {carrierData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Carrier Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-900">Carrier Breakdown</h3></div>
              {carrierData.length === 0 ? <p className="text-gray-400 text-center py-8">No data.</p> : (
                <Table>
                  <TableHeader><TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50"><TableHead className="text-gray-500 font-semibold text-xs uppercase">Carrier</TableHead><TableHead className="text-gray-500 font-semibold text-xs uppercase text-right">Premium</TableHead><TableHead className="text-gray-500 font-semibold text-xs uppercase text-right">Policies</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {carrierData.map((c, i) => {
                      const count = sales.filter(s => s.carrier === c.name).length;
                      return <TableRow key={c.name} className="border-gray-100 hover:bg-gray-50"><TableCell className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} /><span className="font-medium text-gray-900">{c.name}</span></TableCell><TableCell className="text-right font-semibold text-gray-900">${c.value.toLocaleString()}</TableCell><TableCell className="text-right text-gray-600">{count}</TableCell></TableRow>;
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ===== LEADERBOARD ===== */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}><Trophy className="h-5 w-5" style={{ color: GOLD }} /></div><div><h2 className="text-base font-semibold text-gray-900">Global Leaderboard</h2><p className="text-xs text-gray-400">Real-time rankings by annual premium</p></div></div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">{(["week","month","year"] as const).map(p => <button key={p} onClick={() => setLeaderboardPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${leaderboardPeriod === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{p === "week" ? "This Week" : p === "month" ? "This Month" : "Year to Date"}</button>)}</div>
            </div>
            {leaderboard.length === 0 ? <div className="p-8 text-center"><Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No sales recorded for this period.</p></div> : (
              <Table>
                <TableHeader><TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50"><TableHead className="text-gray-500 font-semibold text-xs uppercase w-16">Rank</TableHead><TableHead className="text-gray-500 font-semibold text-xs uppercase">Agent</TableHead><TableHead className="text-gray-500 font-semibold text-xs uppercase text-right">Total Premium</TableHead><TableHead className="text-gray-500 font-semibold text-xs uppercase text-right">Policies</TableHead></TableRow></TableHeader>
                <TableBody>{leaderboard.map((entry, idx) => { const rank = idx + 1; const isMe = entry.advisorId === advisorId; return <TableRow key={entry.advisorId} className={`border-gray-100 ${isMe ? "bg-emerald-50" : "hover:bg-gray-50"}`}><TableCell className="text-center">{getRankIcon(rank)}</TableCell><TableCell className={`font-medium ${isMe ? "text-emerald-700" : "text-gray-900"}`}>{entry.name} {isMe && <span className="text-xs font-normal text-emerald-500 ml-1">(You)</span>}</TableCell><TableCell className="text-right font-semibold text-gray-900">${entry.totalPremium.toLocaleString()}</TableCell><TableCell className="text-right text-gray-600">{entry.policyCount}</TableCell></TableRow>; })}</TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* ===== ACTIVITY ===== */}
        <TabsContent value="activity" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Lead Activity Log</h2>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50"><Download className="h-4 w-4" /> Export CSV</button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild><button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}><Plus className="h-4 w-4" /> Add Entry</button></DialogTrigger>
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
                    <div className="col-span-2"><button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND }}>Save Entry</button></div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Revenue", value: `$${(activityStats.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: GOLD },
              { label: "Clients Closed", value: String(activityStats.totalClientsClosed), icon: Users, color: BRAND },
              { label: "Avg Close Rate", value: `${activityStats.avgCloseRate.toFixed(1)}%`, icon: TrendingUp, color: BRAND },
              { label: "Avg ROI", value: `${activityStats.avgROI.toFixed(1)}%`, icon: activityStats.avgROI >= 0 ? TrendingUp : TrendingDown, color: activityStats.avgROI >= 0 ? GREEN : RED },
            ].map(s => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Conversion Funnel</h2>
            {[
              { label: "Leads Worked", value: activityStats.totalLeadsWorked, pct: 100 },
              { label: "Appointments Set", value: activityStats.totalApptsSet, pct: funnelPct(activityStats.totalApptsSet) },
              { label: "Appointments Held", value: activityStats.totalApptsHeld, pct: funnelPct(activityStats.totalApptsHeld) },
              { label: "Clients Closed", value: activityStats.totalClientsClosed, pct: funnelPct(activityStats.totalClientsClosed) },
            ].map(step => (
              <div key={step.label}><div className="flex justify-between text-sm mb-1.5"><span className="font-medium text-gray-700">{step.label}</span><span className="text-gray-400">{step.value} ({step.pct.toFixed(1)}%)</span></div><div className="h-2 rounded-full overflow-hidden bg-gray-100"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(step.pct, 100)}%`, background: BRAND }} /></div></div>
            ))}
          </div>

          {entries.length > 0 && (
            <>
              <div className="md:hidden space-y-3">
                <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
                {entries.slice(0, 10).map((e: any) => {
                  const roi = (e.total_lead_cost || 0) > 0 ? ((e.revenue - e.total_lead_cost) / e.total_lead_cost * 100) : 0;
                  return (
                    <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
                      <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-900">{e.entry_date}</span><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{e.lead_type || "—"}</span></div>
                      <div className="grid grid-cols-3 gap-2 text-center"><div><p className="text-xs text-gray-400">Leads</p><p className="text-sm font-semibold text-gray-900">{e.leads_worked}</p></div><div><p className="text-xs text-gray-400">Closed</p><p className="text-sm font-semibold text-gray-900">{e.clients_closed}</p></div><div><p className="text-xs text-gray-400">Revenue</p><p className="text-sm font-semibold text-gray-900">${Number(e.revenue).toLocaleString()}</p></div></div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100"><span className="text-xs text-gray-400">ROI</span><span className="text-sm font-bold" style={{ color: roi >= 0 ? GREEN : RED }}>{roi.toFixed(1)}%</span></div>
                    </div>
                  );
                })}
              </div>
              <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Recent Activity</h2></div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">{["Date","Lead Type","Leads","Worked","Dials","Appts Set","Appts Held","Closed","Revenue","ROI"].map(h => <TableHead key={h} className="text-gray-500 whitespace-nowrap font-semibold text-xs uppercase tracking-wide">{h}</TableHead>)}</TableRow></TableHeader>
                    <TableBody>{entries.slice(0, 20).map((e: any) => { const roi = (e.total_lead_cost || 0) > 0 ? ((e.revenue - e.total_lead_cost) / e.total_lead_cost * 100) : 0; return <TableRow key={e.id} className="border-gray-100 hover:bg-gray-50"><TableCell className="text-gray-600 whitespace-nowrap">{e.entry_date}</TableCell><TableCell className="text-gray-600">{e.lead_type || "—"}</TableCell><TableCell className="text-gray-600">{e.leads_purchased}</TableCell><TableCell className="text-gray-600">{e.leads_worked}</TableCell><TableCell className="text-gray-600">{e.dials_made}</TableCell><TableCell className="text-gray-600">{e.appointments_set}</TableCell><TableCell className="text-gray-600">{e.appointments_held}</TableCell><TableCell className="font-semibold text-gray-900">{e.clients_closed}</TableCell><TableCell className="font-semibold text-gray-900">${Number(e.revenue).toLocaleString()}</TableCell><TableCell className="font-bold" style={{ color: roi >= 0 ? GREEN : RED }}>{roi.toFixed(1)}%</TableCell></TableRow>; })}</TableBody>
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
