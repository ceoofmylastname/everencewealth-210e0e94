import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Appt { id: string; title: string; description: string | null; location: string | null; starts_at: string; ends_at: string | null; status: string; }

export default function ContactAppointmentsTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: "", description: "", location: "", starts_at: "", ends_at: "" });

  useEffect(() => { load(); }, [contactId]);
  async function load() {
    const { data } = await supabase.from("advisor_contact_appointments").select("*").eq("contact_id", contactId).order("starts_at", { ascending: false });
    setAppts((data as Appt[]) || []);
  }
  async function save() {
    if (!f.title || !f.starts_at) return toast.error("Title and start time required");
    const { error } = await supabase.from("advisor_contact_appointments").insert({
      contact_id: contactId, advisor_id: advisorId,
      title: f.title, description: f.description || null, location: f.location || null,
      starts_at: f.starts_at, ends_at: f.ends_at || null,
    });
    if (error) return toast.error(error.message);
    setAdding(false); setF({ title: "", description: "", location: "", starts_at: "", ends_at: "" });
    toast.success("Appointment scheduled — also visible on your dashboard");
    load();
  }
  async function remove(id: string) {
    await supabase.from("advisor_contact_appointments").delete().eq("id", id);
    load();
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="w-full sm:w-auto min-h-10" onClick={() => setAdding(!adding)} style={{ backgroundColor: "#1A4D3E" }}><Plus className="w-4 h-4 mr-1" /> Schedule</Button>
      </div>
      {adding && (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <Input placeholder="Title" value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs">Start<Input type="datetime-local" value={f.starts_at} onChange={(e) => setF((p) => ({ ...p, starts_at: e.target.value }))} /></label>
            <label className="text-xs">End<Input type="datetime-local" value={f.ends_at} onChange={(e) => setF((p) => ({ ...p, ends_at: e.target.value }))} /></label>
          </div>
          <Input placeholder="Location" value={f.location} onChange={(e) => setF((p) => ({ ...p, location: e.target.value }))} />
          <textarea className="w-full border rounded-md p-2 text-sm" rows={2} placeholder="Description" value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-10" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="w-full sm:w-auto min-h-10" onClick={save} style={{ backgroundColor: "#1A4D3E" }}>Save</Button>
          </div>
        </div>
      )}
      {appts.length === 0 && !adding ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500 text-sm">No appointments yet.</div>
      ) : appts.map((a) => (
        <div key={a.id} className="bg-white border rounded-lg p-4 flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-semibold break-words">{a.title}</div>
            <div className="text-sm text-gray-600">{new Date(a.starts_at).toLocaleString()}{a.ends_at ? ` – ${new Date(a.ends_at).toLocaleTimeString()}` : ""}</div>
            {a.location && <div className="text-sm text-gray-600 mt-1 break-words">{a.location}</div>}
            {a.description && <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.description}</div>}
          </div>
          <Button variant="ghost" size="sm" className="min-h-10 min-w-10 shrink-0" aria-label="Delete appointment" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
        </div>
      ))}
    </div>
  );
}
