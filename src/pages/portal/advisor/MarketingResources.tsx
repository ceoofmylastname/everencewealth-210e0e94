import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Download, FileText, Video, Megaphone, Eye, Image as ImageIcon, Copy } from "lucide-react";
import { toast } from "sonner";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

const categories = [
  { key: "recruiting", label: "Recruiting" }, { key: "client_acquisition", label: "Client Acquisition" },
  { key: "social_media", label: "Social Media" }, { key: "email_templates", label: "Email Templates" },
  { key: "presentations", label: "Presentations" }, { key: "brochures", label: "Brochures" }, { key: "video_content", label: "Video Content" },
];
const resourceTypes = [
  { key: "creative", label: "Creative" }, { key: "template", label: "Template" },
  { key: "video", label: "Video" }, { key: "document", label: "Document" }, { key: "script", label: "Script" },
];
const typeIcons: Record<string, React.ElementType> = { creative: ImageIcon, template: FileText, video: Video, document: FileText, script: Copy };

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
      style={active ? { background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }
        : { background: "hsla(0,0%,100%,0.04)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
      {label}
    </button>
  );
}

export default function MarketingResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("marketing_resources").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setResources(data ?? []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return resources.filter(r => (!selectedCategory || r.category === selectedCategory) && (!selectedType || r.resource_type === selectedType) && (!q || r.title?.toLowerCase().includes(q) || r.tags?.some((t: string) => t.toLowerCase().includes(q))));
  }, [resources, searchQuery, selectedCategory, selectedType]);

  const stats = useMemo(() => ({ total: resources.length, creatives: resources.filter(r => r.resource_type === "creative").length, templates: resources.filter(r => r.resource_type === "template").length, videos: resources.filter(r => r.resource_type === "video").length }), [resources]);

  async function handleDownload(r: any) {
    await supabase.from("marketing_resources").update({ download_count: (r.download_count || 0) + 1 }).eq("id", r.id);
    r.download_count = (r.download_count || 0) + 1; setResources([...resources]);
    if (r.file_url) window.open(r.file_url, "_blank");
    toast.success("Resource downloaded!");
  }

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${GOLD_BG} 0%, transparent 70%)`, filter: "blur(80px)" }} />
      </div>
      <div className="relative z-10 space-y-6">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>MARKETING</span>
          <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>Marketing Resources</h1>
          <p className="text-white/50 mt-1 text-sm">Access social media creatives, email templates, and recruiting materials.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ label: "Total Resources", value: stats.total, icon: Megaphone }, { label: "Creatives", value: stats.creatives, icon: ImageIcon }, { label: "Templates", value: stats.templates, icon: FileText }, { label: "Videos", value: stats.videos, icon: Video }].map(s => (
            <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={GLASS}>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: GOLD_BG }}>
                <s.icon className="h-5 w-5" style={{ color: GOLD }} />
              </div>
              <div><p className="text-xs text-white/40">{s.label}</p><p className="text-xl font-bold text-white">{s.value}</p></div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-5 space-y-4" style={GLASS}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input placeholder="Search resources or tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/40">Category</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />
              {categories.map(c => <FilterChip key={c.key} label={c.label} active={selectedCategory === c.key} onClick={() => setSelectedCategory(c.key)} />)}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/40">Type</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All Types" active={!selectedType} onClick={() => setSelectedType(null)} />
              {resourceTypes.map(t => <FilterChip key={t.key} label={t.label} active={selectedType === t.key} onClick={() => setSelectedType(t.key)} />)}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={GLASS}>
            <Search className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No resources match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => {
              const TypeIcon = typeIcons[r.resource_type] || FileText;
              return (
                <div key={r.id} className="rounded-2xl overflow-hidden flex flex-col" style={GLASS}>
                  {r.thumbnail_url || (r.resource_type === "creative" && r.file_url) ? (
                    <img src={r.thumbnail_url || r.file_url} alt={r.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center" style={{ background: GOLD_BG }}>
                      <TypeIcon className="h-12 w-12 opacity-30" style={{ color: GOLD }} />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs px-2 py-0.5 rounded-full w-fit capitalize mb-2"
                      style={{ background: "hsla(0,0%,100%,0.06)", color: "hsla(0,0%,100%,0.6)", border: "1px solid hsla(0,0%,100%,0.08)" }}>{r.resource_type}</span>
                    <p className="font-medium text-white truncate">{r.title}</p>
                    {r.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{r.description}</p>}
                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0 rounded-full" style={{ background: "hsla(0,0%,100%,0.04)", color: "hsla(0,0%,100%,0.4)", border: "1px solid hsla(0,0%,100%,0.06)" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-white/30">
                      <Download className="h-3 w-3" />{r.download_count || 0} downloads
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                      <button onClick={() => handleDownload(r)} className="flex-1 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all"
                        style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                        <Download className="h-3 w-3" />Download
                      </button>
                      {r.file_url && (
                        <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                          <button className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                            style={{ background: "hsla(0,0%,100%,0.05)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
                            <Eye className="h-3 w-3" />Preview
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
    </div>
  );
}
