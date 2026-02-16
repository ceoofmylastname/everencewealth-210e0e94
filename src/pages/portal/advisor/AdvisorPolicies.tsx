import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Policy {
  id: string;
  client_id: string;
  advisor_id: string;
  carrier_name: string;
  policy_number: string;
  product_type: string;
  policy_status: string;
  death_benefit: number | null;
  cash_value: number | null;
  monthly_premium: number | null;
  issue_date: string | null;
  created_at: string;
  client?: { first_name: string; last_name: string };
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  lapsed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  paid_up: "bg-blue-100 text-blue-800",
};

export default function AdvisorPolicies() {
  const { portalUser } = usePortalAuth();
  const [searchParams] = useSearchParams();
  const clientFilter = searchParams.get("client");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!portalUser) return;
    loadPolicies();
  }, [portalUser, clientFilter]);

  async function loadPolicies() {
    try {
      const { data: advisor } = await supabase
        .from("advisors")
        .select("id")
        .eq("portal_user_id", portalUser!.id)
        .maybeSingle();

      if (!advisor) { setLoading(false); return; }

      let query = supabase
        .from("policies")
        .select("*, client:portal_users!policies_client_id_fkey(first_name, last_name)")
        .eq("advisor_id", advisor.id)
        .order("created_at", { ascending: false });

      if (clientFilter) {
        query = query.eq("client_id", clientFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPolicies((data as Policy[]) ?? []);
    } catch (err) {
      console.error("Error loading policies:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    const { error } = await supabase.from("policies").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete policy");
    } else {
      toast.success("Policy deleted");
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const filtered = policies.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.carrier_name.toLowerCase().includes(q) ||
      p.policy_number.toLowerCase().includes(q) ||
      p.product_type.toLowerCase().includes(q) ||
      (p.client && `${p.client.first_name} ${p.client.last_name}`.toLowerCase().includes(q))
    );
  });

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Policies
          </h1>
          <p className="text-muted-foreground mt-1">{policies.length} total policies</p>
        </div>
        <Button asChild>
          <Link to="/portal/advisor/policies/new"><Plus className="h-4 w-4 mr-2" />New Policy</Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search policies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No policies found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((policy) => (
            <Card key={policy.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">{policy.carrier_name}</span>
                      <Badge variant="secondary" className={statusColors[policy.policy_status] || ""}>{policy.policy_status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-x-3">
                      <span>#{policy.policy_number}</span>
                      <span>{policy.product_type}</span>
                      {policy.client && <span>• {policy.client.first_name} {policy.client.last_name}</span>}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Death Benefit: {fmt(policy.death_benefit)}</span>
                      <span>Cash Value: {fmt(policy.cash_value)}</span>
                      <span>Premium: {fmt(policy.monthly_premium)}/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/portal/advisor/policies/${policy.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/portal/advisor/policies/${policy.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(policy.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
