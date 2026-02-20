import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ExternalLink, Wrench, Search, Lock, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BRAND_GREEN = "#1A4D3E";
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

const TOOL_TYPES = [
  { key: "quick_quote", label: "Quick Quote" }, { key: "agent_portal", label: "Agent Portal" },
  { key: "microsite", label: "Microsite" }, { key: "illustration_system", label: "Illustration System" },
  { key: "application_portal", label: "Application Portal" },
];

const defaultToolForm = { tool_name: "", tool_url: "", tool_type: "quick_quote", carrier_id: "", description: "", requires_login: false, login_instructions: "", featured: false };

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${active ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>{label}</button>);
}

export default function AdminTools() {
  const [tools, setTools] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultToolForm });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [t, cr] = await Promise.all([
      supabase.from("quoting_tools").select("*, carriers(carrier_name, carrier_logo_url)").order("tool_name"),
      supabase.from("carriers").select("id, carrier_name").order("carrier_name"),
    ]);
    setTools(t.data ?? []); setCarriers(cr.data ?? []); setLoading(false);
  }

  function openAdd() { setEditingTool(null); setForm({ ...defaultToolForm }); setShowDialog(true); }
  function openEdit(t: any) {
    setEditingTool(t);
    setForm({ tool_name: t.tool_name || "", tool_url: t.tool_url || "", tool_type: t.tool_type || "quick_quote", carrier_id: t.carrier_id || "", description: t.description || "", requires_login: t.requires_login || false, login_instructions: t.login_instructions || "", featured: t.featured || false });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.tool_name.trim()) { toast.error("Tool name is required"); return; }
    const payload = { ...form, carrier_id: form.carrier_id || null };
    if (editingTool) {
      const { error } = await supabase.from("quoting_tools").update(payload).eq("id", editingTool.id);
      if (error) { toast.error("Failed to update tool"); return; }
      toast.success("Tool updated!");
    } else {
      const { error } = await supabase.from("quoting_tools").insert(payload);
      if (error) { toast.error("Failed to create tool"); return; }
      toast.success("Tool created!");
    }
    setShowDialog(false); loadData();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("quoting_tools").delete().eq("id", id);
    if (error) { toast.error("Failed to delete tool"); return; }
    toast.success("Tool deleted"); loadData();
  }

  const filtered = useMemo(() => {
    let result = tools;
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(t => t.tool_name?.toLowerCase().includes(q) || t.carriers?.carrier_name?.toLowerCase().includes(q)); }
    if (selectedType) result = result.filter(t => t.tool_type === selectedType);
    return result;
  }, [tools, searchQuery, selectedType]);

  if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tools</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add and manage quoting tools visible to all agents.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
          <Plus className="h-4 w-4" /> Add Tool
        </button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">{editingTool ? "Edit Tool" : "Add Tool"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-600">Tool Name *</label><Input value={form.tool_name} onChange={e => setForm({ ...form, tool_name: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Tool URL *</label><Input value={form.tool_url} onChange={e => setForm({ ...form, tool_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Type</label>
                <select value={form.tool_type} onChange={e => setForm({ ...form, tool_type: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                  {TOOL_TYPES.map(tt => <option key={tt.key} value={tt.key}>{tt.label}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-600">Carrier</label>
                <select value={form.carrier_id} onChange={e => setForm({ ...form, carrier_id: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                  <option value="">None</option>
                  {carriers.map(c => <option key={c.id} value={c.id}>{c.carrier_name}</option>)}
                </select>
              </div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">Description</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.requires_login} onChange={e => setForm({ ...form, requires_login: e.target.checked })} className="rounded" />
              <label className="text-sm text-gray-600">Requires login</label>
            </div>
            {form.requires_login && (
              <div><label className="text-sm font-medium text-gray-600">Login Instructions</label><Textarea value={form.login_instructions} onChange={e => setForm({ ...form, login_instructions: e.target.value })} rows={2} className={inputCls} /></div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="rounded" />
              <label className="text-sm text-gray-600">Featured</label>
            </div>
            <button onClick={handleSave} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>{editingTool ? "Update Tool" : "Create Tool"}</button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tools..." className={`pl-9 ${inputCls}`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All" active={selectedType === null} onClick={() => setSelectedType(null)} />
          {TOOL_TYPES.map(tt => <FilterChip key={tt.key} label={tt.label} active={selectedType === tt.key} onClick={() => setSelectedType(selectedType === tt.key ? null : tt.key)} />)}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-12"><Search className="h-8 w-8 text-gray-300 mx-auto mb-2" /><p className="text-gray-500">No tools match your search.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-gray-200 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {t.carriers?.carrier_logo_url ? (<img src={t.carriers.carrier_logo_url} alt={t.carriers.carrier_name} className="h-8 w-8 object-contain rounded bg-gray-50" />) : (<div className="h-8 w-8 rounded flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}><Wrench className="h-4 w-4" style={{ color: BRAND_GREEN }} /></div>)}
                  <div className="min-w-0"><p className="font-medium text-gray-900 truncate">{t.tool_name}</p>{t.carriers?.carrier_name && <p className="text-xs text-gray-400">{t.carriers.carrier_name}</p>}</div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this tool?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-gray-100 text-gray-600 border border-gray-200">{t.tool_type?.replace(/_/g, " ")}</span>
                {t.requires_login && (<span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-white" style={{ background: BRAND_GREEN }}><Lock className="h-3 w-3" /> Login Required</span>)}
              </div>
              {t.description && <p className="text-xs text-gray-400 line-clamp-2">{t.description}</p>}
              <div className="flex-1" />
              <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                <button className="w-full py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}><ExternalLink className="h-3 w-3" /> Open Tool</button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
