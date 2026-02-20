import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Download, FileText, Video, Megaphone, Eye, Image as ImageIcon, Copy, Plus, Pencil, Trash2 } from "lucide-react";
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

const defaultForm = { title: "", category: "recruiting", resource_type: "document", file_url: "", thumbnail_url: "", description: "", tags: "" };

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${active ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>{label}</button>);
}

export default function MarketingResources() {
  const { portalUser } = usePortalAuth();
  const isAdmin = portalUser?.role === "admin";
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultForm });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("marketing_resources").select("*").order("created_at", { ascending: false });
    setResources(data ?? []); setLoading(false);
  }

  function openAdd() { setEditingItem(null); setForm({ ...defaultForm }); setShowDialog(true); }
  function openEdit(r: any) {
    setEditingItem(r);
    setForm({ title: r.title || "", category: r.category || "recruiting", resource_type: r.resource_type || "document", file_url: r.file_url || "", thumbnail_url: r.thumbnail_url || "", description: r.description || "", tags: (r.tags || []).join(", ") });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = { title: form.title, category: form.category, resource_type: form.resource_type, file_url: form.file_url || null, thumbnail_url: form.thumbnail_url || null, description: form.description || null, tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : null };
    if (editingItem) {
      const { error } = await supabase.from("marketing_resources").update(payload).eq("id", editingItem.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Resource updated!");
    } else {
      const { error } = await supabase.from("marketing_resources").insert(payload);
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Resource created!");
    }
    setShowDialog(false); loadData();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("marketing_resources").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Resource deleted"); loadData();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Resources</h1>
          <p className="text-sm text-gray-500 mt-0.5">Access social media creatives, email templates, and recruiting materials.</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
            <Plus className="h-4 w-4" /> Add Resource
          </button>
        )}
      </div>

      {/* Admin Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">{editingItem ? "Edit Resource" : "Add Resource"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-600">Title *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                  {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-600">Type</label>
                <select value={form.resource_type} onChange={e => setForm({ ...form, resource_type: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                  {resourceTypes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">File URL</label><Input value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Thumbnail URL</label><Input value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Description</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Tags (comma-separated)</label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="social, recruiting, flyer" className={inputCls} /></div>
            <button onClick={handleSave} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>{editingItem ? "Update" : "Create"}</button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Total Resources", value: stats.total, icon: Megaphone }, { label: "Creatives", value: stats.creatives, icon: ImageIcon }, { label: "Templates", value: stats.templates, icon: FileText }, { label: "Videos", value: stats.videos, icon: Video }].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BRAND_GREEN}15` }}><s.icon className="h-5 w-5" style={{ color: BRAND_GREEN }} /></div>
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search resources or tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`pl-9 ${inputCls}`} /></div>
        <div className="space-y-2"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</p><div className="flex flex-wrap gap-2"><FilterChip label="All" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />{categories.map(c => <FilterChip key={c.key} label={c.label} active={selectedCategory === c.key} onClick={() => setSelectedCategory(c.key)} />)}</div></div>
        <div className="space-y-2"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</p><div className="flex flex-wrap gap-2"><FilterChip label="All Types" active={!selectedType} onClick={() => setSelectedType(null)} />{resourceTypes.map(t => <FilterChip key={t.key} label={t.label} active={selectedType === t.key} onClick={() => setSelectedType(t.key)} />)}</div></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-12"><Search className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No resources match your filters</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => {
            const TypeIcon = typeIcons[r.resource_type] || FileText;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-gray-200 transition-all relative">
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg bg-white/90 shadow hover:bg-white text-gray-500 hover:text-gray-700"><Pencil className="h-3.5 w-3.5" /></button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><button className="p-1.5 rounded-lg bg-white/90 shadow hover:bg-white text-gray-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this resource?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(r.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
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
