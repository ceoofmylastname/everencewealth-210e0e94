import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

interface Policy {
  id: string; client_id: string; advisor_id: string; carrier_name: string;
  policy_number: string; product_type: string; policy_status: string;
  death_benefit: number | null; cash_value: number | null; monthly_premium: number | null;
  issue_date: string | null; created_at: string;
  client?: { first_name: string; last_name: string };
}

function getStatusStyle(status: string) {
  switch (status) {
    case "active": return { background: "hsla(160,48%,21%,0.3)", color: "hsla(160,60%,65%,1)", border: "1px solid hsla(160,48%,21%,0.5)" };
    case "pending": return { background: "hsla(51,78%,65%,0.1)", color: "hsla(51,78%,65%,1)", border: "1px solid hsla(51,78%,65%,0.3)" };
    case "lapsed": return { background: "hsla(0,60%,30%,0.3)", color: "hsla(0,70%,70%,1)", border: "1px solid hsla(0,60%,30%,0.5)" };
    case "cancelled": return { background: "hsla(0,0%,100%,0.06)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.1)" };
    case "paid_up": return { background: "hsla(220,60%,30%,0.3)", color: "hsla(220,70%,70%,1)", border: "1px solid hsla(220,60%,30%,0.5)" };
    default: return { background: "hsla(0,0%,100%,0.06)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.1)" };
  }
}

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

export default function AdvisorPolicies() {
  const { portalUser } = usePortalAuth();
  const [searchParams] = useSearchParams();
  const clientFilter = searchParams.get("client");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { if (!portalUser) return; loadPolicies(); }, [portalUser, clientFilter]);

  async function loadPolicies() {
    try {
      const { data: advisor } = await supabase.from("advisors").select("id").eq("portal_user_id", portalUser!.id).maybeSingle();
      if (!advisor) { setLoading(false); return; }
      let query = supabase.from("policies").select("*, client:portal_users!policies_client_id_fkey(first_name, last_name)").eq("advisor_id", advisor.id).order("created_at", { ascending: false });
      if (clientFilter) query = query.eq("client_id", clientFilter);
      const { data, error } = await query;
      if (error) throw error;
      setPolicies((data as Policy[]) ?? []);
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
    return p.carrier_name.toLowerCase().includes(q) || p.policy_number.toLowerCase().includes(q) || p.product_type.toLowerCase().includes(q) ||
      (p.client && `${p.client.first_name} ${p.client.last_name}`.toLowerCase().includes(q));
  });

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <MeshOrbs />
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                POLICY LEDGER
              </span>
            </div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Policies</h1>
            <p className="text-white/50 mt-1 text-sm">{policies.length} total policies</p>
          </div>
          <Link to="/portal/advisor/policies/new">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${GOLD_BG}`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <Plus className="h-4 w-4" /> New Policy
            </button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input placeholder="Search policies..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={GLASS}>
            <FileText className="h-12 w-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50">No policies found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((policy) => (
              <div key={policy.id} className="rounded-2xl p-4 sm:p-5 transition-all" style={GLASS}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = `1px solid hsla(0,0%,100%,0.12)`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = "1px solid hsla(0,0%,100%,0.08)"}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white">{policy.carrier_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={getStatusStyle(policy.policy_status)}>
                        {policy.policy_status}
                      </span>
                    </div>
                    <div className="text-sm text-white/40 space-x-3">
                      <span>#{policy.policy_number}</span>
                      <span>{policy.product_type}</span>
                      {policy.client && <span>• {policy.client.first_name} {policy.client.last_name}</span>}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/40">
                      <span>Death Benefit: <span className="text-white/70">{fmt(policy.death_benefit)}</span></span>
                      <span>Cash Value: <span className="text-white/70">{fmt(policy.cash_value)}</span></span>
                      <span>Premium: <span className="text-white/70">{fmt(policy.monthly_premium)}/mo</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link to={`/portal/advisor/policies/${policy.id}`}>
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        style={{ background: "hsla(0,0%,100%,0.04)" }}>
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/portal/advisor/policies/${policy.id}/edit`}>
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        style={{ background: "hsla(0,0%,100%,0.04)" }}>
                        <Pencil className="h-4 w-4" />
                      </button>
                    </Link>
                    <button onClick={() => handleDelete(policy.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: "hsla(0,0%,100%,0.04)", color: "hsla(0,70%,70%,0.7)" }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
