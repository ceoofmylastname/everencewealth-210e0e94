import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Newspaper, TrendingUp, AlertCircle, Star, Eye } from "lucide-react";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

const priorities = ["low", "normal", "high", "urgent"];
const articleTypes = ["rate_update", "product_launch", "general", "compliance", "promotion"];

function getPriorityStyle(p: string) {
  switch (p) {
    case "urgent": return { background: "hsla(0,60%,30%,0.3)", color: "hsla(0,70%,70%,1)", border: "1px solid hsla(0,60%,30%,0.5)" };
    case "high": return { background: "hsla(25,70%,30%,0.3)", color: "hsla(25,80%,70%,1)", border: "1px solid hsla(25,70%,30%,0.5)" };
    case "normal": return { background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` };
    default: return { background: "hsla(0,0%,100%,0.06)", color: "hsla(0,0%,100%,0.4)", border: "1px solid hsla(0,0%,100%,0.1)" };
  }
}

function getTypeIcon(type: string | null) {
  switch (type) {
    case "rate_update": return TrendingUp;
    case "compliance": return AlertCircle;
    default: return Newspaper;
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

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
      style={active ? { background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }
        : { background: "hsla(0,0%,100%,0.04)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
      {label}
    </button>
  );
}

export default function CarrierNews() {
  const [news, setNews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("carrier_news").select("*, carriers(carrier_name, carrier_logo_url)").eq("status", "published").order("published_at", { ascending: false })
      .then(({ data }) => { setNews(data ?? []); setLoading(false); });
  }, []);

  const filteredNews = useMemo(() => {
    let filtered = news;
    if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.carriers?.carrier_name?.toLowerCase().includes(q)); }
    if (selectedPriority) filtered = filtered.filter(n => n.priority === selectedPriority);
    if (selectedType) filtered = filtered.filter(n => n.article_type === selectedType);
    return filtered;
  }, [news, searchQuery, selectedPriority, selectedType]);

  async function incrementViews(id: string, currentViews: number) {
    await supabase.from("carrier_news").update({ views: currentViews + 1 }).eq("id", id);
    setNews(prev => prev.map(n => n.id === id ? { ...n, views: (n.views || 0) + 1 } : n));
  }

  const stats = useMemo(() => ({
    total: news.length,
    urgent: news.filter(n => n.priority === "urgent").length,
    rateUpdates: news.filter(n => n.article_type === "rate_update").length,
    productLaunches: news.filter(n => n.article_type === "product_launch").length,
  }), [news]);

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <MeshOrbs />
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
              style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>CARRIER INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Carrier News &amp; Updates</h1>
          <p className="text-white/50 mt-1 text-sm">Stay informed about rate changes, product launches, and carrier updates</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Articles", value: stats.total, icon: Newspaper, iconColor: GOLD },
            { label: "Urgent Updates", value: stats.urgent, icon: AlertCircle, iconColor: "hsla(0,70%,70%,1)" },
            { label: "Rate Updates", value: stats.rateUpdates, icon: TrendingUp, iconColor: GOLD },
            { label: "Product Launches", value: stats.productLaunches, icon: Star, iconColor: GOLD },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={GLASS}>
              <div className="p-2 rounded-lg" style={{ background: GOLD_BG }}>
                <s.icon className="h-5 w-5" style={{ color: s.iconColor }} />
              </div>
              <div>
                <p className="text-xs text-white/40">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl p-5 space-y-4" style={GLASS}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input placeholder="Search by carrier, title, or content..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/40">Priority</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All" active={!selectedPriority} onClick={() => setSelectedPriority(null)} />
              {priorities.map(p => <FilterChip key={p} label={p} active={selectedPriority === p} onClick={() => setSelectedPriority(p)} />)}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/40">Type</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All Types" active={!selectedType} onClick={() => setSelectedType(null)} />
              {articleTypes.map(t => <FilterChip key={t} label={t.replace(/_/g, " ")} active={selectedType === t} onClick={() => setSelectedType(t)} />)}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12 rounded-2xl space-y-3" style={GLASS}>
            <Newspaper className="h-12 w-12 mx-auto text-white/20" />
            <p className="text-white/50">No news articles match your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map(n => {
              const TypeIcon = getTypeIcon(n.article_type);
              return (
                <div key={n.id} className="rounded-2xl p-5 cursor-pointer transition-all" style={GLASS}
                  onClick={() => incrementViews(n.id, n.views || 0)}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = "1px solid hsla(0,0%,100%,0.14)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = "1px solid hsla(0,0%,100%,0.08)"}>
                  <div className="flex items-start gap-4">
                    {n.carriers?.carrier_logo_url && (
                      <img src={n.carriers.carrier_logo_url} alt={n.carriers.carrier_name} className="w-10 h-10 rounded object-contain flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                          <h3 className="text-base font-semibold text-white">{n.title}</h3>
                        </div>
                        <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full font-medium" style={getPriorityStyle(n.priority)}>
                          {n.priority}
                        </span>
                      </div>
                      {n.carriers?.carrier_name && (
                        <p className="text-sm font-medium mt-1" style={{ color: GOLD }}>{n.carriers.carrier_name}</p>
                      )}
                      <p className="text-sm text-white/50 mt-2 line-clamp-3">{n.content}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-white/30">
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
    </div>
  );
}
