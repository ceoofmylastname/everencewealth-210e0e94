import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Search, FileText, ClipboardList, CheckCircle, Clock, Archive, TrendingUp,
} from "lucide-react";

const BRAND_GREEN = "#1A4D3E";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#F59E0B", bg: "#FFFBEB" },
  completed: { label: "Completed", color: "#10B981", bg: "#ECFDF5" },
  reviewed: { label: "Reviewed", color: "#3B82F6", bg: "#EFF6FF" },
  archived: { label: "Archived", color: "#6B7280", bg: "#F3F4F6" },
};

export default function CNADashboard() {
  const { portalUser } = usePortalAuth();
  const [cnas, setCnas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!portalUser) return;
    loadCnas();
  }, [portalUser]);

  async function loadCnas() {
    try {
      const { data, error } = await supabase
        .from("client_needs_analysis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCnas(data ?? []);
    } catch (err) {
      console.error("Error loading CNAs:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = cnas.filter((c) => {
    const matchSearch = !search || c.applicant_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const completedThisMonth = cnas.filter(
    (c) => c.status === "completed" && c.completed_at && c.completed_at >= monthStart
  ).length;

  const avgNetWorth =
    cnas.filter((c) => c.net_worth != null).reduce((s, c) => s + Number(c.net_worth), 0) /
      (cnas.filter((c) => c.net_worth != null).length || 1) || 0;

  const pendingFollowUps = cnas.filter(
    (c) =>
      c.follow_up_tasks &&
      Array.isArray(c.follow_up_tasks) &&
      (c.follow_up_tasks as any[]).some((t: any) => !t.completed)
  ).length;

  const stats = [
    { label: "Total Analyses", value: cnas.length, icon: ClipboardList, color: BRAND_GREEN },
    { label: "Completed This Month", value: completedThisMonth, icon: CheckCircle, color: "#10B981" },
    { label: "Pending Follow-ups", value: pendingFollowUps, icon: Clock, color: "#F59E0B" },
    {
      label: "Avg Net Worth",
      value: `$${(avgNetWorth / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: "#6366F1",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Needs Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {cnas.length} analyses · {completedThisMonth} completed this month
          </p>
        </div>
        <Link to="/portal/advisor/cna/new">
          <Button className="gap-2 text-white" style={{ background: BRAND_GREEN }}>
            <Plus className="h-4 w-4" /> New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}15` }}
              >
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "draft", "completed", "reviewed", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={statusFilter === s ? { background: BRAND_GREEN } : undefined}
            >
              {s === "all" ? "All" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* CNA List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No analyses found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first Client Needs Analysis</p>
            <Link to="/portal/advisor/cna/new">
              <Button className="mt-4 gap-2 text-white" style={{ background: BRAND_GREEN }}>
                <Plus className="h-4 w-4" /> New Analysis
              </Button>
            </Link>
          </div>
        ) : (
          filtered.map((cna) => {
            const sc = statusConfig[cna.status] || statusConfig.draft;
            const retScore = cna.ai_retirement_projection?.retirement_score;
            return (
              <Link key={cna.id} to={`/portal/advisor/cna/${cna.id}`}>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                         <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {cna.applicant_name}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {sc.label}
                        </span>
                        {cna.client_id && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                            Shared
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {new Date(cna.created_at).toLocaleDateString()}
                        {cna.email && ` · ${cna.email}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {cna.net_worth != null && (
                        <div className="text-right">
                          <p className="text-gray-400">Net Worth</p>
                          <p className="font-semibold text-gray-900">
                            ${Number(cna.net_worth).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {retScore != null && (
                        <div className="text-right">
                          <p className="text-gray-400">Retirement</p>
                          <p className="font-semibold" style={{ color: retScore >= 70 ? "#10B981" : retScore >= 40 ? "#F59E0B" : "#EF4444" }}>
                            {retScore}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
