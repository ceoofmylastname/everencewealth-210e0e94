import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Star, ExternalLink, Shield, Building2, X } from "lucide-react";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

const ALL_PRODUCTS = ["Term", "WL", "IUL", "FE", "Annuity", "DI", "LTC"];
const ALL_NICHES = ["senior", "final_expense", "simplified_issue", "fast_approval", "no_exam", "digital", "high_net_worth", "smoker", "diabetes", "accelerated_underwriting", "annuity", "preferred"];

function getRatingStyle(rating: string | null) {
  if (!rating) return {};
  if (rating.startsWith("A+")) return { background: "hsla(160,48%,21%,0.3)", color: "hsla(160,60%,65%,1)", border: "1px solid hsla(160,48%,21%,0.5)" };
  if (rating.startsWith("A")) return { background: "hsla(220,60%,30%,0.3)", color: "hsla(220,70%,70%,1)", border: "1px solid hsla(220,60%,30%,0.5)" };
  return { background: "hsla(51,78%,65%,0.1)", color: "hsla(51,78%,65%,1)", border: "1px solid hsla(51,78%,65%,0.3)" };
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

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
      style={active
        ? { background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }
        : { background: "hsla(0,0%,100%,0.04)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.08)" }
      }
    >
      {label}
    </button>
  );
}

export default function CarrierDirectory() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("carriers").select("*").order("carrier_name").then(({ data }) => { setCarriers(data ?? []); setLoading(false); });
  }, []);

  const hasFilters = search || selectedProducts.length > 0 || selectedNiches.length > 0;

  const filtered = carriers.filter(c => {
    const matchesSearch = !search || c.carrier_name.toLowerCase().includes(search.toLowerCase()) || (c.notes ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesProducts = selectedProducts.length === 0 || selectedProducts.some(p => (c.products_offered ?? []).includes(p));
    const matchesNiches = selectedNiches.length === 0 || selectedNiches.some(n => (c.niches ?? []).includes(n));
    return matchesSearch && matchesProducts && matchesNiches;
  });

  const toggleProduct = (p: string) => setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleNiche = (n: string) => setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  const clearFilters = () => { setSearch(""); setSelectedProducts([]); setSelectedNiches([]); };

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <MeshOrbs />
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
              style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
              CARRIER NETWORK
            </span>
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Carrier Directory</h1>
          <p className="text-white/50 mt-1 text-sm">Browse {carriers.length} partnered carriers and their product offerings.</p>
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl p-5 space-y-4" style={GLASS}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input placeholder="Search carriers by name or description..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-white/40">Products</p>
            <div className="flex flex-wrap gap-2">
              {ALL_PRODUCTS.map(p => <FilterChip key={p} label={p} active={selectedProducts.includes(p)} onClick={() => toggleProduct(p)} />)}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-white/40">Specialties</p>
            <div className="flex flex-wrap gap-2">
              {ALL_NICHES.map(n => <FilterChip key={n} label={n.replace(/_/g, " ")} active={selectedNiches.includes(n)} onClick={() => toggleNiche(n)} />)}
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors">
              <X className="h-3 w-3" /> Clear All Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl" style={GLASS}>
            <Building2 className="h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/50 font-medium">No carriers match your filters</p>
            <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-colors"
              style={{ background: "hsla(0,0%,100%,0.05)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(carrier => (
              <div key={carrier.id} className="rounded-2xl p-5 flex flex-col transition-all h-full" style={GLASS}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = `1px solid hsla(0,0%,100%,0.14)`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = "1px solid hsla(0,0%,100%,0.08)"}>
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {carrier.carrier_logo_url ? (
                      <img src={carrier.carrier_logo_url} alt={carrier.carrier_name} className="h-10 w-10 rounded object-contain" />
                    ) : (
                      <div className="h-10 w-10 rounded flex items-center justify-center" style={{ background: GOLD_BG }}>
                        <Shield className="h-5 w-5" style={{ color: GOLD }} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        {carrier.carrier_name}
                        {carrier.short_code && <span className="text-xs text-white/40 ml-1">({carrier.short_code})</span>}
                      </p>
                    </div>
                  </div>
                  {carrier.featured && <Star className="h-4 w-4 fill-current shrink-0" style={{ color: GOLD }} />}
                </div>

                {/* AM Best */}
                {carrier.am_best_rating && (
                  <span className="text-xs w-fit mb-2 px-2 py-0.5 rounded-full font-medium" style={getRatingStyle(carrier.am_best_rating)}>
                    AM Best: {carrier.am_best_rating}
                  </span>
                )}

                {/* Products */}
                {carrier.products_offered && carrier.products_offered.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {carrier.products_offered.map((p: string) => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "hsla(0,0%,100%,0.06)", color: "hsla(0,0%,100%,0.6)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {carrier.notes && <p className="text-xs text-white/40 line-clamp-2 mb-3">{carrier.notes}</p>}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <Link to={`/portal/advisor/carriers/${carrier.id}`} className="flex-1">
                    <button className="w-full py-1.5 rounded-lg text-xs font-medium transition-all text-white/60 hover:text-white"
                      style={{ background: "hsla(0,0%,100%,0.05)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
                      View Details
                    </button>
                  </Link>
                  {carrier.portal_url && (
                    <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                        style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                        <ExternalLink className="h-3 w-3" /> Portal
                      </button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
