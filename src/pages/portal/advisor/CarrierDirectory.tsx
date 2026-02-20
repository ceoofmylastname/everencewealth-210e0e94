import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Star, ExternalLink, Shield, Building2, X, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";

const ALL_PRODUCTS = ["Term", "WL", "IUL", "FE", "Annuity", "DI", "LTC"];
const ALL_NICHES = ["senior", "final_expense", "simplified_issue", "fast_approval", "no_exam", "digital", "high_net_worth", "smoker", "diabetes", "accelerated_underwriting", "annuity", "preferred"];

const defaultCarrier = { carrier_name: "", short_code: "", am_best_rating: "", portal_url: "", carrier_logo_url: "", notes: "", products_offered: [] as string[], niches: [] as string[], featured: false };
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

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${active ? "text-white border-transparent" : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>
      {label}
    </button>
  );
}

export default function CarrierDirectory() {
  const { portalUser } = usePortalAuth();
  const isAdmin = portalUser?.role === "admin";
  const [carriers, setCarriers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultCarrier });

  useEffect(() => {
    loadCarriers();
  }, []);

  async function loadCarriers() {
    const { data } = await supabase.from("carriers").select("*").order("carrier_name");
    setCarriers(data ?? []);
    setLoading(false);
  }

  function openAdd() { setEditingCarrier(null); setForm({ ...defaultCarrier }); setShowDialog(true); }
  function openEdit(c: any) {
    setEditingCarrier(c);
    setForm({ carrier_name: c.carrier_name || "", short_code: c.short_code || "", am_best_rating: c.am_best_rating || "", portal_url: c.portal_url || "", carrier_logo_url: c.carrier_logo_url || "", notes: c.notes || "", products_offered: c.products_offered || [], niches: c.niches || [], featured: c.featured || false });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.carrier_name.trim()) { toast.error("Carrier name is required"); return; }
    const payload = { ...form, products_offered: form.products_offered.length ? form.products_offered : null, niches: form.niches.length ? form.niches : null };
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrier Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse {carriers.length} partnered carriers and their product offerings.</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
            <Plus className="h-4 w-4" /> Add Carrier
          </button>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">{editingCarrier ? "Edit Carrier" : "Add Carrier"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-600">Carrier Name *</label><Input value={form.carrier_name} onChange={e => setForm({ ...form, carrier_name: e.target.value })} placeholder="e.g. National Life Group" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Short Code</label><Input value={form.short_code} onChange={e => setForm({ ...form, short_code: e.target.value })} placeholder="e.g. NLG" className={inputCls} /></div>
              <div><label className="text-sm font-medium text-gray-600">AM Best Rating</label><Input value={form.am_best_rating} onChange={e => setForm({ ...form, am_best_rating: e.target.value })} placeholder="e.g. A+" className={inputCls} /></div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">Logo URL</label><Input value={form.carrier_logo_url} onChange={e => setForm({ ...form, carrier_logo_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Portal URL</label><Input value={form.portal_url} onChange={e => setForm({ ...form, portal_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            <div>
              <label className="text-sm font-medium text-gray-600">Products Offered</label>
              <div className="flex flex-wrap gap-1.5 mt-1">{ALL_PRODUCTS.map(p => <ToggleChip key={p} label={p} active={form.products_offered.includes(p)} onClick={() => toggleFormProduct(p)} />)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Niches</label>
              <div className="flex flex-wrap gap-1.5 mt-1">{ALL_NICHES.map(n => <ToggleChip key={n} label={n.replace(/_/g, " ")} active={form.niches.includes(n)} onClick={() => toggleFormNiche(n)} />)}</div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">Notes</label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="rounded" />
              <label className="text-sm text-gray-600">Featured carrier</label>
            </div>
            <button onClick={handleSave} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>{editingCarrier ? "Update Carrier" : "Create Carrier"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search carriers by name or description..." value={search} onChange={e => setSearch(e.target.value)} className={`pl-9 ${inputCls}`} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Products</p>
          <div className="flex flex-wrap gap-2">{ALL_PRODUCTS.map(p => <FilterChip key={p} label={p} active={selectedProducts.includes(p)} onClick={() => toggleProduct(p)} />)}</div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Specialties</p>
          <div className="flex flex-wrap gap-2">{ALL_NICHES.map(n => <FilterChip key={n} label={n.replace(/_/g, " ")} active={selectedNiches.includes(n)} onClick={() => toggleNiche(n)} />)}</div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(carrier => (
            <div key={carrier.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-gray-200 transition-all h-full">
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
                <div className="flex items-center gap-1">
                  {carrier.featured && <Star className="h-4 w-4 fill-current shrink-0" style={{ color: GOLD }} />}
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(carrier)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {carrier.carrier_name}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(carrier.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
              {carrier.am_best_rating && (
                <span className={`text-xs w-fit mb-2 px-2.5 py-0.5 rounded-full font-medium ${getRatingBadge(carrier.am_best_rating)}`}>AM Best: {carrier.am_best_rating}</span>
              )}
              {carrier.products_offered && carrier.products_offered.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">{carrier.products_offered.map((p: string) => (<span key={p} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{p}</span>))}</div>
              )}
              {carrier.notes && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{carrier.notes}</p>}
              <div className="flex items-center gap-2 mt-auto pt-2">
                <Link to={`/portal/advisor/carriers/${carrier.id}`} className="flex-1">
                  <button className="w-full py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">View Details</button>
                </Link>
                {carrier.portal_url && (
                  <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}><ExternalLink className="h-3 w-3" /> Portal</button>
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
