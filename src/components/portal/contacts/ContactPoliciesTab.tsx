import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Link2, Unlink, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Policy {
  id: string; carrier_name: string | null; product_type: string | null;
  policy_number: string | null; monthly_modal_premium: number | null;
  face_amount: number | null; cash_value: number | null;
  issue_date: string | null; status: string | null; notes: string | null;
}

export default function ContactPoliciesTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [adding, setAdding] = useState(false);
  const [linkedPolicies, setLinkedPolicies] = useState<any[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => { load(); loadLinked(); }, [contactId]);
  async function load() {
    const { data } = await supabase.from("advisor_contact_policies").select("*").eq("contact_id", contactId).order("created_at", { ascending: false });
    setPolicies((data as Policy[]) || []);
  }
  async function loadLinked() {
    const { data } = await supabase
      .from("policies")
      .select("id, carrier_name, product_type, policy_number, policy_status, monthly_premium, death_benefit, client:portal_users!policies_client_id_fkey(first_name, last_name)")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });
    setLinkedPolicies(data || []);
  }
  async function unlinkPolicy(policyId: string) {
    if (!confirm("Unlink this policy from the contact?")) return;
    const { error } = await supabase.from("policies").update({ contact_id: null }).eq("id", policyId);
    if (error) return toast.error(error.message);
    toast.success("Policy unlinked");
    loadLinked();
  }
  async function remove(id: string) {
    if (!confirm("Delete this policy?")) return;
    const { error } = await supabase.from("advisor_contact_policies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="space-y-3">
      {/* Linked existing policies */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Linked Policies</h3>
            <p className="text-xs text-gray-500">Policies from your main Policies list linked to this contact.</p>
          </div>
          <Button size="sm" variant="outline" className="w-full sm:w-auto min-h-10" onClick={() => setPickerOpen(true)}>
            <Link2 className="w-4 h-4 mr-1" /> Link existing policy
          </Button>
        </div>
        {linkedPolicies.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">No linked policies yet.</div>
        ) : (
          <div className="space-y-2">
            {linkedPolicies.map((p) => (
              <div key={p.id} className="border rounded-md p-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="text-sm min-w-0 flex-1">
                  <div className="font-medium text-gray-900 break-words">
                    {p.carrier_name} <span className="text-gray-500 font-normal">· {p.product_type}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 break-words">
                    #{p.policy_number} · {p.policy_status}
                    {p.client && ` · Client: ${p.client.first_name} ${p.client.last_name}`}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Premium: ${p.monthly_premium?.toLocaleString() ?? "—"}/mo · Death Benefit: ${p.death_benefit?.toLocaleString() ?? "—"}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 self-end sm:self-start">
                  <Link to={`/portal/advisor/policies/${p.id}`}>
                    <Button variant="ghost" size="sm" className="min-h-10 min-w-10" aria-label="Open policy"><ExternalLink className="w-4 h-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="min-h-10 min-w-10" aria-label="Unlink policy" onClick={() => unlinkPolicy(p.id)}>
                    <Unlink className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
        <h3 className="font-semibold text-gray-900 text-sm">Quick policies (notes only)</h3>
        <Button size="sm" className="w-full sm:w-auto min-h-10" onClick={() => setAdding(true)} style={{ backgroundColor: "#1A4D3E" }}>
          <Plus className="w-4 h-4 mr-1" /> Add Policy
        </Button>
      </div>
      {adding && <PolicyForm contactId={contactId} advisorId={advisorId} onDone={() => { setAdding(false); load(); }} />}
      {policies.length === 0 && !adding ? (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-500 text-sm">No quick-entry policies yet.</div>
      ) : policies.map((p) => (
        <div key={p.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-semibold break-words">{p.carrier_name || "—"} <span className="text-gray-500 font-normal">· {p.product_type}</span></div>
              <div className="text-sm text-gray-600 mt-1">Policy #{p.policy_number || "—"}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 text-sm">
                <div><div className="text-xs text-gray-500">Monthly Premium</div><div>${p.monthly_modal_premium?.toLocaleString() ?? "—"}</div></div>
                <div><div className="text-xs text-gray-500">Face Amount</div><div>${p.face_amount?.toLocaleString() ?? "—"}</div></div>
                <div><div className="text-xs text-gray-500">Cash Value</div><div>${p.cash_value?.toLocaleString() ?? "—"}</div></div>
                <div><div className="text-xs text-gray-500">Issue Date</div><div>{p.issue_date ?? "—"}</div></div>
                <div><div className="text-xs text-gray-500">Status</div><div className="capitalize">{p.status}</div></div>
              </div>
              {p.notes && <div className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{p.notes}</div>}
            </div>
            <Button variant="ghost" size="sm" className="min-h-10 min-w-10 shrink-0" aria-label="Delete policy" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
          </div>
        </div>
      ))}
      <PolicyPicker open={pickerOpen} onOpenChange={setPickerOpen} advisorId={advisorId} contactId={contactId} onLinked={loadLinked} />
    </div>
  );
}

function PolicyPicker({ open, onOpenChange, advisorId, contactId, onLinked }: {
  open: boolean; onOpenChange: (o: boolean) => void; advisorId: string; contactId: string; onLinked: () => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase.from("policies")
      .select("id, carrier_name, product_type, policy_number, policy_status, contact_id, client:portal_users!policies_client_id_fkey(first_name, last_name)")
      .eq("advisor_id", advisorId)
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, [open, advisorId]);

  async function pick(p: any) {
    const { error } = await supabase.from("policies").update({ contact_id: contactId }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Policy linked to contact");
    onLinked();
    onOpenChange(false);
  }

  const filtered = items.filter((p) => {
    if (!q.trim()) return true;
    const hay = `${p.carrier_name} ${p.policy_number} ${p.product_type} ${p.client?.first_name || ""} ${p.client?.last_name || ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Link an existing policy</DialogTitle>
          <DialogDescription>Choose one of your policies to attach to this contact.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search carrier, policy #..." className="pl-9 h-11" />
        </div>
        <div className="max-h-[60vh] overflow-y-auto divide-y border rounded-md">
          {loading ? <div className="p-4 text-sm text-gray-500">Loading...</div>
          : filtered.length === 0 ? <div className="p-4 text-sm text-gray-500">No policies found.</div>
          : filtered.map((p) => (
            <button key={p.id} onClick={() => pick(p)} disabled={p.contact_id === contactId}
              className="w-full text-left px-3 py-3 min-h-[56px] hover:bg-gray-50 transition-colors disabled:opacity-50">
              <div className="font-medium text-sm text-gray-900">{p.carrier_name} · {p.product_type}</div>
              <div className="text-xs text-gray-500">
                #{p.policy_number} · {p.policy_status}
                {p.client && ` · ${p.client.first_name} ${p.client.last_name}`}
                {p.contact_id === contactId && " · already linked"}
                {p.contact_id && p.contact_id !== contactId && " · linked to another contact"}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PolicyForm({ contactId, advisorId, onDone }: { contactId: string; advisorId: string; onDone: () => void }) {
  const [f, setF] = useState({
    carrier_name: "", product_type: "", policy_number: "",
    monthly_modal_premium: "", face_amount: "", cash_value: "",
    issue_date: "", status: "active", notes: "",
  });
  async function save() {
    const payload: any = {
      contact_id: contactId, advisor_id: advisorId,
      carrier_name: f.carrier_name || null, product_type: f.product_type || null,
      policy_number: f.policy_number || null,
      monthly_modal_premium: f.monthly_modal_premium ? Number(f.monthly_modal_premium) : null,
      face_amount: f.face_amount ? Number(f.face_amount) : null,
      cash_value: f.cash_value ? Number(f.cash_value) : null,
      issue_date: f.issue_date || null, status: f.status, notes: f.notes || null,
    };
    const { error } = await supabase.from("advisor_contact_policies").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Policy added");
    onDone();
  }
  const u = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input placeholder="Carrier name" value={f.carrier_name} onChange={u("carrier_name")} />
        <Input placeholder="Product type (IUL, Term, Annuity...)" value={f.product_type} onChange={u("product_type")} />
        <Input placeholder="Policy number" value={f.policy_number} onChange={u("policy_number")} />
        <Input placeholder="Monthly modal premium" type="number" value={f.monthly_modal_premium} onChange={u("monthly_modal_premium")} />
        <Input placeholder="Face amount" type="number" value={f.face_amount} onChange={u("face_amount")} />
        <Input placeholder="Cash value" type="number" value={f.cash_value} onChange={u("cash_value")} />
        <Input placeholder="Issue date" type="date" value={f.issue_date} onChange={u("issue_date")} />
        <select className="border rounded-md h-10 px-3 bg-white" value={f.status} onChange={(e) => setF((p) => ({ ...p, status: e.target.value }))}>
          <option value="active">Active</option><option value="pending">Pending</option>
          <option value="lapsed">Lapsed</option><option value="cancelled">Cancelled</option><option value="paid_up">Paid up</option>
        </select>
      </div>
      <textarea className="w-full border rounded-md p-2 text-sm" rows={2} placeholder="Notes" value={f.notes} onChange={(e) => setF((p) => ({ ...p, notes: e.target.value }))} />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-10" onClick={onDone}>Cancel</Button>
        <Button size="sm" className="w-full sm:w-auto min-h-10" onClick={save} style={{ backgroundColor: "#1A4D3E" }}>Save</Button>
      </div>
    </div>
  );
}
