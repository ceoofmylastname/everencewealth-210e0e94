import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Star, Shield, Building2, X, Plus, Pencil, Trash2, ExternalLink, Zap, Clock, FileText, MapPin, Users, Calendar } from "lucide-react";
import { toast } from "sonner";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";
const ALL_PRODUCTS = ["Term", "WL", "IUL", "FE", "Annuity", "DI", "LTC"];
const ALL_NICHES = ["senior", "final_expense", "simplified_issue", "fast_approval", "no_exam", "digital", "high_net_worth", "smoker", "diabetes", "accelerated_underwriting", "annuity", "preferred"];

const defaultCarrier = {
  carrier_name: "", short_code: "", am_best_rating: "", portal_url: "", carrier_logo_url: "", notes: "",
  products_offered: [] as string[], niches: [] as string[], featured: false,
  description: "", founded_year: "", employees: "", headquarters: "", phone: "", website: "",
  quotes_url: "", illustration_url: "", turnaround: "", special_products_text: "",
  underwriting_strengths: "", reparenting_email: "", reparenting_subject: "", reparenting_template: "",
};

const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

function getRatingBadge(rating: string | null) {
  if (!rating) return null;
  if (rating.startsWith("A+")) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (rating.startsWith("A")) return "bg-blue-50 text-blue-700 border border-blue-200";
  return "bg-amber-50 text-amber-700 border border-amber-200";
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${active ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>{label}</button>);
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (<button type="button" onClick={onClick} className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${active ? "text-white border-transparent" : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>{label}</button>);
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

export default function AdminCarriers() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultCarrier });

  useEffect(() => { loadCarriers(); }, []);

  async function loadCarriers() {
    const [c, d] = await Promise.all([
      supabase.from("carriers").select("*").order("carrier_name"),
      supabase.from("carrier_documents").select("carrier_id"),
    ]);
    setCarriers(c.data ?? []);
    const counts: Record<string, number> = {};
    (d.data ?? []).forEach((doc: any) => { counts[doc.carrier_id] = (counts[doc.carrier_id] || 0) + 1; });
    setDocCounts(counts);
    setLoading(false);
  }

  function openAdd() { setEditingCarrier(null); setForm({ ...defaultCarrier }); setShowDialog(true); }
  function openEdit(c: any) {
    const rep = c.reparenting_info as Record<string, any> | null;
    setEditingCarrier(c);
    setForm({
      carrier_name: c.carrier_name || "", short_code: c.short_code || "", am_best_rating: c.am_best_rating || "",
      portal_url: c.portal_url || "", carrier_logo_url: c.carrier_logo_url || "", notes: c.notes || "",
      products_offered: c.products_offered || [], niches: c.niches || [], featured: c.featured || false,
      description: c.description || "", founded_year: c.founded_year ? String(c.founded_year) : "",
      employees: c.employees || "", headquarters: c.headquarters || "", phone: c.phone || "",
      website: c.website || "", quotes_url: c.quotes_url || "", illustration_url: c.illustration_url || "",
      turnaround: c.turnaround || "", special_products_text: (c.special_products || []).join(", "),
      underwriting_strengths: c.underwriting_strengths || "",
      reparenting_email: rep?.email || "", reparenting_subject: rep?.subject || "", reparenting_template: rep?.template || "",
    });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.carrier_name.trim()) { toast.error("Carrier name is required"); return; }
    const specialProducts = form.special_products_text ? form.special_products_text.split(",").map(s => s.trim()).filter(Boolean) : null;
    const reparentingInfo = form.reparenting_email ? { email: form.reparenting_email, subject: form.reparenting_subject, template: form.reparenting_template } : null;
    const payload: any = {
      carrier_name: form.carrier_name, short_code: form.short_code || null, am_best_rating: form.am_best_rating || null,
      portal_url: form.portal_url || null, carrier_logo_url: form.carrier_logo_url || null, notes: form.notes || null,
      products_offered: form.products_offered.length ? form.products_offered : null,
      niches: form.niches.length ? form.niches : null, featured: form.featured,
      description: form.description || null, founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      employees: form.employees || null, headquarters: form.headquarters || null, phone: form.phone || null,
      website: form.website || null, quotes_url: form.quotes_url || null, illustration_url: form.illustration_url || null,
      turnaround: form.turnaround || null, special_products: specialProducts,
      underwriting_strengths: form.underwriting_strengths || null, reparenting_info: reparentingInfo,
    };
    if (editingCarrier) {
      const { error } = await supabase.from("carriers").update(payload).eq("id", editingCarrier.id);
      if (error) { toast.error("Failed to update carrier"); return; }
      toast.success("Carrier updated!");
    } else {
      const { error } = await supabase.from("carriers").insert(payload);
      if (error) { toast.error("Failed to create carrier"); return; }
      toast.success("Carrier created!");
    }
    setShowDialog(false); loadCarriers();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("carriers").delete().eq("id", id);
    if (error) { toast.error("Failed to delete carrier"); return; }
    toast.success("Carrier deleted"); loadCarriers();
  }

  const toggleFormProduct = (p: string) => setForm(prev => ({ ...prev, products_offered: prev.products_offered.includes(p) ? prev.products_offered.filter(x => x !== p) : [...prev.products_offered, p] }));
  const toggleFormNiche = (n: string) => setForm(prev => ({ ...prev, niches: prev.niches.includes(n) ? prev.niches.filter(x => x !== n) : [...prev.niches, n] }));

  const hasFilters = search || selectedProducts.length > 0 || selectedNiches.length > 0;
  const filtered = carriers.filter(c => {
    const matchesSearch = !search || c.carrier_name.toLowerCase().includes(search.toLowerCase()) || (c.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesProducts = selectedProducts.length === 0 || selectedProducts.some(p => (c.products_offered ?? []).includes(p));
    const matchesNiches = selectedNiches.length === 0 || selectedNiches.some(n => (c.niches ?? []).includes(n));
    return matchesSearch && matchesProducts && matchesNiches;
  });

  const toggleProduct = (p: string) => setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleNiche = (n: string) => setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  const clearFilters = () => { setSearch(""); setSelectedProducts([]); setSelectedNiches([]); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Carriers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add, edit, and manage {carriers.length} partnered carriers.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
          <Plus className="h-4 w-4" /> Add Carrier
        </button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">{editingCarrier ? "Edit Carrier" : "Add Carrier"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Basic Info */}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Basic Info</p>
            <div><label className="text-sm font-medium text-gray-600">Carrier Name *</label><Input value={form.carrier_name} onChange={e => setForm({ ...form, carrier_name: e.target.value })} placeholder="e.g. National Life Group" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Short Code</label><Input value={form.short_code} onChange={e => setForm({ ...form, short_code: e.target.value })} placeholder="e.g. NLG" className={inputCls} /></div>
              <div><label className="text-sm font-medium text-gray-600">AM Best Rating</label><Input value={form.am_best_rating} onChange={e => setForm({ ...form, am_best_rating: e.target.value })} placeholder="e.g. A+" className={inputCls} /></div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">Description</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Short marketing description..." className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Logo URL</label><Input value={form.carrier_logo_url} onChange={e => setForm({ ...form, carrier_logo_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>

            {/* Company Details */}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-2">Company Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Founded Year</label><Input value={form.founded_year} onChange={e => setForm({ ...form, founded_year: e.target.value })} placeholder="e.g. 1910" className={inputCls} /></div>
              <div><label className="text-sm font-medium text-gray-600">Employees</label><Input value={form.employees} onChange={e => setForm({ ...form, employees: e.target.value })} placeholder="e.g. 500+" className={inputCls} /></div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">Headquarters</label><Input value={form.headquarters} onChange={e => setForm({ ...form, headquarters: e.target.value })} placeholder="Full address" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Phone</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="1-800-..." className={inputCls} /></div>
              <div>
                <label className="text-sm font-medium text-gray-600">Turnaround</label>
                <select value={form.turnaround} onChange={e => setForm({ ...form, turnaround: e.target.value })} className={`w-full h-10 px-3 text-sm rounded-lg border ${inputCls}`}>
                  <option value="">Select...</option>
                  <option value="Fast">Fast</option>
                  <option value="Average">Average</option>
                </select>
              </div>
            </div>

            {/* URLs */}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-2">URLs & Links</p>
            <div><label className="text-sm font-medium text-gray-600">Website</label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Portal URL</label><Input value={form.portal_url} onChange={e => setForm({ ...form, portal_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Quotes URL</label><Input value={form.quotes_url} onChange={e => setForm({ ...form, quotes_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
              <div><label className="text-sm font-medium text-gray-600">Illustration URL</label><Input value={form.illustration_url} onChange={e => setForm({ ...form, illustration_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            </div>

            {/* Products & Niches */}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-2">Products & Niches</p>
            <div>
              <label className="text-sm font-medium text-gray-600">Products Offered</label>
              <div className="flex flex-wrap gap-1.5 mt-1">{ALL_PRODUCTS.map(p => <ToggleChip key={p} label={p} active={form.products_offered.includes(p)} onClick={() => toggleFormProduct(p)} />)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Niches</label>
              <div className="flex flex-wrap gap-1.5 mt-1">{ALL_NICHES.map(n => <ToggleChip key={n} label={n.replace(/_/g, " ")} active={form.niches.includes(n)} onClick={() => toggleFormNiche(n)} />)}</div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">Special Products (comma-separated)</label><Textarea value={form.special_products_text} onChange={e => setForm({ ...form, special_products_text: e.target.value })} rows={2} placeholder="Product 1, Product 2, ..." className={inputCls} /></div>

            {/* Underwriting */}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-2">Underwriting</p>
            <div><label className="text-sm font-medium text-gray-600">Underwriting Strengths</label><Textarea value={form.underwriting_strengths} onChange={e => setForm({ ...form, underwriting_strengths: e.target.value })} rows={3} placeholder="Describe key underwriting advantages..." className={inputCls} /></div>

            {/* Reparenting */}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-2">Reparenting Info</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Reparenting Email</label><Input value={form.reparenting_email} onChange={e => setForm({ ...form, reparenting_email: e.target.value })} placeholder="agents@carrier.com" className={inputCls} /></div>
              <div><label className="text-sm font-medium text-gray-600">Subject Line</label><Input value={form.reparenting_subject} onChange={e => setForm({ ...form, reparenting_subject: e.target.value })} placeholder="Reparenting Request" className={inputCls} /></div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">Template / Notes</label><Textarea value={form.reparenting_template} onChange={e => setForm({ ...form, reparenting_template: e.target.value })} rows={2} placeholder="Include: Agent Name, NPN..." className={inputCls} /></div>

            {/* Other */}
            <div><label className="text-sm font-medium text-gray-600">Notes</label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="rounded" />
              <label className="text-sm text-gray-600">Featured carrier</label>
            </div>
            <button onClick={handleSave} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>{editingCarrier ? "Update Carrier" : "Create Carrier"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search carriers..." value={search} onChange={e => setSearch(e.target.value)} className={`pl-9 ${inputCls}`} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Products</p>
          <div className="flex flex-wrap gap-2">{ALL_PRODUCTS.map(p => <FilterChip key={p} label={p} active={selectedProducts.includes(p)} onClick={() => toggleProduct(p)} />)}</div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Specialties</p>
          <div className="flex flex-wrap gap-2">{ALL_NICHES.map(n => <FilterChip key={n} label={n.replace(/_/g, " ")} active={selectedNiches.includes(n)} onClick={() => toggleNiche(n)} />)}</div>
        </div>
        {hasFilters && (<button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"><X className="h-3 w-3" /> Clear All Filters</button>)}
      </div>

      {/* Carrier Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No carriers match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(carrier => {
            const dc = docCounts[carrier.id] || 0;
            const cityState = extractCityState(carrier.headquarters);
            return (
              <div key={carrier.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all h-full flex flex-col overflow-hidden">
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
                        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{carrier.carrier_name}</p>
                        {carrier.short_code && <span className="text-[11px] text-gray-400">{carrier.short_code}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {carrier.featured && <Star className="h-4 w-4 fill-current" style={{ color: GOLD }} />}
                      <button onClick={() => openEdit(carrier)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {carrier.carrier_name}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(carrier.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {carrier.am_best_rating && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getRatingBadge(carrier.am_best_rating)}`}>AM Best: {carrier.am_best_rating}</span>
                    )}
                    {carrier.turnaround && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${carrier.turnaround === "Fast" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                        {carrier.turnaround === "Fast" ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />} {carrier.turnaround}
                      </span>
                    )}
                    {dc > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {dc} PDF{dc > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {(carrier.founded_year || cityState || carrier.employees) && (
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3 flex-wrap">
                      {carrier.founded_year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Est. {carrier.founded_year}</span>}
                      {cityState && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cityState}</span>}
                      {carrier.employees && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {carrier.employees}</span>}
                    </div>
                  )}
                </div>

                <div className="px-5 pb-3 space-y-2">
                  {carrier.products_offered && carrier.products_offered.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {carrier.products_offered.map((p: string) => (
                        <span key={p} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${BRAND_GREEN}10`, color: BRAND_GREEN, border: `1px solid ${BRAND_GREEN}25` }}>{p}</span>
                      ))}
                    </div>
                  )}
                </div>

                {carrier.underwriting_strengths && (
                  <div className="px-5 pb-3">
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{carrier.underwriting_strengths}</p>
                  </div>
                )}

                <div className="mt-auto px-5 pb-5 pt-2 flex items-center gap-2">
                  {carrier.portal_url && (
                    <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer">
                      <button className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                        <ExternalLink className="h-3 w-3" /> Portal
                      </button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
