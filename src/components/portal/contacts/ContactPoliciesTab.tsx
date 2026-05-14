import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Policy {
  id: string; carrier_name: string | null; product_type: string | null;
  policy_number: string | null; monthly_modal_premium: number | null;
  face_amount: number | null; cash_value: number | null;
  issue_date: string | null; status: string | null; notes: string | null;
}

export default function ContactPoliciesTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => { load(); }, [contactId]);
  async function load() {
    const { data } = await supabase.from("advisor_contact_policies").select("*").eq("contact_id", contactId).order("created_at", { ascending: false });
    setPolicies((data as Policy[]) || []);
  }
  async function remove(id: string) {
    if (!confirm("Delete this policy?")) return;
    const { error } = await supabase.from("advisor_contact_policies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)} style={{ backgroundColor: "#1A4D3E" }}>
          <Plus className="w-4 h-4 mr-1" /> Add Policy
        </Button>
      </div>
      {adding && <PolicyForm contactId={contactId} advisorId={advisorId} onDone={() => { setAdding(false); load(); }} />}
      {policies.length === 0 && !adding ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500 text-sm">No policies yet.</div>
      ) : policies.map((p) => (
        <div key={p.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{p.carrier_name || "—"} <span className="text-gray-500 font-normal">· {p.product_type}</span></div>
              <div className="text-sm text-gray-600 mt-1">Policy #{p.policy_number || "—"}</div>
              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div><div className="text-xs text-gray-500">Monthly Premium</div><div>${p.monthly_modal_premium?.toLocaleString() ?? "—"}</div></div>
                <div><div className="text-xs text-gray-500">Face Amount</div><div>${p.face_amount?.toLocaleString() ?? "—"}</div></div>
                <div><div className="text-xs text-gray-500">Cash Value</div><div>${p.cash_value?.toLocaleString() ?? "—"}</div></div>
                <div><div className="text-xs text-gray-500">Issue Date</div><div>{p.issue_date ?? "—"}</div></div>
                <div><div className="text-xs text-gray-500">Status</div><div className="capitalize">{p.status}</div></div>
              </div>
              {p.notes && <div className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{p.notes}</div>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
          </div>
        </div>
      ))}
    </div>
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
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Carrier name" value={f.carrier_name} onChange={u("carrier_name")} />
        <Input placeholder="Product type (IUL, Term, Annuity...)" value={f.product_type} onChange={u("product_type")} />
        <Input placeholder="Policy number" value={f.policy_number} onChange={u("policy_number")} />
        <Input placeholder="Monthly modal premium" type="number" value={f.monthly_modal_premium} onChange={u("monthly_modal_premium")} />
        <Input placeholder="Face amount" type="number" value={f.face_amount} onChange={u("face_amount")} />
        <Input placeholder="Cash value" type="number" value={f.cash_value} onChange={u("cash_value")} />
        <Input placeholder="Issue date" type="date" value={f.issue_date} onChange={u("issue_date")} />
        <select className="border rounded-md h-10 px-3" value={f.status} onChange={(e) => setF((p) => ({ ...p, status: e.target.value }))}>
          <option value="active">Active</option><option value="pending">Pending</option>
          <option value="lapsed">Lapsed</option><option value="cancelled">Cancelled</option><option value="paid_up">Paid up</option>
        </select>
      </div>
      <textarea className="w-full border rounded-md p-2 text-sm" rows={2} placeholder="Notes" value={f.notes} onChange={(e) => setF((p) => ({ ...p, notes: e.target.value }))} />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onDone}>Cancel</Button>
        <Button size="sm" onClick={save} style={{ backgroundColor: "#1A4D3E" }}>Save</Button>
      </div>
    </div>
  );
}
