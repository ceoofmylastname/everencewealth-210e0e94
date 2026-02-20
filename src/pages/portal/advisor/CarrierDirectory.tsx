import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Star, ExternalLink, Shield, Building2, X, Zap, Clock, FileText, MapPin, Users, Calendar } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";
const ALL_PRODUCTS = ["Term", "WL", "IUL", "FE", "Annuity", "DI", "LTC"];
const ALL_NICHES = ["senior", "final_expense", "simplified_issue", "fast_approval", "no_exam", "digital", "high_net_worth", "smoker", "diabetes", "accelerated_underwriting", "annuity", "preferred"];
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

function getRatingBadge(rating: string | null) {
  if (!rating) return null;
  if (rating.startsWith("A+")) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (rating.startsWith("A")) return "bg-blue-50 text-blue-700 border border-blue-200";
  return "bg-amber-50 text-amber-700 border border-amber-200";
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${active ? "border-transparent text-white" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>
      {label}
    </button>
  );
}

function extractCityState(hq: string | null): string {
  if (!hq) return "";
  const parts = hq.split(",").map(s => s.trim());
  if (parts.length >= 2) {
    const stateZip = parts[parts.length - 1];
    const city = parts[parts.length - 2];
    const state = stateZip.replace(/\d{5}(-\d{4})?/, "").trim();
    return `${city}, ${state}`.replace(/,\s*$/, "");
  }
  return hq;
}

export default function CarrierDirectory() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("carriers").select("*").order("carrier_name"),
      supabase.from("carrier_documents").select("carrier_id"),
    ]).then(([c, d]) => {
      setCarriers(c.data ?? []);
      const counts: Record<string, number> = {};
      (d.data ?? []).forEach((doc: any) => { counts[doc.carrier_id] = (counts[doc.carrier_id] || 0) + 1; });
      setDocCounts(counts);
      setLoading(false);
    });
  }, []);

  const hasFilters = search || selectedProducts.length > 0 || selectedNiches.length > 0;
  const filtered = carriers.filter(c => {
    const matchesSearch = !search || c.carrier_name.toLowerCase().includes(search.toLowerCase()) || (c.description ?? "").toLowerCase().includes(search.toLowerCase()) || (c.notes ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesProducts = selectedProducts.length === 0 || selectedProducts.some(p => (c.products_offered ?? []).includes(p));
    const matchesNiches = selectedNiches.length === 0 || selectedNiches.some(n => (c.niches ?? []).includes(n));
    return matchesSearch && matchesProducts && matchesNiches;
  });

  const toggleProduct = (p: string) => setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleNiche = (n: string) => setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  const clearFilters = () => { setSearch(""); setSelectedProducts([]); setSelectedNiches([]); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carrier Directory</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse {carriers.length} partnered carriers and their product offerings.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="relative sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search carriers..." value={search} onChange={e => setSearch(e.target.value)} className={`pl-9 ${inputCls}`} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Products</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{ALL_PRODUCTS.map(p => <FilterChip key={p} label={p} active={selectedProducts.includes(p)} onClick={() => toggleProduct(p)} />)}</div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Specialties</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{ALL_NICHES.map(n => <FilterChip key={n} label={n.replace(/_/g, " ")} active={selectedNiches.includes(n)} onClick={() => toggleNiche(n)} />)}</div>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"><X className="h-3 w-3" /> Clear All Filters</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No carriers match your filters</p>
          <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 transition-colors">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(carrier => {
            const dc = docCounts[carrier.id] || 0;
            const cityState = extractCityState(carrier.headquarters);
            return (
              <div key={carrier.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all h-full flex flex-col overflow-hidden group">
                {/* Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {carrier.carrier_logo_url ? (
                        <img src={carrier.carrier_logo_url} alt={carrier.carrier_name} className="h-11 w-11 rounded-lg object-contain bg-gray-50 p-0.5 shrink-0" />
                      ) : (
                        <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BRAND_GREEN}12` }}>
                          <Shield className="h-5 w-5" style={{ color: BRAND_GREEN }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                          {carrier.carrier_name}
                        </p>
                        {carrier.short_code && <span className="text-[11px] text-gray-400">{carrier.short_code}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {carrier.featured && <Star className="h-4 w-4 fill-current" style={{ color: GOLD }} />}
                    </div>
                  </div>

                  {/* Rating + Turnaround row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {carrier.am_best_rating && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getRatingBadge(carrier.am_best_rating)}`}>
                        AM Best: {carrier.am_best_rating}
                      </span>
                    )}
                    {carrier.turnaround && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${carrier.turnaround === "Fast" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                        {carrier.turnaround === "Fast" ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {carrier.turnaround}
                      </span>
                    )}
                    {dc > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {dc} PDF{dc > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Quick stats */}
                  {(carrier.founded_year || cityState || carrier.employees) && (
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3 flex-wrap">
                      {carrier.founded_year && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Est. {carrier.founded_year}</span>
                      )}
                      {cityState && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cityState}</span>
                      )}
                      {carrier.employees && (
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {carrier.employees}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Products + Niches */}
                <div className="px-5 pb-3 space-y-2">
                  {carrier.products_offered && carrier.products_offered.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {carrier.products_offered.map((p: string) => (
                        <span key={p} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${BRAND_GREEN}10`, color: BRAND_GREEN, border: `1px solid ${BRAND_GREEN}25` }}>{p}</span>
                      ))}
                    </div>
                  )}
                  {carrier.niches && carrier.niches.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {carrier.niches.slice(0, 4).map((n: string) => (
                        <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 capitalize">{n.replace(/_/g, " ")}</span>
                      ))}
                      {carrier.niches.length > 4 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-400">+{carrier.niches.length - 4}</span>}
                    </div>
                  )}
                </div>

                {/* UW Strengths summary */}
                {carrier.underwriting_strengths && (
                  <div className="px-5 pb-3">
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{carrier.underwriting_strengths}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto px-5 pb-5 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Link to={`/portal/advisor/carriers/${carrier.id}`} className="flex-1">
                    <button className="w-full py-2.5 sm:py-2 rounded-lg text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all touch-manipulation">
                      View Details
                    </button>
                  </Link>
                  <div className="flex gap-2">
                    {carrier.portal_url && (
                      <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                        <button className="w-full px-3 py-2.5 sm:py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 text-white transition-all hover:opacity-90 touch-manipulation" style={{ background: BRAND_GREEN }}>
                          <ExternalLink className="h-3 w-3" /> Portal
                        </button>
                      </a>
                    )}
                    {carrier.quotes_url && (
                      <a href={carrier.quotes_url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                        <button className="w-full px-3 py-2.5 sm:py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 text-white transition-all hover:opacity-90 bg-blue-600 hover:bg-blue-700 touch-manipulation">
                          Quote
                        </button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
