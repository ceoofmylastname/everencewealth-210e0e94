import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Reminder { id: string; title: string; body: string | null; remind_at: string; completed_at: string | null; dismissed_at: string | null; }

export default function ContactRemindersTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: "", body: "", remind_at: "" });

  useEffect(() => { load(); }, [contactId]);
  async function load() {
    const { data } = await supabase.from("advisor_contact_reminders").select("*").eq("contact_id", contactId).order("remind_at", { ascending: true });
    setItems((data as Reminder[]) || []);
  }
  async function save() {
    if (!f.title || !f.remind_at) return toast.error("Title and date required");
    const { error } = await supabase.from("advisor_contact_reminders").insert({
      contact_id: contactId, advisor_id: advisorId, title: f.title, body: f.body || null, remind_at: f.remind_at,
    });
    if (error) return toast.error(error.message);
    toast.success("Reminder set — will appear on your dashboard");
    setAdding(false); setF({ title: "", body: "", remind_at: "" }); load();
  }
  async function complete(id: string) { await supabase.from("advisor_contact_reminders").update({ completed_at: new Date().toISOString() }).eq("id", id); load(); }
  async function dismiss(id: string) { await supabase.from("advisor_contact_reminders").update({ dismissed_at: new Date().toISOString() }).eq("id", id); load(); }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="w-full sm:w-auto min-h-10" onClick={() => setAdding(!adding)} style={{ backgroundColor: "#1A4D3E" }}><Plus className="w-4 h-4 mr-1" /> Add Reminder</Button>
      </div>
      {adding && (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <Input placeholder="Title (e.g. Follow up about IUL)" value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
          <Input type="datetime-local" value={f.remind_at} onChange={(e) => setF((p) => ({ ...p, remind_at: e.target.value }))} />
          <textarea className="w-full border rounded-md p-2 text-sm" rows={2} placeholder="Optional details" value={f.body} onChange={(e) => setF((p) => ({ ...p, body: e.target.value }))} />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-10" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="w-full sm:w-auto min-h-10" onClick={save} style={{ backgroundColor: "#1A4D3E" }}>Set Reminder</Button>
          </div>
        </div>
      )}
      {items.length === 0 && !adding ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500 text-sm">No reminders yet.</div>
      ) : items.map((r) => {
        const overdue = !r.completed_at && !r.dismissed_at && new Date(r.remind_at) < new Date();
        const done = r.completed_at || r.dismissed_at;
        return (
          <div key={r.id} className={`bg-white border rounded-lg p-4 flex justify-between items-start gap-2 ${overdue ? "border-red-300 bg-red-50" : ""} ${done ? "opacity-50" : ""}`}>
            <div className="flex gap-3 min-w-0 flex-1">
              <Bell className={`w-5 h-5 mt-0.5 shrink-0 ${overdue ? "text-red-600" : "text-gray-500"}`} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold break-words">{r.title}</div>
                <div className="text-sm text-gray-600">{new Date(r.remind_at).toLocaleString()}</div>
                {r.body && <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.body}</div>}
                {r.completed_at && <div className="text-xs text-emerald-600 mt-1">Completed</div>}
                {r.dismissed_at && <div className="text-xs text-gray-500 mt-1">Dismissed</div>}
              </div>
            </div>
            {!done && (
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="min-h-10 min-w-10" aria-label="Complete reminder" onClick={() => complete(r.id)}><Check className="w-4 h-4 text-emerald-600" /></Button>
                <Button variant="ghost" size="sm" className="min-h-10 min-w-10" aria-label="Dismiss reminder" onClick={() => dismiss(r.id)}><X className="w-4 h-4 text-gray-500" /></Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
