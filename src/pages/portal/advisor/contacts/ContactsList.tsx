import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAdvisorId } from "@/hooks/useCurrentAdvisorId";
import { useManagedAdvisors } from "@/hooks/useManagedAdvisors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Upload, Settings as SettingsIcon, UserCircle2, Eye } from "lucide-react";
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
  const { managed, loading: managedLoading } = useManagedAdvisors();
  const [viewAdvisorId, setViewAdvisorId] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("all");
  const navigate = useNavigate();

  // Default scope to self when advisor id resolves
  useEffect(() => {
    if (advisorId && !viewAdvisorId) setViewAdvisorId(advisorId);
  }, [advisorId, viewAdvisorId]);

  const isViewingOther = !!advisorId && !!viewAdvisorId && viewAdvisorId !== advisorId;
  const viewingAdvisor = managed.find((m) => m.advisor_id === viewAdvisorId);

  useEffect(() => {
    if (!viewAdvisorId) return;
    load();
  }, [viewAdvisorId]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("advisor_contacts")
      .select("id, first_name, last_name, primary_email, primary_phone, company, lifecycle_stage, tags, created_at")
      .eq("advisor_id", viewAdvisorId)
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

  if (authLoading || managedLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {managed.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
          <div className="flex items-center gap-2 text-sm text-emerald-900 font-medium">
            <Eye className="w-4 h-4" /> Viewing contacts for:
          </div>
          <select
            className="border rounded-md px-3 h-10 text-sm bg-white flex-1 sm:flex-none sm:min-w-[280px]"
            value={viewAdvisorId}
            onChange={(e) => setViewAdvisorId(e.target.value)}
          >
            {advisorId && <option value={advisorId}>My contacts</option>}
            {managed.map((m) => (
              <option key={m.advisor_id} value={m.advisor_id}>
                {m.first_name} {m.last_name} {m.email ? `· ${m.email}` : ""}
              </option>
            ))}
          </select>
          {isViewingOther && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Read-only
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {isViewingOther ? `${viewingAdvisor?.first_name ?? ""} ${viewingAdvisor?.last_name ?? ""}'s Contacts` : "Contacts"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{contacts.length} contacts {isViewingOther ? "in this advisor's book" : "in your book"}</p>
        </div>
        {!isViewingOther && (
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none min-h-11" onClick={() => navigate("/portal/advisor/contacts/settings")}>
            <SettingsIcon className="w-4 h-4 md:mr-2" /> <span className="hidden sm:inline">Custom Fields</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/portal/advisor/contacts/import")}
            className="flex-1 md:flex-none min-h-11 rounded-xl border-white/40 backdrop-blur-md bg-gradient-to-r from-emerald-700/15 to-amber-200/25 hover:from-emerald-700/25 hover:to-amber-200/40 hover:shadow-[0_0_0_1px_rgba(237,219,119,0.7)] active:scale-95 transition"
          >
            <Upload className="w-4 h-4 md:mr-2" /> <span className="hidden sm:inline">Import Contacts</span>
          </Button>
          <Button className="flex-1 md:flex-none min-h-11" onClick={() => navigate("/portal/advisor/contacts/new")} style={{ backgroundColor: "#1A4D3E" }}>
            <Plus className="w-4 h-4 md:mr-2" /> <span>Add<span className="hidden sm:inline"> Contact</span></span>
          </Button>
        </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9 h-11" placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 text-sm h-11 bg-white" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="all">All stages</option>
          <option value="lead">Lead</option>
          <option value="prospect">Prospect</option>
          <option value="client">Client</option>
          <option value="past_client">Past client</option>
        </select>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="p-8 text-center text-gray-500 bg-white border rounded-lg">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white border rounded-lg">No contacts yet. Add one or import a CSV.</div>
        ) : filtered.map((c) => (
          <button key={c.id} onClick={() => navigate(`/portal/advisor/contacts/${c.id}`)}
            className="w-full text-left bg-white border rounded-lg p-4 active:bg-gray-50">
            <div className="flex items-start gap-3">
              <UserCircle2 className="w-10 h-10 text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-gray-900 truncate">
                    {c.first_name || ""} {c.last_name || ""}
                  </div>
                  {c.lifecycle_stage && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 capitalize shrink-0">{c.lifecycle_stage}</span>
                  )}
                </div>
                {c.primary_email && <div className="text-xs text-gray-600 truncate mt-0.5">{c.primary_email}</div>}
                {c.primary_phone && <div className="text-xs text-gray-600 mt-0.5">{c.primary_phone}</div>}
                {c.company && <div className="text-xs text-gray-500 mt-0.5 truncate">{c.company}</div>}
                {(c.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(c.tags || []).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg bg-white overflow-hidden">
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
