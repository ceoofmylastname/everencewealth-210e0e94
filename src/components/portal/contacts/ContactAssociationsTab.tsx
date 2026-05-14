import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Users } from "lucide-react";
import { toast } from "sonner";

const RELATIONSHIPS = ["spouse", "parent", "child", "sibling", "business_partner", "referral", "referred_by", "other"];

interface Assoc { id: string; contact_b_id: string; relationship_label: string; other?: { id: string; first_name: string | null; last_name: string | null } }

export default function ContactAssociationsTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [assocs, setAssocs] = useState<Assoc[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [pickedId, setPickedId] = useState<string>("");
  const [pickedName, setPickedName] = useState<string>("");
  const [rel, setRel] = useState<string>("spouse");

  useEffect(() => { load(); }, [contactId]);
  async function load() {
    const { data } = await supabase.from("advisor_contact_associations")
      .select("id, contact_b_id, relationship_label").eq("contact_a_id", contactId);
    const list = (data as any[]) || [];
    if (list.length) {
      const ids = list.map((a) => a.contact_b_id);
      const { data: contacts } = await supabase.from("advisor_contacts").select("id, first_name, last_name").in("id", ids);
      const map = new Map((contacts || []).map((c: any) => [c.id, c]));
      setAssocs(list.map((a) => ({ ...a, other: map.get(a.contact_b_id) })));
    } else setAssocs([]);
  }
  async function searchContacts(q: string) {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    const { data } = await supabase.from("advisor_contacts").select("id, first_name, last_name, primary_email")
      .neq("id", contactId).or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,primary_email.ilike.%${q}%`).limit(10);
    setResults(data || []);
  }
  async function add() {
    if (!pickedId) return toast.error("Pick a contact");
    const { error } = await supabase.from("advisor_contact_associations").insert({
      advisor_id: advisorId, contact_a_id: contactId, contact_b_id: pickedId, relationship_label: rel,
    });
    if (error) return toast.error(error.message);
    toast.success("Association added");
    setPickedId(""); setPickedName(""); setSearch(""); setResults([]); load();
  }
  async function remove(id: string) {
    await supabase.from("advisor_contact_associations").delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="text-sm font-medium">Link another contact</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Input placeholder="Search contacts..." value={pickedName || search}
              onChange={(e) => { setPickedId(""); setPickedName(""); searchContacts(e.target.value); }} />
            {results.length > 0 && !pickedId && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto">
                {results.map((r) => (
                  <button key={r.id} className="w-full text-left px-3 py-2.5 min-h-[44px] hover:bg-gray-50 text-sm"
                    onClick={() => { setPickedId(r.id); setPickedName(`${r.first_name ?? ""} ${r.last_name ?? ""}`); setResults([]); }}>
                    {r.first_name} {r.last_name} <span className="text-gray-500">{r.primary_email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <select className="border rounded-md h-10 px-3 bg-white" value={rel} onChange={(e) => setRel(e.target.value)}>
            {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
          </select>
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="w-full sm:w-auto min-h-10" onClick={add} style={{ backgroundColor: "#1A4D3E" }}><Plus className="w-4 h-4 mr-1" /> Link Contact</Button>
        </div>
      </div>
      {assocs.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500 text-sm">No related contacts.</div>
      ) : assocs.map((a) => (
        <div key={a.id} className="bg-white border rounded-lg p-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Users className="w-5 h-5 text-gray-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <Link to={`/portal/advisor/contacts/${a.contact_b_id}`} className="font-medium hover:underline break-words">
                {a.other?.first_name} {a.other?.last_name}
              </Link>
              <div className="text-xs text-gray-500 capitalize">{a.relationship_label.replace("_", " ")}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="min-h-10 min-w-10 shrink-0" aria-label="Remove association" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
        </div>
      ))}
    </div>
  );
}
