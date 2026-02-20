import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Newspaper, TrendingUp, AlertCircle, Star, Eye, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";

const priorities = ["low", "normal", "high", "urgent"];
const articleTypes = ["rate_update", "product_launch", "general", "compliance", "promotion"];
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

const defaultForm = { title: "", content: "", carrier_id: "", article_type: "general", priority: "normal", status: "published" };

function getPriorityBadge(p: string) {
  switch (p) {
    case "urgent": return "bg-red-50 text-red-700 border border-red-200";
    case "high": return "bg-orange-50 text-orange-700 border border-orange-200";
    case "normal": return "bg-amber-50 text-amber-700 border border-amber-200";
    default: return "bg-gray-100 text-gray-600 border border-gray-200";
  }
}

function getTypeIcon(type: string | null) {
  switch (type) { case "rate_update": return TrendingUp; case "compliance": return AlertCircle; default: return Newspaper; }
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${active ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>
      {label}
    </button>
  );
}

export default function CarrierNews() {
  const { portalUser } = usePortalAuth();
  const isAdmin = portalUser?.role === "admin";
  const [news, setNews] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultForm });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [newsRes, carriersRes] = await Promise.all([
      supabase.from("carrier_news").select("*, carriers(carrier_name, carrier_logo_url)").order("published_at", { ascending: false }),
      supabase.from("carriers").select("id, carrier_name").order("carrier_name"),
    ]);
    // Admin sees all statuses, advisors only published
    const allNews = newsRes.data ?? [];
    setNews(isAdmin ? allNews : allNews.filter(n => n.status === "published"));
    setCarriers(carriersRes.data ?? []);
    setLoading(false);
  }

  function openAdd() { setEditingItem(null); setForm({ ...defaultForm }); setShowDialog(true); }
  function openEdit(n: any) {
    setEditingItem(n);
    setForm({ title: n.title, content: n.content, carrier_id: n.carrier_id || "", article_type: n.article_type || "general", priority: n.priority || "normal", status: n.status || "published" });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = { ...form, carrier_id: form.carrier_id || null, published_at: form.status === "published" ? new Date().toISOString() : null };
    if (editingItem) {
      const { error } = await supabase.from("carrier_news").update(payload).eq("id", editingItem.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("News updated!");
    } else {
      const { error } = await supabase.from("carrier_news").insert(payload);
      if (error) { toast.error("Failed to create"); return; }
      toast.success("News created!");
    }
    setShowDialog(false); loadData();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("carrier_news").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("News deleted"); loadData();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrier News &amp; Updates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stay informed about rate changes, product launches, and carrier updates</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
            <Plus className="h-4 w-4" /> Add News
          </button>
        )}
      </div>

      {/* Admin Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">{editingItem ? "Edit News" : "Create News"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-600">Title *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Content *</label><Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Carrier</label>
              <select value={form.carrier_id} onChange={e => setForm({ ...form, carrier_id: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                <option value="">None</option>
                {carriers.map(c => <option key={c.id} value={c.id}>{c.carrier_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Type</label>
                <select value={form.article_type} onChange={e => setForm({ ...form, article_type: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                  {articleTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-600">Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                <option value="published">Published</option><option value="draft">Draft</option>
              </select>
            </div>
            <button onClick={handleSave} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>{editingItem ? "Update" : "Publish"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Articles", value: stats.total, icon: Newspaper, color: BRAND_GREEN },
          { label: "Urgent Updates", value: stats.urgent, icon: AlertCircle, color: "#EF4444" },
          { label: "Rate Updates", value: stats.rateUpdates, icon: TrendingUp, color: BRAND_GREEN },
          { label: "Product Launches", value: stats.productLaunches, icon: Star, color: "#C9A84C" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
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

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-12"><Newspaper className="h-12 w-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No news articles match your filters</p></div>
      ) : (
        <div className="space-y-3">
          {filteredNews.map(n => {
            const TypeIcon = getTypeIcon(n.article_type);
            return (
              <div key={n.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all">
                <div className="flex items-start gap-4">
                  {n.carriers?.carrier_logo_url && (<img src={n.carriers.carrier_logo_url} alt={n.carriers.carrier_name} className="w-10 h-10 rounded object-contain bg-gray-50 p-0.5 flex-shrink-0" />)}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => incrementViews(n.id, n.views || 0)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 flex-shrink-0" style={{ color: BRAND_GREEN }} />
                        <h3 className="text-base font-semibold text-gray-900">{n.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getPriorityBadge(n.priority)}`}>{n.priority}</span>
                        {isAdmin && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); openEdit(n); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild><button onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this article?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(n.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                    {n.carriers?.carrier_name && (<p className="text-sm font-medium mt-1" style={{ color: GOLD }}>{n.carriers.carrier_name}</p>)}
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{n.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{n.views || 0} views</span>
                      <span>•</span>
                      <span>{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</span>
                      <span>•</span>
                      <span className="capitalize">{n.article_type?.replace(/_/g, " ")}</span>
                      {n.status !== "published" && <span className="text-orange-500 font-medium">• {n.status}</span>}
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
