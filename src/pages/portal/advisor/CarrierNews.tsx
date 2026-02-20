import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Newspaper, TrendingUp, AlertCircle, Star, Eye } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";
const priorities = ["low", "normal", "high", "urgent"];
const articleTypes = ["rate_update", "product_launch", "general", "compliance", "promotion"];
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

function getPriorityBadge(p: string) {
  switch (p) { case "urgent": return "bg-red-50 text-red-700 border border-red-200"; case "high": return "bg-orange-50 text-orange-700 border border-orange-200"; case "normal": return "bg-amber-50 text-amber-700 border border-amber-200"; default: return "bg-gray-100 text-gray-600 border border-gray-200"; }
}
function getTypeIcon(type: string | null) {
  switch (type) { case "rate_update": return TrendingUp; case "compliance": return AlertCircle; default: return Newspaper; }
}
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${active ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>{label}</button>);
}

export default function CarrierNews() {
  const [news, setNews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("carrier_news").select("*, carriers(carrier_name, carrier_logo_url)").eq("status", "published").order("published_at", { ascending: false });
    setNews(data ?? []); setLoading(false);
  }

  async function incrementViews(id: string, currentViews: number) {
    await supabase.from("carrier_news").update({ views: currentViews + 1 }).eq("id", id);
    setNews(prev => prev.map(n => n.id === id ? { ...n, views: (n.views || 0) + 1 } : n));
  }

  const filteredNews = useMemo(() => {
    let filtered = news;
    if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.carriers?.carrier_name?.toLowerCase().includes(q)); }
    if (selectedPriority) filtered = filtered.filter(n => n.priority === selectedPriority);
    if (selectedType) filtered = filtered.filter(n => n.article_type === selectedType);
    return filtered;
  }, [news, searchQuery, selectedPriority, selectedType]);

  const stats = useMemo(() => ({ total: news.length, urgent: news.filter(n => n.priority === "urgent").length, rateUpdates: news.filter(n => n.article_type === "rate_update").length, productLaunches: news.filter(n => n.article_type === "product_launch").length }), [news]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carrier News &amp; Updates</h1>
        <p className="text-sm text-gray-500 mt-0.5">Stay informed about rate changes, product launches, and carrier updates</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Articles", value: stats.total, icon: Newspaper, color: BRAND_GREEN },
          { label: "Urgent Updates", value: stats.urgent, icon: AlertCircle, color: "#EF4444" },
          { label: "Rate Updates", value: stats.rateUpdates, icon: TrendingUp, color: BRAND_GREEN },
          { label: "Product Launches", value: stats.productLaunches, icon: Star, color: "#C9A84C" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by carrier, title, or content..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`pl-9 ${inputCls}`} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="All" active={!selectedPriority} onClick={() => setSelectedPriority(null)} />
            {priorities.map(p => <FilterChip key={p} label={p} active={selectedPriority === p} onClick={() => setSelectedPriority(p)} />)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="All Types" active={!selectedType} onClick={() => setSelectedType(null)} />
            {articleTypes.map(t => <FilterChip key={t} label={t.replace(/_/g, " ")} active={selectedType === t} onClick={() => setSelectedType(t)} />)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] text-center py-12"><Newspaper className="h-12 w-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No news articles match your filters</p></div>
      ) : (
        <div className="space-y-3">
          {filteredNews.map(n => {
            const TypeIcon = getTypeIcon(n.article_type);
            return (
              <div key={n.id} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px] transition-all cursor-pointer" onClick={() => incrementViews(n.id, n.views || 0)}>
                <div className="flex items-start gap-4">
                  {n.carriers?.carrier_logo_url && (<img src={n.carriers.carrier_logo_url} alt={n.carriers.carrier_name} className="w-10 h-10 rounded object-contain bg-gray-50 p-0.5 flex-shrink-0" />)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 flex-shrink-0" style={{ color: BRAND_GREEN }} />
                        <h3 className="text-base font-semibold text-gray-900">{n.title}</h3>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${getPriorityBadge(n.priority)}`}>{n.priority}</span>
                    </div>
                    {n.carriers?.carrier_name && (<p className="text-sm font-medium mt-1" style={{ color: GOLD }}>{n.carriers.carrier_name}</p>)}
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{n.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{n.views || 0} views</span>
                      <span>•</span>
                      <span>{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</span>
                      <span>•</span>
                      <span className="capitalize">{n.article_type?.replace(/_/g, " ")}</span>
                    </div>
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
