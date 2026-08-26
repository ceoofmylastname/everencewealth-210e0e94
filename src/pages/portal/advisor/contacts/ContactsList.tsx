import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAdvisorId } from "@/hooks/useCurrentAdvisorId";
import { useManagedAdvisors } from "@/hooks/useManagedAdvisors";
import { useAdvisorProfileKeyTrends } from "@/hooks/useProfileKeyTrend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Upload, Settings as SettingsIcon, UserCircle2, Eye, User, Users, Trophy } from "lucide-react";
import { toast } from "sonner";
import ProfileKeyBadge from "@/components/portal/contacts/ProfileKeyBadge";
import ProfileKeyLegend from "@/components/portal/contacts/ProfileKeyLegend";
import ProfileKeyTrendArrow from "@/components/portal/contacts/ProfileKeyTrendArrow";
import ProfileKeyAutomationToggle from "@/components/portal/contacts/ProfileKeyAutomationToggle";
import Top25List from "./Top25List";
import { PROFILE_KEY_TRAITS, ProfileTraitKey, scoreColorHsl } from "@/lib/profileKey";


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
  pk_score?: number;
  pk_status?: "response" | "associate" | "client" | null;
  pk_traits?: Record<ProfileTraitKey, boolean>;
}

export default function ContactsList() {
  const { advisorId, loading: authLoading } = useCurrentAdvisorId();
  const { managed, loading: managedLoading } = useManagedAdvisors();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") === "team" ? "team" : "mine") as "mine" | "team";
  const teamAgentParam = searchParams.get("agent") || "";
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [scoreMin, setScoreMin] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "response" | "associate" | "client">("all");
  const [traitFilter, setTraitFilter] = useState<ProfileTraitKey | "all">("all");
  const [sortByScore, setSortByScore] = useState(false);
  const navigate = useNavigate();

  // Default team-tab selection to first managed advisor if none chosen
  useEffect(() => {
    if (tab === "team" && !teamAgentParam && managed.length > 0) {
      const next = new URLSearchParams(searchParams);
      next.set("agent", managed[0].advisor_id);
      setSearchParams(next, { replace: true });
    }
  }, [tab, teamAgentParam, managed, searchParams, setSearchParams]);

  const viewAdvisorId =
    tab === "team" ? (teamAgentParam || managed[0]?.advisor_id || "") : (advisorId || "");
  const isViewingOther = tab === "team";
  const viewingAdvisor = managed.find((m) => m.advisor_id === viewAdvisorId);
  const hasManaged = managed.length > 0;

  function setTab(next: "mine" | "team") {
    const sp = new URLSearchParams(searchParams);
    if (next === "mine") {
      sp.delete("tab");
      sp.delete("agent");
    } else {
      sp.set("tab", "team");
      if (!sp.get("agent") && managed[0]) sp.set("agent", managed[0].advisor_id);
    }
    setSearchParams(sp, { replace: true });
  }

  function setTeamAgent(id: string) {
    const sp = new URLSearchParams(searchParams);
    sp.set("tab", "team");
    sp.set("agent", id);
    setSearchParams(sp, { replace: true });
  }

  useEffect(() => {
    if (!viewAdvisorId) return;
    load();
  }, [viewAdvisorId]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("advisor_contacts")
      .select("id, first_name, last_name, primary_email, primary_phone, company, lifecycle_stage, tags, created_at, advisor_contact_profile_key(score, status_code, trait_age_25_plus, trait_married, trait_children, trait_homeowner, trait_income, trait_ambitious, trait_dissatisfied, trait_entrepreneur)")
      .eq("advisor_id", viewAdvisorId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    else {
      const mapped: Contact[] = ((data as any[]) || []).map((c) => {
        const pk = Array.isArray(c.advisor_contact_profile_key)
          ? c.advisor_contact_profile_key[0]
          : c.advisor_contact_profile_key;
        return {
          ...c,
          pk_score: pk?.score ?? 0,
          pk_status: pk?.status_code ?? null,
          pk_traits: pk
            ? {
                trait_age_25_plus: !!pk.trait_age_25_plus,
                trait_married: !!pk.trait_married,
                trait_children: !!pk.trait_children,
                trait_homeowner: !!pk.trait_homeowner,
                trait_income: !!pk.trait_income,
                trait_ambitious: !!pk.trait_ambitious,
                trait_dissatisfied: !!pk.trait_dissatisfied,
                trait_entrepreneur: !!pk.trait_entrepreneur,
              }
            : undefined,
        };
      });
      setContacts(mapped);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = contacts.filter((c) => {
      if (stage !== "all" && c.lifecycle_stage !== stage) return false;
      if (scoreMin > 0 && (c.pk_score ?? 0) < scoreMin) return false;
      if (statusFilter !== "all" && c.pk_status !== statusFilter) return false;
      if (traitFilter !== "all" && !(c.pk_traits?.[traitFilter])) return false;
      if (!q) return true;
      return (
        `${c.first_name ?? ""} ${c.last_name ?? ""}`.toLowerCase().includes(q) ||
        (c.primary_email ?? "").toLowerCase().includes(q) ||
        (c.primary_phone ?? "").toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q)
      );
    });
    if (sortByScore) {
      out.sort((a, b) => (b.pk_score ?? 0) - (a.pk_score ?? 0));
    }
    return out;
  }, [contacts, search, stage, scoreMin, statusFilter, traitFilter, sortByScore]);

  if (authLoading || managedLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {hasManaged && (
        <div className="mb-5 flex flex-col gap-3">
          <div className="inline-flex p-1 rounded-xl border bg-white w-full sm:w-auto">
            <button
              onClick={() => setTab("mine")}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition ${
                tab === "mine" ? "bg-emerald-700 text-white shadow" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User className="w-4 h-4" /> My Contacts
            </button>
            <button
              onClick={() => setTab("team")}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition ${
                tab === "team" ? "bg-emerald-700 text-white shadow" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Users className="w-4 h-4" /> Team Contacts
            </button>
          </div>

          {tab === "team" && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <div className="flex items-center gap-2 text-sm text-emerald-900 font-medium">
                <Eye className="w-4 h-4" /> Agent:
              </div>
              <select
                className="border rounded-md px-3 h-10 text-sm bg-white flex-1 sm:flex-none sm:min-w-[280px]"
                value={viewAdvisorId}
                onChange={(e) => setTeamAgent(e.target.value)}
              >
                {managed.map((m) => (
                  <option key={m.advisor_id} value={m.advisor_id}>
                    {m.first_name} {m.last_name} {m.email ? `· ${m.email}` : ""}
                  </option>
                ))}
              </select>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Read-only
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {isViewingOther
              ? `${viewingAdvisor?.first_name ?? ""} ${viewingAdvisor?.last_name ?? ""}'s Contacts`
              : "My Contacts"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{contacts.length} contacts {isViewingOther ? "in this agent's book" : "in your book"}</p>
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

      {/* Profile Key legend + filters */}
      <div className="mb-4 space-y-3">
        <ProfileKeyLegend />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mr-1">Score</span>
          {[0, 2, 4, 6, 8].map((n) => {
            const active = scoreMin === n;
            return (
              <button
                key={n}
                onClick={() => setScoreMin(n)}
                className={`h-8 px-3 rounded-full text-xs font-bold border transition ${
                  active ? "text-white shadow" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                style={
                  active
                    ? { background: scoreColorHsl(n === 0 ? 0 : n), borderColor: scoreColorHsl(n === 0 ? 0 : n) }
                    : { borderColor: "hsl(220 13% 91%)" }
                }
              >
                {n === 0 ? "All" : `${n}+`}
              </button>
            );
          })}
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <select
            className="h-8 rounded-full border bg-white px-3 text-xs font-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All status</option>
            <option value="response">R · Response</option>
            <option value="associate">A · Associate</option>
            <option value="client">C · Client</option>
          </select>
          <select
            className="h-8 rounded-full border bg-white px-3 text-xs font-semibold"
            value={traitFilter}
            onChange={(e) => setTraitFilter(e.target.value as any)}
          >
            <option value="all">All traits</option>
            {PROFILE_KEY_TRAITS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.num}. {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortByScore((v) => !v)}
            className={`h-8 px-3 rounded-full text-xs font-bold border transition ${
              sortByScore
                ? "bg-[#1A4D3E] text-white border-[#1A4D3E]"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {sortByScore ? "Sorted by score ↓" : "Sort by score"}
          </button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="p-8 text-center text-gray-500 bg-white border rounded-lg">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white border rounded-lg">No contacts yet. Add one or import a CSV.</div>
        ) : filtered.map((c) => (
          <button key={c.id} onClick={() => navigate(`/portal/advisor/contacts/${c.id}${isViewingOther ? `?from=team&agent=${viewAdvisorId}` : ""}`)}
            className="w-full text-left bg-white border rounded-lg p-4 active:bg-gray-50">
            <div className="flex items-start gap-3">
              <UserCircle2 className="w-10 h-10 text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-gray-900 truncate">
                    {c.first_name || ""} {c.last_name || ""}
                  </div>
                  <ProfileKeyBadge score={c.pk_score ?? 0} status={c.pk_status ?? null} size="sm" />
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
              <th className="px-4 py-3">Profile Key</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No contacts yet. Add one or import a CSV.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/portal/advisor/contacts/${c.id}${isViewingOther ? `?from=team&agent=${viewAdvisorId}` : ""}`)}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <UserCircle2 className="w-5 h-5 text-gray-400" />
                      {c.first_name || ""} {c.last_name || ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ProfileKeyBadge score={c.pk_score ?? 0} status={c.pk_status ?? null} />
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
