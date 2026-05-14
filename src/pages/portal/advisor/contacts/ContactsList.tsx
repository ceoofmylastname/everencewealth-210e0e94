import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAdvisorId } from "@/hooks/useCurrentAdvisorId";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Upload, Settings as SettingsIcon, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  company: string | null;
  lifecycle_stage: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function ContactsList() {
  const { advisorId, loading: authLoading } = useCurrentAdvisorId();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!advisorId) return;
    load();
  }, [advisorId]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("advisor_contacts")
      .select("id, first_name, last_name, primary_email, primary_phone, company, lifecycle_stage, tags, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    else setContacts((data as Contact[]) || []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (stage !== "all" && c.lifecycle_stage !== stage) return false;
      if (!q) return true;
      return (
        `${c.first_name ?? ""} ${c.last_name ?? ""}`.toLowerCase().includes(q) ||
        (c.primary_email ?? "").toLowerCase().includes(q) ||
        (c.primary_phone ?? "").toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q)
      );
    });
  }, [contacts, search, stage]);

  if (authLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">{contacts.length} contacts in your book</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/portal/advisor/contacts/settings")}>
            <SettingsIcon className="w-4 h-4 mr-2" /> Custom Fields
          </Button>
          <Button variant="outline" onClick={() => navigate("/portal/advisor/contacts/import")}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button onClick={() => navigate("/portal/advisor/contacts/new")} style={{ backgroundColor: "#1A4D3E" }}>
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search by name, email, phone, company..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 text-sm" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="all">All stages</option>
          <option value="lead">Lead</option>
          <option value="prospect">Prospect</option>
          <option value="client">Client</option>
          <option value="past_client">Past client</option>
        </select>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-xs text-gray-600 uppercase">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No contacts yet. Add one or import a CSV.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/portal/advisor/contacts/${c.id}`)}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <UserCircle2 className="w-5 h-5 text-gray-400" />
                      {c.first_name || ""} {c.last_name || ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.primary_email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.primary_phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.company}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 capitalize">{c.lifecycle_stage}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags || []).map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{t}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
