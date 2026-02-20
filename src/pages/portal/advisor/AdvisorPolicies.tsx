import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Eye, Pencil, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";

const BRAND_GREEN = "#1A4D3E";

interface Policy {
  id: string; client_id: string; advisor_id: string; carrier_name: string;
  policy_number: string; product_type: string; policy_status: string;
  death_benefit: number | null; cash_value: number | null; monthly_premium: number | null;
  issue_date: string | null; created_at: string;
  client?: { first_name: string; last_name: string };
}

interface AdvisorInfo {
  id: string;
  first_name: string;
  last_name: string;
  portal_user_id: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    lapsed: "bg-red-50 text-red-700 border border-red-200",
    cancelled: "bg-gray-100 text-gray-600 border border-gray-200",
    paid_up: "bg-blue-50 text-blue-700 border border-blue-200",
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${styles[status] || "bg-gray-100 text-gray-600 border border-gray-200"}`}>
      {status}
    </span>
  );
}

export default function AdvisorPolicies() {
  const { portalUser } = usePortalAuth();
  const [searchParams] = useSearchParams();
  const clientFilter = searchParams.get("client");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [advisors, setAdvisors] = useState<AdvisorInfo[]>([]);
  const [advisorFilter, setAdvisorFilter] = useState<string>("all");
  const [advisorNameMap, setAdvisorNameMap] = useState<Record<string, string>>({});

  const isAdmin = portalUser?.role === "admin";

  useEffect(() => { if (!portalUser) return; loadPolicies(); }, [portalUser, clientFilter]);

  async function loadPolicies() {
    try {
      if (isAdmin) {
        // Admin: load all advisors and all policies
        const { data: allAdvisors } = await supabase.from("advisors").select("id, first_name, last_name, portal_user_id");
        const advisorList = (allAdvisors as AdvisorInfo[]) ?? [];
        setAdvisors(advisorList);
        const nameMap: Record<string, string> = {};
        advisorList.forEach((a) => { nameMap[a.id] = `${a.first_name} ${a.last_name}`; });
        setAdvisorNameMap(nameMap);

        let query = supabase.from("policies").select("*, client:portal_users!policies_client_id_fkey(first_name, last_name)").order("created_at", { ascending: false });
        if (clientFilter) query = query.eq("client_id", clientFilter);
        const { data, error } = await query;
        if (error) throw error;
        setPolicies((data as Policy[]) ?? []);
      } else {
        // Advisor: only their own policies
        const { data: advisor } = await supabase.from("advisors").select("id").eq("portal_user_id", portalUser!.id).maybeSingle();
        if (!advisor) { setLoading(false); return; }
        let query = supabase.from("policies").select("*, client:portal_users!policies_client_id_fkey(first_name, last_name)").eq("advisor_id", advisor.id).order("created_at", { ascending: false });
        if (clientFilter) query = query.eq("client_id", clientFilter);
        const { data, error } = await query;
        if (error) throw error;
        setPolicies((data as Policy[]) ?? []);
      }
    } catch (err) { console.error("Error loading policies:", err); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    const { error } = await supabase.from("policies").delete().eq("id", id);
    if (error) { toast.error("Failed to delete policy"); } else { toast.success("Policy deleted"); setPolicies((prev) => prev.filter((p) => p.id !== id)); }
  }

  const filtered = policies.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = p.carrier_name.toLowerCase().includes(q) || p.policy_number.toLowerCase().includes(q) || p.product_type.toLowerCase().includes(q) ||
      (p.client && `${p.client.first_name} ${p.client.last_name}`.toLowerCase().includes(q));
    const matchesAdvisor = !isAdmin || advisorFilter === "all" || p.advisor_id === advisorFilter;
    return matchesSearch && matchesAdvisor;
  });

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
          <p className="text-sm text-gray-500 mt-0.5">{policies.length} total policies</p>
        </div>
        <Link to="/portal/advisor/policies/new">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
            <Plus className="h-4 w-4" /> New Policy
          </button>
        </Link>
      </div>

      {/* Search + Advisor Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search policies..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg" />
        </div>
        {isAdmin && advisors.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="text-sm border border-gray-200 rounded-lg p-2 bg-white text-gray-900"
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
            >
              <option value="all">All Advisors</option>
              {advisors.map((a) => (
                <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No policies found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((policy) => (
            <div key={policy.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{policy.carrier_name}</span>
                    <StatusBadge status={policy.policy_status} />
                    {isAdmin && advisorNameMap[policy.advisor_id] && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        {advisorNameMap[policy.advisor_id]}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 space-x-3">
                    <span>#{policy.policy_number}</span>
                    <span>{policy.product_type}</span>
                    {policy.client && <span>• {policy.client.first_name} {policy.client.last_name}</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                    <span>Death Benefit: <span className="text-gray-700 font-medium">{fmt(policy.death_benefit)}</span></span>
                    <span>Cash Value: <span className="text-gray-700 font-medium">{fmt(policy.cash_value)}</span></span>
                    <span>Premium: <span className="text-gray-700 font-medium">{fmt(policy.monthly_premium)}/mo</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link to={`/portal/advisor/policies/${policy.id}`}>
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link to={`/portal/advisor/policies/${policy.id}/edit`}>
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(policy.id)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
