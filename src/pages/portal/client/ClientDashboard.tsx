import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderOpen, ArrowUpRight, TrendingUp } from "lucide-react";

interface PolicySummary {
  id: string;
  carrier_name: string;
  policy_number: string;
  product_type: string;
  policy_status: string;
  death_benefit: number | null;
  cash_value: number | null;
}

export default function ClientDashboard() {
  const { portalUser } = usePortalAuth();
  const [policies, setPolicies] = useState<PolicySummary[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser) return;
    loadData();
  }, [portalUser]);

  async function loadData() {
    try {
      const [policiesRes, docsRes] = await Promise.all([
        supabase.from("policies").select("id, carrier_name, policy_number, product_type, policy_status, death_benefit, cash_value").eq("client_id", portalUser!.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("portal_documents").select("id", { count: "exact", head: true }).eq("client_id", portalUser!.id).eq("is_client_visible", true),
      ]);
      setPolicies((policiesRes.data as PolicySummary[]) ?? []);
      setDocCount(docsRes.count ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "pending": return "bg-amber-500";
      case "lapsed": return "bg-destructive";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-primary p-6 sm:p-8 text-primary-foreground">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">
          Welcome, {portalUser?.first_name}
        </h1>
        <p className="mt-1 text-primary-foreground/70 text-sm sm:text-base">
          Your personal insurance portal — everything in one place.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link to="/portal/client/policies">
          <div className="group rounded-2xl bg-primary/10 border border-primary/20 p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : policies.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Active Policies</p>
          </div>
        </Link>
        <Link to="/portal/client/documents">
          <div className="group rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-amber-600" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : docCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Documents</p>
          </div>
        </Link>
      </div>

      {/* Recent Policies */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Policies</h2>
          <Link to="/portal/client/policies" className="text-sm text-primary hover:underline font-medium">
            View all
          </Link>
        </div>
        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : policies.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No policies yet.</p>
          ) : (
            <div className="space-y-3">
              {policies.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{p.carrier_name}</p>
                      <p className="text-xs text-muted-foreground">#{p.policy_number} · {p.product_type.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Benefit</p>
                      <p className="text-sm font-semibold text-foreground">{fmt(p.death_benefit)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${statusColor(p.policy_status)}`} />
                      <span className="text-xs text-muted-foreground capitalize">{p.policy_status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
