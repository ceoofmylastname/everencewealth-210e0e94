import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pin, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Note { id: string; body: string; pinned: boolean; created_at: string; }

export default function ContactNotesTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  useEffect(() => { load(); }, [contactId]);
  async function load() {
    const { data } = await supabase.from("advisor_contact_notes").select("*").eq("contact_id", contactId).order("pinned", { ascending: false }).order("created_at", { ascending: false });
    setNotes((data as Note[]) || []);
  }
  async function add() {
    if (!body.trim()) return;
    const { error } = await supabase.from("advisor_contact_notes").insert({ contact_id: contactId, advisor_id: advisorId, body });
    if (error) return toast.error(error.message);
    setBody(""); load();
  }
  async function togglePin(n: Note) {
    await supabase.from("advisor_contact_notes").update({ pinned: !n.pinned }).eq("id", n.id);
    load();
  }
  async function remove(id: string) {
    await supabase.from("advisor_contact_notes").delete().eq("id", id);
    load();
  }
  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-lg p-3">
        <textarea className="w-full border rounded-md p-2 text-sm" rows={3} placeholder="Add a note..." value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={add} style={{ backgroundColor: "#1A4D3E" }}>Add Note</Button>
        </div>
      </div>
      {notes.map((n) => (
        <div key={n.id} className={`bg-white border rounded-lg p-4 ${n.pinned ? "border-amber-300" : ""}`}>
          <div className="flex justify-between items-start gap-2">
            <div className="text-sm whitespace-pre-wrap flex-1">{n.body}</div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => togglePin(n)}><Pin className={`w-4 h-4 ${n.pinned ? "text-amber-600 fill-amber-600" : ""}`} /></Button>
              <Button variant="ghost" size="sm" onClick={() => remove(n.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
