import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  company: string | null;
}

export default function ContactPickerDialog({
  open,
  onOpenChange,
  advisorId,
  onPick,
  title = "Link a contact",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advisorId: string;
  onPick: (contact: Contact) => void;
  title?: string;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !advisorId) return;
    setLoading(true);
    supabase
      .from("advisor_contacts")
      .select("id, first_name, last_name, primary_email, primary_phone, company")
      .eq("advisor_id", advisorId)
      .order("last_name", { ascending: true })
      .limit(500)
      .then(({ data }) => {
        setContacts((data as Contact[]) || []);
        setLoading(false);
      });
  }, [open, advisorId]);

  const filtered = contacts.filter((c) => {
    if (!q.trim()) return true;
    const hay = `${c.first_name || ""} ${c.last_name || ""} ${c.primary_email || ""} ${c.primary_phone || ""} ${c.company || ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Search your contacts to link one.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, phone, company..." className="pl-9" autoFocus />
        </div>
        <div className="max-h-80 overflow-y-auto divide-y border rounded-md">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No contacts found.</div>
          ) : filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => { onPick(c); onOpenChange(false); }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-sm text-gray-900">{c.first_name} {c.last_name}</div>
              <div className="text-xs text-gray-500">
                {[c.primary_email, c.primary_phone, c.company].filter(Boolean).join(" · ") || "—"}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}