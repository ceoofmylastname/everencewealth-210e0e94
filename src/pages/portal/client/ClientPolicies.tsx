import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight } from "lucide-react";

interface Policy {
  id: string;
  carrier_name: string;
  policy_number: string;
  product_type: string;
  policy_status: string;
  death_benefit: number | null;
  cash_value: number | null;
  monthly_premium: number | null;
  premium_frequency: string | null;
  issue_date: string | null;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  lapsed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  paid_up: "bg-blue-100 text-blue-800",
};

export default function ClientPolicies() {
  const { portalUser } = usePortalAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser) return;
    loadPolicies();
  }, [portalUser]);

  // Realtime subscription for instant policy updates
  useEffect(() => {
    if (!portalUser) return;
    const channel = supabase
      .channel('client-policies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'policies',
          filter: `client_id=eq.${portalUser.id}`,
        },
        () => {
          loadPolicies();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [portalUser?.id]);

  async function loadPolicies() {
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("client_id", portalUser!.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setPolicies((data as Policy[]) ?? []);
    setLoading(false);
  }

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
        My Policies
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : policies.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No policies found.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {policies.map((p) => (
            <Link key={p.id} to={`/portal/client/policies/${p.id}`} className="block group">
              <Card className="transition-colors group-hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{p.carrier_name}</h3>
                      <p className="text-sm text-muted-foreground">#{p.policy_number} • {p.product_type.replace(/_/g, " ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[p.policy_status] || ""}>{p.policy_status}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Death Benefit</p>
                      <p className="font-medium text-foreground">{fmt(p.death_benefit)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cash Value</p>
                      <p className="font-medium text-foreground">{fmt(p.cash_value)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Premium</p>
                      <p className="font-medium text-foreground">{fmt(p.monthly_premium)}/{p.premium_frequency?.replace(/_/g, " ") || "mo"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Issue Date</p>
                      <p className="font-medium text-foreground">{p.issue_date || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
