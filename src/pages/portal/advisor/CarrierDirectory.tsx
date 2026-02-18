import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Star, ExternalLink, Shield, Building2, X } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";

const ALL_PRODUCTS = ["Term", "WL", "IUL", "FE", "Annuity", "DI", "LTC"];
const ALL_NICHES = ["senior", "final_expense", "simplified_issue", "fast_approval", "no_exam", "digital", "high_net_worth", "smoker", "diabetes", "accelerated_underwriting", "annuity", "preferred"];

function getRatingBadge(rating: string | null) {
  if (!rating) return null;
  if (rating.startsWith("A+")) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (rating.startsWith("A")) return "bg-blue-50 text-blue-700 border border-blue-200";
  return "bg-amber-50 text-amber-700 border border-amber-200";
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
        active ? "border-transparent text-white" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
      }`}
      style={active ? { background: BRAND_GREEN } : {}}
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carrier Directory</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse {carriers.length} partnered carriers and their product offerings.</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search carriers by name or description..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Products</p>
          <div className="flex flex-wrap gap-2">
            {ALL_PRODUCTS.map(p => <FilterChip key={p} label={p} active={selectedProducts.includes(p)} onClick={() => toggleProduct(p)} />)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {ALL_NICHES.map(n => <FilterChip key={n} label={n.replace(/_/g, " ")} active={selectedNiches.includes(n)} onClick={() => toggleNiche(n)} />)}
          </div>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
            <X className="h-3 w-3" /> Clear All Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No carriers match your filters</p>
          <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(carrier => (
            <div key={carrier.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-gray-200 transition-all h-full">
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {carrier.carrier_logo_url ? (
                    <img src={carrier.carrier_logo_url} alt={carrier.carrier_name} className="h-10 w-10 rounded object-contain bg-gray-50 p-0.5" />
                  ) : (
                    <div className="h-10 w-10 rounded flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
                      <Shield className="h-5 w-5" style={{ color: BRAND_GREEN }} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {carrier.carrier_name}
                      {carrier.short_code && <span className="text-xs text-gray-400 ml-1">({carrier.short_code})</span>}
                    </p>
                  </div>
                </div>
                {carrier.featured && <Star className="h-4 w-4 fill-current shrink-0" style={{ color: GOLD }} />}
              </div>

              {/* AM Best */}
              {carrier.am_best_rating && (
                <span className={`text-xs w-fit mb-2 px-2.5 py-0.5 rounded-full font-medium ${getRatingBadge(carrier.am_best_rating)}`}>
                  AM Best: {carrier.am_best_rating}
                </span>
              )}

              {/* Products */}
              {carrier.products_offered && carrier.products_offered.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {carrier.products_offered.map((p: string) => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{p}</span>
                  ))}
                </div>
              )}

              {carrier.notes && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{carrier.notes}</p>}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-2">
                <Link to={`/portal/advisor/carriers/${carrier.id}`} className="flex-1">
                  <button className="w-full py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
                    View Details
                  </button>
                </Link>
                {carrier.portal_url && (
                  <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
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
  );
}
