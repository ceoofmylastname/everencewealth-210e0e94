import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Download, FileText, Video, Megaphone, Eye, Image as ImageIcon, Copy } from "lucide-react";
import { toast } from "sonner";

const BRAND_GREEN = "#1A4D3E";
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

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
  return (<button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${active ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>{label}</button>);
}

export default function MarketingResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("marketing_resources").select("*").order("created_at", { ascending: false });
    setResources(data ?? []); setLoading(false);
  }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing Resources</h1>
        <p className="text-sm text-gray-500 mt-0.5">Access social media creatives, email templates, and recruiting materials.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Total Resources", value: stats.total, icon: Megaphone }, { label: "Creatives", value: stats.creatives, icon: ImageIcon }, { label: "Templates", value: stats.templates, icon: FileText }, { label: "Videos", value: stats.videos, icon: Video }].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BRAND_GREEN}15` }}><s.icon className="h-5 w-5" style={{ color: BRAND_GREEN }} /></div>
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5 space-y-4">
        <div className="relative sm:max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search resources or tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`pl-9 ${inputCls}`} /></div>
        <div className="space-y-2"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</p><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"><FilterChip label="All" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />{categories.map(c => <FilterChip key={c.key} label={c.label} active={selectedCategory === c.key} onClick={() => setSelectedCategory(c.key)} />)}</div></div>
        <div className="space-y-2"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</p><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"><FilterChip label="All Types" active={!selectedType} onClick={() => setSelectedType(null)} />{resourceTypes.map(t => <FilterChip key={t.key} label={t.label} active={selectedType === t.key} onClick={() => setSelectedType(t.key)} />)}</div></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] text-center py-12"><Search className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No resources match your filters</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => {
            const TypeIcon = typeIcons[r.resource_type] || FileText;
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px] transition-all">
                {r.thumbnail_url || (r.resource_type === "creative" && r.file_url) ? (<img src={r.thumbnail_url || r.file_url} alt={r.title} className="w-full h-40 object-cover" />) : (<div className="w-full h-40 flex items-center justify-center bg-gray-50"><TypeIcon className="h-12 w-12 text-gray-300" /></div>)}
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-xs px-2 py-0.5 rounded-full w-fit capitalize mb-2 bg-gray-100 text-gray-600 border border-gray-200">{r.resource_type}</span>
                  <p className="font-medium text-gray-900 truncate">{r.title}</p>
                  {r.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{r.description}</p>}
                  {r.tags && r.tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{r.tags.slice(0, 3).map((tag: string) => (<span key={tag} className="text-[10px] px-1.5 py-0 rounded-full bg-gray-50 text-gray-400 border border-gray-100">{tag}</span>))}</div>)}
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400"><Download className="h-3 w-3" />{r.download_count || 0} downloads</div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => handleDownload(r)} className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}><Download className="h-3 w-3" />Download</button>
                    {r.file_url && (<a href={r.file_url} target="_blank" rel="noopener noreferrer"><button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 transition-colors"><Eye className="h-3 w-3" />Preview</button></a>)}
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
