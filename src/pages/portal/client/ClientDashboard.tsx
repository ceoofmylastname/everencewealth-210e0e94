import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderOpen, ArrowRight } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome, {portalUser?.first_name}
        </h1>
        <p className="text-muted-foreground mt-1">Your personal insurance portal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/portal/client/policies">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{loading ? "—" : policies.length}</p>
              <p className="text-sm text-muted-foreground">Policies</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/portal/client/documents">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <FolderOpen className="h-5 w-5 text-amber-600" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{loading ? "—" : docCount}</p>
              <p className="text-sm text-muted-foreground">Documents</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent policies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Policies</CardTitle>
          <Link to="/portal/client/policies" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : policies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No policies yet.</p>
          ) : (
            <div className="space-y-3">
              {policies.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground">{p.carrier_name}</p>
                    <p className="text-sm text-muted-foreground">#{p.policy_number} • {p.product_type.replace(/_/g, " ")}</p>
                  </div>
                  <div className="text-right">
                    <Badge>{p.policy_status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Benefit: {fmt(p.death_benefit)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
