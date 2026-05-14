import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link2, Unlink, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";

export default function ContactCNAsTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [linked, setLinked] = useState<any[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => { load(); }, [contactId]);

  async function load() {
    const { data } = await supabase
      .from("client_needs_analysis")
      .select("id, applicant_name, status, created_at, client_id")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });
    setLinked(data || []);
  }

  async function unlink(id: string) {
    if (!confirm("Unlink this CNA from the contact?")) return;
    const { error } = await supabase.from("client_needs_analysis").update({ contact_id: null }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("CNA unlinked");
    load();
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Linked Client Needs Analyses</h3>
            <p className="text-xs text-gray-500">CNAs you have created and attached to this contact.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
            <Link2 className="w-4 h-4 mr-1" /> Link existing CNA
          </Button>
        </div>
        {linked.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">No CNAs linked yet.</div>
        ) : (
          <div className="space-y-2">
            {linked.map((c) => (
              <div key={c.id} className="border rounded-md p-3 flex items-start justify-between">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{c.applicant_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {c.status} · Created {new Date(c.created_at).toLocaleDateString()}
                    {c.client_id && " · Shared with client"}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link to={`/portal/advisor/cna/${c.id}`}>
                    <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => unlink(c.id)}>
                    <Unlink className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CNAPicker open={pickerOpen} onOpenChange={setPickerOpen} advisorId={advisorId} contactId={contactId} onLinked={load} />
    </div>
  );
}

function CNAPicker({ open, onOpenChange, advisorId, contactId, onLinked }: {
  open: boolean; onOpenChange: (o: boolean) => void; advisorId: string; contactId: string; onLinked: () => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase.from("client_needs_analysis")
      .select("id, applicant_name, status, created_at, contact_id, client_id")
      .eq("advisor_id", advisorId)
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, [open, advisorId]);

  async function pick(c: any) {
    const { error } = await supabase.from("client_needs_analysis").update({ contact_id: contactId }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("CNA linked to contact");
    onLinked();
    onOpenChange(false);
  }

  const filtered = items.filter((c) => !q.trim() || c.applicant_name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link an existing CNA</DialogTitle>
          <DialogDescription>Choose one of your client needs analyses to attach.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by applicant name..." className="pl-9" autoFocus />
        </div>
        <div className="max-h-80 overflow-y-auto divide-y border rounded-md">
          {loading ? <div className="p-4 text-sm text-gray-500">Loading...</div>
          : filtered.length === 0 ? <div className="p-4 text-sm text-gray-500">No CNAs found.</div>
          : filtered.map((c) => (
            <button key={c.id} onClick={() => pick(c)} disabled={c.contact_id === contactId}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <div className="font-medium text-sm text-gray-900">{c.applicant_name}</div>
              <div className="text-xs text-gray-500">
                {c.status} · {new Date(c.created_at).toLocaleDateString()}
                {c.contact_id === contactId && " · already linked"}
                {c.contact_id && c.contact_id !== contactId && " · linked to another contact"}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}